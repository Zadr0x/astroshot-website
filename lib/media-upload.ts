import crypto from "crypto";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
export const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
export const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";
export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? "";
export const R2_PUBLIC_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL ?? "";

function hasCloudinaryConfig() {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

export function hasR2Config() {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET && R2_PUBLIC_BASE_URL);
}

function sanitizeFolderSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, "-");
}

function buildFolder(bucket: string) {
  return `astroshot/${sanitizeFolderSegment(bucket)}`;
}

export function buildObjectKey(bucket: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${buildFolder(bucket)}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
}

async function uploadToCloudinary(file: File, bucket: string): Promise<string | null> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = buildFolder(bucket);
  const publicId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  if (file.type.startsWith("video/")) {
    formData.append("resource_type", "video");
  }

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Cloudinary upload failed:", text);
    return null;
  }

  const data = (await response.json()) as { secure_url?: string };
  return data.secure_url ?? null;
}

function hmacSha256(key: crypto.BinaryLike, data: string) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function hmacSha256Text(key: crypto.BinaryLike, data: string, encoding: crypto.BinaryToTextEncoding) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest(encoding);
}

function sha256Hex(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function getR2PublicUrl(key: string) {
  return `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
}

export function createR2PresignedPutUrl(key: string, expiresSeconds = 900) {
  if (!hasR2Config()) return null;

  const endpointHost = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const canonicalUri = `/${R2_BUCKET}/${encodedKey}`;
  const signedHeaders = "host";
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${R2_ACCESS_KEY_ID}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  });
  const canonicalQueryString = Array.from(query.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("&");
  const canonicalHeaders = `host:${endpointHost}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = hmacSha256Text(kSigning, stringToSign, "hex");
  query.set("X-Amz-Signature", signature);

  return `https://${endpointHost}${canonicalUri}?${query.toString()}`;
}

async function uploadToR2(file: File, bucket: string): Promise<string | null> {
  const key = buildObjectKey(bucket, file.name);
  const endpointHost = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const payload = Buffer.from(await file.arrayBuffer());
  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const canonicalUri = `/${R2_BUCKET}/${encodedKey}`;
  const canonicalHeaders = [
    `content-type:${file.type || "application/octet-stream"}`,
    `host:${endpointHost}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = hmacSha256Text(kSigning, stringToSign, "hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(`https://${endpointHost}${canonicalUri}`, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": file.type || "application/octet-stream",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("R2 upload failed:", text);
    return null;
  }

  return getR2PublicUrl(key);
}

export async function uploadMedia(file: File, bucket: string): Promise<string | null> {
  if (hasCloudinaryConfig()) {
    return uploadToCloudinary(file, bucket);
  }

  if (hasR2Config()) {
    return uploadToR2(file, bucket);
  }

  return null;
}

export function mediaProviderLabel() {
  if (hasCloudinaryConfig()) return "cloudinary";
  if (hasR2Config()) return "cloudflare-r2";
  return "supabase";
}
