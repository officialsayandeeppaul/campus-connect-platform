import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { eventsAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const Events = () => {
  const navigate = useNavigate();
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
      console.log('Events API response:', response.data);
      
      // Handle different response structures
      let eventData = [];
      if (response.data.events) {
        eventData = response.data.events;
      } else if (response.data.data) {
        eventData = response.data.data;
      } else if (Array.isArray(response.data)) {
        eventData = response.data;
      }
      
      console.log('Extracted event data:', eventData);
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (error) {
      console.error('Events fetch error:', error);
      setEvents([]); // Set empty array on error
      // Don't show error toast if it's just empty data (404)
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch events');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground mt-2">
              Discover workshops, hackathons, and webinars
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/events/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
            <Link to="/events/my-registrations">
              <Button variant="outline">My Registrations</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
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
          <div className="grid gap-6 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {event.poster && (
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-start gap-3 mb-3">
                    <Badge variant="default" className="capitalize">{event.eventType}</Badge>
                    <Badge variant="outline" className="capitalize">{event.mode}</Badge>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.mode === 'offline' && event.venue && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.registeredAttendees?.length || 0}
                        {event.maxAttendees && `/${event.maxAttendees}`} registered
                      </span>
                    </div>
                  </div>

                  <Link to={`/events/${event._id}`}>
                    <Button className="w-full">View Details & Register</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
