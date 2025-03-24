
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notebook } from '@/hooks/useNotebooks';

interface NotebookItemProps {
  notebook: Notebook;
  className?: string;
}

const NotebookItem: React.FC<NotebookItemProps> = ({ notebook, className }) => {
  const pageCount = notebook.sections.reduce(
    (count, section) => count + section.pages.length,
    0
  );
  
  return (
    <Link
      to={`/notebook/${notebook.id}`}
      className={cn("notebook-card block p-4 h-full", className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <Book className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-medium truncate">{notebook.title}</h3>
          <p className="text-xs text-muted-foreground">
            {notebook.sections.length} {notebook.sections.length === 1 ? 'section' : 'sections'} • {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </p>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground truncate mb-4">
        {notebook.description || 'No description'}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          <span>Last edited {notebook.lastEdited}</span>
        </div>
      </div>
    </Link>
  );
};

export default NotebookItem;
