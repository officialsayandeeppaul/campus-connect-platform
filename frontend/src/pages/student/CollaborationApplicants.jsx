import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, Mail, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { collaborationsAPI } from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

const CollaborationApplicants = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collaboration, setCollaboration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchCollaboration();
  }, [id]);

  const fetchCollaboration = async () => {
    try {
      setLoading(true);
      const response = await collaborationsAPI.getById(id);
      setCollaboration(response.data.collaboration || response.data);
    } catch (error) {
      toast.error('Failed to fetch collaboration details');
      navigate('/collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      setProcessing(userId);
      await collaborationsAPI.acceptMember(id, userId);
      toast.success('Applicant accepted successfully!');
      fetchCollaboration();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept applicant');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setProcessing(userId);
      await collaborationsAPI.rejectMember(id, userId);
      toast.success('Applicant rejected');
      fetchCollaboration();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject applicant');
    } finally {
      setProcessing(null);
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

  if (!collaboration) return null;

  const interestedUsers = collaboration.interestedUsers || [];
  const pendingApplicants = interestedUsers.filter(
    interested => interested.status === 'pending'
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/collaborations/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>

        <div>
          <h1 className="text-3xl font-bold">{collaboration.title}</h1>
          <p className="text-muted-foreground mt-2">
            Manage applicants for your collaboration project
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{interestedUsers.length}</div>
              <p className="text-sm text-muted-foreground">Total Applicants</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">
                {pendingApplicants.length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {collaboration.teamMembers?.length || 0}/{collaboration.teamSize?.required || 0}
              </div>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
        </div>

        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Pending Applicants ({pendingApplicants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApplicants.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending applicants</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplicants.map((interested) => {
                  const applicant = interested.user;
                  const isProcessing = processing === applicant._id;
                  
                  return (
                    <div
                      key={interested._id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={applicant.avatar} alt={applicant.fullName} />
                        <AvatarFallback>{getInitials(applicant.fullName)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{applicant.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{applicant.email}</p>
                            {applicant.college && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {applicant.college}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {formatDate(interested.appliedAt)}
                          </Badge>
                        </div>

                        {/* Skills */}
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {applicant.skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        {interested.message && (
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Message:</p>
                            <p className="text-sm text-muted-foreground">{interested.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(applicant._id)}
                            disabled={isProcessing}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(applicant._id)}
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/messages?userId=${applicant._id}&userName=${applicant.fullName}`)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accepted Members */}
        {collaboration.teamMembers && collaboration.teamMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Team Members ({collaboration.teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collaboration.teamMembers.map((member) => {
                  const user = member.user;
                  return (
                    <div
                      key={member._id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CollaborationApplicants;
