import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, DollarSign, Calendar, Building2, ArrowLeft, Send, Bookmark, BookmarkCheck } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { opportunitiesAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await opportunitiesAPI.getById(id);
      // Handle both response.data.opportunity and response.data formats
      const oppData = response.data.opportunity || response.data;
      setOpportunity(oppData);
      setIsSaved(oppData.isSaved || false);
      setHasApplied(oppData.hasApplied || false);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch opportunity details');
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    try {
      setApplying(true);
      await opportunitiesAPI.apply(id, { coverLetter });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      setCoverLetter('');
      fetchOpportunity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isSaved) {
        await opportunitiesAPI.unsave(id);
        toast.success('Opportunity removed from saved');
      } else {
        await opportunitiesAPI.save(id);
        toast.success('Opportunity Saved!');
      }
      // Refetch to get updated isSaved state from backend
      await fetchOpportunity();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save opportunity');
    } finally {
      setSaving(false);
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

  if (!opportunity) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>

        {/* Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {opportunity.companyLogo && (
                  <img
                    src={opportunity.companyLogo}
                    alt={opportunity.company}
                    className="h-16 w-16 rounded-lg object-cover mb-4"
                  />
                )}
                <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{opportunity.company}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{opportunity.location?.city}, {opportunity.location?.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span className="capitalize">{opportunity.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="capitalize">{opportunity.mode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>Deadline: {formatDate(opportunity.deadline)}</span>
                  </div>
                </div>

                {opportunity.stipend && (
                  <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                    <DollarSign className="h-6 w-6" />
                    ₹{opportunity.stipend.min.toLocaleString()} - ₹{opportunity.stipend.max.toLocaleString()}/month
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {isSaved ? (
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
                <Button 
                  size="lg" 
                  onClick={() => setShowApplyModal(true)}
                  disabled={hasApplied}
                  variant={hasApplied ? 'outline' : 'default'}
                >
                  {hasApplied ? (
                    <>
                      <BookmarkCheck className="mr-2 h-4 w-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Apply Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{opportunity.description}</p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {opportunity.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {opportunity.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {opportunity.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Required */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skillsRequired?.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{opportunity.company}</p>
                </div>
                {opportunity.companyWebsite && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={opportunity.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Posted</p>
                  <p className="font-medium">{formatDate(opportunity.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicants</p>
                  <p className="font-medium">{opportunity.applicants?.length || 0} applied</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apply Modal */}
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title="Apply for this Position"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Cover Letter *
              </label>
              <Textarea
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Your resume will be automatically attached from your profile
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowApplyModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={applying}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default OpportunityDetails;
