import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  User, 
  LogOut, 
  Settings,
  GraduationCap,
  Users2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Campus Connect</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link to="/admin/users" className="text-sm font-medium hover:text-primary">
                Users
              </Link>
              <Link to="/admin/opportunities" className="text-sm font-medium hover:text-primary">
                Opportunities
              </Link>
              <Link to="/admin/events" className="text-sm font-medium hover:text-primary">
                Events
              </Link>
              <Link to="/admin/collaborations" className="text-sm font-medium hover:text-primary">
                Collaborations
              </Link>
            </>
          ) : user?.role === 'recruiter' ? (
            <>
              <Link to="/recruiter" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link to="/recruiter/post-opportunity" className="text-sm font-medium hover:text-primary">
                Post Job
              </Link>
              <Link to="/recruiter/applications" className="text-sm font-medium hover:text-primary">
                Applications
              </Link>
              <Link to="/collaborations" className="text-sm font-medium hover:text-primary">
                Collaborations
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link to="/opportunities" className="text-sm font-medium hover:text-primary">
                Opportunities
              </Link>
              <Link to="/collaborations" className="text-sm font-medium hover:text-primary">
                Collaborations
              </Link>
              <Link to="/events" className="text-sm font-medium hover:text-primary">
                Events
              </Link>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Messages */}
          <Link to="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
