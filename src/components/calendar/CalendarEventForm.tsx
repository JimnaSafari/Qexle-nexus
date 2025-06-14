
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface CalendarEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent: CalendarEvent | null;
  selectedDate?: Date;
  onSubmit: (formData: any, isEditing: boolean) => void;
  isLoading: boolean;
}

export const CalendarEventForm = ({ 
  isOpen, 
  onClose, 
  editingEvent, 
  selectedDate, 
  onSubmit, 
  isLoading 
}: CalendarEventFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: ''
  });

  // Initialize form when dialog opens
  useEffect(() => {
    if (editingEvent) {
      const startDate = new Date(editingEvent.start_time);
      const endDate = new Date(editingEvent.end_time);
      
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        start_date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        end_time: format(endDate, 'HH:mm'),
        location: editingEvent.location || ''
      });
    } else if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setFormData({
        title: '',
        description: '',
        start_date: dateStr,
        start_time: '09:00',
        end_date: dateStr,
        end_time: '10:00',
        location: ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        location: ''
      });
    }
  }, [editingEvent, selectedDate, isOpen]);

  const handleSubmit = () => {
    onSubmit(formData, !!editingEvent);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter event title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              />
            </div>
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
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {editingEvent ? 'Update' : 'Add'} Event
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
