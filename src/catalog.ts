export const WHATSAPP_NUMBER = '919097046343'
export const ORDER_WHATSAPP_NUMBER = '917277333091'

/** Paste a Google Apps Script web app URL. Each order tap is appended as one row. */
export const SHEET_WEBHOOK = ''

export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=24.942858,84.836188'

export const SERVICE_PINCODES = new Set(['824236'])

export interface Pack {
  id: string
  name: string
  unit: string
  price: number
  label: string
}

export interface Medicine {
  id: number
  name: string
  generic: string
  brand: string
  category: string
  price: number
  unit: string
  requiresPrescription: boolean
  inStock: boolean
  description: string
  dosage: string
  uses: string[]
  sideEffects: string[]
  image: string
  bgColor: string
  packs?: Pack[]
}

export interface CartLine {
  medicineId: number
  packId: string
  qty: number
}

export interface CustomerForm {
  name: string
  phone: string
  mode: 'delivery' | 'pickup'
  slot: string
  area: string
  address: string
  pincode: string
  hasPrescription: boolean
}

export type OrderError = 'empty' | 'oos' | 'closed' | 'name' | 'phone' | 'slot' | 'area' | 'address' | 'pin' | 'pinArea' | 'rx'

export type Lang = 'en' | 'hi'

export const CATEGORIES = ['All', 'Antibiotics', 'Vitamins', 'Pain Relief', 'Diabetes', 'Cardiac', 'Skin Care', 'Digestive', 'Eye & Ear']

export const PAIRED: Record<number, number[]> = {
  1: [3, 10],
  2: [10, 3],
  3: [8, 10],
  4: [5],
  5: [9],
  6: [12],
  7: [3],
  8: [7, 3],
  9: [5],
  10: [2],
  11: [3],
  12: [10],
}

const WEEK_SLOTS = [
  { id: '8-11', label: { en: '8:00 AM - 11:00 AM', hi: 'सुबह 8 - 11' } },
  { id: '11-14', label: { en: '11:00 AM - 2:00 PM', hi: 'सुबह 11 - दोपहर 2' } },
  { id: '14-17', label: { en: '2:00 PM - 5:00 PM', hi: 'दोपहर 2 - शाम 5' } },
  { id: '17-20', label: { en: '5:00 PM - 8:00 PM', hi: 'शाम 5 - रात 8' } },
  { id: '20-21', label: { en: '8:00 PM - 9:00 PM', hi: 'रात 8 - 9' } },
]

const SUNDAY_SLOTS = [
  { id: '10-13', label: { en: '10:00 AM - 1:00 PM', hi: 'सुबह 10 - दोपहर 1' } },
  { id: '13-16', label: { en: '1:00 PM - 4:00 PM', hi: 'दोपहर 1 - शाम 4' } },
  { id: '16-18', label: { en: '4:00 PM - 6:00 PM', hi: 'शाम 4 - 6' } },
]

export const MEDICINES: Medicine[] = [
  {
    id: 1, name: 'Amoxicillin 500mg', generic: 'Amoxicillin', brand: 'Amoxil',
    category: 'Antibiotics', price: 89, unit: '10 Capsules',
    requiresPrescription: true, inStock: true,
    description: 'A broad-spectrum antibiotic belonging to the penicillin group, effective against a wide range of bacterial infections including respiratory tract, urinary tract, and skin infections.',
    dosage: '500mg every 8 hours for 7–14 days as prescribed by your doctor',
    uses: ['Respiratory tract infections', 'Urinary tract infections', 'Ear infections', 'Skin & soft tissue infections'],
    sideEffects: ['Nausea', 'Diarrhoea', 'Skin rash', 'Allergic reactions in sensitive individuals'],
    image: `${import.meta.env.BASE_URL}images/capsules.png`,
    bgColor: '#e8f4f0',
  },
  {
    id: 2, name: 'Vitamin D3 1000IU', generic: 'Cholecalciferol', brand: 'D-Rise',
    category: 'Vitamins', price: 145, unit: '60 Tablets',
    requiresPrescription: false, inStock: true,
    description: 'Essential fat-soluble vitamin crucial for calcium absorption, bone mineralisation, immune function, and overall cellular health. Particularly important for individuals with limited sun exposure.',
    dosage: '1 tablet daily with a meal or as directed by your healthcare provider',
    uses: ['Bone health & calcium absorption', 'Immune system support', 'Muscle function', 'Prevention of vitamin D deficiency'],
    sideEffects: ['Generally well tolerated', 'Excessive doses may cause nausea', 'Weakness at very high doses'],
    image: `${import.meta.env.BASE_URL}images/vitamins.png`,
    bgColor: '#fff8e8',
    packs: [
      { id: '1000', name: 'Vitamin D3 1000IU', unit: '60 Tablets', price: 145, label: '1000 IU · 60 Tablets' },
      { id: '3000', name: 'Vitamin D3 3000IU', unit: '30 Tablets', price: 249, label: '3000 IU · 30 Tablets' },
    ],
  },
  {
    id: 3, name: 'Paracetamol 650mg', generic: 'Acetaminophen', brand: 'Calpol',
    category: 'Pain Relief', price: 28, unit: '15 Tablets',
    requiresPrescription: false, inStock: true,
    description: 'A widely used analgesic and antipyretic medication that provides effective relief from mild to moderate pain and reduces elevated body temperature safely for most age groups.',
    dosage: '1 tablet every 4–6 hours. Do not exceed 4 tablets in 24 hours',
    uses: ['Headache & migraine', 'Fever reduction', 'Body aches & muscle pain', 'Toothache & menstrual pain'],
    sideEffects: ['Rare at therapeutic doses', 'Liver damage with overdose', 'Allergic reactions in rare cases'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#fef0f0',
  },
  {
    id: 4, name: 'Metformin 500mg', generic: 'Metformin HCl', brand: 'Glycomet',
    category: 'Diabetes', price: 62, unit: '20 Tablets',
    requiresPrescription: true, inStock: true,
    description: 'First-line oral antidiabetic medication that works by decreasing hepatic glucose production and improving insulin sensitivity. Used in the management of type 2 diabetes mellitus.',
    dosage: '1 tablet twice daily with meals. Dose adjusted by physician based on blood sugar levels',
    uses: ['Type 2 diabetes management', 'Blood sugar control', 'Insulin resistance treatment', 'PCOS management (off-label)'],
    sideEffects: ['Nausea & vomiting (initially)', 'Diarrhoea', 'Lactic acidosis (rare)', 'Vitamin B12 reduction with long-term use'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#e8f0fe',
  },
  {
    id: 5, name: 'Atorvastatin 10mg', generic: 'Atorvastatin', brand: 'Lipitor',
    category: 'Cardiac', price: 135, unit: '10 Tablets',
    requiresPrescription: true, inStock: true,
    description: 'A potent HMG-CoA reductase inhibitor (statin) that significantly reduces LDL cholesterol and triglycerides while raising HDL levels, reducing cardiovascular disease risk.',
    dosage: '1 tablet at bedtime. Regular lipid monitoring recommended',
    uses: ['High LDL cholesterol', 'Cardiovascular risk reduction', 'Prevention of stroke & heart attack', 'Triglyceride management'],
    sideEffects: ['Muscle aches', 'Elevated liver enzymes', 'Headache', 'Digestive issues'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#fce8f3',
  },
  {
    id: 6, name: 'Clotrimazole Cream', generic: 'Clotrimazole', brand: 'Candid B',
    category: 'Skin Care', price: 98, unit: '20g Tube',
    requiresPrescription: false, inStock: true,
    description: 'A topical antifungal agent effective against a broad spectrum of dermatophytes and yeasts. Treats various superficial fungal infections of the skin, including tinea and candidiasis.',
    dosage: 'Apply a thin layer to the affected area twice daily. Continue for 2–4 weeks',
    uses: ['Ringworm & tinea', 'Athletes foot', 'Candidal skin infections', 'Pityriasis versicolor'],
    sideEffects: ['Mild skin irritation', 'Burning sensation on application', 'Peeling (initial phase)'],
    image: `${import.meta.env.BASE_URL}images/skincare.png`,
    bgColor: '#f0fce8',
  },
  {
    id: 7, name: 'Omeprazole 20mg', generic: 'Omeprazole', brand: 'Omez',
    category: 'Digestive', price: 72, unit: '14 Capsules',
    requiresPrescription: false, inStock: true,
    description: 'A proton pump inhibitor (PPI) that reduces stomach acid production by irreversibly blocking the hydrogen-potassium ATPase enzyme system of the gastric parietal cells.',
    dosage: '1 capsule 30 minutes before the first meal of the day',
    uses: ['Acid reflux & GERD', 'Peptic ulcer treatment', 'Zollinger-Ellison syndrome', 'H. pylori eradication (combined therapy)'],
    sideEffects: ['Headache', 'Diarrhoea or constipation', 'Nausea', 'Abdominal pain with prolonged use'],
    image: `${import.meta.env.BASE_URL}images/capsules.png`,
    bgColor: '#e8f8fe',
  },
  {
    id: 8, name: 'Ibuprofen 400mg', generic: 'Ibuprofen', brand: 'Brufen',
    category: 'Pain Relief', price: 38, unit: '15 Tablets',
    requiresPrescription: false, inStock: true,
    description: 'A non-steroidal anti-inflammatory drug (NSAID) providing effective relief from pain, inflammation, and fever. Works by blocking prostaglandin synthesis.',
    dosage: '1 tablet every 6–8 hours after food. Do not exceed 3 tablets in 24 hours',
    uses: ['Dental & menstrual pain', 'Arthritis & joint pain', 'Fever reduction', 'Post-operative pain'],
    sideEffects: ['Gastric irritation', 'Nausea', 'Dizziness', 'Not suitable for peptic ulcer patients'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#fef5e8',
  },
  {
    id: 9, name: 'Amlodipine 5mg', generic: 'Amlodipine besylate', brand: 'Norvasc',
    category: 'Cardiac', price: 88, unit: '10 Tablets',
    requiresPrescription: true, inStock: true,
    description: 'A dihydropyridine calcium channel blocker used for the treatment of hypertension and chronic stable angina. Relaxes blood vessel walls enabling easier blood flow.',
    dosage: '1 tablet daily at the same time each day. Do not stop without consulting your doctor',
    uses: ['Hypertension (high blood pressure)', 'Chronic stable angina', 'Vasospastic angina', 'Coronary artery disease'],
    sideEffects: ['Ankle swelling', 'Flushing & warmth', 'Headache', 'Palpitations'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#f8e8fe',
  },
  {
    id: 10, name: 'Vitamin C 1000mg', generic: 'Ascorbic Acid', brand: 'Limcee',
    category: 'Vitamins', price: 85, unit: '30 Tablets',
    requiresPrescription: false, inStock: true,
    description: 'A water-soluble antioxidant vitamin that plays vital roles in immune function, collagen synthesis, iron absorption, and protection against oxidative stress.',
    dosage: '1 effervescent tablet dissolved in water daily',
    uses: ['Immune system support', 'Collagen production', 'Iron absorption enhancement', 'Antioxidant protection'],
    sideEffects: ['Stomach upset at high doses', 'Kidney stones with chronic excessive use', 'Diarrhoea'],
    image: `${import.meta.env.BASE_URL}images/vitamins.png`,
    bgColor: '#fffce8',
    packs: [
      { id: '1000', name: 'Vitamin C 1000mg', unit: '30 Tablets', price: 85, label: '1000 mg · 30 Tablets' },
      { id: '500', name: 'Vitamin C 500mg', unit: '30 Tablets', price: 55, label: '500 mg · 30 Tablets' },
    ],
  },
  {
    id: 11, name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin HCl', brand: 'Ciplox',
    category: 'Antibiotics', price: 118, unit: '10 Tablets',
    requiresPrescription: true, inStock: false,
    description: 'A second-generation fluoroquinolone antibiotic with broad-spectrum activity against gram-negative and gram-positive bacteria, particularly effective for urinary and gastrointestinal infections.',
    dosage: '1 tablet twice daily for 5–14 days as prescribed. Take 2 hours apart from antacids',
    uses: ['Urinary tract infections', 'Gastrointestinal infections', 'Bone & joint infections', 'Respiratory infections'],
    sideEffects: ['Nausea & vomiting', 'Tendon rupture risk (rare)', 'Photosensitivity', 'CNS effects in elderly'],
    image: `${import.meta.env.BASE_URL}images/tablets.png`,
    bgColor: '#e8eff4',
  },
  {
    id: 12, name: 'Refresh Eye Drops', generic: 'Carboxymethylcellulose 0.5%', brand: 'Refresh Plus',
    category: 'Eye & Ear', price: 145, unit: '10ml Bottle',
    requiresPrescription: false, inStock: true,
    description: 'Sterile ophthalmic lubricant drops that provide long-lasting relief from dry, irritated eyes. Mimics natural tear composition for comfortable, immediate soothing.',
    dosage: '1–2 drops in each affected eye as needed throughout the day',
    uses: ['Dry eye syndrome', 'Eye irritation from screens', 'Post-operative eye care', 'Contact lens discomfort'],
    sideEffects: ['Mild temporary blurring after instillation', 'Rare allergic reactions', 'Eye redness (rare)'],
    image: `${import.meta.env.BASE_URL}images/eye-drops.png`,
    bgColor: '#e8fef4',
  },
]

export function packsOf(medicine: Medicine): Pack[] {
  if (medicine.packs?.length) return medicine.packs
  return [{ id: 'std', name: medicine.name, unit: medicine.unit, price: medicine.price, label: medicine.unit }]
}

export function minPrice(medicine: Medicine) {
  return Math.min(...packsOf(medicine).map(p => p.price))
}

export function resolveLine(line: CartLine) {
  const medicine = MEDICINES.find(m => m.id === line.medicineId)
  if (!medicine) return null
  const pack = packsOf(medicine).find(p => p.id === line.packId) ?? packsOf(medicine)[0]
  const qty = Math.max(1, Math.min(10, line.qty))
  return { medicine, pack, qty, total: pack.price * qty }
}

export function relatedMedicines(id: number) {
  return (PAIRED[id] ?? [])
    .map(rid => MEDICINES.find(m => m.id === rid))
    .filter((m): m is Medicine => !!m && m.inStock)
}

export function kolkataParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  let hour = Number(get('hour'))
  if (hour === 24) hour = 0
  return { weekday: get('weekday'), minutes: hour * 60 + Number(get('minute')) }
}

export function shopTiming(now = new Date()) {
  const { weekday, minutes } = kolkataParts(now)
  const openAt = 8 * 60
  const closeAt = 21 * 60
  return { open: minutes >= openAt && minutes < closeAt, sunday: weekday === 'Sun', minutes, weekday }
}

export function shopBadge(now = new Date()): Record<Lang, string> {
  const t = shopTiming(now)
  if (t.open) return { en: 'Open now · until 9:00 PM', hi: 'अभी खुला · रात 9 बजे तक' }
  if (t.minutes < 8 * 60) return { en: 'Closed · opens 8:00 AM', hi: 'बंद · सुबह 8 बजे खुलेगा' }
  return { en: 'Closed · opens tomorrow 8:00 AM', hi: 'बंद · कल सुबह 8 बजे खुलेगा' }
}

export function slotsToday(_now = new Date()) {
  return WEEK_SLOTS
}

export function cleanPhone(input: string) {
  let d = input.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return d
}

export function orderErrors(lines: CartLine[], form: CustomerForm, now = new Date()): OrderError[] {
  const errors: OrderError[] = []
  const resolved = lines.map(resolveLine).filter((r): r is NonNullable<typeof r> => !!r)
  if (!resolved.length) errors.push('empty')
  if (resolved.some(r => !r.medicine.inStock)) errors.push('oos')
  if (form.name.trim().length < 2) errors.push('name')
  if (!/^[6-9]\d{9}$/.test(cleanPhone(form.phone))) errors.push('phone')
  if (!slotsToday(now).some(s => s.id === form.slot)) errors.push('slot')
  if (form.mode === 'delivery') {
    if (form.area.trim().length < 2) errors.push('area')
    if (form.address.trim().length < 5) errors.push('address')
    const pin = form.pincode.replace(/\D/g, '')
    if (!/^\d{6}$/.test(pin)) errors.push('pin')
    else if (!SERVICE_PINCODES.has(pin)) errors.push('pinArea')
  }
  return errors
}

function padEnd(s: string, n: number) {
  const chars = [...s]
  const cut = chars.length > n ? chars.slice(0, n - 1).join('') + '…' : s
  return cut + ' '.repeat(Math.max(0, n - [...cut].length))
}

function kv(key: string, value: string) {
  return `${key}: ${value.replace(/\s+/g, ' ').trim()}`
}

export function buildOrderMessage(opts: {
  lang: Lang
  ref: string
  lines: CartLine[]
  form: CustomerForm
  src: string
  now?: Date
}) {
  const resolved = opts.lines.map(resolveLine).filter((r): r is NonNullable<typeof r> => !!r)
  const rows = resolved.map((r, i) => [
    `${i + 1}. ${r.pack.name}`,
    `${r.medicine.brand} · ${r.pack.unit}`,
    `Qty ${r.qty} x ₹${r.pack.price} = ₹${r.total}`,
  ].join('\n'))
  const grand = resolved.reduce((s, r) => s + r.total, 0)
  const slot = slotsToday(opts.now).find(s => s.id === opts.form.slot)
  const slotText = slot?.label.en ?? opts.form.slot
  const mode = opts.form.mode === 'delivery' ? 'Home delivery' : 'Store pickup'

  const intro = opts.lang === 'hi'
    ? `नमस्ते Pihu Medical, Tekari\nOrder ${opts.ref}`
    : `Hello Pihu Medical, Tekari\nOrder ${opts.ref}`

  const detail = [
    kv('Name', opts.form.name),
    kv('Phone', cleanPhone(opts.form.phone)),
    kv('Mode', mode),
    kv('Slot', slotText),
  ]
  if (opts.form.mode === 'delivery') {
    detail.push(kv('Area', opts.form.area), kv('PIN', opts.form.pincode.replace(/\D/g, '')))
    detail.push(`Address: ${opts.form.address.replace(/\s+/g, ' ').trim().slice(0, 160)}`)
  }
  if (opts.src) detail.push(kv('Via', opts.src))

  return [
    intro,
    '',
    rows.join('\n\n'),
    '',
    `TOTAL ₹${grand}`,
    '',
    ...detail,
    '',
    opts.lang === 'hi' ? 'कृपया कन्फर्म करें। धन्यवाद।' : 'Please confirm this order. Thank you.',
  ].join('\n')
}

export function buildStockMessage(medicine: Medicine) {
  const head = [padEnd('Field', 8), padEnd('Detail', 28)].join(' | ')
  const rule = '-'.repeat(head.length)
  return [
    'Hello Pihu Medical, Tekari',
    '',
    'Please tell me when this is back in stock.',
    '',
    '```',
    head,
    rule,
    [padEnd('Product', 8), padEnd(medicine.name, 28)].join(' | '),
    [padEnd('Brand', 8), padEnd(medicine.brand, 28)].join(' | '),
    [padEnd('Pack', 8), padEnd(medicine.unit, 28)].join(' | '),
    '```',
    '',
    'Thank you.',
  ].join('\n')
}

export function orderLink(text: string, fallback: string) {
  const base = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=`
  const full = base + encodeURIComponent(text)
  return full.length <= 1900 ? full : base + encodeURIComponent(fallback)
}

export function captureSource() {
  if (typeof window === 'undefined') return ''
  const src = new URLSearchParams(window.location.search).get('src')
  if (src) sessionStorage.setItem('src', src.replace(/[^\w.-]/g, '').slice(0, 40))
  return sessionStorage.getItem('src') || ''
}

export function currentSource() {
  if (typeof window === 'undefined') return ''
  return sessionStorage.getItem('src') || ''
}

export function setProductQuery(id: number | null) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (id == null) url.searchParams.delete('product')
  else url.searchParams.set('product', String(id))
  window.history.replaceState({}, '', url)
}

export function productShareUrl(id: number) {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('product', String(id))
  return url.toString()
}

export function formatStorePhone() {
  const local = WHATSAPP_NUMBER.slice(2)
  return `+91 ${local.slice(0, 2)} ${local.slice(2, 7)} ${local.slice(7)}`
}

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  va?: (...args: unknown[]) => void
  vaq?: unknown[]
}

function analyticsWindow() {
  return window as AnalyticsWindow
}

export function track(event: string, data: Record<string, string>, onceKey?: string) {
  if (typeof window === 'undefined') return
  if (onceKey) {
    const k = `tracked:${onceKey}`
    if (sessionStorage.getItem(k)) return
    sessionStorage.setItem(k, '1')
  }
  const src = currentSource() || 'direct'
  const w = analyticsWindow()
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, src, ...data })
  if (typeof w.gtag === 'function') w.gtag('event', event, { src, ...data })
  if (typeof w.va !== 'function') {
    w.va = function vaQueue() {
      (w.vaq = w.vaq || []).push(arguments)
    }
  }
  w.va('event', { name: event, data: { src, ...data } })
}

export function logOrder(row: Record<string, string>) {
  const pub = { ...row }
  for (const key of ['name', 'phone', 'address', 'area', 'pincode']) delete pub[key]
  track('order_tap', pub)
  if (!SHEET_WEBHOOK || typeof navigator === 'undefined') return
  const payload = JSON.stringify({
    ...row,
    src: currentSource() || 'direct',
    at: new Date().toISOString(),
  })
  const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' })
  if (!navigator.sendBeacon(SHEET_WEBHOOK, blob)) {
    fetch(SHEET_WEBHOOK, { method: 'POST', mode: 'no-cors', body: payload }).catch(() => {})
  }
}
