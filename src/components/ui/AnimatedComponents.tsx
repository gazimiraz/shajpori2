'use client'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useRef } from 'react'

export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
)

export const StaggerContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div className={className} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div className={className} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}>
    {children}
  </motion.div>
)

export const ProductCardMotion = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div className={className} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(255,105,180,0.25)', transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } }} transition={{ duration: 0.4 }}>
    {children}
  </motion.div>
)

export const ModalMotion = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div className="fixed inset-0 bg-black/60 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="pointer-events-auto" initial={{ scale: 0.88, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 280 }} onClick={e => e.stopPropagation()}>
            {children}
          </motion.div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export const ToastMotion = ({ isVisible, message, emoji = '✓' }: { isVisible: boolean; message: string; emoji?: string }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div className="fixed bottom-6 left-1/2 z-[999] flex items-center gap-2 bg-[#1A1A2E] text-white px-5 py-3 rounded-full text-sm font-semibold shadow-2xl" initial={{ opacity: 0, y: 60, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 40, x: '-50%' }} transition={{ type: 'spring', damping: 20, stiffness: 250 }}>
        <span className="text-[#FF69B4]">{emoji}</span>{message}
      </motion.div>
    )}
  </AnimatePresence>
)

export const PinkButton = ({ children, onClick, className, disabled }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) => (
  <motion.button onClick={onClick} disabled={disabled} className={className} whileHover={{ scale: 1.03, backgroundColor: '#FF1493' }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
    {children}
  </motion.button>
)

export const BentoCard = ({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => (
  <motion.div className={className} onClick={onClick} whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] } }} whileTap={{ scale: 0.98 }}>
    {children}
  </motion.div>
)

export const StatCard = ({ label, value, change, icon, color }: { label: string; value: string; change?: string; icon: string; color: string }) => (
  <motion.div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" whileHover={{ y: -3 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      {change && <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{change}</span>}
    </div>
    <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
    <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
    <div className={`h-1 mt-3 rounded-full ${color}`} />
  </motion.div>
)
