
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, History, Search, Share, Menu } from 'lucide-react';
import Button from '../common/Button';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, toggleSidebar }) => {
  const location = useLocation();
  
  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10 animate-fade-in">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        
        {toggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        {title && (
          <h1 className="font-medium truncate">{title}</h1>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <History className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <Share className="h-4 w-4 mr-1.5" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default Header;
