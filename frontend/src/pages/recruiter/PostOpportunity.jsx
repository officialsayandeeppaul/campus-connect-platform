import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, Save, X, Edit2, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { opportunitiesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const PostOpportunity = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    type: 'internship',
    category: '',
    mode: 'remote',
    city: '',
    state: '',
    deadline: '',
    minStipend: '',
    maxStipend: '',
    skillsRequired: [],
    responsibilities: [],
    requirements: [],
    companyWebsite: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [editingResponsibility, setEditingResponsibility] = useState(null);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [editText, setEditText] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skill)
    }));
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleEditResponsibility = (index) => {
    setEditingResponsibility(index);
    setEditText(formData.responsibilities[index]);
  };

  const handleEditRequirement = (index) => {
    setEditingRequirement(index);
    setEditText(formData.requirements[index]);
  };

  const handleSaveResponsibility = (index) => {
    if (editText.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: prev.responsibilities.map((item, i) => 
          i === index ? editText.trim() : item
        )
      }));
    }
    setEditingResponsibility(null);
    setEditText('');
  };

  const handleSaveRequirement = (index) => {
    if (editText.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.map((item, i) => 
          i === index ? editText.trim() : item
        )
      }));
    }
    setEditingRequirement(null);
    setEditText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const opportunityData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        mode: formData.mode,
        location: {
          city: formData.city,
          state: formData.state,
        },
        deadline: formData.deadline,
        skillsRequired: formData.skillsRequired,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        companyWebsite: formData.companyWebsite,
      };

      if (formData.minStipend && formData.maxStipend) {
        opportunityData.stipend = {
          min: parseInt(formData.minStipend),
          max: parseInt(formData.maxStipend),
          currency: 'INR',
        };
      }

      await opportunitiesAPI.create(opportunityData);
      toast.success('Opportunity posted successfully!');
      navigate('/recruiter');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/recruiter')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Post New Opportunity</h1>
          <p className="text-muted-foreground mt-2">
            Create a new job or internship posting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Title *</label>
                  <Input
                    name="title"
                    placeholder="e.g. Frontend Developer Intern"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company Name *</label>
                  <Input
                    name="company"
                    placeholder="e.g. TechCorp"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Type *</label>
                  <Select name="type" value={formData.type} onChange={handleChange}>
                    <option value="internship">Internship</option>
                    <option value="job">Full-time Job</option>
                    <option value="freelance">Freelance</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Input
                    name="category"
                    placeholder="e.g. Web Development"
                    value={formData.category}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mode *</label>
                  <Select name="mode" value={formData.mode} onChange={handleChange}>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Application Deadline *</label>
                  <Input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  name="description"
                  placeholder="Describe the role, company, and what you're looking for..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    name="city"
                    placeholder="e.g. Bangalore"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    name="state"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Minimum Stipend/Salary (₹)</label>
                  <Input
                    type="number"
                    name="minStipend"
                    placeholder="e.g. 10000"
                    value={formData.minStipend}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum Stipend/Salary (₹)</label>
                  <Input
                    type="number"
                    name="maxStipend"
                    placeholder="e.g. 15000"
                    value={formData.maxStipend}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skillsRequired.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a responsibility"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
                />
                <Button type="button" onClick={handleAddResponsibility}>Add</Button>
              </div>
              <ul className="space-y-2">
                {formData.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    {editingResponsibility === index ? (
                      <>
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveResponsibility(index)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingResponsibility(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">• {resp}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditResponsibility(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveResponsibility(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                />
                <Button type="button" onClick={handleAddRequirement}>Add</Button>
              </div>
              <ul className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    {editingRequirement === index ? (
                      <>
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveRequirement(index)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingRequirement(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">• {req}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRequirement(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Website</label>
                <Input
                  name="companyWebsite"
                  placeholder="https://yourcompany.com"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/recruiter')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? 'Posting...' : 'Post Opportunity'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostOpportunity;
