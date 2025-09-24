#!/bin/bash

# Ordner für Poster-Bilder
OUTPUT_DIR="../images/posters"
mkdir -p "$OUTPUT_DIR"

# Durch alle Videos im Ordner loopen
for video in *.webm; do
  name=$(basename "$video" .webm)
  echo "🎬 Verarbeite $video → $name"

  # 1. Frame bei 0.5s grabben
  ffmpeg -ss 00:00:00.500 -i "$video" -frames:v 1 -q:v 2 "$OUTPUT_DIR/${name}-master.jpg"

  # 2. Skalieren in verschiedene Größen
  for size in 480 768 1024 1440; do
    ffmpeg -i "$OUTPUT_DIR/${name}-master.jpg" -vf scale=${size}:-1 "$OUTPUT_DIR/${name}-${size}.jpg"

    # 3. WebP
    cwebp -q 78 "$OUTPUT_DIR/${name}-${size}.jpg" -o "$OUTPUT_DIR/${name}-${size}.webp"

    # 4. AVIF
    avifenc --min 20 --max 35 --qcolor 45 "$OUTPUT_DIR/${name}-${size}.jpg" -o "$OUTPUT_DIR/${name}-${size}.avif"
  done
done

echo "✅ Fertig! Poster liegen in $OUTPUT_DIR"
