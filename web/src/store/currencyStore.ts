import { create } from 'zustand'

export type CurrencyCode = 'GBP' | 'QAR' | 'USD' | 'EUR'

interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  rate: number // conversion rate from GBP (base)
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 1 },
  QAR: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', rate: 4.6 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.27 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 1.17 },
}

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: (localStorage.getItem('mentivara-currency') as CurrencyCode) || 'GBP',
  setCurrency: (currency) => {
    localStorage.setItem('mentivara-currency', currency)
    set({ currency })
  },
}))

/** Format an amount (in GBP) to the user's selected currency */
export function formatPrice(amountGBP: number, currencyCode: CurrencyCode): string {
  const info = CURRENCIES[currencyCode]
  const converted = Math.round(amountGBP * info.rate)
  return `${info.symbol}${converted}`
}
