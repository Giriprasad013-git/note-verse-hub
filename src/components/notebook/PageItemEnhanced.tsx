
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PenSquare, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  Layers, 
  Layout, 
  BrainCircuit,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from '@/hooks/useNotebooks';

interface PageItemEnhancedProps {
  page: Page;
  className?: string;
}

const PageItemEnhanced = ({ page, className }: PageItemEnhancedProps) => {
  const getPageTypeIcon = () => {
    switch (page.type) {
      case 'richtext':
        return <PenSquare className="h-4 w-4" />;
      case 'drawio':
        return <BrainCircuit className="h-4 w-4" />;
      case 'flatpage':
        return <FileText className="h-4 w-4" />;
      case 'flatpagev2':
        return <Layout className="h-4 w-4" />;
      case 'pagegroup':
        return <Layers className="h-4 w-4" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'table':
        return <Table className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getPageTypeName = () => {
    switch (page.type) {
      case 'richtext':
        return 'Rich Text';
      case 'drawio':
        return 'Draw.io';
      case 'flatpage':
        return 'Flat Page';
      case 'flatpagev2':
        return 'Enhanced Flat Page';
      case 'pagegroup':
        return 'Page Group';
      case 'spreadsheet':
        return 'Spreadsheet';
      case 'table':
        return 'Table';
      default:
        return 'Page';
    }
  };
  
  return (
    <Link to={`/page/${page.id}`} className={cn(className)}>
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-accent/50">
            {getPageTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium leading-tight">{page.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{getPageTypeName()}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{page.lastEdited}</span>
              </div>
            </div>
          </div>
        </div>
        
        {page.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-1 flex-wrap max-w-[200px]">
            {page.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className="px-1.5 py-0.5 text-xs bg-accent/40 rounded-md"
              >
                {tag}
              </span>
            ))}
            {page.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{page.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PageItemEnhanced;
