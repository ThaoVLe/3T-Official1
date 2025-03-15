import sharp from 'sharp';
import path from 'path';

// Create a basic icon with text
async function generateAssets() {
  const assetsDir = path.join(process.cwd(), 'mobile', 'assets');
  
  // Generate app icon (1024x1024)
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(
      `<svg width="1024" height="1024">
        <rect width="1024" height="1024" fill="#4A90E2"/>
        <text x="512" y="512" font-family="Arial" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle">
          PJ
        </text>
      </svg>`
    ),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'icon.png'));

  // Generate adaptive icon (108x108)
  await sharp({
    create: {
      width: 108,
      height: 108,
      channels: 4,
      background: { r: 74, g: 144, b: 226, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(
      `<svg width="108" height="108">
        <text x="54" y="54" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">
          PJ
        </text>
      </svg>`
    ),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'adaptive-icon.png'));

  // Generate splash screen (1242x2436)
  await sharp({
    create: {
      width: 1242,
      height: 2436,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: Buffer.from(
      `<svg width="1242" height="2436">
        <rect width="1242" height="2436" fill="#4A90E2"/>
        <text x="621" y="1218" font-family="Arial" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">
          Personal Journal
        </text>
      </svg>`
    ),
    top: 0,
    left: 0,
  }])
  .png()
  .toFile(path.join(assetsDir, 'splash.png'));
}

generateAssets().catch(console.error);
