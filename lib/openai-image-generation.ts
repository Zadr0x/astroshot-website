export type OpenAiImageInput = {
  mimeType: string;
  dataBase64: string;
};

export type OpenAiImageOutput = {
  buffer: Buffer;
  mimeType: string;
  description: string;
};

type OpenAiResponseOutput = {
  output_text?: string;
  output?: Array<{
    type?: string;
    result?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function outputText(data: OpenAiResponseOutput) {
  if (data.output_text) return data.output_text.trim();
  return data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? "")
    .filter(Boolean)
    .join("\n")
    .trim() ?? "";
}

function outputFromImageApi(data: unknown): OpenAiImageOutput | null {
  const response = data as {
    data?: Array<{ b64_json?: string; revised_prompt?: string }>;
    output_format?: string;
  };
  const imageBase64 = response.data?.[0]?.b64_json;
  if (!imageBase64) return null;
  const outputFormat = response.output_format || "png";
  return {
    buffer: Buffer.from(imageBase64, "base64"),
    mimeType: outputFormat === "jpeg" ? "image/jpeg" : outputFormat === "webp" ? "image/webp" : "image/png",
    description: response.data?.[0]?.revised_prompt ?? "",
  };
}

function imageBlob(image: OpenAiImageInput) {
  return new Blob([Buffer.from(image.dataBase64, "base64")], { type: image.mimeType });
}

async function generateImageWithOpenAiImageApi(options: {
  apiKey: string;
  prompt: string;
  images: OpenAiImageInput[];
}): Promise<OpenAiImageOutput> {
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

  if (options.images.length > 0) {
    const formData = new FormData();
    formData.append("model", model);
    formData.append("prompt", options.prompt);
    formData.append("size", process.env.OPENAI_IMAGE_SIZE || "1024x1536");
    formData.append("quality", process.env.OPENAI_IMAGE_QUALITY || "medium");
    formData.append("output_format", "png");
    options.images.slice(0, 10).forEach((image, index) => {
      const extension = image.mimeType.includes("jpeg") || image.mimeType.includes("jpg")
        ? "jpg"
        : image.mimeType.includes("webp")
          ? "webp"
          : "png";
      formData.append("image[]", imageBlob(image), `reference-${index + 1}.${extension}`);
    });

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${options.apiKey}` },
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = data as { error?: { message?: string } } | null;
      throw new Error(error?.error?.message ?? "OpenAI Image API edit failed");
    }
    const output = outputFromImageApi(data);
    if (!output) throw new Error("OpenAI Image API returned no image");
    return output;
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: options.prompt,
      size: process.env.OPENAI_IMAGE_SIZE || "1024x1536",
      quality: process.env.OPENAI_IMAGE_QUALITY || "medium",
      output_format: "png",
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data as { error?: { message?: string } } | null;
    throw new Error(error?.error?.message ?? "OpenAI Image API generation failed");
  }
  const output = outputFromImageApi(data);
  if (!output) throw new Error("OpenAI Image API returned no image");
  return output;
}

export async function generateImageWithOpenAi(options: {
  apiKey: string;
  prompt: string;
  images: OpenAiImageInput[];
  action?: "auto" | "generate" | "edit";
}): Promise<OpenAiImageOutput> {
  try {
    return await generateImageWithOpenAiImageApi(options);
  } catch (imageApiError) {
    try {
      return await generateImageWithOpenAiResponses(options);
    } catch (responsesError) {
      const imageMessage = imageApiError instanceof Error ? imageApiError.message : "Image API failed";
      const responsesMessage = responsesError instanceof Error ? responsesError.message : "Responses fallback failed";
      throw new Error(`${imageMessage}. Responses fallback failed: ${responsesMessage}`);
    }
  }
}

export async function generateImageWithOpenAiResponses(options: {
  apiKey: string;
  prompt: string;
  images: OpenAiImageInput[];
  action?: "auto" | "generate" | "edit";
}): Promise<OpenAiImageOutput> {
  const model = process.env.OPENAI_IMAGE_TOOL_MODEL || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: options.prompt },
            ...options.images.map((image) => ({
              type: "input_image",
              image_url: `data:${image.mimeType};base64,${image.dataBase64}`,
            })),
          ],
        },
      ],
      tools: [{ type: "image_generation", action: options.action ?? "auto" }],
    }),
  });

  const data = await response.json().catch(() => null) as OpenAiResponseOutput | null;
  if (!response.ok) {
    const error = data as { error?: { message?: string } } | null;
    throw new Error(error?.error?.message ?? "OpenAI image generation failed");
  }

  const imageBase64 = data?.output
    ?.filter((item) => item.type === "image_generation_call")
    .map((item) => item.result)
    .find(Boolean);

  if (!imageBase64) {
    throw new Error(outputText(data ?? {}) || "OpenAI returned no image");
  }

  return {
    buffer: Buffer.from(imageBase64, "base64"),
    mimeType: "image/png",
    description: outputText(data ?? {}),
  };
}
