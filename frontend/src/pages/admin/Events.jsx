import { useState, useEffect } from 'react';
import { Search, Calendar, Eye, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { eventsAPI } from '../../lib/api';
import { formatDate, formatDateTime } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = typeFilter !== 'all' ? { eventType: typeFilter } : {};
      const response = await eventsAPI.getAll(params);
      setEvents(response.data.events || response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'workshop': return 'default';
      case 'hackathon': return 'success';
      case 'webinar': return 'warning';
      case 'seminar': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all campus events and activities
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="all">All Types</option>
                <option value="workshop">Workshops</option>
                <option value="hackathon">Hackathons</option>
                <option value="webinar">Webinars</option>
                <option value="seminar">Seminars</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No events found</p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <Badge variant={getTypeBadgeVariant(event.eventType)} className="capitalize">
                          {event.eventType}
                        </Badge>
                        <Badge variant={event.mode === 'online' ? 'default' : event.mode === 'offline' ? 'secondary' : 'outline'} className="capitalize">
                          {event.mode}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(event.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{event.startTime}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Registered</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.registeredAttendees?.length || 0}
                            {event.maxAttendees && `/${event.maxAttendees}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Organizer</p>
                          <p className="font-medium">{event.organizer?.fullName || 'N/A'}</p>
                        </div>
                      </div>

                      {event.registrationRequired && event.registrationDeadline && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Registration Deadline</p>
                          <p className="font-medium">{formatDate(event.registrationDeadline)}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.href = `/events/${event._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(event._id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEvents;
