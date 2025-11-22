import { useState, useEffect } from 'react';
import { User, Mail, Building2, BookOpen, Award, Upload, Save, FileText, X, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import useAuthStore from '../../store/authStore';
import { usersAPI, authAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    year: '',
    branch: '',
    bio: '',
    skills: [],
    linkedIn: '',
    github: '',
    portfolio: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch fresh user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching fresh user data...');
        const response = await authAPI.getMe();
        console.log('API response:', response);
        console.log('Fresh user data received:', response.data?.user || response.data);
        // Handle both response structures
        const userData = response.data?.user || response.data;
        updateUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      console.log('Loading user data into form:', user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        year: user.year?.toString() || '',
        branch: user.branch || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills : [],
        linkedIn: user.socialLinks?.linkedin || '',  // Backend uses lowercase 'linkedin'
        github: user.socialLinks?.github || '',
        portfolio: user.socialLinks?.portfolio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving profile data:', formData);
      
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        college: formData.college,
        year: formData.year ? parseInt(formData.year) : undefined,
        branch: formData.branch,
        bio: formData.bio,
        skills: formData.skills,
        socialLinks: {
          linkedin: formData.linkedIn,  // Backend expects lowercase 'linkedin'
          github: formData.github,
          portfolio: formData.portfolio,
        },
      };

      console.log('Sending update:', updateData);
      const response = await authAPI.updateProfile(updateData);
      console.log('Update response:', response);
      
      // Refresh user data
      const userResponse = await authAPI.getMe();
      console.log('Refreshed user response:', userResponse);
      const userData = userResponse.data?.user || userResponse.data;
      console.log('Extracted user data:', userData);
      updateUser(userData);
      
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Avatar file selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast.error('Please upload an image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      console.log('Starting avatar upload...');
      toast.loading('Uploading avatar...');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('Calling uploadAvatar API...');
      const uploadResponse = await usersAPI.uploadAvatar(formData);
      console.log('Upload response:', uploadResponse);
      
      toast.dismiss();
      toast.success('Avatar uploaded successfully!');
      
      // Refresh user data instead of page reload
      console.log('Fetching updated user data...');
      const response = await authAPI.getMe();
      console.log('Updated user response:', response);
      const userData = response.data?.user || response.data;
      console.log('Extracted user data:', userData);
      updateUser(userData);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOC file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      const toastId = toast.loading('Uploading resume...');
      console.log('Uploading resume:', file.name);
      
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await usersAPI.uploadResume(formData);
      console.log('Upload response:', uploadResponse);
      
      toast.dismiss();
      toast.success('Resume uploaded successfully!');
      
      // Refresh user data instead of page reload
      console.log('Fetching updated user data...');
      const response = await authAPI.getMe();
      console.log('Updated user response:', response);
      const userData = response.data?.user || response.data;
      console.log('Extracted user data:', userData);
      updateUser(userData);
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    }
  };

  const handleScanResume = async () => {
    if (!user?.resume) {
      toast.error('Please upload a resume first');
      return;
    }

    try {
      const toastId = toast.loading(' Scanning resume with AI...');
      console.log(' Scanning resume with AI...');
      
      const response = await usersAPI.scanResume();
      console.log('Scan response:', response);
      
      toast.dismiss();
      
      if (response.data.resumeSkills && response.data.resumeSkills.length > 0) {
        toast.success(` Resume scanned! Found ${response.data.skillsCount} skills!`);
        
        // Refresh user data
        const userResponse = await authAPI.getMe();
        const userData = userResponse.data?.user || userResponse.data;
        updateUser(userData);
      } else {
        toast.error('No skills extracted from resume');
      }
    } catch (error) {
      console.error('Resume scan error:', error);
      toast.error(error.response?.data?.message || 'Failed to scan resume with AI');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your personal information and preferences
            </p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{user?.fullName}</h3>
                  <p className="text-muted-foreground capitalize">{user?.role}</p>
                  <Badge variant="outline" className="mt-2">
                    Profile {user?.profileCompletionPercentage || 0}% Complete
                  </Badge>

                  <div className="w-full mt-4">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium flex items-center justify-center transition-colors">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </div>
                    </label>
                  </div>

                  {/* Resume Upload - Students Only */}
                  {user?.role === 'student' && (
                    <div className="w-full mt-2">
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <div className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium flex items-center justify-center transition-colors">
                          <FileText className="mr-2 h-4 w-4" />
                          Upload Resume
                        </div>
                      </label>
                    </div>
                  )}

                  {user?.role === 'student' && user?.resume && (
                    <div className="w-full mt-4 space-y-3">
                      <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Resume Uploaded</span>
                          </div>
                          <a
                            href={user.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>

                      {(!user?.resumeSkills || user.resumeSkills.length === 0) && (
                        <Button 
                          onClick={handleScanResume} 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Scan Resume with AI
                        </Button>
                      )}
                      
                      {user?.resumeSkills && user.resumeSkills.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                                AI Extracted Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {user.resumeSkills.map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                These skills were automatically extracted from your resume using AI
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills - Students Only */}
            {user?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {editing && (
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button onClick={handleAddSkill}>Add</Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={editing ? 'cursor-pointer' : ''}
                        onClick={() => editing && handleRemoveSkill(skill)}
                      >
                        {skill} {editing && '×'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      name="email"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {user?.role === 'recruiter' ? 'Company' : 'College'}
                    </label>
                    <Input
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder={user?.role === 'recruiter' ? 'Company name' : 'College name'}
                    />
                  </div>
                  {/* Year & Branch - Students Only */}
                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Year</label>
                        <Select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          disabled={!editing}
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                          <option value="5">5th Year</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Branch</label>
                        <Input
                          name="branch"
                          value={formData.branch}
                          onChange={handleChange}
                          disabled={!editing}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">LinkedIn</label>
                  <Input
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">GitHub</label>
                  <Input
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Portfolio</label>
                  <Input
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
