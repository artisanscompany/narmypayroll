import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Wallet,
  Shield,
  Clock,
  UserCheck,
  Search,
  PenLine,
  X,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/_authenticated/_personnel/help')({
  component: HelpPage,
})

interface FAQItem {
  q: string
  a: string
  links?: { label: string; to: string }[]
}

interface FAQSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  faqs: FAQItem[]
}

const faqSections: FAQSection[] = [
  {
    id: 'pay',
    title: 'Pay & Allowances',
    icon: Wallet,
    faqs: [
      { q: 'How do I download my payslip?', a: 'Navigate to Pay Slips from the sidebar. Each month shows your payslip with a download option. You will need your verification PIN to download.', links: [{ label: 'Go to Pay Slips', to: '/pay' }] },
      { q: 'Why are my allowances different this month?', a: 'Allowances may change due to posting changes, rank promotions, or policy updates. If the change seems incorrect, submit an inquiry under the "Pay" category.' },
      { q: 'When is salary typically paid?', a: 'Salary is typically paid on the 25th of each month.' },
      { q: 'How do I report a pay discrepancy?', a: 'Submit an inquiry under the "Pay" category. Provide the affected month, expected amount, and actual amount received.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'How far back can I view pay history?', a: 'You can view up to the last 12 months of pay history in the portal. For older records, contact your base pay office.' },
    ],
  },
  {
    id: 'account',
    title: 'Account & Access',
    icon: UserCheck,
    faqs: [
      { q: 'How do I log in for the first time?', a: 'You will receive a temporary password from your base. On first login, you will be prompted to set a new password and create a verification PIN.' },
      { q: 'What is the PIN used for?', a: 'Your PIN is used to download PDF documents and view sensitive personal data such as NIN and BVN.' },
      { q: 'I forgot my password — what do I do?', a: 'Click "Forgot password?" on the login page. Alternatively, your administrator can generate a new temporary password for you.' },
      { q: 'Why was I logged out?', a: 'The portal has a 5-minute inactivity timeout for security. Additionally, only one active session per device is allowed.' },
      { q: 'Who can access my information?', a: 'Only you can see your full details. Sensitive data (NIN, BVN) requires PIN verification to view.', links: [{ label: 'View your profile', to: '/profile' }] },
      { q: 'How do I report a security concern?', a: 'If you suspect unauthorized access to your account, contact the Help Desk immediately by phone at 0800-ARMY-HELP. Do not share your login credentials with anyone.' },
    ],
  },
  {
    id: 'inquiries',
    title: 'Inquiries & Resolutions',
    icon: Clock,
    faqs: [
      { q: 'How do I submit an inquiry?', a: 'Go to Inquiries, select a category, describe your issue, and optionally attach documents or a voice recording.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'What do the inquiry statuses mean?', a: 'Open: received and queued. In Review: assigned to a handler. Action Required: additional information needed from you. Resolved: issue addressed. Closed: case finalized.' },
      { q: 'What happens when my inquiry is marked Resolved?', a: 'You will be asked to confirm that the issue is resolved. If not, you can reopen the inquiry. If no action is taken, it will auto-close after 7 days.' },
      { q: 'Can I add more information to an existing inquiry?', a: 'Yes. Open your inquiry and use the response area at the bottom to add messages or attach documents.', links: [{ label: 'View your inquiries', to: '/complaints' }] },
      { q: 'Can I record a voice message?', a: 'Yes. When submitting a new inquiry, use the microphone button to record a voice message as part of your submission.' },
    ],
  },
  {
    id: 'status',
    title: 'Status & AWOL',
    icon: Shield,
    faqs: [
      { q: 'How do I dispute an AWOL status?', a: 'Submit an inquiry with supporting documentation such as leave approval letters, medical certificates, or posting orders.', links: [{ label: 'Submit an inquiry', to: '/complaints/new' }] },
      { q: 'What happens when I am marked AWOL?', a: 'AWOL status restricts portal access to inquiries only. Your pay may be withheld until the status is resolved.' },
      { q: 'How long does a dispute take to resolve?', a: 'Resolution time depends on verification of your documentation. Ensure all supporting documents are attached when filing to avoid delays.' },
    ],
  },
]

const totalArticles = faqSections.reduce((sum, s) => sum + s.faqs.length, 0)

function HelpPage() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const filteredSections = search.trim()
    ? faqSections
        .map((section) => ({
          ...section,
          faqs: section.faqs.filter(
            (faq) =>
              faq.q.toLowerCase().includes(search.toLowerCase()) ||
              faq.a.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((section) => section.faqs.length > 0)
    : activeSection
      ? faqSections.filter((s) => s.id === activeSection)
      : faqSections

  const totalResults = filteredSections.reduce((sum, s) => sum + s.faqs.length, 0)

  const scrollToSection = (id: string) => {
    const newActive = activeSection === id ? null : id
    setActiveSection(newActive)
    setSearch('')
    if (newActive) {
      setTimeout(() => sectionRefs.current[newActive]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-army-dark">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-0.5">{totalArticles} articles · {faqSections.length} categories</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          aria-label="Search" placeholder="Search for help — e.g. 'short pay', 'AWOL', 'transfer'"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveSection(null) }}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-army-dark placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-army/15 focus:border-army/30 transition-all"
        />
        {search ? (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => { setActiveSection(null); setSearch('') }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeSection && !search ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({totalArticles})
        </button>
        {faqSections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeSection === s.id ? 'bg-army-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s.title} ({s.faqs.length})
          </button>
        ))}
      </div>

      {/* Search result count */}
      {search && (
        <p className="text-xs text-gray-500">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* FAQ Sections */}
      {filteredSections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-500 mb-1">No results for "{search}"</p>
          <p className="text-xs text-gray-500">Try different keywords or raise a ticket below</p>
        </div>
      ) : (
        filteredSections.map((section) => (
          <div
            key={section.id}
            ref={(el) => { sectionRefs.current[section.id] = el }}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center gap-2.5 px-5 pt-4 pb-2.5">
              <section.icon className="w-4 h-4 text-army" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{section.title}</h2>
              <span className="text-xs text-gray-300">({section.faqs.length})</span>
            </div>

            {/* Questions */}
            <div className="px-5 pb-3">
              {section.faqs.map((faq, i) => {
                const qId = `${section.id}-${i}`
                const isOpen = expandedQ === qId
                return (
                  <div key={i} className={`${i < section.faqs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <button
                      onClick={() => setExpandedQ(isOpen ? null : qId)}
                      className="w-full flex items-center justify-between py-3 text-left group"
                    >
                      <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-army' : 'text-army-dark group-hover:text-army'}`}>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 ml-4 transition-transform ${isOpen ? 'rotate-180 text-army' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pb-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        {faq.links && faq.links.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {faq.links.map((link) => (
                              <Link
                                key={link.to}
                                to={link.to}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-army hover:text-army-gold transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Help Desk: <span className="font-semibold text-army-dark">0800-ARMY-HELP</span></p>
          <p>Visit your base pay office for in-person assistance</p>
          <p>Operating hours: Monday–Friday, 08:00–16:00</p>
        </div>
      </div>

      {/* Submit Inquiry CTA — fallback after self-service */}
      <div className="bg-army-dark rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-army/20 via-transparent to-army-gold/5" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Still need help?</h3>
            <p className="text-xs text-white/40">Submit an inquiry and our team will respond as soon as possible</p>
          </div>
          <Link
            to="/complaints/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-army-gold text-army-dark text-sm font-bold hover:bg-army-gold-light transition-colors self-start whitespace-nowrap shrink-0"
          >
            <PenLine className="w-4 h-4" />
            Submit an Inquiry
          </Link>
        </div>
      </div>
    </div>
  )
}
