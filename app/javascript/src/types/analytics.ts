export interface KPIData {
  label: string
  value: number
  unit: string
  trend: number
  trendDirection: 'up' | 'down' | 'neutral'
}

export interface CategoryChartData {
  category: string
  count: number
}

export interface MonthlyTrendData {
  month: string
  tickets: number
  resolved: number
}

export interface StatusDistributionData {
  status: string
  count: number
  color: string
}

export interface DivisionComparisonData {
  division: string
  open: number
  resolved: number
  escalated: number
}

export interface SLAComplianceData {
  division: string
  withinSLA: number
  breached: number
  complianceRate: number
}
