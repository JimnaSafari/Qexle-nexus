import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  CheckSquare, 
  UserCheck, 
  FileCheck, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Scale,
  UserPlus,
  ClipboardList,
  CalendarDays,
  Gavel
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const [isLegalExcellenceOpen, setIsLegalExcellenceOpen] = useState(true);

  const mainNavItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/' 
    },
    { 
      icon: Users, 
      label: 'Team', 
      path: '/team' 
    },
    { 
      icon: UserPlus, 
      label: 'Clients', 
      path: '/clients' 
    },
  ];

  const legalExcellenceItems = [
    { 
      icon: ClipboardList, 
      label: 'Tasks', 
      path: '/tasks' 
    },
    { 
      icon: CalendarDays, 
      label: 'Calendar', 
      path: '/calendar' 
    },
    { 
      icon: FileText, 
      label: 'Files', 
      path: '/files' 
    },
    { 
      icon: CheckSquare, 
      label: 'Leaves', 
      path: '/leaves' 
    },
    { 
      icon: UserCheck, 
      label: 'Approvals', 
      path: '/approvals' 
    },
    { 
      icon: DollarSign, 
      label: 'Invoices', 
      path: '/invoices' 
    },
  ];

  // Check if current path is within Legal Excellence section
  const isInLegalExcellence = legalExcellenceItems.some(item => location.pathname === item.path);
  
  // Keep Legal Excellence section open if we're on one of its pages
  React.useEffect(() => {
    if (isInLegalExcellence) {
      setIsLegalExcellenceOpen(true);
    }
  }, [isInLegalExcellence]);

  const NavItem = ({ icon: Icon, label, path, className = "" }: { 
    icon: React.ElementType; 
    label: string; 
    path: string; 
    className?: string;
  }) => (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "hover:bg-mna-accent hover:text-mna-primary",
          isActive 
            ? "bg-mna-accent text-mna-primary" 
            : "text-muted-foreground",
          className
        )
      }
    >
      <Icon size={18} />
      {!isOpen && <span>{label}</span>}
    </NavLink>
  );

  return (
    <div className="h-full bg-card border-r border-border">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="h-8 w-8 text-mna-primary" />
          {!isOpen && (
            <div>
              <h1 className="text-xl font-bold text-foreground">MNA Africa</h1>
              <p className="text-xs text-muted-foreground">Law Firm</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
            />
          ))}

          {/* Legal Excellence Section */}
          <div className="mt-6">
            <button
              onClick={() => setIsLegalExcellenceOpen(!isLegalExcellenceOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                "hover:bg-mna-accent hover:text-mna-primary",
                (isLegalExcellenceOpen || isInLegalExcellence)
                  ? "bg-mna-accent text-mna-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Gavel size={18} />
              {!isOpen && (
                <>
                  <span className="flex-1 text-left">Legal Excellence</span>
                  {isLegalExcellenceOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </>
              )}
            </button>

            {/* Legal Excellence Submenu */}
            {!isOpen && isLegalExcellenceOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {legalExcellenceItems.map((item) => (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    className="text-xs"
                  />
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
