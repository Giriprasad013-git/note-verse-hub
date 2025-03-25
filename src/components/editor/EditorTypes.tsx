
import React from 'react';
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

interface EditorProps {
  initialContent?: string;
  pageId: string;
  pageType: Page['type'];
  onContentChange?: (content: string) => void;
  className?: string;
}

// Main editor component that selects the appropriate editor based on type
export const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  pageId,
  pageType,
  onContentChange,
  className,
}) => {
  // Ensure we have a valid initial content
  const safeInitialContent = initialContent || '';
  
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
      return <DrawIOEditor />;
    case 'flatpage':
    case 'flatpagev2':
      return <FlatPageEditor type={pageType} />;
    case 'pagegroup':
      return <PageGroupEditor />;
    case 'spreadsheet':
      return <SpreadsheetEditor />;
    case 'table':
      return <TableEditor />;
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

// Placeholder editors for different types
const DrawIOEditor = () => (
  <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
    <div className="text-center max-w-md">
      <BrainCircuit className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">Draw.io Integration</h2>
      <p className="text-muted-foreground mb-4">
        This page type will allow you to create diagrams and flowcharts using the Draw.io integration.
      </p>
      <p className="text-sm text-muted-foreground">
        Feature coming soon.
      </p>
    </div>
  </div>
);

const FlatPageEditor: React.FC<{ type: 'flatpage' | 'flatpagev2' }> = ({ type }) => (
  <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
    <div className="text-center max-w-md">
      {type === 'flatpage' ? (
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      ) : (
        <Layout className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      )}
      <h2 className="text-xl font-medium mb-2">
        {type === 'flatpage' ? 'Flat Page Editor' : 'Enhanced Flat Page Editor'}
      </h2>
      <p className="text-muted-foreground mb-4">
        This page type provides a simplified editing experience with minimal formatting options.
      </p>
      <p className="text-sm text-muted-foreground">
        Feature coming soon.
      </p>
    </div>
  </div>
);

const PageGroupEditor = () => (
  <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
    <div className="text-center max-w-md">
      <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">Page Group</h2>
      <p className="text-muted-foreground mb-4">
        Group multiple pages together for better organization.
      </p>
      <p className="text-sm text-muted-foreground">
        Feature coming soon.
      </p>
    </div>
  </div>
);

const SpreadsheetEditor = () => (
  <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
    <div className="text-center max-w-md">
      <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">Spreadsheet Editor</h2>
      <p className="text-muted-foreground mb-4">
        Create tables with calculations and formulas.
      </p>
      <p className="text-sm text-muted-foreground">
        Feature coming soon.
      </p>
    </div>
  </div>
);

const TableEditor = () => (
  <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
    <div className="text-center max-w-md">
      <Table className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">Table Editor</h2>
      <p className="text-muted-foreground mb-4">
        Create structured tables with sortable columns.
      </p>
      <p className="text-sm text-muted-foreground">
        Feature coming soon.
      </p>
    </div>
  </div>
);

// Export page type icon mapping function
export const getPageTypeIcon = (pageType: Page['type']) => {
  switch (pageType) {
    case 'richtext':
      return <PenSquare className="h-5 w-5" />;
    case 'drawio':
      return <BrainCircuit className="h-5 w-5" />;
    case 'flatpage':
    case 'flatpagev2':
      return pageType === 'flatpage' ? <FileText className="h-5 w-5" /> : <Layout className="h-5 w-5" />;
    case 'pagegroup':
      return <Layers className="h-5 w-5" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="h-5 w-5" />;
    case 'table':
      return <Table className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Export page type name mapping function
export const getPageTypeName = (pageType: Page['type']) => {
  switch (pageType) {
    case 'richtext':
      return 'Rich Text';
    case 'drawio':
      return 'Draw.io';
    case 'flatpage':
      return 'Flat Page';
    case 'flatpagev2':
      return 'Flat Page V2';
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
