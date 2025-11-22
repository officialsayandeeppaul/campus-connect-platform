import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Calendar, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import { opportunitiesAPI, eventsAPI, collaborationsAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [trendingCollabs, setTrendingCollabs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data for user:', user?.fullName, 'Profile completion:', user?.profileCompletionPercentage);
      
      const [recResponse, eventsResponse, collabsResponse] = await Promise.all([
        opportunitiesAPI.getRecommendations(),
        eventsAPI.getUpcoming(),
        collaborationsAPI.getTrending(),
      ]);

      console.log('Recommendations response:', recResponse);
      console.log('Events response:', eventsResponse);
      console.log('Collaborations response:', collabsResponse);

      setRecommendations(recResponse.data.opportunities || recResponse.data || []);
      setUpcomingEvents(eventsResponse.data.events || eventsResponse.data || []);
      setTrendingCollabs(collabsResponse.data.collaborations || collabsResponse.data || []);
      
      console.log('Recommendations set:', recResponse.data.opportunities?.length || 0);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your campus network today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Profile Completion
                  </p>
                  <h3 className="text-2xl font-bold mt-2">
                    {user?.profileCompletionPercentage || 0}%
                  </h3>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Applications
                  </p>
                  <h3 className="text-2xl font-bold mt-2">0</h3>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Briefcase className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Events Registered
                  </p>
                  <h3 className="text-2xl font-bold mt-2">0</h3>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Powered Recommendations
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Opportunities matched to your skills and interests
              </p>
            </div>
            <Link to="/opportunities">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {user?.profileCompletionPercentage < 80 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Complete your profile (at least 80%) to unlock AI-powered recommendations
                </p>
                <p className="text-sm text-muted-foreground">
                  Current completion: {user?.profileCompletionPercentage || 0}%
                </p>
                <Link to="/profile">
                  <Button className="mt-4">Complete Profile</Button>
                </Link>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No recommendations available yet
                </p>
                <p className="text-sm text-muted-foreground">
                  We're analyzing opportunities that match your skills: {user?.skills?.join(', ') || 'Add skills to your profile'}
                </p>
                <Link to="/opportunities">
                  <Button variant="outline" className="mt-4">
                    Browse All Opportunities
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((opp) => (
                  <div
                    key={opp._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{opp.title}</h4>
                        {opp.matchScore && opp.matchScore >= 70 && (
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{opp.company}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="capitalize">{opp.type}</Badge>
                        <Badge variant="outline">{opp.mode}</Badge>
                        {opp.matchScore && (
                          <Badge 
                            variant={opp.matchScore >= 70 ? "default" : "secondary"}
                            className={opp.matchScore >= 70 ? "bg-green-500" : ""}
                          >
                            🎯 {opp.matchScore}% Match
                          </Badge>
                        )}
                        {opp.matchingSkills && opp.matchingSkills.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {opp.matchingSkills.slice(0, 3).join(', ')}
                            {opp.matchingSkills.length > 3 && ` +${opp.matchingSkills.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={`/opportunities/${opp._id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events & Trending Collaborations */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Link to="/events">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming events
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.startDate)} • {event.startTime}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {event.eventType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Collaborations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trending Collaborations</CardTitle>
              <Link to="/collaborations">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {trendingCollabs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No collaborations available
                </p>
              ) : (
                <div className="space-y-4">
                  {trendingCollabs.slice(0, 3).map((collab) => (
                    <div key={collab._id} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{collab.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {collab.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{collab.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {collab.teamMembers?.length || 0}/{collab.teamSize?.required || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
