
import React from 'react';
import { Link } from 'react-router-dom';
import { File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from '@/hooks/useNotebooks';

interface PageItemProps {
  page: Page;
  className?: string;
}

const PageItem: React.FC<PageItemProps> = ({ page, className }) => {
  return (
    <Link
      to={`/page/${page.id}`}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md hover:bg-accent/30 transition-colors", 
        className
      )}
    >
      <File className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <span className="block truncate font-medium">{page.title}</span>
        <span className="block text-xs text-muted-foreground">Edited {page.lastEdited}</span>
      </div>
    </Link>
  );
};

export default PageItem;
