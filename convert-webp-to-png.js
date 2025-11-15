const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Input and output directories
const inputDir = path.join(__dirname, 'src/images');
const outputDir = path.join(__dirname, 'src/images/png');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const inputFile = path.join(inputDir, file);
  const outputFile = path.join(
    outputDir,
    path.basename(file, path.extname(file)) + '.png'
  );

  // Check if the file is a .webp
  if (path.extname(file) === '.webp') {
    sharp(inputFile)
      .toFormat('png')
      .toFile(outputFile)
      .then(() => console.log(`Converted: ${file} -> ${outputFile}`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  }
});