#!/usr/bin/env bash
# Submit every URL in sitemap.xml to IndexNow.
#
# IndexNow shares submissions across all participating engines (Bing, Yandex,
# Seznam, Naver), so one POST covers them all — no need to ping each.
# Google does not participate; it still discovers changes via sitemap.xml.
#
# Run after deploying content changes:  ./indexnow.sh

set -euo pipefail

HOST="jacoborbach.com"
KEY="afe95b03181243bc909a35444834823a"
SITEMAP="$(dirname "$0")/sitemap.xml"

# Expected responses: 200 OK, 202 Accepted (key validation pending).
# 403 = key file missing or wrong; 422 = URL/host or key mismatch.
payload=$(python3 - "$SITEMAP" "$HOST" "$KEY" <<'PY'
import json, re, sys
sitemap, host, key = sys.argv[1], sys.argv[2], sys.argv[3]
with open(sitemap) as f:
    urls = re.findall(r"<loc>([^<]+)</loc>", f.read())
if not urls:
    sys.exit("no <loc> entries found in sitemap")
print(json.dumps({
    "host": host,
    "key": key,
    "keyLocation": f"https://{host}/{key}.txt",
    "urlList": urls,
}))
PY
)

count=$(printf '%s' "$payload" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["urlList"]))')
echo "Submitting $count URLs to IndexNow..."

code=$(curl -s -o /tmp/indexnow-resp.txt -w '%{http_code}' \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary "$payload")

case "$code" in
  200|202) echo "OK (HTTP $code) — $count URLs accepted." ;;
  403)     echo "FAILED (403): key file not reachable at https://$HOST/$KEY.txt"; exit 1 ;;
  422)     echo "FAILED (422): URL/host mismatch or bad key"; cat /tmp/indexnow-resp.txt; exit 1 ;;
  429)     echo "FAILED (429): rate limited — try again later"; exit 1 ;;
  *)       echo "FAILED (HTTP $code)"; cat /tmp/indexnow-resp.txt; exit 1 ;;
esac
