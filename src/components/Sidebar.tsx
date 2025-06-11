
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  File, 
  Clock, 
  List,
  Menu,
  X,
  Users,
  UserCheck,
  Receipt
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Menu },
    { name: 'Tasks', path: '/tasks', icon: List },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Court Files', path: '/files', icon: File },
    { name: 'Leave Requests', path: '/leaves', icon: Clock },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Clients', path: '/clients', icon: UserCheck },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Approvals', path: '/approvals', icon: UserCheck },
  ];

  return (
    <>
      <div className={cn(
        "fixed left-0 top-0 h-full bg-mna-primary text-white transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className={cn(
              "font-bold text-xl transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0"
            )}>
              MNA Africa
            </h1>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-white/10",
                    isActive && "bg-white/20"
                  )}
                >
                  <Icon size={20} />
                  <span className={cn(
                    "ml-3 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
