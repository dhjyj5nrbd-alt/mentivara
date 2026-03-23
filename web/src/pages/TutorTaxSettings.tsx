import { useState, useMemo, useCallback } from 'react'
import {
  Receipt, ChevronDown, ChevronRight, Download, FileText, Eye, EyeOff,
  Globe, ToggleLeft, ToggleRight, Building2, Info, AlertTriangle, CheckCircle,
  Calendar, Hash, Printer,
} from 'lucide-react'
import Layout from '../components/Layout'

// ── Types ────────────────────────────────────────────────────
interface CountryConfig {
  label: string
  code: string
  taxFree: boolean
  taxIdLabel: string
  taxYearStart: string // MM-DD
  taxYearEnd: string   // MM-DD
  vatLabel?: string
  guidance: string
}

interface QuarterData {
  label: string
  period: string
  gross: number
  commission: number
  net: number
  lessons: number
  current?: boolean
}

interface MonthData {
  label: string
  gross: number
  commission: number
  net: number
  lessons: number
}

interface Invoice {
  id: string
  number: string
  date: string
  student: string
  subject: string
  amount: number
  vat: number
  total: number
  status: 'paid' | 'pending'
}

// ── Country configs ──────────────────────────────────────────
const COUNTRIES: CountryConfig[] = [
  { label: 'United Kingdom', code: 'GB', taxFree: false, taxIdLabel: 'National Insurance Number', taxYearStart: '04-06', taxYearEnd: '04-05', vatLabel: 'VAT', guidance: 'As a self-employed tutor in the UK, you must register with HMRC for Self Assessment if your tutoring income exceeds \u00a31,000 per tax year. Key dates: Register by 5 October, Submit online return by 31 January, Pay tax owed by 31 January.' },
  { label: 'United States', code: 'US', taxFree: false, taxIdLabel: 'Social Security Number (SSN) or EIN', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'As an independent contractor, you may need to file Schedule C with your Form 1040. If you earn over $400, you must pay self-employment tax.' },
  { label: 'Canada', code: 'CA', taxFree: false, taxIdLabel: 'Social Insurance Number (SIN)', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'GST/HST', guidance: 'Self-employed tutors must report income on Form T2125. You may need to register for GST/HST if annual revenue exceeds $30,000.' },
  { label: 'Australia', code: 'AU', taxFree: false, taxIdLabel: 'Tax File Number (TFN)', taxYearStart: '07-01', taxYearEnd: '06-30', vatLabel: 'GST', guidance: 'You must lodge a tax return with the ATO. Register for GST if your annual turnover is $75,000 or more.' },
  { label: 'Germany', code: 'DE', taxFree: false, taxIdLabel: 'Tax Identification Number (TIN)', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'VAT (USt)', guidance: 'Freelance tutors must register with the local Finanzamt. You may be eligible for Kleinunternehmerregelung if revenue is under \u20ac22,000.' },
  { label: 'France', code: 'FR', taxFree: false, taxIdLabel: 'Tax Identification Number (TIN)', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'TVA', guidance: 'Auto-entrepreneur status may apply. Declare income through your annual tax return or micro-entrepreneur portal.' },
  { label: 'India', code: 'IN', taxFree: false, taxIdLabel: 'Permanent Account Number (PAN)', taxYearStart: '04-01', taxYearEnd: '03-31', vatLabel: 'GST', guidance: 'File income tax returns if total income exceeds the basic exemption limit. GST registration required if turnover exceeds \u20b920 lakhs.' },
  { label: 'Singapore', code: 'SG', taxFree: false, taxIdLabel: 'Tax Reference Number', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'GST', guidance: 'File Form B or B1 with IRAS. Register for GST if annual turnover exceeds S$1 million.' },
  { label: 'Hong Kong', code: 'HK', taxFree: false, taxIdLabel: 'Tax Identification Number (TIN)', taxYearStart: '04-01', taxYearEnd: '03-31', guidance: 'File a tax return with the Inland Revenue Department. Hong Kong taxes are territorial \u2014 only income sourced in HK is taxable.' },
  { label: 'Qatar', code: 'QA', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'No income tax is levied on individual earnings in Qatar.' },
  { label: 'United Arab Emirates', code: 'AE', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'VAT', guidance: 'No income tax is levied on individual earnings in the UAE.' },
  { label: 'Saudi Arabia', code: 'SA', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', vatLabel: 'VAT', guidance: 'No income tax is levied on individual earnings in Saudi Arabia.' },
  { label: 'Bahrain', code: 'BH', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'No income tax is levied on individual earnings in Bahrain.' },
  { label: 'Brunei', code: 'BN', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'No income tax is levied on individual earnings in Brunei.' },
  { label: 'Cayman Islands', code: 'KY', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'No income tax is levied on individual earnings in the Cayman Islands.' },
  { label: 'Monaco', code: 'MC', taxFree: true, taxIdLabel: 'Tax ID Number', taxYearStart: '01-01', taxYearEnd: '12-31', guidance: 'No income tax is levied on individual earnings in Monaco.' },
]

const TAX_FREE_CODES = new Set(COUNTRIES.filter((c) => c.taxFree).map((c) => c.code))

const BUSINESS_TYPES = ['Individual', 'Sole Trader', 'Limited Company', 'Self-Employed']

// ── Demo data ────────────────────────────────────────────────
const DEMO_QUARTERLY: QuarterData[] = [
  { label: 'Q1', period: '6 Apr \u2013 5 Jul 2025', gross: 3420, commission: 513, net: 2907, lessons: 42 },
  { label: 'Q2', period: '6 Jul \u2013 5 Oct 2025', gross: 2980, commission: 447, net: 2533, lessons: 36 },
  { label: 'Q3', period: '6 Oct \u2013 5 Jan 2026', gross: 3650, commission: 547.5, net: 3102.5, lessons: 44 },
  { label: 'Q4', period: '6 Jan \u2013 5 Apr 2026', gross: 3180, commission: 477, net: 2703, lessons: 38, current: true },
]

const DEMO_MONTHLY: MonthData[] = [
  { label: 'April 2025', gross: 1120, commission: 168, net: 952, lessons: 14 },
  { label: 'May 2025', gross: 1180, commission: 177, net: 1003, lessons: 15 },
  { label: 'June 2025', gross: 1120, commission: 168, net: 952, lessons: 13 },
  { label: 'July 2025', gross: 980, commission: 147, net: 833, lessons: 12 },
  { label: 'August 2025', gross: 720, commission: 108, net: 612, lessons: 8 },
  { label: 'September 2025', gross: 1280, commission: 192, net: 1088, lessons: 16 },
  { label: 'October 2025', gross: 1340, commission: 201, net: 1139, lessons: 16 },
  { label: 'November 2025', gross: 1180, commission: 177, net: 1003, lessons: 14 },
  { label: 'December 2025', gross: 1130, commission: 169.5, net: 960.5, lessons: 14 },
  { label: 'January 2026', gross: 1240, commission: 186, net: 1054, lessons: 15 },
  { label: 'February 2026', gross: 1060, commission: 159, net: 901, lessons: 13 },
  { label: 'March 2026', gross: 880, commission: 132, net: 748, lessons: 10 },
]

const DEMO_INVOICES: Invoice[] = [
  { id: 'inv_001', number: 'INV-2026-0038', date: '21 Mar 2026', student: 'Alex Johnson', subject: 'Mathematics', amount: 45.00, vat: 0, total: 45.00, status: 'pending' },
  { id: 'inv_002', number: 'INV-2026-0037', date: '20 Mar 2026', student: 'Sophie Chen', subject: 'Mathematics', amount: 67.50, vat: 0, total: 67.50, status: 'pending' },
  { id: 'inv_003', number: 'INV-2026-0036', date: '19 Mar 2026', student: 'Amara Okafor', subject: 'Chemistry', amount: 50.00, vat: 0, total: 50.00, status: 'paid' },
  { id: 'inv_004', number: 'INV-2026-0035', date: '17 Mar 2026', student: 'Priya Sharma', subject: 'Physics', amount: 50.00, vat: 0, total: 50.00, status: 'paid' },
]

// ── Helpers ──────────────────────────────────────────────────
function formatCurrency(amount: number, code: string) {
  if (code === 'US' || code === 'CA') return `$${amount.toFixed(2)}`
  if (code === 'AU') return `A$${amount.toFixed(2)}`
  if (code === 'DE' || code === 'FR') return `\u20ac${amount.toFixed(2)}`
  if (code === 'IN') return `\u20b9${amount.toFixed(2)}`
  if (code === 'SG') return `S$${amount.toFixed(2)}`
  if (code === 'HK') return `HK$${amount.toFixed(2)}`
  return `\u00a3${amount.toFixed(2)}`
}

function getTaxYearDisplay(country: CountryConfig): string {
  if (country.code === 'GB') return '6 Apr 2025 \u2013 5 Apr 2026'
  if (country.code === 'AU') return '1 Jul 2025 \u2013 30 Jun 2026'
  if (country.code === 'IN' || country.code === 'HK') return '1 Apr 2025 \u2013 31 Mar 2026'
  return '1 Jan 2026 \u2013 31 Dec 2026'
}

function maskValue(value: string): string {
  if (value.length <= 4) return '****'
  return value.slice(0, 2) + ' ** ** ** ' + value.slice(-1)
}

function showToast(message: string) {
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-6 right-6 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 animate-fade-in'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 2500)
}

// ── Component ────────────────────────────────────────────────
export default function TutorTaxSettings() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'settings' | 'reports'>('settings')

  // Settings state
  const [selectedCountry, setSelectedCountry] = useState('GB')
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [taxId, setTaxId] = useState('AB 12 34 56 C')
  const [showTaxId, setShowTaxId] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Sole Trader')
  const [vatRegistered, setVatRegistered] = useState(false)
  const [vatNumber, setVatNumber] = useState('')
  const [showVatNumber, setShowVatNumber] = useState(false)

  // Reports state
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [guidanceOpen, setGuidanceOpen] = useState(false)
  const [autoInvoice, setAutoInvoice] = useState(true)
  const [showInvoiceList, setShowInvoiceList] = useState(false)

  const country = useMemo(() => COUNTRIES.find((c) => c.code === selectedCountry)!, [selectedCountry])
  const isTaxFree = TAX_FREE_CODES.has(selectedCountry)
  const fc = useCallback((amount: number) => formatCurrency(amount, selectedCountry), [selectedCountry])

  const totalGross = DEMO_QUARTERLY.reduce((a, q) => a + q.gross, 0)
  const totalCommission = DEMO_QUARTERLY.reduce((a, q) => a + q.commission, 0)
  const totalNet = DEMO_QUARTERLY.reduce((a, q) => a + q.net, 0)
  const totalLessons = DEMO_QUARTERLY.reduce((a, q) => a + q.lessons, 0)

  const toggleMonth = (label: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const handleExportCSV = useCallback(() => {
    const headers = ['Month', 'Gross Earnings', 'Commission', 'Net Earnings', 'Lessons']
    const rows = DEMO_MONTHLY.map((m) => [m.label, m.gross.toFixed(2), m.commission.toFixed(2), m.net.toFixed(2), m.lessons.toString()])
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mentivara-tax-transactions-${selectedCountry}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Transactions CSV downloaded')
  }, [selectedCountry])

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#7C3AED]" />
            Tax &amp; Invoicing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your tax settings, view reports, and download summaries</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-[#232536] rounded-lg p-0.5 w-fit">
          {(['settings', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#1a1d2e] text-[#7C3AED] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ═══════════════════ SETTINGS TAB ═══════════════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Country Selection */}
            <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#7C3AED]" />
                Country of Tax Residence
              </h2>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full max-w-md text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>

              {/* Tax-free / taxable banner */}
              {isTaxFree ? (
                <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your country of residence has no income tax. Tax reporting is optional.
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Income earned through Mentivara may be subject to income tax in {country.label}. We recommend keeping tax reporting enabled.
                  </p>
                </div>
              )}
            </div>

            {/* Tax Reporting Toggle */}
            <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Tax Reporting</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {taxEnabled ? 'Tax reporting is enabled' : 'Tax reporting is disabled'}
                  </p>
                </div>
                <button
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className="flex items-center gap-2 transition-colors"
                  aria-label={taxEnabled ? 'Disable tax reporting' : 'Enable tax reporting'}
                >
                  {taxEnabled ? (
                    <ToggleRight className="w-10 h-10 text-[#7C3AED]" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Tax Details (shown when enabled) */}
            {taxEnabled && (
              <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5 space-y-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7C3AED]" />
                  Tax Details
                </h2>

                {/* Tax ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    {country.taxIdLabel}
                  </label>
                  <div className="flex items-center gap-2 max-w-md">
                    <input
                      type="text"
                      value={showTaxId ? taxId : maskValue(taxId)}
                      onChange={(e) => { setTaxId(e.target.value); setShowTaxId(true) }}
                      className="flex-1 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-mono"
                    />
                    <button
                      onClick={() => setShowTaxId(!showTaxId)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#232536] transition-colors"
                      aria-label={showTaxId ? 'Hide tax ID' : 'Show tax ID'}
                    >
                      {showTaxId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Registered Business Name <span className="text-slate-400 dark:text-slate-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Smith Tutoring Ltd"
                    className="w-full max-w-md text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full max-w-md text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* VAT/GST (if applicable) */}
                {country.vatLabel && (
                  <>
                    <div className="flex items-center justify-between max-w-md">
                      <div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{country.vatLabel} Registered</p>
                      </div>
                      <button
                        onClick={() => setVatRegistered(!vatRegistered)}
                        aria-label={vatRegistered ? `Disable ${country.vatLabel} registration` : `Enable ${country.vatLabel} registration`}
                      >
                        {vatRegistered ? (
                          <ToggleRight className="w-8 h-8 text-[#7C3AED]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    </div>

                    {vatRegistered && (
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          {country.vatLabel} Number
                        </label>
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            type="text"
                            value={showVatNumber ? vatNumber : (vatNumber ? maskValue(vatNumber) : '')}
                            onChange={(e) => { setVatNumber(e.target.value); setShowVatNumber(true) }}
                            placeholder={`Enter your ${country.vatLabel} number`}
                            className="flex-1 text-sm rounded-lg bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] font-mono placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          />
                          <button
                            onClick={() => setShowVatNumber(!showVatNumber)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#232536] transition-colors"
                            aria-label={showVatNumber ? `Hide ${country.vatLabel} number` : `Show ${country.vatLabel} number`}
                          >
                            {showVatNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Tax Year */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#232536]">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Current Tax Year</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{getTaxYearDisplay(country)}</p>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    onClick={() => showToast('Tax settings saved successfully')}
                    className="px-5 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ REPORTS TAB ═══════════════════ */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {!taxEnabled ? (
              <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-8 text-center">
                <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tax reporting is currently disabled. Enable it in the Settings tab to view your tax reports.
                </p>
              </div>
            ) : (
              <>
                {/* Tax Year Summary */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#7C3AED]" />
                    Tax Year Summary
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{getTaxYearDisplay(country)}</p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gross Earnings</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{fc(totalGross)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Platform Commission</p>
                      <p className="text-xl font-bold text-red-500 dark:text-red-400">&minus;{fc(totalCommission)}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Net Earnings (Taxable)</p>
                      <p className="text-xl font-bold text-[#7C3AED] dark:text-purple-300">{fc(totalNet)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-[#1a1d2e] rounded-lg p-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lessons Delivered</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{totalLessons}</p>
                    </div>
                  </div>
                </div>

                {/* Quarterly Breakdown */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
                  <div className="px-5 pt-5 pb-3">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quarterly Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-[#232536]">
                          <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Quarter</th>
                          <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Period</th>
                          <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Gross</th>
                          <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Commission</th>
                          <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Net</th>
                          <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-5 py-2.5">Lessons</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_QUARTERLY.map((q) => (
                          <tr
                            key={q.label}
                            className={`border-b border-slate-50 dark:border-[#1a1d2e] last:border-0 ${
                              q.current ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'hover:bg-slate-50 dark:hover:bg-[#1a1d2e]'
                            } transition-colors`}
                          >
                            <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-white">
                              {q.label}
                              {q.current && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[#7C3AED] text-white font-medium">
                                  Current
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{q.period}</td>
                            <td className="px-5 py-3 text-sm text-slate-900 dark:text-white text-right">{fc(q.gross)}</td>
                            <td className="px-5 py-3 text-sm text-red-500 dark:text-red-400 text-right">&minus;{fc(q.commission)}</td>
                            <td className="px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">{fc(q.net)}</td>
                            <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 text-right">{q.lessons}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Monthly Breakdown</h2>
                  <div className="space-y-1.5">
                    {DEMO_MONTHLY.map((m) => {
                      const open = expandedMonths.has(m.label)
                      return (
                        <div key={m.label} className="border border-slate-100 dark:border-[#232536] rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleMonth(m.label)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
                          >
                            <span className="font-medium text-slate-900 dark:text-white">{m.label}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Net: {fc(m.net)}</span>
                              {open ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </button>
                          {open && (
                            <div className="px-4 pb-3 pt-1 bg-slate-50 dark:bg-[#1a1d2e] grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 mb-0.5">Gross</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{fc(m.gross)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 mb-0.5">Commission</p>
                                <p className="text-sm font-semibold text-red-500 dark:text-red-400">&minus;{fc(m.commission)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 mb-0.5">Net</p>
                                <p className="text-sm font-semibold text-[#7C3AED]">{fc(m.net)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 dark:text-slate-500 mb-0.5">Lessons</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.lessons}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#7C3AED]" />
                    Export &amp; Downloads
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => showToast('PDF downloaded')}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Download Tax Summary (PDF)
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Transactions (CSV)
                    </button>
                    <button
                      onClick={() => showToast('Invoice summary downloaded')}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#232536] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#232536] transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Download Invoice Summary
                    </button>
                  </div>
                </div>

                {/* Country-Specific Guidance */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] overflow-hidden">
                  <button
                    onClick={() => setGuidanceOpen(!guidanceOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors"
                  >
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#7C3AED]" />
                      Tax Guidance for {country.label}
                    </h2>
                    {guidanceOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {guidanceOpen && (
                    <div className="px-5 pb-5">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{country.guidance}</p>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic">
                        This is general guidance only. Please consult a qualified tax advisor for advice specific to your situation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Invoicing Section */}
                <div className="bg-white dark:bg-[#161822] rounded-xl border border-slate-200 dark:border-[#232536] p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#7C3AED]" />
                      Invoicing
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Auto-generate invoices</span>
                      <button
                        onClick={() => setAutoInvoice(!autoInvoice)}
                        aria-label={autoInvoice ? 'Disable auto-invoicing' : 'Enable auto-invoicing'}
                      >
                        {autoInvoice ? (
                          <ToggleRight className="w-8 h-8 text-[#7C3AED]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {autoInvoice && (
                    <>
                      {/* Sample Invoice Preview */}
                      <div className="border border-slate-200 dark:border-[#232536] rounded-lg p-4 bg-slate-50 dark:bg-[#1a1d2e]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">SAMPLE INVOICE</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{DEMO_INVOICES[0].number}</p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{DEMO_INVOICES[0].date}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 mb-0.5">From</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">Dr. James Mitchell</p>
                            <p className="text-slate-500 dark:text-slate-400">Sole Trader</p>
                          </div>
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 mb-0.5">To</p>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{DEMO_INVOICES[0].student}</p>
                          </div>
                        </div>
                        <div className="border-t border-slate-200 dark:border-[#2a2d3e] pt-2">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{DEMO_INVOICES[0].subject} \u2014 60min lesson</span>
                            <span>{fc(DEMO_INVOICES[0].amount)}</span>
                          </div>
                          {vatRegistered && (
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span>{country.vatLabel} (20%)</span>
                              <span>{fc(DEMO_INVOICES[0].amount * 0.2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-semibold text-slate-900 dark:text-white mt-2 pt-2 border-t border-slate-200 dark:border-[#2a2d3e]">
                            <span>Total</span>
                            <span>{fc(vatRegistered ? DEMO_INVOICES[0].amount * 1.2 : DEMO_INVOICES[0].amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* View All Invoices */}
                      <button
                        onClick={() => setShowInvoiceList(!showInvoiceList)}
                        className="text-sm text-[#7C3AED] hover:underline font-medium flex items-center gap-1"
                      >
                        {showInvoiceList ? 'Hide' : 'View All'} Invoices
                        {showInvoiceList ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {showInvoiceList && (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[500px]">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-[#232536]">
                                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-3 py-2">Invoice</th>
                                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-3 py-2">Date</th>
                                <th className="text-left text-xs font-medium text-slate-400 dark:text-slate-500 px-3 py-2">Student</th>
                                <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-3 py-2">Amount</th>
                                <th className="text-right text-xs font-medium text-slate-400 dark:text-slate-500 px-3 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {DEMO_INVOICES.map((inv) => (
                                <tr key={inv.id} className="border-b border-slate-50 dark:border-[#1a1d2e] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] transition-colors">
                                  <td className="px-3 py-2.5 text-sm font-mono text-slate-900 dark:text-white">{inv.number}</td>
                                  <td className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">{inv.date}</td>
                                  <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{inv.student}</td>
                                  <td className="px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white text-right">{fc(inv.total)}</td>
                                  <td className="px-3 py-2.5 text-right">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                                      inv.status === 'paid'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
