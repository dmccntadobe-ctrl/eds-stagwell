#!/bin/bash
# Regenerate all page content, upload media and pages to DA, and trigger preview.
cd "$(dirname "$0")" || exit 1
mkdir -p content final media
export MEDIA_BASE=https://content.da.live/dmccntadobe-ctrl/eds-stagwell/media/stagwell
node convert.mjs >/dev/null && node compose.mjs >/dev/null && node navfooter.mjs >/dev/null || exit 1
for p in nav footer; do
  sed -i 's#https://www.stagwellglobal.com/\(about-us\|our-network\|meetmark\)/#/\1#g' "content/$p.html"
done
cp content/nav.html final/nav.html; cp content/footer.html final/footer.html
TOKEN=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.aem/da-token.json','utf8')).access_token)")
for f in $(grep -oh "media/stagwell/[0-9a-f]*\.[a-z]*" final/*.html | sort -u | sed 's#media/stagwell/##'); do
  [ -f "media/$f" ] && curl -s -o /dev/null -X PUT -H "Authorization: Bearer $TOKEN" -F "data=@media/$f" "https://admin.da.live/source/dmccntadobe-ctrl/eds-stagwell/media/stagwell/$f"
done
for p in index about-us our-network meetmark nav footer; do
  a=$(curl -s -o /dev/null -w "%{http_code}" -X PUT -H "Authorization: Bearer $TOKEN" -F "data=@final/$p.html;type=text/html" "https://admin.da.live/source/dmccntadobe-ctrl/eds-stagwell/$p.html")
  b=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" "https://admin.hlx.page/preview/dmccntadobe-ctrl/eds-stagwell/main/$p")
  echo "$p put=$a preview=$b"
done
