
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-border p-4 flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="lg:hidden"
      >
        <Menu size={20} />
      </Button>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Welcome back, Legal Team
        </div>
        <div className="w-8 h-8 bg-mna-navy rounded-full flex items-center justify-center text-white text-sm">
          MNA
        </div>
      </div>
    </header>
  );
};

export default Header;
