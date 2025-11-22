import { useState, useEffect } from 'react';
import { Search, Briefcase, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { opportunitiesAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = typeFilter !== 'all' ? { type: typeFilter } : {};
      const response = await opportunitiesAPI.getAll(params);
      setOpportunities(response.data.opportunities || response.data);
    } catch (error) {
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    
    try {
      await opportunitiesAPI.delete(id);
      toast.success('Opportunity deleted successfully');
      fetchOpportunities();
    } catch (error) {
      toast.error('Failed to delete opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'internship': return 'default';
      case 'job': return 'success';
      case 'freelance': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Opportunities Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all job postings and internships
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
                    placeholder="Search by title or company..."
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
                <option value="internship">Internships</option>
                <option value="job">Jobs</option>
                <option value="freelance">Freelance</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Grid */}
        <div className="grid gap-6">
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
            filteredOpportunities.map((opp) => (
              <Card key={opp._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{opp.title}</h3>
                            <Badge variant={getTypeBadgeVariant(opp.type)} className="capitalize">
                              {opp.type}
                            </Badge>
                            {opp.isActive ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4">{opp.company}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">
                                {opp.location?.city}, {opp.location?.state}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Mode</p>
                              <p className="font-medium capitalize">{opp.mode}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Applications</p>
                              <p className="font-medium">{opp.applicants?.length || 0}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deadline</p>
                              <p className="font-medium">{formatDate(opp.deadline)}</p>
                            </div>
                          </div>

                          {opp.stipend && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">Stipend</p>
                              <p className="font-semibold text-green-600">
                                ₹{opp.stipend.min.toLocaleString()} - ₹{opp.stipend.max.toLocaleString()}/month
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.href = `/opportunities/${opp._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(opp._id)}
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

export default AdminOpportunities;
