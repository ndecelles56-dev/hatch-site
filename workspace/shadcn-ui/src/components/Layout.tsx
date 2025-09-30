import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/App';
import { useView } from '@/contexts/ViewContext';
import { 
  Home, 
  Search, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  BookOpen,
  Building2,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Eye,
  Shield,
  Inbox,
  MapPin,
  CheckSquare,
  UserCheck
} from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { viewMode, setViewMode } = useView();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCustomerView = viewMode === 'customer';
  const isBrokerView = viewMode === 'broker';

  // Broker navigation items (existing + enhanced)
  const brokerNavItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Properties', href: '/properties', icon: Search },
    { name: 'CRM', href: '/crm', icon: Users },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Education', href: '/education', icon: BookOpen },
    // Enhanced broker features (Phase 3)
    { name: 'Offers Inbox', href: '/broker/offers', icon: Inbox },
    { name: 'Listings', href: '/broker/listings', icon: MapPin },
    { name: 'Tasks', href: '/broker/tasks', icon: CheckSquare },
    { name: 'Clients', href: '/broker/clients', icon: UserCheck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Customer navigation items (Phase 2)
  const customerNavItems = [
    { name: 'Search Properties', href: '/customer/search', icon: Search },
    { name: 'Saved Properties', href: '/customer/saved', icon: Home },
    { name: 'My Offers', href: '/customer/offers', icon: FileText },
    { name: 'Market Insights', href: '/customer/insights', icon: BarChart3 },
  ];

  const currentNavItems = isBrokerView ? brokerNavItems : customerNavItems;

  const handleViewToggle = (checked: boolean) => {
    const newViewMode = checked ? 'customer' : 'broker';
    setViewMode(newViewMode);
    setIsMobileMenuOpen(false);
    
    // Navigate to appropriate home page when switching views
    if (newViewMode === 'customer') {
      navigate('/customer/search');
    } else {
      navigate('/');
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Hatch</span>
              </Link>
              
              {/* View Mode Badge */}
              <div className="ml-4 hidden sm:block">
                <Badge 
                  variant={isBrokerView ? "default" : "secondary"}
                  className={`${isBrokerView ? 'bg-blue-600' : 'bg-green-600'} text-white`}
                >
                  {isBrokerView ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Broker View
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Customer View
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {currentNavItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Demo View Toggle Switch */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border">
                <Label htmlFor="view-toggle" className="text-sm font-medium text-gray-700">
                  Demo Mode
                </Label>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${isBrokerView ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Broker
                  </span>
                  <Switch
                    id="view-toggle"
                    checked={isCustomerView}
                    onCheckedChange={handleViewToggle}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className={`text-xs ${isCustomerView ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    Customer
                  </span>
                </div>
              </div>

              {/* Notifications (Broker View Only) */}
              {isBrokerView && (
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              )}

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile View Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg mb-3">
                <Label htmlFor="mobile-view-toggle" className="text-sm font-medium text-gray-700">
                  Demo Mode
                </Label>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${isBrokerView ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Broker
                  </span>
                  <Switch
                    id="mobile-view-toggle"
                    checked={isCustomerView}
                    onCheckedChange={handleViewToggle}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className={`text-xs ${isCustomerView ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    Customer
                  </span>
                </div>
              </div>

              {/* Mobile Navigation */}
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* View Mode Notice for Customer View */}
        {isCustomerView && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Customer View Demo</h3>
                <p className="text-sm text-green-700">
                  You're viewing the platform as a customer would see it. Toggle back to Broker View to access admin features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Broker View Notice */}
        {isBrokerView && (location.pathname.startsWith('/broker/')) && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Enhanced Broker Tools</h3>
                <p className="text-sm text-blue-700">
                  You're using advanced broker features including offers management, task boards, and enhanced client tools.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* This is where page content should render */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;