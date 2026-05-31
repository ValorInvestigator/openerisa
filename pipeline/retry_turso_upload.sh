#!/bin/bash
# Retry the Turso erisa upload until their multipart endpoint recovers, then save creds.
TURSO=/home/levi/.turso/turso
SQLITE=/home/levi/projects/valor-erisa-lookup/data/erisa.sqlite
for i in $(seq 1 40); do
  out=$($TURSO db create erisa --from-file "$SQLITE" --group default 2>&1)
  if echo "$out" | grep -qi "Created database"; then
    URL=$($TURSO db show erisa --url)
    TOKEN=$($TURSO db tokens create erisa)
    printf '{"db":"erisa","url":"%s","auth_token":"%s","attempt":%d}\n' "$URL" "$TOKEN" "$i" \
      > /home/levi/.claude/keys/turso-erisa.json
    chmod 600 /home/levi/.claude/keys/turso-erisa.json
    echo "SUCCESS attempt $i -> $URL"
    exit 0
  fi
  echo "attempt $i: $(echo "$out" | grep -oiE 'status code [0-9]+' | head -1 || echo fail)"
  sleep 180
done
echo "gave up after 40 attempts (~2h)"; exit 1
