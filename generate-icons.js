const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG to PNG converter for PWA icons
async function generateIcons() {
  const svgPath = path.join(__dirname, 'public/assets/img/logo.svg');
  const outputDir = path.join(__dirname, 'public');
  
  const sizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' }
  ];

  console.log('🎨 Generating PWA icons from SVG...\n');

  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      
      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 109, b: 91, alpha: 1 } // #006d5b
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to create ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icon generation complete!');
}

generateIcons().catch(console.error);
