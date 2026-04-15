import { Card, CardContent } from '#/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { KPIData } from '#/types/analytics'

interface KPICardProps {
  data: KPIData
  accentColor?: string
}

export function KPICard({ data, accentColor = '#C8A84B' }: KPICardProps) {
  const TrendIcon = data.trendDirection === 'up' ? TrendingUp : data.trendDirection === 'down' ? TrendingDown : Minus
  const isPositiveTrend =
    (data.label.includes('Resolved') && data.trendDirection === 'up') ||
    (data.label.includes('Breach') && data.trendDirection === 'down') ||
    (data.label.includes('Resolution') && data.trendDirection === 'down')

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
      <CardContent className="pt-5 pb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{data.label}</div>
        <div className="text-3xl font-extrabold text-army-dark font-mono">
          {data.value}{data.unit}
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-500'}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(data.trend)}% vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
