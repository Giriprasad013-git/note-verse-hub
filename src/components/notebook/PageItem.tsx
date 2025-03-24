
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
      className={cn("page-item", className)}
    >
      <File className="h-4 w-4" />
      <span className="truncate">{page.title}</span>
    </Link>
  );
};

export default PageItem;
