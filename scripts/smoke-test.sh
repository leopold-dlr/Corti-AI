#!/usr/bin/env bash
# Tests de fumée sur un déploiement (production par défaut).
#
#   ./scripts/smoke-test.sh                                # https://nicolas-agent.vercel.app
#   ./scripts/smoke-test.sh http://localhost:3000          # serveur local
#   CONVERSATION_ID=conv_xxx ./scripts/smoke-test.sh       # + analyse complète (1 appel Mistral)
#
# Dépendances : bash, curl, jq. Aucune clé n'est nécessaire : tout passe par l'API publique.

set -uo pipefail

BASE_URL="${1:-https://nicolas-agent.vercel.app}"
BASE_URL="${BASE_URL%/}"
CONVERSATION_ID="${CONVERSATION_ID:-}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass + 1)); }
ko() { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail + 1)); }
check() { if eval "$2"; then ok "$1"; else ko "$1"; fi; }

# POST /api/analyse ; écrit le corps dans $TMP/body et renvoie le code HTTP
analyse() {
  curl -sS -o "$TMP/body" -w '%{http_code}' --max-time 130 \
    -X POST -H 'content-type: application/json' "$@" "$BASE_URL/api/analyse"
}

echo "Cible : $BASE_URL"

echo
echo "Page d'accueil"
code=$(curl -sS -o "$TMP/home.html" -w '%{http_code}' "$BASE_URL/")
check "GET / répond 200 (reçu $code)" '[ "$code" = 200 ]'
check "le titre est « Voice Diligence Agent »" 'grep -q "<title>Voice Diligence Agent" "$TMP/home.html"'

echo
echo "JavaScript client"
mkdir -p "$TMP/js"
for path in $(grep -oE '/_next/static/[^"]+\.js' "$TMP/home.html" | sort -u); do
  curl -sS "$BASE_URL$path" -o "$TMP/js/$(echo "$path" | tr / _)"
done
count=$(find "$TMP/js" -type f | wc -l | tr -d ' ')
check "bundles téléchargés ($count)" '[ "$count" -gt 0 ]'
check "l'ID de l'agent ElevenLabs est intégré" 'grep -qE "agent_[a-z0-9]{20,}" "$TMP"/js/*'
check "aucun nom de clé serveur (ELEVENLABS_API_KEY, MISTRAL_API_KEY, xi-api-key)" \
  '! grep -qE "ELEVENLABS_API_KEY|MISTRAL_API_KEY|xi-api-key" "$TMP"/js/*'
check "aucune clé ElevenLabs (sk_…)" '! grep -qE "sk_[A-Za-z0-9]{20,}" "$TMP"/js/*'

echo
echo "API /api/analyse : validation"
code=$(analyse)
check "corps vide → 400 (reçu $code)" '[ "$code" = 400 ]'
code=$(analyse -d '{}')
check "{} → 400 (reçu $code)" '[ "$code" = 400 ]'
code=$(analyse -d '{"conversationId":"../../etc"}')
check "identifiant invalide → 400 (reçu $code)" '[ "$code" = 400 ]'
check "code d'erreur invalid_request" '[ "$(jq -r .error.code "$TMP/body" 2>/dev/null)" = invalid_request ]'

echo
echo "API /api/analyse : clé ElevenLabs côté serveur"
code=$(analyse -d '{"conversationId":"conv_doesnotexist000000000000000"}')
err=$(jq -r .error.code "$TMP/body" 2>/dev/null)
check "conversation inconnue → 404 conversation_not_found (reçu $code $err)" \
  '[ "$code" = 404 ] && [ "$err" = conversation_not_found ]'

if [ -n "$CONVERSATION_ID" ]; then
  echo
  echo "API /api/analyse : analyse complète de $CONVERSATION_ID"
  start=$(date +%s)
  code=$(analyse -d "{\"conversationId\":\"$CONVERSATION_ID\"}")
  secs=$(($(date +%s) - start))
  check "200 en ${secs} s (reçu $code $(jq -r '.error.code // empty' "$TMP/body" 2>/dev/null))" '[ "$code" = 200 ]'
  if [ "$code" = 200 ]; then
    check "16 champs de données" '[ "$(jq ".data | length" "$TMP/body")" = 16 ]'
    check "7 critères" '[ "$(jq ".criteria | length" "$TMP/body")" = 7 ]'
    check "transcription non vide" '[ "$(jq ".transcript | length" "$TMP/body")" -gt 0 ]'
    check "mémo Mistral avec une synthèse" '[ -n "$(jq -r ".memo.synthese // empty" "$TMP/body")" ]'
    jq -r '"  → complétude \(.completeness.filled)/\(.completeness.total), critères réussis \([.criteria[] | select(.result == "success")] | length)/7"' "$TMP/body"
  fi
else
  echo
  echo "(Analyse complète ignorée : définir CONVERSATION_ID=conv_… pour la lancer.)"
fi

echo
if [ "$fail" -eq 0 ]; then
  printf '\033[32m%d tests réussis\033[0m\n' "$pass"
else
  printf '\033[31m%d échec(s)\033[0m, %d réussi(s)\n' "$fail" "$pass"
  exit 1
fi
