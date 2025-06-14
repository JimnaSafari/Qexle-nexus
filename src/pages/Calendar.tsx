
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  date: string;
  type: string;
  location: string;
}

const Calendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([
    { 
      id: 1, 
      title: 'Court Hearing - Case #2024-001', 
      time: '10:00 AM', 
      date: '2024-06-10',
      type: 'Court',
      location: 'Courtroom 3A'
    },
    { 
      id: 2, 
      title: 'Client Consultation - Estate Planning', 
      time: '2:00 PM', 
      date: '2024-06-11',
      type: 'Client',
      location: 'Conference Room 1'
    },
    { 
      id: 3, 
      title: 'Team Meeting - Case Review', 
      time: '9:00 AM', 
      date: '2024-06-12',
      type: 'Internal',
      location: 'Main Conference Room'
    },
    { 
      id: 4, 
      title: 'Deposition - Witness Interview', 
      time: '11:00 AM', 
      date: '2024-06-13',
      type: 'Court',
      location: 'Legal Office Building'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    date: '',
    type: 'Court',
    location: ''
  });

  const eventTypes = ['Court', 'Client', 'Internal', 'Deadline'];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Court': return 'destructive';
      case 'Client': return 'default';
      case 'Internal': return 'secondary';
      case 'Deadline': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.time || !formData.date || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now(),
      ...formData
    };

    setEvents([...events, newEvent]);
    setFormData({ title: '', time: '', date: '', type: 'Court', location: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Event added successfully",
    });
  };

  const handleEditEvent = () => {
    if (!editingEvent || !formData.title || !formData.time || !formData.date || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setEvents(events.map(event => 
      event.id === editingEvent.id 
        ? { ...event, ...formData }
        : event
    ));
    setEditingEvent(null);
    setFormData({ title: '', time: '', date: '', type: 'Court', location: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Event updated successfully",
    });
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Success",
      description: "Event removed successfully",
    });
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      time: event.time,
      date: event.date,
      type: event.type,
      location: event.location
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    setFormData({ title: '', time: '', date: '', type: 'Court', location: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Legal Calendar</h1>
          <p className="text-muted-foreground">Manage court dates, meetings, and deadlines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-mna-navy hover:bg-mna-navy/90">
              <Plus size={16} className="mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingEvent ? handleEditEvent : handleAddEvent}
                  className="flex-1"
                >
                  {editingEvent ? 'Update' : 'Add'} Event
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getEventTypeColor(event.type) as any}>
                    {event.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(event)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-mna-danger hover:text-mna-danger"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
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
