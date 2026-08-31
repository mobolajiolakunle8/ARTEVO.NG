#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# ARTÉVO — safe GitHub deploy script
# Fixes "Something went really wrong, and we can't process that
# file" — which happens ONLY when using GitHub's web upload UI.
# This script uses git properly instead.
#
# Usage:
#   1. chmod +x deploy-to-github.sh
#   2. ./deploy-to-github.sh  <github-username> <repo-name> [branch]
#      example: ./deploy-to-github.sh mobolajiolakunle8 artevo main
# ─────────────────────────────────────────────────────────────
set -euo pipefail

USERNAME="${1:?Provide GitHub username, e.g. ./deploy-to-github.sh mobolajiolakunle8 artevo}"
REPO="${2:?Provide repository name}"
BRANCH="${3:-main}"

FILES=$(find . -type f \
  -not -path "./node_modules/*" -not -path "./.next/*" \
  -not -path "./.git/*" -not -name ".env" -not -name ".env.local" \
  -not -name "artevo-deploy.zip" | wc -l | tr -d ' ')
echo ""
echo "  ▸ Deploying $FILES files to https://github.com/$USERNAME/$REPO ($BRANCH)"
echo "  ▸ Node: $(node -v) · Framework: Next.js 16 · DB: PostgreSQL (DATABASE_URL)"
echo ""

if [ -d .git ]; then
  echo "  ▸ Existing git repository detected — committing changes…"
else
  echo "  ▸ Initialising git repository…"
  git init -b "$BRANCH"
fi

git add -A
git status --short | head -20

if git diff --cached --quiet; then
  echo ""
  echo "  ✓ Nothing new to commit."
else
  git commit -m "ARTÉVO deployment: public website + admin studio (clean 79-file bundle)"
  echo ""
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "  ▸ Updating remote origin…"
  git remote set-url origin "https://github.com/$USERNAME/$REPO.git"
else
  echo "  ▸ Adding remote origin…"
  git remote add origin "https://github.com/$USERNAME/$REPO.git"
fi

echo ""
echo "  ▸ Pushing to $BRANCH…"
git push -u origin "$BRANCH"

echo ""
echo "  ✓ Done. Next in Vercel:"
echo "      1. Settings → General → Node.js Version: 22.x"
echo "      2. Settings → Environment Variables → DATABASE_URL (hosted Postgres)"
echo "      3. Redeploy (Redeploy without Build Cache on first run)"
