
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_by?: string;
  case_id?: string;
  attendees?: string[];
}

interface EventsListProps {
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventsList = ({ events, onEditEvent, onDeleteEvent }: EventsListProps) => {
  const getEventTypeColor = (event: CalendarEvent) => {
    const hour = new Date(event.start_time).getHours();
    if (hour < 12) return 'default';
    if (hour < 17) return 'secondary';
    return 'destructive';
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const todayEvents = getEventsForDate(new Date());

  return (
    <div className="lg:col-span-2 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Today's Events</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <p className="text-muted-foreground">No events today</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getEventTypeColor(event) as any}>
                      {format(new Date(event.start_time), 'HH:mm')}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEditEvent(event)}>
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Events */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.slice(0, 10).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{format(new Date(event.start_time), 'PPP')}</span>
                      <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditEvent(event)}>
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
