
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
  Receipt,
  Home
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
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
        "fixed left-0 top-0 h-full bg-gradient-to-b from-mna-primary to-mna-primary/90 text-white transition-all duration-500 ease-in-out z-40 shadow-2xl",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8 animate-slide-down">
            <h1 className={cn(
              "font-bold text-xl transition-all duration-300 ease-in-out",
              isOpen ? "opacity-100 transform translate-x-0" : "opacity-0 transform -translate-x-4"
            )}>
              MNA Africa
            </h1>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110 micro-bounce"
            >
              {isOpen ? <X size={20} className="transition-transform duration-200" /> : <Menu size={20} className="transition-transform duration-200" />}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out hover:bg-white/10 hover-lift group animate-slide-in-left",
                    isActive && "bg-white/20 shadow-lg transform scale-105",
                    "hover:scale-105"
                  )}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-200 group-hover:scale-110",
                      isActive && "text-mna-accent"
                    )}
                  />
                  <span className={cn(
                    "ml-3 transition-all duration-300 ease-in-out font-medium",
                    isOpen ? "opacity-100 transform translate-x-0" : "opacity-0 transform -translate-x-4",
                    isActive && "text-mna-accent"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute right-0 w-1 h-8 bg-mna-accent rounded-l-full animate-scale-in" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Animated brand element */}
          <div className={cn(
            "absolute bottom-6 left-4 right-4 transition-all duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm animate-float">
              <div className="w-8 h-8 bg-mna-accent rounded-full mx-auto mb-2 animate-pulse-slow"></div>
              <p className="text-xs text-white/80">Legal Excellence</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
