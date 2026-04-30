'use client'
// src/components/admin/POSReceipt.tsx
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Printer, X, Download } from 'lucide-react'
import type { POSSale } from '@/types/pos'

interface POSReceiptProps {
  sale: POSSale
  onClose: () => void
}

const PAY_LABEL: Record<string, string> = {
  cash: 'Cash', card: 'Card', bkash: 'bKash', nagad: 'Nagad', cod: 'COD'
}

export default function POSReceipt({ sale, onClose }: POSReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt — ${sale.sale_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; padding: 2px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; padding: 4px 0; }
          .small { font-size: 9px; color: #666; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:16px;margin-bottom:4px">SHAJPORI</div>
        <div class="center small">Dhaka, Bangladesh</div>
        <div class="center small">+880 1700-000000</div>
        <div class="divider"></div>
        <div class="row"><span class="bold">${sale.sale_number}</span><span>${new Date(sale.created_at).toLocaleString('en-BD', { day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit' })}</span></div>
        ${sale.customer_name ? `<div class="row"><span>Customer:</span><span>${sale.customer_name}</span></div>` : ''}
        ${sale.customer_phone ? `<div class="row"><span>Phone:</span><span>${sale.customer_phone}</span></div>` : ''}
        <div class="divider"></div>
        ${sale.items.map(item => `
          <div style="margin-bottom:4px">
            <div class="bold">${item.name}</div>
            <div class="row">
              <span class="small">${item.size} · ${item.colour} × ${item.qty}</span>
              <span>৳${item.total_price.toLocaleString()}</span>
            </div>
          </div>`).join('')}
        <div class="divider"></div>
        <div class="row"><span>Subtotal</span><span>৳${sale.subtotal.toLocaleString()}</span></div>
        ${sale.discount_amt > 0 ? `<div class="row"><span>Discount (${sale.discount_pct}%)</span><span>-৳${sale.discount_amt.toLocaleString()}</span></div>` : ''}
        ${sale.tax_amount > 0 ? `<div class="row"><span>Tax</span><span>৳${sale.tax_amount.toLocaleString()}</span></div>` : ''}
        <div class="divider"></div>
        <div class="total-row"><span>TOTAL</span><span>৳${sale.total_amount.toLocaleString()}</span></div>
        <div class="row"><span>Payment</span><span>${PAY_LABEL[sale.payment_method] || sale.payment_method}</span></div>
        ${sale.amount_tendered ? `<div class="row"><span>Tendered</span><span>৳${sale.amount_tendered.toLocaleString()}</span></div>` : ''}
        ${sale.change_given !== undefined && sale.change_given !== null ? `<div class="row"><span>Change</span><span>৳${sale.change_given.toLocaleString()}</span></div>` : ''}
        <div class="divider"></div>
        <div class="center small" style="margin-top:6px">Thank you for shopping at Shajpori!</div>
        <div class="center small">Exchange within 7 days with this receipt.</div>
        <div class="center small" style="margin-top:4px">www.shajpori.com</div>
      </body>
      </html>`)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-display text-base font-bold text-[#1A1A2E]">Sale Complete ✓</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Receipt */}
        <div ref={receiptRef} className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs">
            {/* Store header */}
            <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
              <p className="text-sm font-bold text-[#1A1A2E] tracking-wider">SHAJPORI</p>
              <p className="text-gray-400">Dhaka, Bangladesh</p>
              <p className="text-gray-400 mt-1">{sale.sale_number}</p>
              <p className="text-gray-400">{new Date(sale.created_at).toLocaleString('en-BD')}</p>
              {sale.customer_name && <p className="text-gray-500 mt-1">Customer: {sale.customer_name}</p>}
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-gray-300 pb-3 mb-3 space-y-2">
              {sale.items.map((item, i) => (
                <div key={i}>
                  <p className="font-bold text-[#1A1A2E]">{item.name}</p>
                  <div className="flex justify-between text-gray-500">
                    <span>{item.size} · {item.colour} × {item.qty}</span>
                    <span>৳{item.total_price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>৳{sale.subtotal.toLocaleString()}</span>
              </div>
              {sale.discount_amt > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount ({sale.discount_pct}%)</span>
                  <span>-৳{sale.discount_amt.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-sm text-[#1A1A2E] border-t border-dashed border-gray-300 pt-2 mb-2">
              <span>TOTAL</span><span>৳{sale.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment</span><span className="capitalize">{PAY_LABEL[sale.payment_method]}</span>
            </div>
            {sale.amount_tendered && <div className="flex justify-between text-gray-500"><span>Tendered</span><span>৳{sale.amount_tendered.toLocaleString()}</span></div>}
            {sale.change_given !== undefined && sale.change_given > 0 && (
              <div className="flex justify-between font-bold text-green-600"><span>Change</span><span>৳{sale.change_given.toLocaleString()}</span></div>
            )}

            {/* Footer */}
            <div className="text-center text-gray-400 border-t border-dashed border-gray-300 pt-3 mt-3">
              <p>Thank you for shopping at Shajpori!</p>
              <p>Exchange within 7 days with this receipt.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <motion.button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A1A2E] text-white rounded-xl py-2.5 text-sm font-semibold"
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
          >
            <Printer size={14} /> Print Receipt
          </motion.button>
          <motion.button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FF69B4] text-white rounded-xl py-2.5 text-sm font-semibold"
            whileHover={{ backgroundColor: '#FF1493' }}
            whileTap={{ scale: 0.97 }}
          >
            New Sale
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
