
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Calendar = () => {
  const events = [
    { 
      id: 1, 
      title: 'Court Hearing - Case #2024-001', 
      time: '10:00 AM', 
      date: 'June 10, 2024',
      type: 'Court',
      location: 'Courtroom 3A'
    },
    { 
      id: 2, 
      title: 'Client Consultation - Estate Planning', 
      time: '2:00 PM', 
      date: 'June 11, 2024',
      type: 'Client',
      location: 'Conference Room 1'
    },
    { 
      id: 3, 
      title: 'Team Meeting - Case Review', 
      time: '9:00 AM', 
      date: 'June 12, 2024',
      type: 'Internal',
      location: 'Main Conference Room'
    },
    { 
      id: 4, 
      title: 'Deposition - Witness Interview', 
      time: '11:00 AM', 
      date: 'June 13, 2024',
      type: 'Court',
      location: 'Legal Office Building'
    },
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Court': return 'destructive';
      case 'Client': return 'default';
      case 'Internal': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Legal Calendar</h1>
          <p className="text-muted-foreground">Manage court dates, meetings, and deadlines</p>
        </div>
        <Button className="bg-mna-navy hover:bg-mna-navy/90">
          <Plus size={16} className="mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <Badge variant={getEventTypeColor(event.type) as any}>
                  {event.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="text-sm font-medium">{event.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="text-sm font-medium">{event.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="text-sm font-medium">{event.location}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
