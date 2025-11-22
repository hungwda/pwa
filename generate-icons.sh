#!/bin/bash

# PWA Icon Generator Script
# Generates all required PNG icons from the SVG source

set -e

echo "🎨 PWA Icon Generator"
echo "====================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it first:"
    echo ""
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    echo ""
    exit 1
fi

# Check if icon.svg exists
if [ ! -f "assets/icons/icon.svg" ]; then
    echo "❌ icon.svg not found in assets/icons/"
    exit 1
fi

echo "✓ ImageMagick found"
echo "✓ icon.svg found"
echo ""

# Icon sizes to generate
sizes=(72 96 128 144 152 192 384 512)

echo "Generating icons..."
echo ""

# Generate each size
for size in "${sizes[@]}"; do
    output_file="assets/icons/icon-${size}x${size}.png"

    echo "  Generating ${size}x${size}..."

    convert -background none \
            -resize "${size}x${size}" \
            -density 300 \
            assets/icons/icon.svg \
            "$output_file"

    if [ -f "$output_file" ]; then
        file_size=$(du -h "$output_file" | cut -f1)
        echo "    ✓ Created: $output_file (${file_size})"
    else
        echo "    ❌ Failed to create $output_file"
        exit 1
    fi
done

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
ls -lh assets/icons/icon-*.png | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "  1. Review the generated icons"
echo "  2. Test them in your PWA"
echo "  3. Run a Lighthouse audit to verify"
echo ""
