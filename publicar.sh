#!/bin/bash
# Publica la web de L'Abelluco: commit (si hi ha canvis) i push de main, i després
# porta main a la branca "pages", que és la que serveix Codeberg Pages a
# https://mario_escuder.codeberg.page/abelluco/
#
# Ús (Git Bash, des de la carpeta de la web):
#   ./publicar.sh "Missatge del commit"
#
# Abans de publicar es fan les verificacions; si fallen, no es publica.
set -e

if [ -z "$1" ]; then
  echo "Cal indicar el missatge del commit."
  echo "Ús: ./publicar.sh \"missatge del commit\""
  exit 1
fi

echo "== Verificant =="
node nucli/eines/verificar.mjs

echo "== Anant a main =="
git checkout main

git add -A
if git diff --cached --quiet; then
  echo "No hi ha canvis per fer commit."
else
  echo "== Fent commit =="
  git commit -m "$1"
fi

echo "== Pujant main =="
git push origin main

echo "== Portant main a pages =="
git checkout pages
git merge --ff-only main
git push origin pages

echo "== Tornant a main =="
git checkout main

echo "Fet! Publicat a https://mario_escuder.codeberg.page/abelluco/"
