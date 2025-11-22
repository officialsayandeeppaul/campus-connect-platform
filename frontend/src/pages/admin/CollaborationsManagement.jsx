import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Ban, CheckCircle, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Dialog from '../../components/ui/Dialog';
import { collaborationsAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const CollaborationsManagement = () => {
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const response = await collaborationsAPI.getAll({ 
        page: 1, 
        limit: 100,
        admin: 'true' // Admin flag to fetch all collaborations
      });
      
      console.log('API Response:', response);
      
      // Handle paginated response structure
      let data = [];
      
      if (response && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      
      console.log('Processed collaborations data:', data);
      setCollaborations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch collaborations:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch collaborations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await collaborationsAPI.delete(deleteDialog.id);
      toast.success('Collaboration deleted successfully');
      setDeleteDialog({ isOpen: false, id: null });
      fetchCollaborations();
    } catch (error) {
      toast.error('Failed to delete collaboration');
    }
  };

  const handleToggleStatus = async (id, currentIsActive) => {
    try {
      await collaborationsAPI.update(id, { isActive: !currentIsActive });
      toast.success(`Collaboration ${!currentIsActive ? 'activated' : 'deactivated'}`);
      fetchCollaborations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredCollaborations = collaborations.filter(collab =>
    collab.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const variants = {
      'open': 'success',
      'in-progress': 'warning',
      'completed': 'default',
      'cancelled': 'destructive',
      'on-hold': 'outline'
    };
    return variants[status] || 'default';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Collaboration Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all platform collaborations
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collaborations by title, category, or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Collaborations ({filteredCollaborations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredCollaborations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No collaborations match your search' : 'No collaborations found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Title</th>
                      <th className="text-left py-3 px-4 font-medium">Creator</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Team Size</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollaborations.map((collab) => (
                      <tr key={collab._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{collab.title}</p>
                            <p className="text-sm text-muted-foreground">{collab.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{collab.createdBy?.fullName || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{collab.createdBy?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {collab.projectType}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">
                            {collab.teamSize?.current || 0}/{collab.teamSize?.required || 0}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge 
                              variant={getStatusBadge(collab.status)}
                              className="capitalize w-fit"
                            >
                              {collab.status || 'open'}
                            </Badge>
                            <Badge 
                              variant={collab.isActive ? 'success' : 'destructive'} 
                              className="w-fit text-xs"
                            >
                              {collab.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{formatDate(collab.createdAt)}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/collaborations/${collab._id}`, '_blank')}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(collab._id, collab.isActive)}
                              title={collab.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {collab.isActive ? (
                                <Ban className="h-4 w-4 text-orange-600" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteDialog({ isOpen: true, id: collab._id })}
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, id: null })}
          title="Delete Collaboration"
          onConfirm={handleDelete}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmVariant="destructive"
        >
          <p>Are you sure you want to delete this collaboration? This action cannot be undone.</p>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CollaborationsManagement;
