#!/usr/bin/env bash
set -euo pipefail

out=_workbench/research/generated-v3
mkdir -p "$out"

normalize() {
  convert "$1" -trim +repage -resize '1050x500>' \
    -gravity center -background none -extent 1200x600 "$2"
}

normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-c9eb7eeb-cf8b-4f5b-9929-fde9caa6e31a.png "$out/granada_mano.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-21b9c472-b10f-4fdb-9912-25e85412031f.png "$out/lanzacohetes.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-fa9ea09d-410d-4bfd-b32d-b45e601d537f.png "$out/mortero81.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-a119b43a-f006-4621-a9b5-bc46bf4d432f.png "$out/mina_antipersonal.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-9b382131-f2f1-4b99-93d6-a3dee1e6bb4a.png "$out/galil.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-49b9db69-5253-44b6-8f4d-7938f6ea78a0.png "$out/minigun.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-8fdacd7e-6a73-47b4-8058-7ad8a4187f79.png "$out/browning_m1917.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-86e990e2-fe46-48ec-b628-379aa12f035b.png "$out/detonador.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-49a5c06a-c576-43c8-8be0-6d8ced959418.png "$out/c4.png"
normalize /home/elettrico/.codex/generated_images/01a1da94-0268-7862-923f-cee8eb592786/exec-f4105aa5-16c4-41d5-b990-00c2f76a370c.png "$out/molotov.png"
normalize _workbench/research/editable-sources/vector/bomba_casera_limpia.svg "$out/bomba_casera.png"
normalize _workbench/research/editable-sources/vector/dinamita_limpia.svg "$out/dinamita.png"
