
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bold, Italic, List, ListOrdered, Heading1, Heading2, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/common/Button';

interface EditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Format buttons handler
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Update content state after formatting
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = () => {
    toast({
      title: "Feature coming soon",
      description: "Image upload will be available in the next update"
    });
  };
  
  // Simulate auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (content !== initialContent) {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
          onContentChange?.(content);
          setIsSaving(false);
          setLastSaved(new Date());
        }, 500);
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [content, initialContent, onContentChange]);
  
  return (
    <div className={cn("editor-container px-8", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="editor-toolbar flex items-center gap-1 overflow-x-auto p-1 rounded-md border border-border">
          <Button 
            type="button" 
            onClick={() => handleFormat('bold')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => handleFormat('italic')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => handleFormat('insertUnorderedList')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => handleFormat('insertOrderedList')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => handleFormat('formatBlock', '<h1>')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={() => handleFormat('formatBlock', '<h2>')} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            onClick={handleImageUpload} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {isSaving ? (
            <span>Saving...</span>
          ) : lastSaved ? (
            <span>Saved {formatTimeSince(lastSaved)}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      </div>
      
      <div className="relative min-h-[calc(100vh-16rem)]">
        {!content && (
          <div className="editor-placeholder absolute text-muted-foreground pointer-events-none p-1">Start writing...</div>
        )}
        <div
          ref={editorRef}
          className="prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 max-w-none focus:outline-none"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

// Helper function to format time since last save
function formatTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

export default Editor;
