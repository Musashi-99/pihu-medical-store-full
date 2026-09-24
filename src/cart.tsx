import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { MEDICINES, packsOf, track, type CartLine } from './catalog'

const KEY = 'medicare-cart'

function load(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]') as CartLine[]
    if (!Array.isArray(raw)) return []
    return raw.flatMap(line => {
      const medicine = MEDICINES.find(m => m.id === line.medicineId)
      if (!medicine) return []
      const pack = packsOf(medicine).find(p => p.id === line.packId) ?? packsOf(medicine)[0]
      const qty = Math.max(1, Math.min(10, Number(line.qty) || 1))
      return [{ medicineId: medicine.id, packId: pack.id, qty }]
    })
  } catch {
    return []
  }
}

interface CartApi {
  lines: CartLine[]
  count: number
  add: (medicineId: number, packId: string, qty?: number) => void
  setQty: (medicineId: number, packId: string, qty: number) => void
  remove: (medicineId: number, packId: string) => void
}

const CartCtx = createContext<CartApi | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(lines))
  }, [lines])

  const add = (medicineId: number, packId: string, qty = 1) => {
    const medicine = MEDICINES.find(m => m.id === medicineId)
    if (!medicine?.inStock) return
    const pack = packsOf(medicine).find(p => p.id === packId) ?? packsOf(medicine)[0]
    const q = Math.max(1, Math.min(10, qty))
    setLines(prev => {
      const i = prev.findIndex(l => l.medicineId === medicineId && l.packId === pack.id)
      if (i < 0) return [...prev, { medicineId, packId: pack.id, qty: q }]
      const next = prev.slice()
      next[i] = { ...next[i], qty: Math.min(10, next[i].qty + q) }
      return next
    })
    track('add_to_cart', { id: String(medicineId), name: pack.name, qty: String(q) })
  }

  const setQty = (medicineId: number, packId: string, qty: number) => {
    setLines(prev => prev.flatMap(l => {
      if (l.medicineId !== medicineId || l.packId !== packId) return [l]
      if (qty < 1) return []
      return [{ ...l, qty: Math.min(10, qty) }]
    }))
  }

  const remove = (medicineId: number, packId: string) => {
    setLines(prev => prev.filter(l => !(l.medicineId === medicineId && l.packId === packId)))
  }

  const count = lines.reduce((s, l) => s + l.qty, 0)

  return <CartCtx.Provider value={{ lines, count, add, setQty, remove }}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart')
  return ctx
}
