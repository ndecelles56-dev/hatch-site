import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  className?: string;
}

const Breadcrumbs = ({ className = '' }: BreadcrumbsProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Create readable labels for path segments
      let label = segment;
      switch (segment) {
        case 'customer':
          label = 'Customer';
          break;
        case 'broker':
          label = 'Broker';
          break;
        case 'admin':
          label = 'Admin';
          break;
        case 'search':
          label = 'Property Search';
          break;
        case 'property':
          label = 'Property Details';
          break;
        case 'listings':
          label = 'My Listings';
          break;
        case 'clients':
          label = 'Clients';
          break;
        case 'offers':
          label = 'Offers';
          break;
        case 'saved':
          label = 'Saved Properties';
          break;
        case 'crm':
          label = 'CRM';
          break;
        case 'education':
          label = 'Education';
          break;
        case 'subscription':
          label = 'Subscription';
          break;
        case 'settings':
          label = 'Settings';
          break;
        default:
          // If it's a number (like property ID), show as ID
          if (!isNaN(Number(segment))) {
            label = `#${segment}`;
          } else {
            // Capitalize first letter
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }

      breadcrumbs.push({
        label,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <div className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {index === breadcrumbs.length - 1 ? (
                // Current page - not clickable
                <span className="text-gray-900 font-medium flex items-center gap-1">
                  {index === 0 && <Home className="w-4 h-4" />}
                  {breadcrumb.label}
                </span>
              ) : (
                // Previous pages - clickable
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 p-0 h-auto font-normal flex items-center gap-1"
                  onClick={() => navigate(breadcrumb.path)}
                >
                  {index === 0 && <Home className="w-4 h-4" />}
                  {breadcrumb.label}
                </Button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;