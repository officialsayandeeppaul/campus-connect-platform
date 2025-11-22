import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Briefcase, Clock, DollarSign, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { opportunitiesAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    mode: 'all',
    category: 'all',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.mode !== 'all') params.mode = filters.mode;
      if (filters.category !== 'all') params.category = filters.category;
      
      const response = await opportunitiesAPI.getAll(params);
      setOpportunities(response.data.opportunities || response.data);
    } catch (error) {
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    try {
      await opportunitiesAPI.save(id);
      toast.success('Opportunity Saved!');
      // Refetch to update button states
      fetchOpportunities();
    } catch (error) {
      toast.error('Failed to save opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-muted-foreground mt-2">
              Discover internships, jobs, and freelance projects
            </p>
          </div>
          <Link to="/opportunities/saved">
            <Button variant="outline">Saved Opportunities</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="internship">Internships</option>
                <option value="job">Jobs</option>
                <option value="freelance">Freelance</option>
              </Select>
              <Select
                value={filters.mode}
                onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              >
                <option value="all">All Modes</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No opportunities found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOpportunities.map((opp) => (
              <Card key={opp._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {opp.companyLogo && (
                          <img
                            src={opp.companyLogo}
                            alt={opp.company}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{opp.title}</h3>
                            {opp.matchScore && (
                              <Badge variant="success" className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {opp.matchScore}% Match
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg text-muted-foreground mb-3">{opp.company}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm mb-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {opp.location?.city}, {opp.location?.state}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="h-4 w-4" />
                              <span className="capitalize">{opp.type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="capitalize">{opp.mode}</span>
                            </div>
                            {opp.stipend && (
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign className="h-4 w-4" />
                                ₹{opp.stipend.min.toLocaleString()} - ₹{opp.stipend.max.toLocaleString()}/mo
                              </div>
                            )}
                          </div>

                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {opp.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {opp.skillsRequired?.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                            {opp.skillsRequired?.length > 5 && (
                              <Badge variant="outline">
                                +{opp.skillsRequired.length - 5} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                            <span>Deadline: {formatDate(opp.deadline)}</span>
                            <span>•</span>
                            <span>{opp.applicants?.length || 0} applicants</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link to={`/opportunities/${opp._id}`}>
                        <Button className="w-full">View Details</Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleSave(opp._id)}
                      >
                        {opp.isSaved ? (
                          <>
                            <BookmarkCheck className="mr-2 h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
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

export default Opportunities;
