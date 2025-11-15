const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Input and output directories
const inputDir = path.join(__dirname, 'src/images');
const outputDir = path.join(__dirname, 'src/images');

// Function to convert PNG to WebP recursively
async function convertPngToWebp(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await convertPngToWebp(filePath);
    } else if (path.extname(file).toLowerCase() === '.png') {
      const outputFile = path.join(
        directory,
        path.basename(file, path.extname(file)) + '.webp'
      );
      
      // Check if WebP version already exists
      if (!fs.existsSync(outputFile)) {
        try {
          await sharp(filePath)
            .toFormat('webp', { 
              quality: 85, // Good balance between quality and file size
              effort: 6    // Higher compression effort
            })
            .toFile(outputFile);
          
          console.log(`✅ Converted: ${file} -> ${path.basename(outputFile)}`);
        } catch (err) {
          console.error(`❌ Error converting ${file}:`, err.message);
        }
      } else {
        console.log(`⏭️  Skipped: ${path.basename(outputFile)} already exists`);
      }
    }
  }
}

// Function to get file sizes for comparison
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2); // Size in KB
}

// Main execution
async function main() {
  console.log('🚀 Starting PNG to WebP conversion...\n');
  
  const startTime = Date.now();
  await convertPngToWebp(inputDir);
  const endTime = Date.now();
  
  console.log(`\n✨ Conversion completed in ${endTime - startTime}ms`);
  
  // Show some statistics
  const pngFiles = [];
  const webpFiles = [];
  
  function collectFiles(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        collectFiles(filePath);
      } else if (path.extname(file).toLowerCase() === '.png') {
        pngFiles.push(filePath);
      } else if (path.extname(file).toLowerCase() === '.webp') {
        webpFiles.push(filePath);
      }
    }
  }
  
  collectFiles(inputDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`   PNG files: ${pngFiles.length}`);
  console.log(`   WebP files: ${webpFiles.length}`);
  
  // Calculate potential savings for files that have both formats
  let totalPngSize = 0;
  let totalWebpSize = 0;
  let comparableFiles = 0;
  
  pngFiles.forEach(pngFile => {
    const webpFile = pngFile.replace('.png', '.webp');
    if (fs.existsSync(webpFile)) {
      const pngSize = parseFloat(getFileSize(pngFile));
      const webpSize = parseFloat(getFileSize(webpFile));
      totalPngSize += pngSize;
      totalWebpSize += webpSize;
      comparableFiles++;
    }
  });
  
  if (comparableFiles > 0) {
    const savings = ((totalPngSize - totalWebpSize) / totalPngSize * 100).toFixed(1);
    console.log(`   Space saved: ${(totalPngSize - totalWebpSize).toFixed(2)} KB (${savings}%)`);
  }
}

main().catch(console.error);
