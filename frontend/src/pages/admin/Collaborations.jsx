import { useState, useEffect } from 'react';
import { Search, Users, Eye, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { collaborationsAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const AdminCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const response = await collaborationsAPI.getAll();
      setCollaborations(response.data.collaborations || response.data);
    } catch (error) {
      toast.error('Failed to fetch collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this collaboration?')) return;
    
    try {
      await collaborationsAPI.delete(id);
      toast.success('Collaboration deleted successfully');
      fetchCollaborations();
    } catch (error) {
      toast.error('Failed to delete collaboration');
    }
  };

  const filteredCollaborations = collaborations.filter(collab =>
    collab.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Collaborations Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all project collaborations
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collaborations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredCollaborations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No collaborations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredCollaborations.map((collab) => (
              <Card key={collab._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{collab.title}</h3>
                        <Badge variant="default" className="capitalize">
                          {collab.projectType}
                        </Badge>
                        {collab.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">{collab.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium">{collab.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Team Size</p>
                          <p className="font-medium">
                            {collab.teamMembers?.length || 0}/{collab.teamSize?.required || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{collab.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">{formatDate(collab.createdAt)}</p>
                        </div>
                      </div>

                      {collab.skillsNeeded && collab.skillsNeeded.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Skills Needed</p>
                          <div className="flex flex-wrap gap-2">
                            {collab.skillsNeeded.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                            {collab.skillsNeeded.length > 5 && (
                              <Badge variant="outline">
                                +{collab.skillsNeeded.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.location.href = `/collaborations/${collab._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(collab._id)}
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

export default AdminCollaborations;
