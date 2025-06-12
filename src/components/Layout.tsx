
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from './Chatbot/ChatWidget';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const isMobile = useIsMobile();

  // Close sidebar when route changes on mobile
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'ml-0' 
          : sidebarOpen 
            ? 'ml-64' 
            : 'ml-16'
      }`}>
        <Header toggleSidebar={handleSidebarToggle} />
        <main className="p-3 sm:p-6 animate-fade-in">
          <div className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default Layout;
