
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border/50 p-4 flex items-center justify-between shadow-sm animate-slide-down">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden hover-glow micro-bounce"
        >
          <Menu size={20} />
        </Button>
        
        {/* Animated search bar */}
        <div className="hidden md:flex items-center space-x-2 animate-slide-in-left animate-stagger-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases, clients, or documents..."
              className="pl-10 pr-4 py-2 w-80 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-mna-primary focus:border-transparent transition-all duration-200 hover:border-mna-primary/50"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 animate-slide-in-right">
        {/* Notification bell with animation */}
        <Button
          variant="ghost"
          size="sm"
          className="relative hover-glow micro-bounce"
        >
          <Bell size={20} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-mna-accent rounded-full animate-pulse">
            <div className="absolute inset-0 bg-mna-accent rounded-full animate-ping"></div>
          </div>
        </Button>
        
        {/* Welcome message with animation */}
        <div className="text-sm text-muted-foreground animate-fade-in animate-stagger-2">
          Welcome back, MNA Africa Team
        </div>
        
        {/* Animated profile avatar */}
        <div className="relative group">
          <div className="w-10 h-10 bg-gradient-to-br from-mna-primary to-mna-primary/80 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg hover-lift cursor-pointer animate-scale-in animate-stagger-3">
            MNA
            <div className="absolute inset-0 bg-gradient-to-br from-mna-accent/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mna-success rounded-full border-2 border-white animate-bounce-in"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
