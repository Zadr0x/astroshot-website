import os, json, mimetypes, pathlib, hashlib, hmac, urllib.request, urllib.parse
from datetime import datetime, timezone

SUPABASE_URL='https://xurzuofmpwfhtlkxppej.supabase.co'
SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cnp1b2ZtcHdmaHRsa3hwcGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njg3ODk1MCwiZXhwIjoyMDkyNDU0OTUwfQ.s1fEZBzgZ21ewOt8ttUb_1Cwxs7hTGFS-6M4fRuNSuw'
ACCOUNT_ID='e8f4fb343e1dc500c030332e69501b4b'
ACCESS_KEY='841043f4b62fe65ec9b8555d84916133'
SECRET_KEY='8a8cf486511c904e7e545cb9f09736610594ddf71e2aaf224b77894d3b369685'
BUCKET='astroshot-media'
PUBLIC_BASE='https://pub-cedabf5231a848dfb49375ca69e25d88.r2.dev'
BASE_DIR=pathlib.Path('tmp/supabase-assets')
EXPORT=json.load(open('tmp/supabase-export.json'))


def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def upload_file(local_path, object_key):
    endpoint_host=f'{ACCOUNT_ID}.r2.cloudflarestorage.com'
    now=datetime.now(timezone.utc)
    amz_date=now.strftime('%Y%m%dT%H%M%SZ')
    date_stamp=now.strftime('%Y%m%d')
    region='auto'; service='s3'
    payload=local_path.read_bytes()
    payload_hash=hashlib.sha256(payload).hexdigest()
    canonical_uri='/' + BUCKET + '/' + '/'.join(urllib.parse.quote(part, safe='') for part in object_key.split('/'))
    content_type=mimetypes.guess_type(str(local_path))[0] or 'application/octet-stream'
    canonical_headers=(
        f'content-type:{content_type}\n'
        f'host:{endpoint_host}\n'
        f'x-amz-content-sha256:{payload_hash}\n'
        f'x-amz-date:{amz_date}\n'
    )
    signed_headers='content-type;host;x-amz-content-sha256;x-amz-date'
    canonical_request='\n'.join([
        'PUT', canonical_uri, '', canonical_headers, signed_headers, payload_hash
    ])
    credential_scope=f'{date_stamp}/{region}/{service}/aws4_request'
    string_to_sign='\n'.join([
        'AWS4-HMAC-SHA256', amz_date, credential_scope, hashlib.sha256(canonical_request.encode()).hexdigest()
    ])
    k_date=sign(('AWS4'+SECRET_KEY).encode(), date_stamp)
    k_region=sign(k_date, region)
    k_service=sign(k_region, service)
    k_signing=sign(k_service, 'aws4_request')
    signature=hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()
    authorization=(
        f'AWS4-HMAC-SHA256 Credential={ACCESS_KEY}/{credential_scope}, '
        f'SignedHeaders={signed_headers}, Signature={signature}'
    )
    req=urllib.request.Request(
        f'https://{endpoint_host}{canonical_uri}',
        data=payload,
        method='PUT',
        headers={
            'Authorization': authorization,
            'Content-Type': content_type,
            'x-amz-content-sha256': payload_hash,
            'x-amz-date': amz_date,
        }
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.status

url_map={}
files=[p for p in BASE_DIR.rglob('*') if p.is_file()]
for i,p in enumerate(files,1):
    rel=p.relative_to(BASE_DIR).as_posix()
    status=upload_file(p, rel)
    old=f'{SUPABASE_URL}/storage/v1/object/public/{rel}'
    new=f'{PUBLIC_BASE}/{rel}'
    url_map[old]=new
    print(f'[{i}/{len(files)}] upload {status} {rel}', flush=True)

# include original full urls from export where path maps cleanly
with open('tmp/url-map.json','w') as f:
    json.dump(url_map,f,indent=2)

headers={
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def patch(path, filters, payload):
    qs='&'.join(f"{k}=eq.{urllib.parse.quote(str(v), safe='')}" for k,v in filters.items())
    req=urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/{path}?{qs}',
        data=json.dumps(payload).encode(),
        method='PATCH',
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status

for row in EXPORT['projects']:
    payload={}
    for field in ['thumbnail_url','media_url']:
        val=row.get(field)
        if val in url_map:
            payload[field]=url_map[val]
    if payload:
        patch('projects', {'id': row['id']}, payload)
        print('patched project', row['id'], flush=True)

for row in EXPORT['project_images']:
    val=row.get('image_url')
    if val in url_map:
        patch('project_images', {'id': row['id']}, {'image_url': url_map[val]})
        print('patched project_image', row['id'], flush=True)

for row in EXPORT['clients']:
    val=row.get('logo_url')
    if val in url_map:
        patch('clients', {'id': row['id']}, {'logo_url': url_map[val]})
        print('patched client', row['id'], flush=True)

for row in EXPORT['blog_posts']:
    val=row.get('cover_image_url')
    if val in url_map:
        patch('blog_posts', {'id': row['id']}, {'cover_image_url': url_map[val]})
        print('patched blog', row['id'], flush=True)

for row in EXPORT['site_content']:
    val=row.get('value')
    if isinstance(val, str) and 'supabase.co/storage/v1/object/public/' in val:
        new_val=val
        for old,new in url_map.items():
            new_val=new_val.replace(old,new)
        if new_val != val:
            patch('site_content', {'id': row['id']}, {'value': new_val})
            print('patched site_content', row['key'], flush=True)

print('migration complete')
