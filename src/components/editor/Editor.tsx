
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className={cn("editor-container", className)}>
      <div className="mb-4 flex items-center justify-end">
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
      
      <div className="relative min-h-[calc(100vh-12rem)]">
        {!content && (
          <div className="editor-placeholder">Start writing...</div>
        )}
        <div
          className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setContent(e.currentTarget.textContent || '')}
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
