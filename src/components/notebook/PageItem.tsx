
import React from 'react';
import { Link } from 'react-router-dom';
import { File, Tag as TagIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from '@/hooks/useNotebooks';
import { Badge } from '@/components/ui/badge';

interface PageItemProps {
  page: Page;
  className?: string;
}

const PageItem: React.FC<PageItemProps> = ({ page, className }) => {
  // Function to extract plain text from HTML content for preview
  const extractPreview = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let text = doc.body.textContent || '';
    
    // Truncate to a reasonable length
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };
  
  const contentPreview = extractPreview(page.content);
  
  return (
    <Link
      to={`/page/${page.id}`}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-md hover:bg-accent/30 border border-border transition-colors", 
        className
      )}
    >
      <div className="flex items-start gap-2">
        <File className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="block truncate font-medium">{page.title}</span>
          
          {contentPreview && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {contentPreview}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{page.lastEdited}</span>
        </div>
        
        {page.tags && page.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <TagIcon className="h-3 w-3 text-muted-foreground" />
            <div className="flex gap-1">
              {page.tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs py-0 px-1.5 bg-accent/30"
                >
                  {tag}
                </Badge>
              ))}
              
              {page.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{page.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PageItem;
