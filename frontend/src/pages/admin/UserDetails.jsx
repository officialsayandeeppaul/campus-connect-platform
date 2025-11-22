import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Briefcase, Ban, CheckCircle, Trash2, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { usersAPI, adminAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getPublicProfile(userId);
      setUser(response.data.user);
    } catch (error) {
      toast.error('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await adminAPI.banUser(userId, reason);
      toast.success('User banned successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async () => {
    try {
      await adminAPI.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const handleVerifyUser = async () => {
    try {
      await adminAPI.verifyUser(userId);
      toast.success('User verified successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to verify user');
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone!')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleMessageUser = () => {
    navigate(`/admin/messages?userId=${userId}&userName=${user.fullName}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || 'User')}`;
                    }}
                  />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || 'User')}`}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{user.fullName}</h1>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'recruiter' ? 'warning' : 'default'} className="capitalize">
                      {user.role}
                    </Badge>
                    {user.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                    {user.isVerified && (
                      <Badge variant="outline">Verified</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.college && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{user.college}</span>
                    </div>
                  )}
                  {user.year && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Year {user.year}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleMessageUser}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message User
                  </Button>
                  
                  {!user.isVerified && (
                    <Button variant="outline" onClick={handleVerifyUser}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify User
                    </Button>
                  )}

                  {user.isActive ? (
                    <Button variant="outline" onClick={handleBanUser} className="text-orange-600">
                      <Ban className="mr-2 h-4 w-4" />
                      Ban User
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleUnbanUser} className="text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Unban User
                    </Button>
                  )}

                  <Button variant="outline" onClick={handleDeleteUser} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {user.bio && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{user.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links */}
        {user.socialLinks && (
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.socialLinks.linkedin && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">LinkedIn:</span>
                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-primary hover:underline">
                      {user.socialLinks.linkedin}
                    </a>
                  </div>
                )}
                {user.socialLinks.github && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">GitHub:</span>
                    <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-primary hover:underline">
                      {user.socialLinks.github}
                    </a>
                  </div>
                )}
                {user.socialLinks.portfolio && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">Portfolio:</span>
                    <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-primary hover:underline">
                      {user.socialLinks.portfolio}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Profile Completion</p>
                <p className="text-2xl font-bold">{user.profileCompletionPercentage || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold">{user.stats?.applicationsSubmitted || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events Attended</p>
                <p className="text-2xl font-bold">{user.stats?.eventsAttended || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collaborations</p>
                <p className="text-2xl font-bold">{user.stats?.collaborationsJoined || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
