
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from './Chatbot/ChatWidget';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 animate-fade-in">
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
