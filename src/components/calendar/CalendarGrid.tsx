
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
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

interface CalendarGridProps {
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  events: CalendarEvent[];
}

export const CalendarGrid = ({ selectedDate, onDateSelect, events }: CalendarGridProps) => {
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon size={20} />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border"
        />
        {selectedDate && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">
              Events on {format(selectedDate, 'PPP')}:
            </p>
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events</p>
            ) : (
              <div className="space-y-1">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="text-xs p-2 bg-muted rounded">
                    {format(new Date(event.start_time), 'HH:mm')} - {event.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
