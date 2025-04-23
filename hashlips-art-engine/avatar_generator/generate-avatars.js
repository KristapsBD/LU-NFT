// generate-avatars.js
const fs = require('fs');
const path = require('path');
const { randpix, RandpixColorScheme, Symmetry } = require('randpix');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'avatars');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Configure randpix
const generator = randpix({
  colorScheme: RandpixColorScheme.NEUTRAL, // Color theme (default: NEUTRAL)
  size: 8, // Art size. Recommended 7 or 8 (odd/even symmetry) (default: 8)
  scale: 32, // Pixel scale (default: 1)
  symmetry: Symmetry.VERTICAL, // Symmetry (default: VERTICAL)
  colorBias: 15, // Slightly changes the color hue, which adds more color to the image
});

// Generate 100 avatars
console.log('Generating 100 avatars...');
for (let i = 1; i <= 100; i++) {
  // Generate a unique avatar
  const art = generator();
  
  // Convert to PNG buffer
  const pngBuffer = art.toBuffer('image/png');
  
  // Save to file
  const filePath = path.join(outputDir, `${i}#1.png`);
  fs.writeFileSync(filePath, pngBuffer);
  
  console.log(`Generated avatar ${i}/100: ${filePath}`);
}

console.log('Done! All avatars have been saved to the "avatars" directory.');
