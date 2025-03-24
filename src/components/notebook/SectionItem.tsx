
import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Section } from '@/hooks/useNotebooks';

interface SectionItemProps {
  section: Section;
  notebookId: string;
  className?: string;
}

const SectionItem: React.FC<SectionItemProps> = ({ section, notebookId, className }) => {
  return (
    <Link
      to={`/notebook/${notebookId}/section/${section.id}`}
      className={cn("section-card block", className)}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <FolderOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-medium truncate">{section.title}</h3>
          <p className="text-xs text-muted-foreground">
            {section.pages.length} {section.pages.length === 1 ? 'page' : 'pages'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SectionItem;
