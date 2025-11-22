import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, UserPlus, Edit, Trash2, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { eventsAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      console.log('Event API response:', response.data);
      // Handle nested response structure
      const eventData = response.data.event || response.data;
      console.log('Setting event data:', eventData);
      setEvent(eventData);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Failed to fetch event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await eventsAPI.register(id);
      toast.success('Successfully registered for the event!');
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    
    try {
      await eventsAPI.cancelRegistration(id);
      toast.success('Registration cancelled');
      fetchEvent();
    } catch (error) {
      toast.error('Failed to cancel registration');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      setDeleting(true);
      await eventsAPI.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  const handleMessageOrganizer = () => {
    // Navigate to messages with organizer ID as query param
    navigate(`/messages?userId=${event.organizer._id}&userName=${event.organizer.fullName}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) return null;

  // Check if current user is registered for this event (and not cancelled)
  const isRegistered = event.attendees?.some(
    attendee => {
      const attendeeId = attendee.user?._id || attendee.user || attendee._id;
      const isCurrentUser = attendeeId === user?._id;
      const isActive = attendee.status !== 'cancelled';
      return isCurrentUser && isActive;
    }
  );

  console.log('Registration check:', {
    userId: user?._id,
    attendees: event.attendees,
    isRegistered
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/events')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        {event.poster && (
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <img
              src={event.poster}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default" className="capitalize">{event.eventType}</Badge>
                  <Badge variant="outline" className="capitalize">{event.mode}</Badge>
                  {event.registrationRequired && (
                    <Badge variant="secondary">Registration Required</Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(event.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>

                  {event.mode === 'offline' && event.venue && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Venue</p>
                        <p className="font-medium">{event.venue}</p>
                      </div>
                    </div>
                  )}

                  {event.mode === 'online' && event.onlineLink && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Online Link</p>
                        <a
                          href={event.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Registered</p>
                      <p className="font-medium">
                        {event.registeredAttendees?.length || 0}
                        {event.maxAttendees && `/${event.maxAttendees}`}
                      </p>
                    </div>
                  </div>
                </div>

                {event.registrationDeadline && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Registration Deadline: {formatDate(event.registrationDeadline)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* Show edit/delete buttons if user is the organizer */}
                {user && event.organizer && user._id === event.organizer._id ? (
                  <>
                    <Badge variant="default" className="text-center py-2">
                      🎯 Your Event
                    </Badge>
                    <Button
                      size="lg"
                      onClick={handleEdit}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Event
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? 'Deleting...' : 'Delete Event'}
                    </Button>
                  </>
                ) : isRegistered ? (
                  <>
                    <Badge variant="success" className="text-center py-2 text-lg">
                      ✓ You're Registered!
                    </Badge>
                    <Button
                      size="lg"
                      onClick={handleMessageOrganizer}
                      className="bg-primary"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Organizer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelRegistration}
                    >
                      Cancel Registration
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {registering ? 'Registering...' : 'Register for Event'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{event.description}</p>
              </CardContent>
            </Card>

            {event.agenda && event.agenda.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="font-medium text-muted-foreground min-w-[80px]">
                          {item.time}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {event.organizer?.avatar ? (
                      <img 
                        src={event.organizer.avatar} 
                        alt={event.organizer.fullName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(event.organizer?.fullName || 'User')}`;
                        }}
                      />
                    ) : (
                      <Users className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer?.fullName || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{event.organizer?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {event.category && (
              <Card>
                <CardHeader>
                  <CardTitle>Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{event.category}</Badge>
                </CardContent>
              </Card>
            )}

            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDetails;
