import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import useAuthStore from '../../store/authStore';
import { opportunitiesAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RecruiterDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    totalApplications: 0,
    activeOpportunities: 0,
  });

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  const fetchMyOpportunities = async () => {
    try {
      setLoading(true);
      const response = await opportunitiesAPI.getMyPosts();
      const opportunities = response.data.opportunities || response.data || [];
      setMyOpportunities(opportunities);

      // Calculate stats
      const totalApplications = opportunities.reduce(
        (sum, opp) => sum + (opp.applicants?.length || 0),
        0
      );
      const activeOpportunities = opportunities.filter(opp => opp.status === 'active').length;

      setStats({
        totalOpportunities: opportunities.length,
        totalApplications,
        activeOpportunities,
      });
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will mark it as inactive.`)) {
      return;
    }

    try {
      await opportunitiesAPI.delete(id);
      toast.success('Opportunity deleted successfully');
      fetchMyOpportunities(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete opportunity');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.fullName}!
            </p>
          </div>
          <Link to="/recruiter/post-opportunity">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Post New Opportunity
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Opportunities
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalOpportunities}</h3>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{stats.totalApplications}</h3>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Postings
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{stats.activeOpportunities}</h3>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Posted Opportunities</CardTitle>
            <Link to="/recruiter/applications">
              <Button variant="outline">View All Applications</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : myOpportunities.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  You haven't posted any opportunities yet
                </p>
                <Link to="/recruiter/post-opportunity">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Opportunity
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myOpportunities.map((opp) => (
                  <div
                    key={opp._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{opp.title}</h4>
                        <Badge variant={opp.status === 'active' ? 'success' : 'outline'}>
                          {opp.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">{opp.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{opp.company}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{opp.applicants?.length || 0} applicants</span>
                        <span>•</span>
                        <span>Posted {formatDate(opp.createdAt)}</span>
                        <span>•</span>
                        <span>Deadline: {formatDate(opp.deadline)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/opportunities/${opp._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/recruiter/edit-opportunity/${opp._id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Link to={`/recruiter/applications?opportunity=${opp._id}`}>
                        <Button size="sm">
                          View Applications ({opp.applicants?.length || 0})
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(opp._id, opp.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RecruiterDashboard;
