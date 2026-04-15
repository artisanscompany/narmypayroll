import type { Payslip, PayComponent } from '#/types/payslip'

function makePayslip(
  userId: string,
  month: number,
  year: number,
  earnings: PayComponent[],
  deductions: PayComponent[],
  status: 'paid' | 'pending' = 'paid',
): Payslip {
  const grossPay = earnings.reduce((sum, c) => sum + c.amount, 0)
  const totalDeductions = deductions.reduce((sum, c) => sum + c.amount, 0)
  return {
    id: `PAY-${userId}-${year}-${String(month).padStart(2, '0')}`,
    userId,
    month,
    year,
    components: [...earnings, ...deductions],
    grossPay,
    totalDeductions,
    netPay: grossPay - totalDeductions,
    status,
    paidDate: status === 'pending' ? null : `${year}-${String(month).padStart(2, '0')}-25`,
  }
}

const officerEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 280000, type: 'earning' },
  { label: 'Housing Allowance', amount: 56000, type: 'earning' },
  { label: 'Transport Allowance', amount: 28000, type: 'earning' },
]

const officerDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 32600, type: 'deduction' },
]

const soldierEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 120000, type: 'earning' },
  { label: 'Housing Allowance', amount: 24000, type: 'earning' },
  { label: 'Transport Allowance', amount: 12000, type: 'earning' },
]

const soldierDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 15625, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3400, type: 'deduction' },
]

const belloEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 135000, type: 'earning' },
  { label: 'Housing Allowance', amount: 27000, type: 'earning' },
  { label: 'Transport Allowance', amount: 13500, type: 'earning' },
]

const belloDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 17550, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3800, type: 'deduction' },
]

function generateMonths(
  userId: string,
  earnings: PayComponent[],
  deductions: PayComponent[],
): Payslip[] {
  const months: Payslip[] = []
  for (let i = 0; i < 12; i++) {
    const date = new Date(2026, 2 - i, 1)
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    months.push(makePayslip(userId, m, y, earnings, deductions))
  }
  return months
}

const sergeantEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 150000, type: 'earning' },
  { label: 'Housing Allowance', amount: 30000, type: 'earning' },
  { label: 'Transport Allowance', amount: 15000, type: 'earning' },
  { label: 'Hazard Allowance', amount: 20000, type: 'earning' },
]
const sergeantDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 21500, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3800, type: 'deduction' },
]

const lcplEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 115000, type: 'earning' },
  { label: 'Housing Allowance', amount: 23000, type: 'earning' },
  { label: 'Transport Allowance', amount: 11500, type: 'earning' },
]
const lcplDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 14950, type: 'deduction' },
  { label: 'Welfare Fund', amount: 3200, type: 'deduction' },
]

const ssgtEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 170000, type: 'earning' },
  { label: 'Housing Allowance', amount: 34000, type: 'earning' },
  { label: 'Transport Allowance', amount: 17000, type: 'earning' },
]
const ssgtDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 22100, type: 'deduction' },
  { label: 'Welfare Fund', amount: 4200, type: 'deduction' },
]

const ltEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 250000, type: 'earning' },
  { label: 'Housing Allowance', amount: 50000, type: 'earning' },
  { label: 'Transport Allowance', amount: 25000, type: 'earning' },
]
const ltDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 32500, type: 'deduction' },
]

const pvtOkoroEarnings: PayComponent[] = [
  { label: 'Basic Salary', amount: 100000, type: 'earning' },
  { label: 'Housing Allowance', amount: 20000, type: 'earning' },
  { label: 'Transport Allowance', amount: 10000, type: 'earning' },
]
const pvtOkoroDeductions: PayComponent[] = [
  { label: 'Tax (PAYE)', amount: 13000, type: 'deduction' },
  { label: 'Welfare Fund', amount: 2800, type: 'deduction' },
]

export const PAYSLIPS: Payslip[] = [
  ...generateMonths('user-001', officerEarnings, officerDeductions),
  ...generateMonths('user-002', soldierEarnings, soldierDeductions),
  ...generateMonths('user-003', belloEarnings, belloDeductions),
  ...generateMonths('user-006', sergeantEarnings, sergeantDeductions),
  ...generateMonths('user-007', lcplEarnings, lcplDeductions),
  ...generateMonths('user-008', ssgtEarnings, ssgtDeductions),
  ...generateMonths('user-009', ltEarnings, ltDeductions),
  ...generateMonths('user-010', pvtOkoroEarnings, pvtOkoroDeductions),
]
