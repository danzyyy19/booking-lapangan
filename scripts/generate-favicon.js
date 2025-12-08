const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
    const inputPath = path.join(__dirname, '../public/logo.png');
    const outputPath = path.join(__dirname, '../src/app/favicon.ico');

    // Read and resize to 32x32 for favicon
    await sharp(inputPath)
        .resize(32, 32)
        .toFile(outputPath.replace('.ico', '.png'));

    // For ico, we'll create a 32x32 png and rename (browsers accept PNG as favicon)
    const pngOutput = outputPath.replace('.ico', '-temp.png');
    await sharp(inputPath)
        .resize(32, 32)
        .png()
        .toFile(pngOutput);

    // Copy as ico (modern browsers support PNG-based ICO)
    fs.copyFileSync(pngOutput, outputPath);
    fs.unlinkSync(pngOutput);

    console.log('✅ Favicon generated at:', outputPath);
}

generateFavicon().catch(console.error);
