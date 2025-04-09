
import React, { useEffect, useRef, memo } from 'react';
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
  const lastContentRef = useRef(safeInitialContent);
  const lastPageIdRef = useRef(pageId);
  
  console.log(`Editor rendering with type ${pageType} for page ${pageId}`);
  
  // Update the content reference when page changes or content significantly changes
  useEffect(() => {
    const pageChanged = lastPageIdRef.current !== pageId;
    
    if (pageChanged) {
      console.log(`Page changed from ${lastPageIdRef.current} to ${pageId}`);
      lastPageIdRef.current = pageId;
      lastContentRef.current = safeInitialContent;
    }
  }, [pageId, safeInitialContent]);
  
  console.log(`Rendering editor for page ${pageId}, type: ${pageType}`);
  
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

// Use React.memo to prevent unnecessary re-renders
export default memo(Editor, (prevProps, nextProps) => {
  // Only re-render if a significant prop changes
  const pageChanged = prevProps.pageId !== nextProps.pageId;
  const typeChanged = prevProps.pageType !== nextProps.pageType;
  
  // Allow re-renders when page or type changes, but not for minor content edits
  return !pageChanged && !typeChanged;
});
