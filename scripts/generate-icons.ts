import sharp from 'sharp'
import { mkdir } from 'fs/promises'

const sizes = [16, 48, 128]

async function generateIcons() {
  // Create icons directory if it doesn't exist
  await mkdir('public/icons', { recursive: true })

  // Generate SVG string
  const createSvg = (size: number) => `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.5}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >TV</text>
    </svg>
  `

  // Generate icons for each size
  for (const size of sizes) {
    const svg = createSvg(size)
    await sharp(Buffer.from(svg)).png().toFile(`public/icons/icon${size}.png`)
    console.log(`Generated icon${size}.png`)
  }

  console.log('All icons generated successfully!')
}

generateIcons().catch(console.error)
