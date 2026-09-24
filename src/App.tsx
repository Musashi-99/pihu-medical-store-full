import { useEffect, useMemo, useRef, useState } from 'react'
import { CartProvider, useCart } from './cart'
import {
  CATEGORIES,
  MAPS_URL,
  MEDICINES,
  WHATSAPP_NUMBER,
  buildOrderMessage,
  buildStockMessage,
  captureSource,
  cleanPhone,
  currentSource,
  minPrice,
  orderErrors,
  orderLink,
  packsOf,
  productShareUrl,
  relatedMedicines,
  resolveLine,
  setProductQuery,
  shopBadge,
  slotsToday,
  track,
  logOrder,
  type CustomerForm,
  type Medicine,
  type OrderError,
} from './catalog'
import { categoryLabel, fill, LangProvider, useLang } from './i18n'

type Page = 'home' | 'products' | 'detail' | 'cart'

const inputCls = 'w-full px-4 py-3 sm:py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7d6e]/25 focus:border-[#0d7d6e]'

const EMPTY_FORM: CustomerForm = {
  name: '',
  phone: '',
  mode: 'delivery',
  slot: '',
  area: '',
  address: '',
  pincode: '',
  hasPrescription: false,
}

function loadForm(): CustomerForm {
  try {
    const raw = JSON.parse(localStorage.getItem('medicare-customer') || '') as Partial<CustomerForm>
    return { ...EMPTY_FORM, ...raw, hasPrescription: false }
  } catch {
    return EMPTY_FORM
  }
}

function initialSelection() {
  const id = Number(new URLSearchParams(window.location.search).get('product'))
  return MEDICINES.find(m => m.id === id) ?? null
}

const Icons = {
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  MapPin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.27 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Shield: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Truck: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Pill: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>,
  Award: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  Bag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  WhatsApp: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  ),
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Warning: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

function Qty({ value, set }: { value: number; set: (n: number) => void }) {
  return (
    <div className="inline-flex items-center border border-gray-200 rounded-xl bg-white">
      <button type="button" disabled={value <= 1} onClick={() => set(value - 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:text-gray-300" aria-label="-"><Icons.Minus /></button>
      <span className="w-6 text-center text-sm font-bold">{value}</span>
      <button type="button" disabled={value >= 10} onClick={() => set(value + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 disabled:text-gray-300" aria-label="+"><Icons.Plus /></button>
    </div>
  )
}

function Header({ page, onNav, onBack }: { page: Page; onNav: (p: Page) => void; onBack: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const { count } = useCart()
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setPastHero(y > window.innerHeight * 0.82)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = () => { if (window.matchMedia('(min-width: 1024px)').matches) setMenuOpen(false) }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  const isHome = page === 'home'
  const hideOnHero = isHome && !pastHero
  const ghost = isHome && !scrolled && !hideOnHero
  const headerBg = ghost ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
  const textColor = ghost ? 'text-white' : 'text-gray-900'
  const logoColor = ghost ? 'bg-white/20 border-white/30' : 'bg-[#0d7d6e]/10 border-transparent'
  const logoText = ghost ? 'text-white' : 'text-[#0d7d6e]'
  const navBtn = (active: boolean) => active
    ? ghost ? 'bg-white/20 text-white' : 'bg-[#0d7d6e]/10 text-[#0d7d6e]'
    : ghost ? 'text-white/75 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'

  const go = (p: Page) => { onNav(p); setMenuOpen(false) }

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${hideOnHero ? '-translate-y-full opacity-0 pointer-events-none' : ''} ${headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button onClick={() => go('home')} className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${logoColor} ${logoText}`}>
              <Icons.Pill />
            </div>
            <div className="text-left min-w-0">
              <div className={`font-bold text-sm sm:text-base leading-none truncate ${textColor}`}>Pihu Medical</div>
              <div className={`text-[10px] font-mono truncate ${ghost ? 'text-white/60' : 'text-gray-400'}`}>{t.tagline}</div>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => go('home')} className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium ${navBtn(page === 'home')}`}>{t.home}</button>
            <button onClick={() => go('products')} className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium ${navBtn(page === 'products')}`}>{t.products}</button>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className={`px-3 py-2 rounded-lg text-sm font-bold ${navBtn(false)}`}>
              {lang === 'en' ? 'हि' : 'EN'}
            </button>
            <button onClick={() => go('cart')} className={`relative px-3 py-2 rounded-lg ${navBtn(page === 'cart')}`} aria-label={t.cart}>
              <Icons.Bag />
              {count > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#25d366] text-white text-[10px] font-black flex items-center justify-center">{count}</span>}
            </button>
            <a href={`tel:+91${WHATSAPP_NUMBER.slice(2)}`} className={`ml-1 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${ghost ? 'bg-white text-[#0d7d6e]' : 'bg-[#0d7d6e] text-white hover:bg-[#095c52]'}`}>
              <Icons.Phone /> {t.callNow}
            </a>
          </nav>

          <div className="lg:hidden flex items-center gap-0.5 shrink-0">
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className={`px-2 py-2 rounded-lg text-sm font-bold ${ghost ? 'text-white' : 'text-gray-700'}`}>
              {lang === 'en' ? 'हि' : 'EN'}
            </button>
            <button onClick={() => go('cart')} className={`relative p-2 rounded-lg ${ghost ? 'text-white' : 'text-gray-700'}`} aria-label={t.cart}>
              <Icons.Bag />
              {count > 0 && <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-[#25d366] text-white text-[10px] font-black flex items-center justify-center">{count}</span>}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-lg ${ghost ? 'text-white' : 'text-gray-600'}`} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
              {menuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button onClick={() => go('home')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t.home}</button>
            <button onClick={() => go('products')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t.products}</button>
            <button onClick={() => go('cart')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t.cart}{count ? ` (${count})` : ''}</button>
            <a href={`tel:+91${WHATSAPP_NUMBER.slice(2)}`} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#0d7d6e] bg-[#e6f4f2]">
              <Icons.Phone /> {t.callStore}
            </a>
          </div>
        )}
      </header>

      {page === 'detail' && (
        <button onClick={onBack} className="fixed top-[calc(4.75rem+env(safe-area-inset-top))] left-4 sm:left-6 lg:left-8 z-40 flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium shadow-sm">
          <Icons.ArrowLeft /> {t.home === 'Home' ? 'Back' : 'वापस'}
        </button>
      )}
    </>
  )
}

function HomePage({ onNav, onSelect }: { onNav: (p: Page) => void; onSelect: (m: Medicine) => void }) {
  const { t, lang } = useLang()
  const base = import.meta.env.BASE_URL

  return (
    <div>
      <section className="relative h-[100dvh] w-full overflow-hidden bg-[#0a5c52]">
        <picture>
          <source media="(min-width: 768px)" type="image/avif" srcSet={`${base}images/hero-desktop.avif`} />
          <source media="(max-width: 767px)" type="image/avif" srcSet={`${base}images/hero-mobile.avif`} />
          <source media="(min-width: 768px)" type="image/webp" srcSet={`${base}images/hero-desktop.webp`} />
          <img src={`${base}images/hero-mobile.webp`} alt="Pihu Medical" width={941} height={1672} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" />
        </picture>
      </section>

      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,9.5rem),1fr))] gap-4 sm:gap-6">
          {[
            { icon: <Icons.Shield />, title: t.feat1, desc: t.feat1d },
            { icon: <Icons.Truck />, title: t.feat2, desc: t.feat2d },
            { icon: <Icons.Award />, title: t.feat3, desc: t.feat3d },
            { icon: <Icons.WhatsApp />, title: t.feat4, desc: t.feat4d },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-3 p-3 sm:p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#e6f4f2] text-[#0d7d6e] flex items-center justify-center">{icon}</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <p className="text-[#0d7d6e] font-mono text-xs font-medium uppercase tracking-widest mb-3">{t.aboutKicker}</p>
            <h2 className="text-[clamp(1.75rem,4.5vw,2.25rem)] font-black text-gray-900 leading-tight mb-5">{t.aboutTitle}</h2>
            <p className="text-gray-600 leading-relaxed mb-5">{t.aboutP1}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{t.aboutP2}</p>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {[['5.0', lang === 'hi' ? 'रेटिंग' : 'Google'], ['10', lang === 'hi' ? 'समीक्षाएँ' : 'Reviews'], ['824236', lang === 'hi' ? 'पिन' : 'Tekari PIN']].map(([num, label]) => (
                <div key={label} className="min-w-0">
                  <p className="text-[clamp(1.25rem,4vw,1.875rem)] font-black text-[#0d7d6e] leading-none">{num}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <img src={`${import.meta.env.BASE_URL}images/tablets.png`} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
            <div>
              <p className="text-[#0d7d6e] font-mono text-xs font-medium uppercase tracking-widest mb-2">{t.productsKicker}</p>
              <h2 className="text-[clamp(1.75rem,4.5vw,2.25rem)] font-black text-gray-900">{t.available}</h2>
            </div>
            <button onClick={() => onNav('products')} className="hidden sm:flex items-center gap-1.5 text-[#0d7d6e] font-semibold text-sm">
              {t.viewAll} <Icons.ArrowRight />
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-3 sm:gap-4">
            {MEDICINES.filter(m => m.inStock).slice(0, 4).map(m => (
              <button key={m.id} onClick={() => onSelect(m)} className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all min-w-0">
                <div className="aspect-[5/4] overflow-hidden bg-white">
                  <img src={m.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 min-w-0">
                  <p className="text-xs text-gray-400 font-mono truncate">{m.brand}</p>
                  <p className="font-bold text-gray-900 text-sm leading-snug mt-0.5 line-clamp-2">{m.name}</p>
                  <p className="text-[#0d7d6e] font-bold text-sm mt-1.5">{m.packs ? `${t.from} ` : ''}₹{minPrice(m)}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-10">
            <button onClick={() => onNav('products')} className="inline-flex items-center justify-center gap-2 bg-[#0d7d6e] text-white px-8 py-3.5 rounded-xl font-bold w-full sm:w-auto">
              {t.browseAll} <Icons.ArrowRight />
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-[#0d7d6e] to-[#095c52] rounded-3xl p-6 sm:p-10 lg:p-12 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 overflow-hidden">
          <div className="min-w-0">
            <p className="font-mono text-white/60 text-xs uppercase tracking-widest mb-2">{t.findUs}</p>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">{t.visit}</h2>
            <p className="text-white/80 whitespace-pre-line">{t.visitAddress}</p>
          </div>
          <div className="flex flex-col min-[420px]:flex-row gap-3 w-full lg:w-auto shrink-0">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-[#0d7d6e] px-6 py-3 rounded-xl font-bold text-sm w-full min-[420px]:w-auto">
              <Icons.MapPin /> {t.openMaps}
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#25d366] text-white px-6 py-3 rounded-xl font-bold text-sm w-full min-[420px]:w-auto">
              <Icons.WhatsApp /> {t.whatsapp}
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0d7d6e] flex items-center justify-center"><Icons.Pill /></div>
            <div>
              <p className="font-bold text-sm">Pihu Medical</p>
              <p className="text-gray-500 text-xs">{t.tagline}</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs max-w-sm">{t.license}</p>
          <div className="flex items-center gap-3">
            <a href={`tel:+91${WHATSAPP_NUMBER.slice(2)}`} className="text-gray-400"><Icons.Phone /></a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#25d366]"><Icons.WhatsApp /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductsPage({ onSelect }: { onSelect: (m: Medicine) => void }) {
  const { t, lang } = useLang()
  const { add } = useCart()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [hideOos, setHideOos] = useState(true)

  const filtered = useMemo(() => MEDICINES.filter(m => {
    if (hideOos && !m.inStock) return false
    if (activeCategory !== 'All' && m.category !== activeCategory) return false
    const q = search.toLowerCase()
    if (!q) return true
    return m.name.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  }), [activeCategory, search, hideOos])

  return (
    <div className="min-h-screen pt-[calc(4rem+env(safe-area-inset-top))] pb-28">
      <div className="bg-white border-b border-gray-100 sticky top-[calc(4rem+env(safe-area-inset-top))] z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{t.ourMedicines}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{fill(t.productCount, filtered.length)}</p>
            </div>
            <div className="sm:ml-auto flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72 lg:w-80">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Icons.Search /></div>
                <input
                  type="search"
                  placeholder={t.search}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 sm:py-2.5 w-full rounded-xl bg-gray-50 border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7d6e]/25 focus:border-[#0d7d6e]"
                />
              </div>
              <button onClick={() => setHideOos(v => !v)} className={`self-start sm:self-auto text-xs font-semibold px-3 py-2 rounded-full ${hideOos ? 'bg-[#0d7d6e] text-white' : 'bg-gray-100 text-gray-600'}`}>
                {hideOos ? t.hideOos : t.showOos}
              </button>
            </div>
          </div>
          <div className="hide-scrollbar -mx-4 sm:mx-0 flex gap-2 overflow-x-auto mt-4 px-4 sm:px-0 pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold ${activeCategory === cat ? 'bg-[#0d7d6e] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {categoryLabel(lang, cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-bold text-gray-700">{t.nothing}</p>
            <p className="text-gray-400 mt-2 text-sm">{t.nothingHint}</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); setHideOos(false) }} className="mt-6 text-[#0d7d6e] font-semibold text-sm">{t.clear}</button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 sm:gap-5">
            {filtered.map(medicine => (
              <div key={medicine.id} className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-[#0d7d6e]/20 transition-all flex flex-col min-w-0">
                <button onClick={() => onSelect(medicine)} className="text-left">
                  <div className="relative aspect-[5/4] sm:aspect-[4/3] overflow-hidden bg-white">
                    <img src={medicine.image} alt="" className="w-full h-full object-cover" />
                    {medicine.requiresPrescription && <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg">Rx</div>}
                    {!medicine.inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="bg-white border border-gray-300 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-lg">{t.outOfStock}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 pb-2 min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide mb-1 truncate">{medicine.brand} · {categoryLabel(lang, medicine.category)}</p>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{medicine.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{medicine.unit}</p>
                  </div>
                </button>
                <div className="px-3 sm:px-4 pb-4 mt-auto flex items-center justify-between gap-2">
                  <span className="text-lg sm:text-xl font-black text-gray-900 min-w-0">{medicine.packs ? <span className="text-xs font-semibold text-gray-400 mr-1">{t.from}</span> : null}₹{minPrice(medicine)}</span>
                  {medicine.inStock ? (
                    <button onClick={() => add(medicine.id, packsOf(medicine)[0].id, 1)} className="shrink-0 text-xs font-bold px-3 py-2 rounded-xl bg-[#0d7d6e] text-white">
                      {t.add}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400 shrink-0">{t.unavailable}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetailPage({ medicine, onOpen, onNav }: { medicine: Medicine; onOpen: (m: Medicine) => void; onNav: (p: Page) => void }) {
  const { t, lang } = useLang()
  const { add } = useCart()
  const packs = packsOf(medicine)
  const [packId, setPackId] = useState(packs[0].id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)
  const pack = packs.find(p => p.id === packId) ?? packs[0]
  const related = relatedMedicines(medicine.id)

  const share = async () => {
    const url = productShareUrl(medicine.id)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addThis = () => {
    if (!medicine.inStock) return
    add(medicine.id, pack.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="min-h-screen pt-[calc(4rem+env(safe-area-inset-top))] pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="min-w-0">
            <div className="rounded-3xl overflow-hidden mb-5 relative bg-[#f4efe8]">
              <img src={medicine.image} alt="" className="w-full h-auto object-contain" />
              {medicine.requiresPrescription && (
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 max-w-[85%] bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Icons.Warning /> {t.rx}
                </div>
              )}
              {!medicine.inStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl px-4">
                  <div className="bg-white border border-gray-200 shadow-xl px-6 py-3 rounded-2xl text-center">
                    <p className="font-bold text-gray-600">{t.outLong}</p>
                    <p className="text-xs text-gray-400 mt-1">{t.outHint}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              {[
                [t.generic, medicine.generic],
                [t.brand, medicine.brand],
                [t.pack, pack.unit],
                [t.category, categoryLabel(lang, medicine.category)],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 min-w-0">
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">{label}</p>
                  <p className="font-semibold text-gray-900 text-sm mt-0.5 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[#0d7d6e] font-mono text-xs font-semibold uppercase tracking-widest">{categoryLabel(lang, medicine.category)}</p>
            <h1 className="text-[clamp(1.75rem,5vw,2.25rem)] font-black text-gray-900 leading-tight mb-2">{pack.name}</h1>
            <p className="text-gray-400 text-sm font-mono mb-5">{medicine.brand} · {medicine.generic}</p>
            <p className="text-gray-600 leading-relaxed mb-6">{medicine.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-gray-900">₹{pack.price}</p>
                <p className="text-gray-400 text-xs mt-1">{t.per} {pack.unit}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm ${medicine.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {medicine.inStock ? <><Icons.Check /> {t.inStock}</> : t.outOfStock}
              </div>
            </div>

            {packs.length > 1 && (
              <div className="mb-5">
                <p className="font-bold text-gray-900 text-sm mb-2">{t.strength}</p>
                <div className="flex flex-wrap gap-2">
                  {packs.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPackId(p.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border ${p.id === pack.id ? 'bg-[#0d7d6e] text-white border-[#0d7d6e]' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                      {p.label} · ₹{p.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#e6f4f2] rounded-xl p-4 mb-5">
              <p className="text-[#0d7d6e] font-bold text-xs font-mono uppercase tracking-wide mb-2">{t.dosage}</p>
              <p className="text-gray-700 text-sm leading-relaxed">{medicine.dosage}</p>
            </div>
            <div className="mb-5">
              <p className="font-bold text-gray-900 text-sm mb-3">{t.uses}</p>
              <div className="flex flex-wrap gap-2">
                {medicine.uses.map(use => (
                  <span key={use} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-xl font-medium">
                    <Icons.Check /> {use}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <p className="font-bold text-gray-900 text-sm mb-3">{t.side}</p>
              <div className="flex flex-wrap gap-2">
                {medicine.sideEffects.map(se => (
                  <span key={se} className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                    <Icons.Warning /> {se}
                  </span>
                ))}
              </div>
            </div>

            {medicine.inStock ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-600">{t.qty}</span>
                  <Qty value={qty} set={n => setQty(Math.max(1, Math.min(10, n)))} />
                </div>
                <button onClick={addThis} className="w-full flex items-center justify-center gap-3 bg-[#25d366] text-white py-4 rounded-2xl font-bold text-base sm:text-lg">
                  <Icons.WhatsApp /> {added ? t.added : t.addToCart}
                </button>
                {added && (
                  <button onClick={() => onNav('cart')} className="w-full py-3 rounded-xl font-bold text-[#0d7d6e] bg-[#e6f4f2]">{t.cart}</button>
                )}
                <button onClick={share} className="w-full py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-700">
                  {copied ? t.copied : t.share}
                </button>
                <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">{shopBadge()[lang]}</p>
                {medicine.requiresPrescription && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs">
                    <Icons.Warning /> {t.rxNote}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <a
                  href={orderLink(buildStockMessage(medicine), buildStockMessage(medicine))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('availability_ask', { id: String(medicine.id), name: medicine.name })}
                  className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-4 rounded-2xl font-bold"
                >
                  <Icons.WhatsApp /> {t.ask}
                </a>
                <p className="text-center text-xs text-gray-400">{t.askHint}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-5">{t.often}</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-3 sm:gap-4">
              {related.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-w-0">
                  <button onClick={() => onOpen(item)} className="w-full text-left">
                    <div className="aspect-[5/4] overflow-hidden bg-white">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 pb-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-[#0d7d6e] font-bold text-sm">₹{minPrice(item)}</p>
                    </div>
                  </button>
                  <div className="px-3 pb-3">
                    <button onClick={() => add(item.id, packsOf(item)[0].id, 1)} className="text-xs font-bold text-[#0d7d6e]">{t.addToCart}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ERR_KEY: Record<OrderError, 'errEmpty' | 'errOos' | 'errClosed' | 'errName' | 'errPhone' | 'errSlot' | 'errArea' | 'errAddress' | 'errPin' | 'errPinArea' | 'errRx'> = {
  empty: 'errEmpty',
  oos: 'errOos',
  closed: 'errClosed',
  name: 'errName',
  phone: 'errPhone',
  slot: 'errSlot',
  area: 'errArea',
  address: 'errAddress',
  pin: 'errPin',
  pinArea: 'errPinArea',
  rx: 'errRx',
}

function CartPage({ onNav }: { onNav: (p: Page) => void }) {
  const { t, lang } = useLang()
  const { lines, setQty, remove } = useCart()
  const [form, setForm] = useState<CustomerForm>(loadForm)
  const [errors, setErrors] = useState<OrderError[]>([])
  const [sent, setSent] = useState(false)
  const orderRef = useRef(`PM-${Date.now().toString().slice(-6)}`)
  const errorRef = useRef<HTMLDivElement>(null)
  const slots = slotsToday()

  useEffect(() => {
    const rest = { ...form, hasPrescription: false }
    localStorage.setItem('medicare-customer', JSON.stringify(rest))
  }, [form])

  const resolved = lines.map(resolveLine).filter((r): r is NonNullable<ReturnType<typeof resolveLine>> => !!r)
  const grand = resolved.reduce((s, r) => s + r.total, 0)
  const src = currentSource()
  const message = resolved.length
    ? buildOrderMessage({ lang, ref: orderRef.current, lines, form, src })
    : ''
  const set = (patch: Partial<CustomerForm>) => setForm(prev => ({ ...prev, ...patch }))
  const bad = (code: OrderError) => errors.includes(code)

  const send = () => {
    const problems = orderErrors(lines, form)
    setErrors(problems)
    if (problems.length) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const text = buildOrderMessage({ lang, ref: orderRef.current, lines, form, src: currentSource() })
    const fallback = buildOrderMessage({ lang: 'en', ref: orderRef.current, lines, form, src: currentSource() })
    const slot = slotsToday().find(s => s.id === form.slot)
    logOrder({
      ref: orderRef.current,
      items: resolved.map(r => `${r.pack.name} x${r.qty}`).join('; '),
      total: String(grand),
      mode: form.mode,
      slot: slot?.label.en ?? form.slot,
      count: String(resolved.reduce((s, r) => s + r.qty, 0)),
      name: form.name.trim(),
      phone: cleanPhone(form.phone),
      area: form.mode === 'delivery' ? form.area.trim() : '',
      pincode: form.mode === 'delivery' ? form.pincode.replace(/\D/g, '') : '',
      address: form.mode === 'delivery' ? form.address.trim().slice(0, 160) : '',
    })
    window.open(orderLink(text, fallback), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  if (!resolved.length) {
    return (
      <div className="min-h-screen pt-28 px-4 text-center">
        <h1 className="text-[clamp(1.75rem,5vw,1.875rem)] font-black text-gray-900">{t.empty}</h1>
        <p className="text-gray-500 mt-2">{t.emptyHint}</p>
        <button onClick={() => onNav('products')} className="mt-6 bg-[#0d7d6e] text-white px-6 py-3 rounded-xl font-bold">{t.browse}</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-[clamp(1.75rem,5vw,1.875rem)] font-black text-gray-900 mb-1">{t.yourCart}</h1>
        <p className="text-sm text-gray-500 mb-6">{orderRef.current} · {shopBadge()[lang]}</p>

        <div className="space-y-3 mb-8">
          {resolved.map(r => (
            <div key={`${r.medicine.id}-${r.pack.id}`} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
              <div className="flex gap-3 min-w-0 flex-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white">
                  <img src={r.medicine.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{r.pack.name}</p>
                  <p className="text-xs text-gray-400">{r.medicine.brand} · {r.pack.unit}</p>
                  <p className="text-sm font-black text-[#0d7d6e] mt-1">₹{r.total}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 min-[480px]:flex-col min-[480px]:items-end">
                <Qty value={r.qty} set={n => setQty(r.medicine.id, r.pack.id, n)} />
                <button onClick={() => remove(r.medicine.id, r.pack.id)} className="text-xs text-red-500 font-semibold">{t.remove}</button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); send() }} className="bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 space-y-5">
          <h2 className="font-black text-lg text-gray-900">{t.details}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-semibold text-gray-700">{t.fullName}</span>
              <input value={form.name} onChange={e => set({ name: e.target.value })} autoComplete="name" className={`${inputCls} mt-1 ${bad('name') ? 'border-red-300' : ''}`} />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-gray-700">{t.mobile}</span>
              <input value={form.phone} onChange={e => set({ phone: e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 14) })} inputMode="tel" autoComplete="tel" className={`${inputCls} mt-1 ${bad('phone') ? 'border-red-300' : ''}`} />
            </label>
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-700 mb-2">{t.fulfilment}</p>
            <div className="grid grid-cols-2 gap-2">
              {(['delivery', 'pickup'] as const).map(mode => (
                <button type="button" key={mode} onClick={() => set({ mode })} className={`py-3 rounded-xl text-sm font-bold border ${form.mode === mode ? 'bg-[#0d7d6e] text-white border-[#0d7d6e]' : 'bg-white text-gray-700 border-gray-200'}`}>
                  {mode === 'delivery' ? t.delivery : t.pickup}
                </button>
              ))}
            </div>
          </div>

          {form.mode === 'delivery' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-semibold text-gray-700">{t.area}</span>
                <input value={form.area} onChange={e => set({ area: e.target.value })} className={`${inputCls} mt-1 ${bad('area') ? 'border-red-300' : ''}`} />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-gray-700">{t.pincode}</span>
                <input value={form.pincode} onChange={e => set({ pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} inputMode="numeric" autoComplete="postal-code" className={`${inputCls} mt-1 ${bad('pin') || bad('pinArea') ? 'border-red-300' : ''}`} />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-semibold text-gray-700">{t.fullAddress}</span>
                <textarea value={form.address} onChange={e => set({ address: e.target.value })} rows={2} autoComplete="street-address" className={`${inputCls} mt-1 ${bad('address') ? 'border-red-300' : ''}`} />
              </label>
              <p className="text-xs text-gray-400 sm:col-span-2">{t.pinHelp}</p>
            </div>
          )}

          <div>
            <p className="font-semibold text-sm text-gray-700 mb-2">{t.slot}</p>
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => (
                <button type="button" key={slot.id} onClick={() => set({ slot: slot.id })} className={`px-3 py-2 rounded-xl text-xs font-bold border ${form.slot === slot.id ? 'bg-[#0d7d6e] text-white border-[#0d7d6e]' : 'bg-white text-gray-700 border-gray-200'} ${bad('slot') && !form.slot ? 'border-red-300' : ''}`}>
                  {slot.label[lang]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-black text-lg text-gray-900">{t.slip}</h2>
            <p className="text-xs text-gray-500 mt-1 mb-3">{t.slipHint}</p>
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              {resolved.map((r, i) => (
                <div key={`${r.medicine.id}-${r.pack.id}`} className="border-t border-gray-100 first:border-t-0 px-3 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900 text-sm min-w-0 break-words">
                      <span className="text-gray-400 font-mono mr-1.5">{i + 1}</span>
                      {r.pack.name}
                    </p>
                    <p className="shrink-0 font-black text-sm text-[#0d7d6e]">₹{r.total}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 break-words">{r.medicine.brand} · {r.pack.unit}</p>
                  <p className="text-xs text-gray-600 mt-1">{t.qty} {r.qty} · {t.rate} ₹{r.pack.price}</p>
                </div>
              ))}
              <div className="border-t border-gray-200 bg-[#e6f4f2] px-3 py-2.5 flex items-center justify-between font-black text-sm">
                <span>{t.total}</span>
                <span>₹{grand}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 mt-3 overflow-hidden">
              <p className="px-3 py-2 font-semibold text-sm text-gray-500 bg-gray-50">{t.previewCustomer}</p>
              {[
                [t.fullName, form.name || '—'],
                [t.mobile, form.phone || '—'],
                [t.mode, form.mode === 'delivery' ? t.delivery : t.pickup],
                [t.slot, slots.find(s => s.id === form.slot)?.label[lang] || '—'],
                ...(form.mode === 'delivery' ? [[t.area, form.area || '—'], [t.pincode, form.pincode || '—'], [t.fullAddress, form.address || '—']] : []),
                ...(src ? [[t.via, src]] : []),
              ].map(([label, value]) => (
                <div key={label} className="border-t border-gray-100 px-3 py-2 min-w-0">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
                </div>
              ))}
            </div>

            {message && (
              <pre className="mt-3 max-w-full overflow-x-hidden rounded-2xl bg-[#10211e] text-[#d7f5ee] text-[11px] leading-relaxed p-3 font-mono whitespace-pre-wrap break-words">{message}</pre>
            )}
          </div>

          {errors.length > 0 && (
            <div ref={errorRef} className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 space-y-1">
              {errors.map(code => <p key={code}>{t[ERR_KEY[code]]}</p>)}
            </div>
          )}

          {sent && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
              <Icons.Check /> {t.ready}
            </div>
          )}

          <button type="submit" className="w-full flex items-center justify-center gap-3 bg-[#25d366] text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-[#25d366]/30">
            <Icons.WhatsApp /> {sent ? t.opening : t.send}
          </button>
        </form>
      </div>
    </div>
  )
}

function CartDock({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  const { count } = useCart()
  const { t } = useLang()
  const [show, setShow] = useState(page !== 'home')

  useEffect(() => {
    if (page !== 'home') {
      setShow(true)
      return
    }
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.82)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page])

  if (!count || page === 'cart' || !show) return null
  return (
    <button onClick={() => onNav('cart')} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-4 z-40 flex items-center justify-center gap-3 bg-[#0d7d6e] text-white px-5 py-3 rounded-full shadow-lg font-bold sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2">
      {t.cart}
      <span className="bg-white text-[#0d7d6e] text-xs font-black min-w-6 h-6 px-2 rounded-full flex items-center justify-center">{count}</span>
    </button>
  )
}

function Shop() {
  const [page, setPage] = useState<Page>(() => (initialSelection() ? 'detail' : 'home'))
  const [selected, setSelected] = useState<Medicine | null>(initialSelection)
  const prev = useRef<Page>('products')

  useEffect(() => {
    captureSource()
    track('visit', {}, 'visit')
  }, [])

  useEffect(() => {
    if (page === 'detail' && selected) track('product_view', { id: String(selected.id), name: selected.name }, `view-${selected.id}`)
  }, [page, selected])

  const navigate = (p: Page) => {
    prev.current = page === 'detail' ? 'products' : page
    setPage(p)
    if (p !== 'detail') setProductQuery(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectMedicine = (m: Medicine) => {
    prev.current = page
    setSelected(m)
    setPage('detail')
    setProductQuery(m.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      <Header page={page} onNav={navigate} onBack={() => navigate(prev.current === 'detail' ? 'products' : prev.current)} />
      {page === 'home' && <HomePage onNav={navigate} onSelect={selectMedicine} />}
      {page === 'products' && <ProductsPage onSelect={selectMedicine} />}
      {page === 'detail' && selected && <ProductDetailPage key={selected.id} medicine={selected} onOpen={selectMedicine} onNav={navigate} />}
      {page === 'cart' && <CartPage onNav={navigate} />}
      <CartDock page={page} onNav={navigate} />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <CartProvider>
        <Shop />
      </CartProvider>
    </LangProvider>
  )
}
