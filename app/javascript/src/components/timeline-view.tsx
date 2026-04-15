import type { TimelineEvent } from '#/types/complaint'
import { StatusBadge } from '#/components/status-badge'
import { format } from 'date-fns'

export function TimelineView({ events, filerName }: { events: TimelineEvent[]; filerName?: string }) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const isAdminResponse = filerName ? (event.type === 'note' && event.actor !== filerName) : false
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                  event.type === 'escalation'
                    ? 'bg-red-500'
                    : event.type === 'status-change'
                      ? 'bg-army-gold'
                      : event.type === 'submission'
                        ? 'bg-army'
                        : (isAdminResponse ? 'bg-army-gold' : 'bg-gray-300')
                }`}
              />
              {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className="pb-6 flex-1">
              {isAdminResponse ? (
                <div className="bg-army-dark/5 rounded-lg px-3 py-2 -mx-1">
                  <span className="text-[10px] font-semibold text-army-gold uppercase tracking-wider mb-1 block">Admin Response</span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-army-dark">{event.actor}</span>
                    {event.newStatus && <StatusBadge status={event.newStatus} />}
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <time className="text-[11px] text-gray-400 mt-1 block">
                    {format(new Date(event.timestamp), "d MMM yyyy 'at' HH:mm")}
                  </time>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-army-dark">{event.actor}</span>
                    {event.newStatus && <StatusBadge status={event.newStatus} />}
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <time className="text-[11px] text-gray-400 mt-1 block">
                    {format(new Date(event.timestamp), "d MMM yyyy 'at' HH:mm")}
                  </time>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
