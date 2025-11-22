import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import { eventsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'workshop',
    category: 'Technical',
    mode: 'online',
    venue: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    maxAttendees: '',
    registrationDeadline: '',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime || !formData.category) {
      toast.error('Please fill in all required fields (title, description, category, dates, and times)');
      return;
    }

    try {
      setSubmitting(true);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        category: formData.category,
        mode: formData.mode,
        venue: formData.venue ? {
          name: formData.venue,
          city: formData.city,
          state: formData.state,
        } : undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxAttendees: parseInt(formData.maxAttendees) || undefined,
        registrationDeadline: formData.registrationDeadline,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        isPublished: true,  // Publish event immediately so it shows in list
      };
      
      console.log('Creating event with data:', eventData);

      await eventsAPI.create(eventData);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-muted-foreground mt-2">
            Organize a workshop, hackathon, or webinar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Title *</label>
                <Input
                  name="title"
                  placeholder="React Workshop 2025"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  name="description"
                  placeholder="Describe your event, agenda, and what attendees will learn..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Type *</label>
                  <Select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="webinar">Webinar</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="meetup">Meetup</option>
                    <option value="competition">Competition</option>
                    <option value="tech-talk">Tech Talk</option>
                    <option value="networking">Networking</option>
                    <option value="placement-drive">Placement Drive</option>
                    <option value="company-visit">Company Visit</option>
                    <option value="other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Technical">Technical</option>
                    <option value="Career">Career</option>
                    <option value="Placement">Placement</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Social">Social</option>
                    <option value="Academic">Academic</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mode *</label>
                  <Select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Venue</label>
                <Input
                  name="venue"
                  placeholder="Auditorium, Zoom Link, etc."
                  value={formData.venue}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    name="city"
                    placeholder="Bangalore"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    name="state"
                    placeholder="Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date *</label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date *</label>
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Time *</label>
                  <Input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Time *</label>
                  <Input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Registration Deadline</label>
                <Input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Max Attendees</label>
                <Input
                  type="number"
                  name="maxAttendees"
                  placeholder="100"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  name="tags"
                  placeholder="React, JavaScript, Frontend"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/events')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
