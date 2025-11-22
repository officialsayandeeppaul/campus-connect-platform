import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { opportunitiesAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const SavedOpportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedOpportunities();
  }, []);

  const fetchSavedOpportunities = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching saved opportunities...');
      const response = await opportunitiesAPI.getMySaved();
      console.log('✅ Saved opportunities response:', response);
      console.log('📊 Opportunities data:', response.data);
      
      const opps = response.data.opportunities || response.data || [];
      console.log('📋 Parsed opportunities:', opps);
      console.log('📊 Count:', opps.length);
      
      setOpportunities(opps);
    } catch (error) {
      console.error('❌ Failed to fetch saved opportunities:', error);
      toast.error('Failed to fetch saved opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (id) => {
    try {
      await opportunitiesAPI.unsave(id);
      toast.success('Opportunity removed from saved');
      fetchSavedOpportunities();
    } catch (error) {
      toast.error('Failed to remove opportunity');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate('/opportunities')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Opportunities
            </Button>
            <h1 className="text-3xl font-bold mt-4">Saved Opportunities</h1>
            <p className="text-muted-foreground mt-2">
              Your bookmarked opportunities
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : opportunities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No saved opportunities yet</p>
              <Link to="/opportunities">
                <Button>Browse Opportunities</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {opportunities.map((opp) => (
              <Card key={opp._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {/* Company Logo/Avatar */}
                      <div className="flex-shrink-0">
                        {opp.companyLogo || opp.postedBy?.avatar ? (
                          <img
                            src={opp.companyLogo || opp.postedBy?.avatar}
                            alt={opp.company}
                            className="h-16 w-16 rounded-lg object-cover border"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(opp.company || 'Company')}`;
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center border">
                            <Briefcase className="h-8 w-8 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{opp.title}</h3>
                        <p className="text-lg text-muted-foreground mb-4">{opp.company}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{opp.location?.city}, {opp.location?.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{opp.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{opp.mode}</span>
                        </div>
                        {opp.stipend && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold text-green-600">
                              ₹{opp.stipend.min.toLocaleString()} - ₹{opp.stipend.max.toLocaleString()}/mo
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {opp.skillsRequired?.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {opp.skillsRequired?.length > 5 && (
                          <Badge variant="outline">+{opp.skillsRequired.length - 5} more</Badge>
                        )}
                      </div>

                        <p className="text-sm text-muted-foreground">
                          Deadline: {formatDate(opp.deadline)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link to={`/opportunities/${opp._id}`}>
                        <Button>View Details</Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleUnsave(opp._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedOpportunities;
