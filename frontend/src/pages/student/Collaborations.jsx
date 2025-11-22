import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { collaborationsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const Collaborations = () => {
  const navigate = useNavigate();
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
      const data = response.data.data || response.data.collaborations || response.data;
      // Filter out inactive collaborations
      const activeCollabs = Array.isArray(data) ? data.filter(collab => collab.isActive !== false) : [];
      setCollaborations(activeCollabs);
    } catch (error) {
      toast.error('Failed to fetch collaborations');
    } finally {
      setLoading(false);
    }
  };

  const filteredCollaborations = collaborations.filter(collab =>
    collab.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collaborations</h1>
            <p className="text-muted-foreground mt-2">Find team members for your projects</p>
          </div>
          <Button onClick={() => navigate('/collaborations/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

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

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredCollaborations.map((collab) => (
              <Card key={collab._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{collab.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{collab.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{collab.category}</Badge>
                        <Badge variant="outline">{collab.projectType}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {collab.teamMembers?.length || 0}/{collab.teamSize?.required || 0} members
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {collab.skillsNeeded?.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <Link to={`/collaborations/${collab._id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Collaborations;
