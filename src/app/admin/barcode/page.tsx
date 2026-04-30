'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Search, Printer, ChevronRight, CheckSquare, Square,
  Barcode as BarcodeIcon, ArrowLeft, Layers,
} from 'lucide-react'
import Link from 'next/link'
import { useSettingsStore } from '@/store/settingsStore'

const BarcodeRenderer = dynamic(() => import('react-barcode'), { ssr: false })

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Variant { id: string; sku: string; color?: string; size?: string; price: number }
interface Product  { id: string; name: string; variants: Variant[] }
interface Settings {
  labelSize:   string
  perRow:      number
  copies:      number
  showName:    boolean
  showPrice:   boolean
  showSku:     boolean
  showShop:    boolean
  barcodeType: string
}

/* ─── Mock products ─────────────────────────────────────────────────────── */
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Floral Maxi Dress',
    variants: [
      { id: 'v1a', sku: 'SHJ-FMD-RED-M', color: 'Red',  size: 'M', price: 1490 },
      { id: 'v1b', sku: 'SHJ-FMD-RED-L', color: 'Red',  size: 'L', price: 1490 },
      { id: 'v1c', sku: 'SHJ-FMD-BLU-M', color: 'Blue', size: 'M', price: 1490 },
    ],
  },
  {
    id: 'p2', name: 'Tote Handbag',
    variants: [
      { id: 'v2a', sku: 'SHJ-THB-BLK', color: 'Black', price: 2200 },
      { id: 'v2b', sku: 'SHJ-THB-BRN', color: 'Brown', price: 2200 },
    ],
  },
  {
    id: 'p3', name: 'Gold Earring Set',
    variants: [
      { id: 'v3a', sku: 'SHJ-GES-001', price: 650 },
      { id: 'v3b', sku: 'SHJ-GES-002', price: 750 },
    ],
  },
  {
    id: 'p4', name: 'Embroidered Kurti',
    variants: [
      { id: 'v4a', sku: 'SHJ-EK-WHT-S', color: 'White', size: 'S', price: 1850 },
      { id: 'v4b', sku: 'SHJ-EK-WHT-M', color: 'White', size: 'M', price: 1850 },
      { id: 'v4c', sku: 'SHJ-EK-WHT-L', color: 'White', size: 'L', price: 1850 },
      { id: 'v4d', sku: 'SHJ-EK-PNK-M', color: 'Pink',  size: 'M', price: 1850 },
    ],
  },
  {
    id: 'p5', name: 'Silk Scarf',
    variants: [
      { id: 'v5a', sku: 'SHJ-SS-MUL', color: 'Multi', price: 550 },
      { id: 'v5b', sku: 'SHJ-SS-BLK', color: 'Black', price: 550 },
    ],
  },
]

const LABEL_SIZES = [
  { label: '50mm × 30mm (Standard)', w: 189, h: 113, mm: '50mm 30mm' },
  { label: '40mm × 25mm (Small)',    w: 151, h: 94,  mm: '40mm 25mm' },
  { label: '60mm × 40mm (Large)',    w: 227, h: 151, mm: '60mm 40mm' },
  { label: '100mm × 50mm (Wide)',    w: 378, h: 189, mm: '100mm 50mm' },
]
const PER_ROW_OPTS  = [1, 2, 3, 4]
const BARCODE_TYPES = [
  { val: 'CODE128', label: 'CODE128 (Recommended)' },
  { val: 'CODE39',  label: 'CODE39' },
  { val: 'EAN13',   label: 'EAN-13 (13 digits)' },
  { val: 'UPC',     label: 'UPC-A (12 digits)' },
]

/* ─── Barcode code formatter ─────────────────────────────────────────────── */
function formatCode(sku: string, type: string) {
  const raw = sku.replace(/[^0-9A-Z-]/gi, '')
  if (type === 'EAN13') return raw.replace(/\D/g, '').padStart(13, '0').slice(0, 13)
  if (type === 'UPC')   return raw.replace(/\D/g, '').padStart(12, '0').slice(0, 12)
  return raw || '0000000000'
}

/* ─── Label component ────────────────────────────────────────────────────── */
function Label({ variant, product, settings, shopName, compact = false }: {
  variant: Variant; product: Product; settings: Settings; shopName: string; compact?: boolean
}) {
  const sz = LABEL_SIZES.find(s => s.label === settings.labelSize) ?? LABEL_SIZES[0]
  const scale   = compact ? 0.72 : 1
  const w       = sz.w * scale
  const h       = sz.h * scale
  const barcodeH = Math.max(24, h * 0.38)
  const fs      = w < 140 ? 7 : w < 170 ? 8 : 9
  const code    = formatCode(variant.sku, settings.barcodeType)

  return (
    <div className="label-item flex flex-col items-center justify-between border border-gray-300 bg-white overflow-hidden"
      style={{ width: w, height: h, padding: '3px 5px', boxSizing: 'border-box', flexShrink: 0 }}>
      {settings.showName && (
        <p className="w-full text-center font-bold leading-tight truncate"
          style={{ fontSize: fs, color: '#111' }}>{product.name}</p>
      )}
      {(variant.color || variant.size) && (
        <p className="w-full text-center leading-none text-gray-500"
          style={{ fontSize: fs - 1 }}>
          {[variant.color, variant.size].filter(Boolean).join(' / ')}
        </p>
      )}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <BarcodeRenderer value={code}
          format={settings.barcodeType as 'CODE128' | 'CODE39'}
          height={barcodeH} width={1} fontSize={fs - 1} margin={1}
          displayValue background="transparent" />
      </div>
      <div className="w-full flex items-center justify-between">
        {settings.showSku && (
          <span className="font-mono truncate text-gray-500" style={{ fontSize: fs - 1 }}>{variant.sku}</span>
        )}
        {settings.showPrice && (
          <span className="font-bold ml-auto" style={{ fontSize: fs, color: '#C2185B' }}>৳{variant.price}</span>
        )}
      </div>
      {settings.showShop && (
        <p className="w-full text-center text-gray-400" style={{ fontSize: fs - 1 }}>{shopName}</p>
      )}
    </div>
  )
}

/* ─── Print helpers ──────────────────────────────────────────────────────── */
function buildLabelHTML(
  labels: { variant: Variant; product: Product }[],
  settings: Settings,
  shopName: string,
  single: boolean,
): string {
  const sz = LABEL_SIZES.find(s => s.label === settings.labelSize) ?? LABEL_SIZES[0]

  // build inner label HTML for each item
  const labelsHTML = labels.map(({ variant, product }) => {
    const code = formatCode(variant.sku, settings.barcodeType)
    const variantLine = [variant.color, variant.size].filter(Boolean).join(' / ')
    return `
      <div class="label">
        ${settings.showName ? `<p class="name">${product.name}</p>` : ''}
        ${variantLine ? `<p class="variant">${variantLine}</p>` : ''}
        <div class="bc-wrap">
          <svg id="bc-${variant.id}" class="bc"></svg>
        </div>
        <div class="bottom">
          ${settings.showSku   ? `<span class="sku">${variant.sku}</span>` : ''}
          ${settings.showPrice ? `<span class="price">&#2547;${variant.price}</span>` : ''}
        </div>
        ${settings.showShop ? `<p class="shop">${shopName}</p>` : ''}
        <script>
          (function(){
            var el = document.getElementById("bc-${variant.id}");
            JsBarcode(el, "${code}", {
              format:"${settings.barcodeType === 'EAN13' ? 'EAN13' : settings.barcodeType === 'UPC' ? 'UPC' : settings.barcodeType}",
              height:${Math.max(24, sz.h * 0.38)},
              width:1,
              fontSize:8,
              margin:1,
              displayValue:true,
              background:"transparent"
            });
          })();
        </script>
      </div>`
  }).join('')

  const pageSize = single ? `@page { size: ${sz.mm}; margin: 0; }` : `@page { margin: 4mm; }`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<style>
  ${pageSize}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; font-family: sans-serif; }
  .wrap { display: flex; flex-wrap: wrap; gap: ${single ? '0' : '4px'}; padding: ${single ? '0' : '4px'}; }
  .label {
    width: ${sz.w}px; height: ${sz.h}px;
    border: 1px solid #aaa;
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    padding: 3px 5px; overflow: hidden;
    page-break-inside: avoid;
  }
  .name    { font-size: 9px; font-weight: 700; text-align: center; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .variant { font-size: 8px; color: #555; text-align: center; }
  .bc-wrap { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden; }
  .bc      { max-width: 100%; }
  .bottom  { width: 100%; display: flex; justify-content: space-between; align-items: center; }
  .sku     { font-size: 7px; font-family: monospace; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .price   { font-size: 9px; font-weight: 700; color: #C2185B; margin-left: auto; }
  .shop    { font-size: 7px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="wrap">${labelsHTML}</div>
<script>window.onload = function(){ window.print(); };</script>
</body>
</html>`
}

function printHTML(html: string) {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open(); doc.write(html); doc.close()
  iframe.contentWindow?.addEventListener('afterprint', () => {
    document.body.removeChild(iframe)
  })
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function BarcodePage() {
  const { storeName } = useSettingsStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [settings, setSettings] = useState<Settings>({
    labelSize: '50mm × 30mm (Standard)', perRow: 3, copies: 1,
    showName: true, showPrice: true, showSku: true, showShop: false,
    barcodeType: 'CODE128',
  })

  const filtered = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()))
  )

  function toggleVariant(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function selectProduct(p: Product) {
    setSelected(s => { const n = new Set(s); p.variants.forEach(v => n.add(v.id)); return n })
  }
  function deselectProduct(p: Product) {
    setSelected(s => { const n = new Set(s); p.variants.forEach(v => n.delete(v.id)); return n })
  }
  function selectAll() { setSelected(new Set(MOCK_PRODUCTS.flatMap(p => p.variants.map(v => v.id)))) }
  function clearAll()  { setSelected(new Set()) }
  function toggleExpand(id: string) {
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  /* collect all selected label items */
  const labelItems: { variant: Variant; product: Product }[] = []
  MOCK_PRODUCTS.forEach(p =>
    p.variants.forEach(v => {
      if (selected.has(v.id)) {
        for (let i = 0; i < settings.copies; i++) labelItems.push({ variant: v, product: p })
      }
    })
  )

  /* Print all selected */
  function handlePrintAll() {
    if (!labelItems.length) return
    printHTML(buildLabelHTML(labelItems, settings, storeName, false))
  }

  /* Print one single label — for dedicated label printer */
  function handlePrintSingle(variant: Variant, product: Product) {
    printHTML(buildLabelHTML([{ variant, product }], settings, storeName, true))
  }

  const sz = LABEL_SIZES.find(s => s.label === settings.labelSize) ?? LABEL_SIZES[0]

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
        <Link href="/admin/settings"
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF7ED' }}>
          <BarcodeIcon size={18} style={{ color: '#EA580C' }} />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-gray-900 leading-tight">Barcode Label Print</h1>
          <p className="text-[12px] text-gray-500">Generate and print barcode labels — bulk or single for your label printer</p>
        </div>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-4 items-start">

        {/* ── LEFT ────────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Product selector */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-700 mb-2">Select Products</p>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or SKU…"
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={selectAll}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                  style={{ background: '#EA580C' }}>Select All</button>
                <button onClick={clearAll}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50">Clear All</button>
              </div>
            </div>

            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {filtered.map(p => {
                const allSel  = p.variants.every(v => selected.has(v.id))
                const someSel = p.variants.some(v => selected.has(v.id))
                const isExp   = expanded.has(p.id)
                return (
                  <div key={p.id}>
                    <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50">
                      <button onClick={() => toggleExpand(p.id)}
                        className={`transition-transform shrink-0 ${isExp ? 'rotate-90' : ''}`}>
                        <ChevronRight size={13} className="text-gray-400" />
                      </button>
                      <button onClick={() => allSel ? deselectProduct(p) : selectProduct(p)} className="shrink-0">
                        {allSel
                          ? <CheckSquare size={14} style={{ color: '#EA580C' }} />
                          : someSel
                          ? <div className="w-3.5 h-3.5 rounded border-2 border-orange-400 bg-orange-100" />
                          : <Square size={14} className="text-gray-300" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.variants.length} variant{p.variants.length !== 1 ? 's' : ''}</p>
                      </div>
                      <button onClick={() => selectProduct(p)}
                        className="text-[10px] font-semibold shrink-0" style={{ color: '#EA580C' }}>
                        Select All
                      </button>
                    </div>

                    {isExp && (
                      <div className="bg-gray-50 px-4 py-1 divide-y divide-gray-100">
                        {p.variants.map(v => (
                          <div key={v.id} className="flex items-center gap-2 py-2">
                            <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleVariant(v.id)}
                              className="w-3 h-3 accent-orange-500 shrink-0" />
                            <span className="text-[11px] font-mono text-gray-600 flex-1 truncate">{v.sku}</span>
                            {(v.color || v.size) && (
                              <span className="text-[10px] text-gray-400 shrink-0">{[v.color, v.size].filter(Boolean).join(' / ')}</span>
                            )}
                            <span className="text-[11px] font-bold text-gray-700 shrink-0">৳{v.price}</span>
                            {/* Single print button per variant */}
                            <button onClick={() => handlePrintSingle(v, p)} title="Print single label"
                              className="p-1 rounded hover:bg-orange-100 text-gray-300 hover:text-orange-500 transition-colors shrink-0">
                              <Printer size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-2 border-t border-gray-100 text-[11px] text-gray-400">
              Selected: <span className="font-semibold text-gray-700">{selected.size} variant{selected.size !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Label settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
            <p className="text-[12px] font-bold text-gray-700">Label Settings</p>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Label Size</label>
              <select value={settings.labelSize} onChange={e => setSettings(s => ({ ...s, labelSize: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-200">
                {LABEL_SIZES.map(v => <option key={v.label} value={v.label}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Labels Per Row (bulk)</label>
              <select value={settings.perRow}
                onChange={e => setSettings(s => ({ ...s, perRow: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-200">
                {PER_ROW_OPTS.map(v => <option key={v} value={v}>{v} per row</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Copies Per Product</label>
              <input type="number" min={1} max={100} value={settings.copies}
                onChange={e => setSettings(s => ({ ...s, copies: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-2">Display Options</label>
              <div className="space-y-2">
                {[
                  { key: 'showName', label: 'Product Name' },
                  { key: 'showPrice', label: 'Price' },
                  { key: 'showSku', label: 'SKU Number' },
                  { key: 'showShop', label: 'Shop Name' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings[key as keyof Settings] as boolean}
                      onChange={() => setSettings(s => ({ ...s, [key]: !s[key as keyof Settings] }))}
                      className="w-3.5 h-3.5 accent-orange-500" />
                    <span className="text-[12px] text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Barcode Type</label>
              <select value={settings.barcodeType}
                onChange={e => setSettings(s => ({ ...s, barcodeType: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-200">
                {BARCODE_TYPES.map(({ val, label }) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── RIGHT — preview ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <p className="text-[13px] font-bold text-gray-800">Label Preview</p>
              {labelItems.length > 0 && (
                <span className="text-[11px] text-gray-400">
                  {labelItems.length} label{labelItems.length !== 1 ? 's' : ''}
                  {settings.copies > 1 && ` · ${settings.copies} copies`}
                </span>
              )}
            </div>

            {/* Print buttons */}
            <div className="flex items-center gap-2">
              {/* Single — prints the first selected label on exact label-size page */}
              <button
                onClick={() => labelItems[0] && handlePrintSingle(labelItems[0].variant, labelItems[0].product)}
                disabled={labelItems.length === 0}
                title="Print a single label — ideal for dedicated label printers (no page margins, exact label size)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 text-[12px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-orange-600 hover:bg-orange-50">
                <Printer size={13} /> Print Single
              </button>
              {/* Bulk — print all selected */}
              <button onClick={handlePrintAll} disabled={labelItems.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[12px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#EA580C' }}>
                <Layers size={13} /> Print All ({labelItems.length})
              </button>
            </div>
          </div>

          {/* Print mode hint */}
          {labelItems.length > 0 && (
            <div className="flex gap-4 px-5 py-2.5 bg-orange-50 border-b border-orange-100 text-[11px] text-orange-700">
              <span className="flex items-center gap-1"><Printer size={11} /><strong>Print Single</strong> — sends exactly one label at {sz.mm.replace(' ', ' × ')} to your label printer with no margins</span>
              <span className="flex items-center gap-1"><Layers size={11} /><strong>Print All</strong> — bulk print on standard paper with all {labelItems.length} labels</span>
            </div>
          )}

          <div className="p-5 min-h-72">
            {labelItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <BarcodeIcon size={32} className="text-gray-200" />
                </div>
                <p className="text-[13px] font-semibold text-gray-400">No products selected</p>
                <p className="text-[11px] text-gray-300 mt-1">Select products from the left panel to preview labels</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {labelItems.map((li, i) => (
                  <div key={i} className="relative group">
                    <Label variant={li.variant} product={li.product} settings={settings} shopName={storeName} compact />
                    {/* Hover: single print button on each label */}
                    <button
                      onClick={() => handlePrintSingle(li.variant, li.product)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Print this label">
                      <span className="flex items-center gap-1 bg-white text-[11px] font-bold text-orange-600 px-2 py-1 rounded-lg shadow">
                        <Printer size={11} /> Print
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
