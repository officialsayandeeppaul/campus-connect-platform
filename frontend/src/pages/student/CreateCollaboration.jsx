import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { collaborationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const CreateCollaboration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    projectType: '',
    maxMembers: 5,
    skillsNeeded: [],
    duration: '',
    goals: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchCollaboration();
    }
  }, [id]);

  const fetchCollaboration = async () => {
    try {
      setLoading(true);
      const response = await collaborationsAPI.getById(id);
      const collab = response.data.collaboration || response.data;
      setFormData({
        title: collab.title || '',
        description: collab.description || '',
        category: collab.category || '',
        projectType: collab.projectType || '',
        maxMembers: collab.teamSize?.required || 5,
        skillsNeeded: collab.skillsNeeded || [],
        duration: collab.duration?.text || '',
        goals: collab.goals || [],
      });
    } catch (error) {
      toast.error('Failed to fetch collaboration details');
      navigate('/collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skillsNeeded.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsNeeded: [...prev.skillsNeeded, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skillsNeeded: prev.skillsNeeded.filter(s => s !== skill)
    }));
  };

  const handleAddGoal = () => {
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.projectType) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.skillsNeeded.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        projectType: formData.projectType,
        teamSize: {
          required: parseInt(formData.maxMembers) || 5
        },
        skillsNeeded: formData.skillsNeeded,
        duration: { text: formData.duration },
        goals: formData.goals,
      };
      
      if (isEditMode) {
        await collaborationsAPI.update(id, payload);
        toast.success('Collaboration updated successfully!');
      } else {
        await collaborationsAPI.create(payload);
        toast.success('Collaboration created successfully!');
      }
      navigate('/collaborations');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} collaboration`);
    } finally {
      setSubmitting(false);
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
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/collaborations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collaborations
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Collaboration Project' : 'Create Collaboration Project'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? 'Update your project details' : 'Find team members for your project'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Project Title *</label>
                <Input
                  name="title"
                  placeholder="E-commerce Platform"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Project Type *</label>
                <Select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Project Type</option>
                  <option value="academic">Academic</option>
                  <option value="research">Research</option>
                  <option value="startup">Startup</option>
                  <option value="open-source">Open Source</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  name="description"
                  placeholder="Describe your project, goals, and what you're looking for in team members..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="IoT">IoT</option>
                    <option value="Game Development">Game Development</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Team Members</label>
                  <Input
                    type="number"
                    name="maxMembers"
                    placeholder="5"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    min="2"
                    max="20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Input
                  name="duration"
                  placeholder="3 months"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsNeeded.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill} <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Goals (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a project goal (e.g., Launch MVP in 2 months)"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())}
                />
                <Button type="button" onClick={handleAddGoal}>Add</Button>
              </div>
              <div className="space-y-2">
                {formData.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-muted rounded-md"
                  >
                    <p className="flex-1 text-sm">{goal}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGoal(goal)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={submitting || loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Project' : 'Create Project')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/collaborations')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateCollaboration;
