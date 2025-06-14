import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { format, parseISO } from 'date-fns';

const Calendar = () => {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    location: '',
    description: ''
  });

  console.log('Calendar component rendered, events:', events.length, 'loading:', loading);

  const eventTypes = ['Court', 'Client', 'Internal', 'Deadline'];

  const getEventTypeFromTitle = (title: string) => {
    if (title.toLowerCase().includes('court')) return 'Court';
    if (title.toLowerCase().includes('client')) return 'Client';
    if (title.toLowerCase().includes('meeting') || title.toLowerCase().includes('team')) return 'Internal';
    if (title.toLowerCase().includes('deadline')) return 'Deadline';
    return 'Internal';
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Court': return 'destructive';
      case 'Client': return 'default';
      case 'Internal': return 'secondary';
      case 'Deadline': return 'outline';
      default: return 'outline';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = parseISO(dateTimeString);
      return {
        date: format(date, 'yyyy-MM-dd'),
        time: format(date, 'HH:mm')
      };
    } catch {
      return { date: '', time: '' };
    }
  };

  const handleAddEvent = async () => {
    if (!formData.title || !formData.start_time || !formData.end_time) {
      return;
    }

    try {
      await addEvent({
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        description: formData.description || null
      });
      
      setFormData({ title: '', start_time: '', end_time: '', location: '', description: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent || !formData.title || !formData.start_time || !formData.end_time) {
      return;
    }

    try {
      await updateEvent(editingEvent.id, {
        title: formData.title,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || null,
        description: formData.description || null
      });
      
      setEditingEvent(null);
      setFormData({ title: '', start_time: '', end_time: '', location: '', description: '' });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    const startDateTime = formatDateTime(event.start_time);
    const endDateTime = formatDateTime(event.end_time);
    
    setFormData({
      title: event.title,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || '',
      description: event.description || ''
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    setFormData({ title: '', start_time: '', end_time: '', location: '', description: '' });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading calendar events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Legal Calendar</h1>
          <p className="text-muted-foreground">Manage court dates, meetings, and deadlines</p>
        </div>
        
        <div className="flex-shrink-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  console.log('New Event button clicked');
                  setEditingEvent(null);
                  setFormData({ title: '', start_time: '', end_time: '', location: '', description: '' });
                  setIsDialogOpen(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-lg"
                size="lg"
              >
                <Plus size={20} className="mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                  <Label htmlFor="start_time">Start Date & Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Date & Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
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
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter event description"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => {
          const eventType = getEventTypeFromTitle(event.title);
          const startFormatted = formatDateTime(event.start_time);
          const endFormatted = formatDateTime(event.end_time);
          
          return (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getEventTypeColor(eventType) as any}>
                      {eventType}
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
                  <span className="text-sm text-muted-foreground">Start:</span>
                  <span className="text-sm font-medium">
                    {startFormatted.date} at {startFormatted.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End:</span>
                  <span className="text-sm font-medium">
                    {endFormatted.date} at {endFormatted.time}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="text-sm font-medium">{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p className="text-sm mt-1">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">Create your first calendar event to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
