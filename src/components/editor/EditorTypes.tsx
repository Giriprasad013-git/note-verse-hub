import React from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import FlatPageEditor from '@/components/editor/FlatPageEditor';
import FlatPageV2Editor from '@/components/editor/FlatPageV2Editor';
import DrawIOEditor from '@/components/editor/DrawIOEditor';
import PageGroupEditor from '@/components/editor/PageGroupEditor';
import TableEditor from '@/components/editor/TableEditor';
import SpreadsheetEditor from '@/components/editor/SpreadsheetEditor';
import { 
  PenSquare, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  Layers, 
  Layout, 
  BrainCircuit
} from 'lucide-react';

export interface EditorProps {
  initialContent?: string;
  pageId: string;
  pageType: 'richtext' | 'drawio' | 'flatpage' | 'flatpagev2' | 'pagegroup' | 'spreadsheet' | 'table';
  onContentChange?: (content: string) => void;
}

export const getPageTypeIcon = (pageType: EditorProps['pageType']) => {
  switch (pageType) {
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

export const getPageTypeName = (pageType: EditorProps['pageType']) => {
  switch (pageType) {
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

// Update the Editor component function to render the FlatPageV2Editor correctly
export function Editor({ initialContent, pageId, pageType, onContentChange }: EditorProps) {
  switch (pageType) {
    case 'richtext':
      return (
        <RichTextEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    case 'flatpage':
      return (
        <FlatPageEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    case 'flatpagev2':
      return (
        <FlatPageV2Editor
          initialContent={initialContent}
          pageId={pageId} 
          onContentChange={onContentChange}
        />
      );
    case 'drawio':
      return (
        <DrawIOEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    case 'pagegroup':
      return (
        <PageGroupEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    case 'table':
      return (
        <TableEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    case 'spreadsheet':
      return (
        <SpreadsheetEditor 
          initialContent={initialContent} 
          pageId={pageId}
          onContentChange={onContentChange}
        />
      );
    default:
      return (
        <div className="p-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-medium mb-2">Unsupported page type</h2>
          <p className="text-muted-foreground text-center">
            This page type is not supported yet.
          </p>
        </div>
      );
  }
}
