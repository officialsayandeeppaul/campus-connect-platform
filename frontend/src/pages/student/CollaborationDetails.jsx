import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowLeft, Send, UserPlus, MessageSquare, GitBranch, Code2, FileText, Clock, User as UserIcon, Mail, Linkedin, Github, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Progress } from '../../components/ui/Progress';
import { collaborationsAPI } from '../../lib/api';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

const CollaborationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [collaboration, setCollaboration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [message, setMessage] = useState('I\'m interested in joining this project!');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCollaboration();
  }, [id]);

  const fetchCollaboration = async () => {
    try {
      setLoading(true);
      const response = await collaborationsAPI.getById(id);
      console.log('Collaboration API response:', response.data);
      // API returns data nested under 'collaboration' key
      const collaborationData = response.data.collaboration || response.data;
      console.log('Setting collaboration data:', collaborationData);
      setCollaboration(collaborationData);
    } catch (error) {
      console.error('Failed to fetch collaboration:', error);
      toast.error('Failed to fetch collaboration details');
      navigate('/collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!message.trim()) {
      toast.error('Please write a message');
      return;
    }

    try {
      setSubmitting(true);
      await collaborationsAPI.expressInterest(id, { message });
      toast.success('Interest submitted successfully!');
      setShowInterestModal(false);
      fetchCollaboration();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to express interest');
    } finally {
      setSubmitting(false);
    }
  };

  // All hooks must be called before any early returns
  // Check if current user has already expressed interest
  const hasExpressedInterest = useMemo(() => {
    if (!collaboration) return false;
    return collaboration.interestedUsers?.some(
      interested => {
        const interestedId = typeof interested === 'string' ? interested : 
                          interested.user?._id || interested.user || interested._id;
        return interestedId === user?._id;
      }
    );
  }, [collaboration, user?._id]);

  const isCreator = useMemo(() => {
    if (!collaboration) return false;
    return collaboration.createdBy?._id === user?._id || 
           (typeof collaboration.createdBy === 'string' && collaboration.createdBy === user?._id);
  }, [collaboration, user?._id]);

  const teamMembers = useMemo(() => {
    if (!collaboration || !collaboration.teamMembers) return [];
    return collaboration.teamMembers.map(member => ({
      ...(typeof member.user === 'string' ? { _id: member.user } : member.user || member),
      role: member.role,
      joinedAt: member.joinedAt
    }));
  }, [collaboration]);

  const interestedUsers = useMemo(() => {
    if (!collaboration || !collaboration.interestedUsers) return [];
    return collaboration.interestedUsers.map(interested => 
      typeof interested === 'string' ? { _id: interested } : interested.user || interested
    );
  }, [collaboration]);

  const progress = useMemo(() => {
    if (!collaboration || !collaboration.teamSize?.required) return 0;
    const current = teamMembers.length;
    const required = collaboration.teamSize.required;
    return Math.min(Math.round((current / required) * 100), 100);
  }, [collaboration, teamMembers.length]);

  const skillsNeeded = useMemo(() => {
    if (!collaboration) return [];
    return Array.isArray(collaboration.skillsNeeded) ? 
      collaboration.skillsNeeded : [];
  }, [collaboration]);

  const createdByUser = useMemo(() => {
    if (!collaboration || !collaboration.createdBy) return null;
    return typeof collaboration.createdBy === 'string' ? 
      { _id: collaboration.createdBy } : collaboration.createdBy;
  }, [collaboration]);

  const handleMessageCreator = () => {
    // Navigate to messages with creator ID as query param
    if (collaboration.createdBy) {
      navigate(`/messages?userId=${collaboration.createdBy._id}&userName=${collaboration.createdBy.fullName}`);
    }
  };

  // Early returns must come after all hooks
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/collaborations')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collaborations
        </Button>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-1">
            <div className="bg-background p-6 rounded-t-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{collaboration.title}</h1>
                    {collaboration.isActive ? (
                      <Badge variant="success" className="h-6">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="h-6">Inactive</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="secondary" className="capitalize">
                      <Code2 className="h-3.5 w-3.5 mr-1.5" />
                      {collaboration.projectType || 'Project'}
                    </Badge>
                    {collaboration.category && (
                      <Badge variant="outline" className="capitalize">
                        <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                        {collaboration.category}
                      </Badge>
                    )}
                    {collaboration.duration?.text && (
                      <Badge variant="outline" className="capitalize">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {collaboration.duration.text}
                      </Badge>
                    )}
                    {collaboration.isRemote && (
                      <Badge variant="outline" className="capitalize">
                        🌍 Remote
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Team Progress</span>
                        <span className="font-medium">
                          {teamMembers.length}/{collaboration.teamSize?.required || '?'} members
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{teamMembers.length} team members</span>
                      </div>
                      <div className="flex items-center">
                        <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{interestedUsers.length} interested</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Posted {formatDate(collaboration.createdAt, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                {isCreator ? (
                  <div className="space-y-2">
                    {collaboration.isActive && (
                      <>
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => navigate(`/collaborations/edit/${collaboration._id}`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Project
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full"
                          onClick={() => navigate(`/collaborations/${collaboration._id}/applicants`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Applicants ({interestedUsers.length})
                        </Button>
                      </>
                    )}
                    {!collaboration.isActive && (
                      <Badge variant="destructive" className="w-full justify-center py-3 text-sm">
                        This project is closed
                      </Badge>
                    )}
                  </div>
                ) : hasExpressedInterest ? (
                  <div className="space-y-3">
                    <Badge variant="success" className="w-full justify-center py-2 text-sm">
                      ✓ Interest Submitted!
                    </Badge>
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={handleMessageCreator}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Creator
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collaboration.isActive ? (
                      <>
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => setShowInterestModal(true)}
                          disabled={collaboration.teamMembers.length >= (collaboration.teamSize?.required || Infinity)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {collaboration.teamMembers.length >= (collaboration.teamSize?.required || Infinity) 
                            ? 'Team Full' 
                            : 'Express Interest'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full"
                          onClick={handleMessageCreator}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message Creator
                        </Button>
                      </>
                    ) : (
                      <Badge variant="destructive" className="w-full justify-center py-3 text-sm">
                        This project is no longer accepting applications
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs 
          defaultValue="overview" 
          className="w-full"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team ({teamMembers.length}/{collaboration.teamSize?.required || '?'})
            </TabsTrigger>
            <TabsTrigger value="skills" disabled={!skillsNeeded.length}>
              <Code2 className="h-4 w-4 mr-2" />
              Skills Needed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {collaboration.description?.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {(collaboration.goals?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {collaboration.goals.map((goal, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary mr-3 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Team Size</h4>
                  <p>
                    {teamMembers.length} of {collaboration.teamSize?.required || '?'} members
                    {collaboration.teamSize?.current && ` (${collaboration.teamSize.current} current)`}
                  </p>
                </div>

                {collaboration.duration?.text && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Duration</h4>
                    <p>{collaboration.duration.text}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Project Type</h4>
                  <p className="capitalize">{collaboration.projectType || 'Not specified'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Visibility</h4>
                  <p className="capitalize">{collaboration.visibility || 'Public'}</p>
                </div>

                {collaboration.isRemote !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                    <p>{collaboration.isRemote ? '🌍 Remote' : 'In-person'}</p>
                  </div>
                )}

                {collaboration.createdAt && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Posted</h4>
                    <p>{formatDate(collaboration.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {skillsNeeded.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Needed</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {skillsNeeded.length} key skills
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillsNeeded.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Team Members</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {teamMembers.length} of {collaboration.teamSize?.required || '?'} spots filled
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {teamMembers.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {teamMembers.map((member) => (
                      <div key={member._id} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {getInitials(member.fullName || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.fullName || 'Team Member'}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.role || 'Member'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No team members yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {createdByUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={createdByUser.avatar} />
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(createdByUser.fullName || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {createdByUser.fullName || 'Project Creator'}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {createdByUser.college || 'Member'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={handleMessageCreator}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills We're Looking For</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {skillsNeeded.length} key skills needed for this project
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillsNeeded.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-3 py-1.5 text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {collaboration.techStack?.length || 'No'} technologies specified
                </p>
              </CardHeader>
              {collaboration.techStack?.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {collaboration.techStack.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="px-3 py-1.5 text-sm"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>

          {/* Sidebar */}
          <div className="space-y-6">

            {collaboration.rolesNeeded && collaboration.rolesNeeded.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Roles Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {collaboration.rolesNeeded.map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{role.title}</span>
                        <Badge variant="outline">{role.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {collaboration.teamMembers && collaboration.teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {collaboration.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {member.user?.avatar ? (
                            <img src={member.user.avatar} alt={member.user?.fullName} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <Users className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{member.user?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{member.role || 'Member'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No members yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        {/* End Sidebar */}

        <Modal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          title="Express Interest in Project"
          description="Send a message to the project creator to express your interest in joining this collaboration."
        >
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Project: {collaboration.title}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Team: {teamMembers.length}/{collaboration.teamSize?.required || '?'} members</p>
                {collaboration.duration?.text && <p>Duration: {collaboration.duration.text}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Your Message <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Tell the creator why you're interested in this project and what skills you can bring..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your profile and skills will be included with this request.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowInterestModal(false)}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExpressInterest}
                disabled={!message.trim() || submitting}
                loading={submitting}
                className="w-full sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Interest Request
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CollaborationDetails;
