import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Check, X, Mail } from 'lucide-react';
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

const ManageApplications = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  useEffect(() => {
    if (selectedOpportunity) {
      fetchApplicants(selectedOpportunity);
    }
  }, [selectedOpportunity]);

  const fetchMyOpportunities = async () => {
    try {
      setLoading(true);
      const response = await opportunitiesAPI.getMyPosts();
      const opps = response.data.opportunities || response.data || [];
      setOpportunities(opps);
      if (opps.length > 0) {
        setSelectedOpportunity(opps[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (opportunityId) => {
    try {
      const response = await opportunitiesAPI.getApplicants(opportunityId);
      setApplicants(response.data.applicants || response.data || []);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
    }
  };

  const handleUpdateStatus = async (opportunityId, userId, status) => {
    try {
      await opportunitiesAPI.updateApplicant(opportunityId, userId, { status });
      toast.success(`Application ${status}`);
      fetchApplicants(opportunityId);
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'shortlisted': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Applications</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage candidate applications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : opportunities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No opportunities posted
                </p>
              ) : (
                <div className="space-y-2">
                  {opportunities.map((opp) => (
                    <div
                      key={opp._id}
                      onClick={() => setSelectedOpportunity(opp._id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedOpportunity === opp._id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium text-sm">{opp.title}</p>
                      <p className="text-xs opacity-80 mt-1">
                        {opp.applicants?.length || 0} applicants
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applicants List */}
          <div className="md:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applicants */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Applications ({filteredApplicants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplicants.map((applicant) => (
                      <div
                        key={applicant._id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-medium text-primary">
                                  {applicant.user?.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{applicant.user?.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{applicant.user?.email}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">College</p>
                                <p className="font-medium">{applicant.user?.college}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Year</p>
                                <p className="font-medium">Year {applicant.user?.year}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Applied</p>
                                <p className="font-medium">{formatDate(applicant.appliedAt)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant={getStatusBadgeVariant(applicant.status)} className="capitalize">
                                  {applicant.status}
                                </Badge>
                              </div>
                            </div>

                            {applicant.user?.skills && applicant.user.skills.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {applicant.user.skills.slice(0, 5).map((skill, index) => (
                                    <Badge key={index} variant="outline">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {applicant.coverLetter && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Cover Letter</p>
                                <p className="text-sm line-clamp-2">{applicant.coverLetter}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {applicant.user?.resume && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(applicant.user.resume, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Resume
                              </Button>
                            )}
                            {applicant.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(selectedOpportunity, applicant.user._id, 'shortlisted')}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(selectedOpportunity, applicant.user._id, 'accepted')}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(selectedOpportunity, applicant.user._id, 'rejected')}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {applicant.status === 'shortlisted' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(selectedOpportunity, applicant.user._id, 'accepted')}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(selectedOpportunity, applicant.user._id, 'rejected')}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
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
      </div>
    </DashboardLayout>
  );
};

export default ManageApplications;
