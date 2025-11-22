# PWA Icons

This directory contains the icons for your Progressive Web App.

## Required Icon Sizes

The manifest.json requires the following icon sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (minimum required)
- 384x384
- 512x512 (minimum required)

## Generating Icons

### Option 1: Using icon.svg (Recommended)

The `icon.svg` file is a scalable vector graphic that can be converted to all required sizes.

Use one of these tools to generate PNG files from the SVG:

#### Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate all sizes
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} icon.svg icon-${size}x${size}.png
done
```

#### Using Inkscape (Command Line)
```bash
# Install Inkscape first
# macOS: brew install inkscape
# Ubuntu: sudo apt-get install inkscape

# Generate all sizes
for size in 72 96 128 144 152 192 384 512; do
  inkscape icon.svg -w ${size} -h ${size} -o icon-${size}x${size}.png
done
```

#### Using Online Tools
- [Favicon Generator](https://favicon.io/)
- [PWA Asset Generator](https://www.pwabuilder.com/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Option 2: Using Design Tools

Create your icon in:
- **Figma**: Export as PNG at each required size
- **Adobe Illustrator**: Export artboards at each size
- **Sketch**: Export slices at each size
- **Canva**: Download at different resolutions

## Icon Design Guidelines

### General Guidelines
- Use a simple, recognizable design
- Ensure it works at small sizes (72x72)
- Use high contrast for visibility
- Avoid text unless it's part of your logo
- Test on both light and dark backgrounds

### Safe Zone
- Keep important elements within 80% of the icon area
- The outer 10% on each side may be cropped on some platforms

### Color
- Use your brand colors
- Ensure good contrast
- Consider dark mode variants
- Avoid gradients if possible (or use subtle ones)

### Maskable Icons
For Android adaptive icons, ensure your design works with the "maskable" purpose:
- Important content should be in the center 40% (safe zone)
- Fill the entire icon area
- Background should extend to edges

## Testing Your Icons

1. **Chrome DevTools**:
   - Open DevTools > Application > Manifest
   - Check if all icons are loading correctly

2. **Lighthouse**:
   - Run a PWA audit
   - Check the PWA installability criteria

3. **Real Devices**:
   - Install the PWA on iOS and Android
   - Check home screen appearance
   - Verify app switcher appearance

## Current Icon

The current `icon.svg` is a placeholder featuring:
- Blue gradient background (brand color)
- White lightning bolt (representing speed/performance)
- Clean, modern design

**Replace this with your own branded icon!**

## Additional Assets

You may also want to create:
- **Splash screens** (for iOS): Various sizes for different devices
- **Favicon**: 16x16, 32x32, 48x48
- **Apple touch icons**: 180x180 for iOS
- **Windows tiles**: Various sizes for Windows
- **Screenshots**: For app stores and manifest

## Resources

- [Web.dev PWA Icons Guide](https://web.dev/add-manifest/#icons)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Maskable.app Editor](https://maskable.app/editor)
- [PWA Builder](https://www.pwabuilder.com/)
