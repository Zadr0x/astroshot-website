#!/usr/bin/env bash
# Editorial fashion shoot — 8 outfits, Vogue Italia direction
# Usage: ./scripts/editorial-shoot.sh <path-to-model-reference-image>
# Example: ./scripts/editorial-shoot.sh ./model-ref.jpg
set -euo pipefail

REF_IMAGE="${1:-}"
if [[ -z "$REF_IMAGE" ]]; then
  echo "Usage: $0 <path-to-model-reference-image>"
  exit 1
fi

FAL_KEY="${FAL_KEY:-$(grep FAL_KEY .env.local 2>/dev/null | cut -d= -f2)}"
if [[ -z "$FAL_KEY" ]]; then
  echo "FAL_KEY not set. Add it to .env.local or export FAL_KEY=..."
  exit 1
fi

# Check genmedia
if ! command -v genmedia &>/dev/null; then
  echo "Installing genmedia..."
  curl -fsSL https://raw.githubusercontent.com/fal-ai-community/genmedia-cli/main/install.sh | GENMEDIA_VERSION=0.6.2 sh
  export PATH="$HOME/.genmedia/bin:$PATH"
fi

genmedia setup --non-interactive --api-key "$FAL_KEY" >/dev/null

echo "Uploading reference image..."
REF_URL=$(genmedia upload "$REF_IMAGE" --json | jq -r '.url')
echo "Reference: $REF_URL"

mkdir -p ./editorial-shoot

# Check consistent-character schema first to confirm param names
SCHEMA=$(genmedia schema fal-ai/consistent-character --json 2>/dev/null)
REF_PARAM=$(echo "$SCHEMA" | jq -r '.input.properties | keys[]' 2>/dev/null | grep -E "ref|face|image" | head -1)
REF_PARAM="${REF_PARAM:-ref_image_url}"

declare -a OUTFITS=(
  # 1 — Milanese minimalism, Steven Meisel
  "Editorial fashion photograph for Vogue Italia. Structured ivory wool blazer coat worn as dress, wide-leg cream trousers, gold choker chain, pointed mules. Cold Milanese morning, harsh overcast north light, desaturated film tones. Steven Meisel. Full-length, frontal."
  # 2 — Dark studio, Paolo Roversi
  "Editorial fashion photograph for Vogue Italia. Sheer black silk slip dress, elbow-length black leather gloves, strappy sandals. Dramatic single side-light, deep shadow, graphite seamless background, Paolo Roversi long-exposure softness. Three-quarter body."
  # 3 — Brutalist tension, Helmut Newton
  "Editorial fashion photograph for Vogue Italia. Oversized tomato-red leather trench coat, belted, bare legs, black ankle-strap heels. Empty brutalist concrete car park, dusk, rain-slicked floor. Helmut Newton power and tension. Wide shot."
  # 4 — White flash, Peter Lindbergh
  "Editorial fashion photograph for Vogue Italia. Oversized white linen deconstructed blazer as mini dress, one shoulder off, bare midriff, white sneakers. Stark white cyclorama, harsh ring flash, Peter Lindbergh grain and intimacy. Medium shot."
  # 5 — Satin palazzo, candlelight
  "Editorial fashion photograph for Vogue Italia. Floor-length bias-cut champagne satin slip gown, backless with thin straps, diamond drop earrings. Candlelit Italian stone palazzo interior, warm amber practicals, long-exposure grain. Full-length, three-quarter back."
  # 6 — Blue hour Milan rooftop
  "Editorial fashion photograph for Vogue Italia. Sculptural black strapless corseted column gown with dramatic folded skirt volume, elbow gloves. Rooftop at blue hour, Milan skyline behind, cinematic teal-orange grade. Full-length, slight low angle."
  # 7 — Camel coat, cobblestone
  "Editorial fashion photograph for Vogue Italia. Double-breasted camel cashmere maxi coat, knee-high black boots, no bag. Wide establishing shot on Via Montenapoleone cobblestones, soft autumn golden-hour backlight, breath visible in cold air. Editorial walking pose."
  # 8 — Burgundy organza, dark studio
  "Editorial fashion photograph for Vogue Italia. Layered translucent burgundy organza evening gown, architectural ruffled shoulders, bare arms. Dark editorial studio, theatrical smoke, single overhead spotlight, 4x5 large-format film aesthetic, cropped just below knee."
)

for i in "${!OUTFITS[@]}"; do
  NUM=$((i + 1))
  echo ""
  echo "── Outfit $NUM/8 ──────────────────────────────"
  RESULT=$(genmedia run fal-ai/consistent-character \
    --prompt "${OUTFITS[$i]} Same model throughout: olive-tan skin, long wavy balayage hair (dark root to ash-blonde), full lips, strong brows. Photorealistic, ultra-sharp, magazine quality." \
    --"$REF_PARAM" "$REF_URL" \
    --download "./editorial-shoot/outfit-${NUM}.jpg" \
    --json)
  echo "$RESULT" | jq '{outfit: '"$NUM"', file: .files[0].name, url: .images[0].url}' 2>/dev/null || echo "$RESULT"
done

echo ""
echo "Done. All 8 outfits saved to ./editorial-shoot/"
ls -lh ./editorial-shoot/
