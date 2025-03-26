
import React, { useState, useEffect } from 'react';
import { Layout, Save, Bold, Italic, List, Heading, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlatPageV2EditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const FlatPageV2Editor: React.FC<FlatPageV2EditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize content when initialContent changes
  useEffect(() => {
    if (initialContent && !isEditing) {
      setContent(initialContent);
    }
  }, [initialContent, isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIsEditing(true);
    setContent(e.target.value);
  };
  
  const handleSave = () => {
    if (onContentChange) {
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your document has been saved successfully"
      });
      setIsEditing(false);
    }
  };
  
  // Simple markdown-like preview renderer
  const renderPreview = () => {
    if (!content) return <p className="text-muted-foreground">No content to preview</p>;
    
    let html = content
      // Convert headings
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>')
      // Convert bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Convert lists
      .replace(/^- (.+)$/gm, '<li class="ml-5">$1</li>')
      // Convert paragraphs
      .split('\n\n').join('</p><p class="mb-4">');
    
    return <div className="prose" dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${html}</p>` }} />;
  };
  
  const insertMarkdown = (markdown: string) => {
    if (viewMode === 'preview') return;
    
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + markdown + content.substring(end);
    
    setContent(newContent);
    setIsEditing(true);
    
    // Set cursor position after the inserted markdown
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 0);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Enhanced Flat Page Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleSave} disabled={!isEditing}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      {viewMode === 'edit' && (
        <div className="border-b p-2 flex gap-1 overflow-x-auto">
          <Button size="sm" variant="ghost" onClick={() => insertMarkdown('# ')}>
            <Heading className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertMarkdown('**Bold text**')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertMarkdown('*Italic text*')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertMarkdown('- List item\n- Another item')}>
            <List className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => insertMarkdown('[Link text](https://example.com)')}>
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 p-4 overflow-auto">
        {viewMode === 'edit' ? (
          <Textarea
            value={content}
            onChange={handleChange}
            placeholder="Start typing your content here. You can use basic markdown syntax like # for headings, ** for bold, * for italic, and - for list items."
            className="w-full h-full min-h-[calc(100vh-16rem)] p-4 text-base font-mono"
          />
        ) : (
          <div className="bg-white rounded-md p-6 border">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatPageV2Editor;
