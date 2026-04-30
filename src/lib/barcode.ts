// src/lib/barcode.ts
// Complete barcode generation, validation and rendering utilities for Shajpori

// ── EAN-13 GENERATION ─────────────────────────────────────────────────────────
// Bangladesh national GS1 prefix: 880
export function generateEAN13(
  countryPrefix = '880',
  manufacturerCode?: string,
  productCode?: string
): string {
  const mfr = manufacturerCode || String(Math.floor(Math.random() * 9000 + 1000))
  const prd = productCode || String(Math.floor(Math.random() * 90000 + 10000))
  const raw = (countryPrefix + mfr + prd).slice(0, 12).padEnd(12, '0')
  const check = calcEAN13CheckDigit(raw)
  return raw + check
}

export function calcEAN13CheckDigit(digits12: string): string {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits12[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return String((10 - (sum % 10)) % 10)
}

export function validateEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false
  const computed = calcEAN13CheckDigit(barcode.slice(0, 12))
  return computed === barcode[12]
}

// ── CODE128 GENERATION ────────────────────────────────────────────────────────
export function generateCode128(
  prefix = 'SJP',
  productCode?: string
): string {
  const code = productCode || String(Date.now()).slice(-8)
  return `${prefix}${code}`.toUpperCase().slice(0, 20)
}

// ── SKU GENERATION ────────────────────────────────────────────────────────────
// Format: SJP-{CAT_CODE}-{SERIAL}
// e.g. SJP-DR-001, SJP-BG-042, SJP-AC-103
const CAT_CODES: Record<string, string> = {
  Dress: 'DR', Bag: 'BG', Accessory: 'AC',
  Jewelry: 'JW', Footwear: 'FW', Scarf: 'SC',
}

export async function generateSKU(
  category: string,
  supabase: { from: (t: string) => { select: (c: string) => { ilike: (col: string, val: string) => { order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: { sku: string }[] | null }> } } } } }
): Promise<string> {
  const catCode = CAT_CODES[category] || category.slice(0, 2).toUpperCase()
  const prefix = `SJP-${catCode}-`

  // Find the highest existing serial for this category
  const { data } = await supabase
    .from('products')
    .select('sku')
    .ilike('sku', `${prefix}%`)
    .order('sku', { ascending: false })
    .limit(1)

  let nextSerial = 1
  if (data && data.length > 0) {
    const lastSku = data[0].sku
    const lastSerial = parseInt(lastSku.replace(prefix, '')) || 0
    nextSerial = lastSerial + 1
  }

  return `${prefix}${String(nextSerial).padStart(3, '0')}`
}

// ── VARIANT SKU ───────────────────────────────────────────────────────────────
// Format: SJP-DR-001-M-PINK
export function generateVariantSKU(
  productSku: string,
  size: string,
  colour: string
): string {
  const sizeCode = size.replace(' ', '').toUpperCase().slice(0, 3)
  const colourCode = colour.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4)
  return `${productSku}-${sizeCode}-${colourCode}`
}

// ── BARCODE SVG RENDERER ──────────────────────────────────────────────────────
// EAN-13 L-code patterns (7-bit, bar/space)
const EAN13_L: Record<string, string> = {
  '0':'0001101','1':'0011001','2':'0010011','3':'0111101','4':'0100011',
  '5':'0110001','6':'0101111','7':'0111011','8':'0110111','9':'0001011',
}
// G-codes (inverted L)
const EAN13_G: Record<string, string> = {
  '0':'0100111','1':'0110011','2':'0011011','3':'0100001','4':'0011101',
  '5':'0111001','6':'0000101','7':'0010001','8':'0001001','9':'0010111',
}
// R-codes (complement of L)
const EAN13_R: Record<string, string> = {
  '0':'1110010','1':'1100110','2':'1101100','3':'1000010','4':'1011100',
  '5':'1001110','6':'1010000','7':'1000100','8':'1001000','9':'1110100',
}
// First digit structure (L=L-code, G=G-code for digits 2-7)
const EAN13_FIRST: Record<string, string> = {
  '0':'LLLLLL','1':'LLGLGG','2':'LLGGLG','3':'LLGGGL','4':'LGLLGG',
  '5':'LGGLLG','6':'LGGGLL','7':'LGLGLG','8':'LGLGGL','9':'LGGL',
}

export function renderEAN13SVG(
  barcode: string,
  options: {
    width?: number; height?: number;
    showText?: boolean; textSize?: number;
    color?: string; backgroundColor?: string
  } = {}
): string {
  const {
    width = 200, height = 80,
    showText = true, textSize = 10,
    color = '#1A1A2E', backgroundColor = '#ffffff',
  } = options

  if (!validateEAN13(barcode)) return '<text>Invalid EAN-13</text>'

  const first = barcode[0]
  const leftDigits = barcode.slice(1, 7)
  const rightDigits = barcode.slice(7, 13)
  const structure = EAN13_FIRST[first] || 'LLLLLL'

  let bits = '101' // start guard

  for (let i = 0; i < 6; i++) {
    const code = structure[i] === 'G' ? EAN13_G[leftDigits[i]] : EAN13_L[leftDigits[i]]
    bits += code
  }

  bits += '01010' // center guard

  for (let i = 0; i < 6; i++) {
    bits += EAN13_R[rightDigits[i]]
  }

  bits += '101' // end guard

  const moduleWidth = width / (bits.length + 10)
  const barHeight = showText ? height - 15 : height - 2
  let x = moduleWidth * 5 // left quiet zone
  let svgBars = ''

  for (const bit of bits) {
    if (bit === '1') {
      svgBars += `<rect x="${x.toFixed(2)}" y="0" width="${moduleWidth.toFixed(2)}" height="${barHeight}" fill="${color}" />`
    }
    x += moduleWidth
  }

  const textY = height - 2
  const leftTextX = width * 0.28
  const rightTextX = width * 0.73

  const textElements = showText ? `
    <text x="2" y="${textY}" font-family="monospace" font-size="${textSize}" fill="${color}">${first}</text>
    <text x="${leftTextX}" y="${textY}" font-family="monospace" font-size="${textSize}" fill="${color}" text-anchor="middle">${leftDigits}</text>
    <text x="${rightTextX}" y="${textY}" font-family="monospace" font-size="${textSize}" fill="${color}" text-anchor="middle">${rightDigits}</text>
  ` : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${backgroundColor !== 'transparent' ? `<rect width="${width}" height="${height}" fill="${backgroundColor}" />` : ''}
    ${svgBars}
    ${textElements}
  </svg>`
}

// ── QR CODE URL (use external API or qrcode library) ─────────────────────────
export function getQRCodeUrl(data: string, size = 150): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=svg`
}

// ── LABEL TEMPLATE GENERATOR ──────────────────────────────────────────────────
export interface LabelData {
  brand: string; productName: string; sku: string
  barcode: string; price: number; size?: string
  colour?: string; material?: string; barcodeType?: 'EAN13' | 'CODE128' | 'QR'
}

export function generateLabelHTML(data: LabelData, copies = 1): string {
  const { brand, productName, sku, barcode, price, size, colour, barcodeType = 'EAN13' } = data
  const barcodeSection = barcodeType === 'QR'
    ? `<img src="${getQRCodeUrl(barcode, 60)}" width="60" height="60" />`
    : renderEAN13SVG(barcode, { width: 140, height: 50, showText: true })

  const singleLabel = `
    <div style="
      border: 1px solid #ccc; border-radius: 4px; padding: 8px 10px;
      width: 150px; display: inline-flex; flex-direction: column;
      align-items: center; gap: 3px; margin: 4px; page-break-inside: avoid;
      font-family: Arial, sans-serif; background: white;
    ">
      <div style="font-size:8px;font-weight:bold;letter-spacing:.1em;color:#333;text-transform:uppercase">${brand}</div>
      <div style="font-size:10px;font-weight:bold;color:#1A1A2E;text-align:center;line-height:1.2">${productName.slice(0, 28)}</div>
      ${size || colour ? `<div style="font-size:8px;color:#666">${[size, colour].filter(Boolean).join(' · ')}</div>` : ''}
      <div style="margin: 4px 0">${barcodeSection}</div>
      <div style="font-size:13px;font-weight:bold;color:#1A1A2E">৳${price.toLocaleString()}</div>
      <div style="font-size:8px;color:#888;font-family:monospace;letter-spacing:.04em">${sku}</div>
    </div>`

  return Array(copies).fill(singleLabel).join('')
}

// ── BULK LABEL SHEET (A4 = 24 labels, 3 columns × 8 rows) ────────────────────
export function generateLabelSheet(labels: LabelData[], copiesEach = 1): string {
  const allLabels = labels.flatMap(l => Array(copiesEach).fill(l))
  const labelItems = allLabels.map(l => generateLabelHTML(l, 1)).join('')

  return `<!DOCTYPE html><html><head>
    <title>Shajpori Barcode Labels</title>
    <style>
      @media print { @page { size: A4; margin: 8mm; } }
      body { margin: 0; padding: 0; }
      .sheet { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px; }
    </style>
  </head><body>
    <div class="sheet">${labelItems}</div>
  </body></html>`
}
