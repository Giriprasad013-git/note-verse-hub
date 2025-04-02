
import React, { useEffect } from 'react';
import {
  BrainCircuit,
  FileText,
  Table,
  FileSpreadsheet,
  Layers,
  Layout,
  PenSquare
} from 'lucide-react';
import { Page } from '@/hooks/useNotebooks';
import RichTextEditor from './RichTextEditor';
import DrawIOEditor from './DrawIOEditor';
import FlatPageEditor from './FlatPageEditor';
import FlatPageV2Editor from './FlatPageV2Editor';
import PageGroupEditor from './PageGroupEditor';
import SpreadsheetEditor from './SpreadsheetEditor';
import TableEditor from './TableEditor';

interface EditorProps {
  initialContent?: string;
  pageId: string;
  pageType: Page['type'];
  onContentChange?: (content: string) => void;
  className?: string;
}

// Main editor component that selects the appropriate editor based on type
const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  pageId,
  pageType,
  onContentChange,
  className,
}) => {
  // Ensure we have a valid initial content
  const safeInitialContent = initialContent || '';
  
  console.log(`Editor rendering with type ${pageType} and content:`, safeInitialContent.substring(0, 50) + "...");
  
  useEffect(() => {
    console.log(`Editor mounted with type: ${pageType}`);
  }, [pageType]);
  
  switch (pageType) {
    case 'richtext':
      return (
        <RichTextEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'drawio':
      return (
        <DrawIOEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'flatpage':
      return (
        <FlatPageEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'flatpagev2':
      // FlatPageV2 is fully implemented now
      return (
        <FlatPageV2Editor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'pagegroup':
      return (
        <PageGroupEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'spreadsheet':
      return (
        <SpreadsheetEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    case 'table':
      return (
        <TableEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
    default:
      return (
        <RichTextEditor
          initialContent={safeInitialContent}
          pageId={pageId}
          onContentChange={onContentChange}
          className={className}
        />
      );
  }
};

export default Editor;
