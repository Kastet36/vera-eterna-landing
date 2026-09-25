#!/usr/bin/env bash
set -euo pipefail

source_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
site_dir="$source_dir/../promo.vera-eterna.ru"

mkdir -p "$site_dir/assets"
rsync -a --delete "$source_dir/assets/" "$site_dir/assets/"
cp "$source_dir/index.html" "$site_dir/index.html"
printf 'Published static files to %s\n' "$site_dir"
