import type {
  KPIData, CategoryChartData, MonthlyTrendData, StatusDistributionData, DivisionComparisonData, SLAComplianceData,
} from '#/types/analytics'

export const KPI_DATA: KPIData[] = [
  { label: 'Open Tickets', value: 47, unit: '', trend: 12, trendDirection: 'up' },
  { label: 'Avg Resolution Time', value: 8.3, unit: 'days', trend: -15, trendDirection: 'down' },
  { label: 'SLA Breach Rate', value: 6.2, unit: '%', trend: -3, trendDirection: 'down' },
  { label: 'Resolved This Month', value: 124, unit: '', trend: 22, trendDirection: 'up' },
]

export const DIVISION_1_KPI: KPIData[] = [
  { label: 'Open Tickets', value: 12, unit: '', trend: 8, trendDirection: 'up' },
  { label: 'Avg Resolution Time', value: 6.1, unit: 'days', trend: -20, trendDirection: 'down' },
  { label: 'SLA Breach Rate', value: 4.5, unit: '%', trend: -5, trendDirection: 'down' },
  { label: 'Resolved This Month', value: 31, unit: '', trend: 18, trendDirection: 'up' },
]

export const CATEGORY_CHART_DATA: CategoryChartData[] = [
  { category: 'Pay & Allowances', count: 42 },
  { category: 'Service Records', count: 28 },
  { category: 'Postings & Transfers', count: 18 },
  { category: 'Status Issues', count: 14 },
  { category: 'Other', count: 9 },
]

export const MONTHLY_TREND_DATA: MonthlyTrendData[] = [
  { month: 'Oct 2025', tickets: 89, resolved: 82 },
  { month: 'Nov 2025', tickets: 95, resolved: 88 },
  { month: 'Dec 2025', tickets: 72, resolved: 70 },
  { month: 'Jan 2026', tickets: 110, resolved: 98 },
  { month: 'Feb 2026', tickets: 103, resolved: 95 },
  { month: 'Mar 2026', tickets: 118, resolved: 124 },
]

export const STATUS_DISTRIBUTION_DATA: StatusDistributionData[] = [
  { status: 'Under Review', count: 23, color: '#C8A84B' },
  { status: 'Needs More Info', count: 8, color: '#f59e0b' },
  { status: 'Escalated', count: 6, color: '#ef4444' },
  { status: 'Submitted', count: 10, color: '#6b7280' },
  { status: 'Resolved', count: 124, color: '#1B5E35' },
]

export const DIVISION_COMPARISON_DATA: DivisionComparisonData[] = [
  { division: '1 Infantry', open: 12, resolved: 31, escalated: 2 },
  { division: '2 Mechanised', open: 9, resolved: 22, escalated: 3 },
  { division: '3 Armoured', open: 7, resolved: 18, escalated: 1 },
  { division: '81 Division', open: 8, resolved: 25, escalated: 0 },
  { division: '82 Division', open: 6, resolved: 15, escalated: 1 },
  { division: '7 Division', open: 5, resolved: 13, escalated: 0 },
]

export const SLA_COMPLIANCE_DATA: SLAComplianceData[] = [
  { division: '1 Infantry Division', withinSLA: 43, breached: 2, complianceRate: 95.6 },
  { division: '2 Mechanised Division', withinSLA: 30, breached: 4, complianceRate: 88.2 },
  { division: '3 Armoured Division', withinSLA: 24, breached: 1, complianceRate: 96.0 },
  { division: '81 Division', withinSLA: 32, breached: 1, complianceRate: 97.0 },
  { division: '82 Division', withinSLA: 20, breached: 2, complianceRate: 90.9 },
  { division: '7 Division', withinSLA: 18, breached: 0, complianceRate: 100.0 },
]
