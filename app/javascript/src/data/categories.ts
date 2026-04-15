import type { Category } from '#/types/complaint'

export const COMPLAINT_CATEGORIES: Category[] = [
  {
    id: 'pay',
    label: 'Pay',
    subcategories: [
      { id: 'overpayment-salary', label: 'Overpayment of Salary' },
      { id: 'underpayment-salary', label: 'Underpayment of Salary' },
      { id: 'non-payment-salary', label: 'Non-payment of Salary' },
      { id: 'overpayment-allowance', label: 'Overpayment of Allowance' },
      { id: 'underpayment-allowance', label: 'Underpayment of Allowance' },
      { id: 'non-payment-allowance', label: 'Non-payment of Allowance' },
    ],
  },
  {
    id: 'others',
    label: 'Others',
    subcategories: [],
  },
]
