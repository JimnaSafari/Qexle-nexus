
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CalendarEventForm } from '@/components/calendar/CalendarEventForm';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { EventsList } from '@/components/calendar/EventsList';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

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

const Calendar = () => {
  const { toast } = useToast();
  const { 
    events, 
    isLoading, 
    addEventMutation, 
    updateEventMutation, 
    deleteEventMutation, 
    user 
  } = useCalendarEvents();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleAddEvent = (formData: any) => {
    if (!formData.title || !formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    const newEvent = {
      title: formData.title,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: formData.location,
      created_by: user?.id
    };

    addEventMutation.mutate(newEvent);
    setIsDialogOpen(false);
  };

  const handleEditEvent = (formData: any) => {
    if (!editingEvent || !formData.title || !formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);

    const updates = {
      id: editingEvent.id,
      title: formData.title,
      description: formData.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: formData.location
    };

    updateEventMutation.mutate(updates);
    setIsDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEventMutation.mutate(id);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (formData: any, isEditing: boolean) => {
    if (isEditing) {
      handleEditEvent(formData);
    } else {
      handleAddEvent(formData);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

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
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalendarGrid 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          events={events}
        />
        
        <EventsList 
          events={events}
          onEditEvent={openEditDialog}
          onDeleteEvent={handleDeleteEvent}
        />
      </div>

      <CalendarEventForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingEvent={editingEvent}
        selectedDate={selectedDate}
        onSubmit={handleFormSubmit}
        isLoading={addEventMutation.isPending || updateEventMutation.isPending}
      />
    </div>
  );
};

export default Calendar;
