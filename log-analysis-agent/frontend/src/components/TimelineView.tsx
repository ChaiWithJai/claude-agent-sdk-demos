import { Clock, Info, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import type { TimelineEvent } from '../types';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-orange-200 bg-orange-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No timeline events available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        Event Timeline
      </h3>
      <p className="text-slate-600 mb-6">
        Chronological sequence of significant events in the logs
      </p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        {/* Events */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative pl-14">
              {/* Icon */}
              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className={`border rounded-lg p-4 ${getEventColor(event.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded">
                    {event.timestamp}
                  </span>
                  <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-white">
                    {event.type}
                  </span>
                </div>
                <p className="text-slate-900 font-medium mb-1">
                  {event.message}
                </p>
                {event.context && (
                  <p className="text-sm text-slate-700 mt-2 pl-3 border-l-2 border-slate-300">
                    {event.context}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
