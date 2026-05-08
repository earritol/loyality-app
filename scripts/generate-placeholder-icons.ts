/**
 * Genera íconos PWA placeholder (color sólido #22C55E) con dimensiones correctas.
 * Objetivo: cumplir requisitos del manifest para testing/installability inicial.
 * Los íconos reales de branding se reemplazarán posteriormente.
 *
 * Uso: npx tsx scripts/generate-placeholder-icons.ts
 *
 * Implementación ligera: genera PNGs mínimos válidos sin librerías externas.
 * Usa la estructura PNG más simple posible (IHDR + IDAT sin compresión + IEND).
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { deflateSync } from 'zlib'

const ICONS_DIR = join(process.cwd(), 'public', 'icons')

// Color #22C55E en RGB
const R = 0x22
const G = 0xc5
const B = 0x5e

function createPNG(width: number, height: number): Buffer {
  // Build raw image data: each row starts with filter byte (0 = None)
  const rawData: number[] = []
  for (let y = 0; y < height; y++) {
    rawData.push(0) // filter byte: None
    for (let x = 0; x < width; x++) {
      rawData.push(R, G, B) // RGB
    }
  }

  const compressed = deflateSync(Buffer.from(rawData))

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 2 // color type: RGB
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  const ihdr = createChunk('IHDR', ihdrData)

  // IDAT chunk
  const idat = createChunk('IDAT', compressed)

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeBuffer = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuffer, data])

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcInput), 0)

  return Buffer.concat([length, typeBuffer, data, crc])
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

// Generate icons
mkdirSync(ICONS_DIR, { recursive: true })

const sizes = [
  { name: 'icon-192x192.png', width: 192, height: 192 },
  { name: 'icon-512x512.png', width: 512, height: 512 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
]

for (const { name, width, height } of sizes) {
  const png = createPNG(width, height)
  const path = join(ICONS_DIR, name)
  writeFileSync(path, png)
  console.log(`✓ ${name} (${width}×${height}) → ${path}`)
}

console.log('\nPlaceholder icons generated. Replace with final branding before production.')
