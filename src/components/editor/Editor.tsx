import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, Bold, Italic, List, ListOrdered, Link as LinkIcon,
  Heading1, Heading2, Heading3, Image, CheckSquare, Code, Quote, Undo, Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import Button from '@/components/common/Button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

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
  const [historyStack, setHistoryStack] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Initialize editor content
  useEffect(() => {
    if (initialContent && initialContent !== content) {
      setContent(initialContent);
      setHistoryStack([initialContent]);
      setHistoryIndex(0);
    }
  }, [initialContent, content]);
  
  // Add to history stack when content changes
  const addToHistory = useCallback((newContent: string) => {
    if (historyIndex < historyStack.length - 1) {
      // If we're in the middle of the history, truncate the future
      const newStack = historyStack.slice(0, historyIndex + 1);
      newStack.push(newContent);
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    } else {
      // We're at the latest history point, just append
      setHistoryStack(prev => [...prev, newContent]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyStack, historyIndex]);
  
  // Format buttons handler
  const handleFormat = useCallback((command: string, value?: string) => {
    // Prevent processing multiple commands at once to avoid race conditions
    if (isProcessingCommand) return;
    
    setIsProcessingCommand(true);
    try {
      document.execCommand(command, false, value);
      
      // Get updated content
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        
        // Only add to history if content actually changed
        if (newContent !== historyStack[historyIndex]) {
          addToHistory(newContent);
        }
      }
    } catch (err) {
      console.error("Error executing command:", err);
    } finally {
      setIsProcessingCommand(false);
      editorRef.current?.focus();
    }
  }, [isProcessingCommand, historyStack, historyIndex, addToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(historyStack[newIndex]);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = historyStack[newIndex];
      }
    }
  }, [historyIndex, historyStack]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(historyStack[newIndex]);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = historyStack[newIndex];
      }
    }
  }, [historyIndex, historyStack]);

  const handleImageUpload = () => {
    toast({
      title: "Feature coming soon",
      description: "Image upload will be available in the next update"
    });
  };
  
  const handleLinkInsert = useCallback(() => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      document.execCommand('createLink', false, url);
      
      // Get updated content after link insert
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        addToHistory(newContent);
      }
    }
  }, [addToHistory]);
  
  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const newContent = editorRef.current.innerHTML;
    if (newContent === content) return;
    
    setContent(newContent);
    
    // Debounced history addition (only add to history if there's a 500ms pause)
    const timer = setTimeout(() => {
      addToHistory(newContent);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, addToHistory]);
  
  // Simulate auto-save functionality with delay
  useEffect(() => {
    if (content === initialContent) return;
    
    const saveTimer = setTimeout(() => {
      setIsSaving(true);
      
      // Simulate API call with slight delay
      setTimeout(() => {
        onContentChange?.(content);
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [content, initialContent, onContentChange]);
  
  // Create keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle common keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      }
    };
    
    // Add event listener to the editor
    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (editorElement) {
        editorElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleFormat, handleRedo, handleUndo]);
  
  return (
    <div className={cn("editor-container px-8", className)}>
      <div className="mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border">
        <div className="flex flex-wrap items-center gap-1 overflow-x-auto">
          <EditorToolbarGroup>
            <EditorToolbarButton
              onClick={() => handleFormat('bold')}
              icon={<Bold className="h-4 w-4" />}
              tooltip="Bold (Ctrl+B)"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('italic')}
              icon={<Italic className="h-4 w-4" />}
              tooltip="Italic (Ctrl+I)"
            />
          </EditorToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
          
          <EditorToolbarGroup>
            <EditorToolbarButton
              onClick={() => handleFormat('formatBlock', '<h1>')}
              icon={<Heading1 className="h-4 w-4" />}
              tooltip="Heading 1"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('formatBlock', '<h2>')}
              icon={<Heading2 className="h-4 w-4" />}
              tooltip="Heading 2"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('formatBlock', '<h3>')}
              icon={<Heading3 className="h-4 w-4" />}
              tooltip="Heading 3"
            />
          </EditorToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
          
          <EditorToolbarGroup>
            <EditorToolbarButton
              onClick={() => handleFormat('insertUnorderedList')}
              icon={<List className="h-4 w-4" />}
              tooltip="Bullet List"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('insertOrderedList')}
              icon={<ListOrdered className="h-4 w-4" />}
              tooltip="Numbered List"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('formatBlock', '<blockquote>')}
              icon={<Quote className="h-4 w-4" />}
              tooltip="Quote"
            />
            <EditorToolbarButton
              onClick={() => handleFormat('formatBlock', '<pre>')}
              icon={<Code className="h-4 w-4" />}
              tooltip="Code Block"
            />
          </EditorToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
          
          <EditorToolbarGroup>
            <EditorToolbarButton
              onClick={handleLinkInsert}
              icon={<LinkIcon className="h-4 w-4" />}
              tooltip="Insert Link"
            />
            <EditorToolbarButton
              onClick={handleImageUpload}
              icon={<Image className="h-4 w-4" />}
              tooltip="Insert Image"
            />
          </EditorToolbarGroup>
          
          <Separator orientation="vertical" className="h-6" />
          
          <EditorToolbarGroup>
            <EditorToolbarButton
              onClick={handleUndo}
              icon={<Undo className="h-4 w-4" />}
              tooltip="Undo (Ctrl+Z)"
              disabled={historyIndex <= 0}
            />
            <EditorToolbarButton
              onClick={handleRedo}
              icon={<Redo className="h-4 w-4" />}
              tooltip="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              disabled={historyIndex >= historyStack.length - 1}
            />
          </EditorToolbarGroup>
          
          <div className="flex-1"></div>
          
          <div className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
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
      </div>
      
      <div className="relative min-h-[calc(100vh-16rem)]">
        {!content && (
          <div className="editor-placeholder absolute text-muted-foreground pointer-events-none p-1">Start writing...</div>
        )}
        <div
          ref={editorRef}
          className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-blockquote:border-l-2 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

// Toolbar button component
interface EditorToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
}

const EditorToolbarButton: React.FC<EditorToolbarButtonProps> = ({
  onClick,
  icon,
  tooltip,
  disabled = false
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type="button" 
            onClick={onClick} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            disabled={disabled}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Group for toolbar buttons
const EditorToolbarGroup: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="flex items-center">
      {children}
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
