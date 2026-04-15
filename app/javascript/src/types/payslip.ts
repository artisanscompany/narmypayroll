export type PayslipStatus = 'paid' | 'pending'

export interface PayComponent {
  label: string
  amount: number
  type: 'earning' | 'deduction'
}

export interface Payslip {
  id: string
  userId: string
  month: number
  year: number
  components: PayComponent[]
  grossPay: number
  totalDeductions: number
  netPay: number
  status: PayslipStatus
  paidDate: string | null
}
