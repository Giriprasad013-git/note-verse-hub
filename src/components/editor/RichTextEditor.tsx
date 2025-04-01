import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, Bold, Italic, List, ListOrdered, Link as LinkIcon,
  Heading1, Heading2, Heading3, Image, Code, Quote, Undo, Redo
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

interface RichTextEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
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
  const cursorPositionRef = useRef<Range | null>(null);
  const isContentUpdating = useRef<boolean>(false);
  const initialContentRef = useRef<string>(initialContent);
  const lastSavedContentRef = useRef<string>(initialContent);
  
  // Save cursor position before any command execution
  const saveCursorPosition = useCallback(() => {
    if (document.getSelection) {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        cursorPositionRef.current = selection.getRangeAt(0).cloneRange();
      }
    }
  }, []);

  // Restore cursor position after command execution
  const restoreCursorPosition = useCallback(() => {
    if (cursorPositionRef.current && document.getSelection) {
      const selection = document.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(cursorPositionRef.current);
      }
    }
  }, []);
  
  // Only initialize the editor once or when initialContent changes significantly
  useEffect(() => {
    if (initialContent !== initialContentRef.current && editorRef.current) {
      // Only update if content has actually changed from server
      if (initialContent !== lastSavedContentRef.current) {
        initialContentRef.current = initialContent;
        lastSavedContentRef.current = initialContent;
        
        // Flag that we're updating to prevent loops
        isContentUpdating.current = true;
        
        // Save cursor position before updating
        saveCursorPosition();
        
        // Update editor content
        editorRef.current.innerHTML = initialContent;
        setContent(initialContent);
        setHistoryStack([initialContent]);
        setHistoryIndex(0);
        
        // Apply appropriate styling to HTML elements
        applyStylesToContent(editorRef.current);
        
        // Restore cursor and clear flag after a short delay
        setTimeout(() => {
          restoreCursorPosition();
          isContentUpdating.current = false;
        }, 10);
      }
    }
  }, [initialContent, saveCursorPosition, restoreCursorPosition]);
  
  // Function to apply styles to HTML elements in the editor
  const applyStylesToContent = (container: HTMLElement) => {
    // Apply styles to headings
    container.querySelectorAll('h1').forEach(el => {
      el.classList.add('text-3xl', 'font-bold', 'mt-6', 'mb-4');
    });
    container.querySelectorAll('h2').forEach(el => {
      el.classList.add('text-2xl', 'font-bold', 'mt-5', 'mb-3');
    });
    container.querySelectorAll('h3').forEach(el => {
      el.classList.add('text-xl', 'font-bold', 'mt-4', 'mb-2');
    });
    
    // Apply styles to lists
    container.querySelectorAll('ul').forEach(el => {
      el.classList.add('list-disc', 'ml-6', 'mb-4');
    });
    container.querySelectorAll('ol').forEach(el => {
      el.classList.add('list-decimal', 'ml-6', 'mb-4');
    });
    
    // Apply styles to blockquotes
    container.querySelectorAll('blockquote').forEach(el => {
      el.classList.add('border-l-4', 'border-muted', 'pl-4', 'italic', 'my-4');
    });
    
    // Apply styles to code blocks
    container.querySelectorAll('pre').forEach(el => {
      el.classList.add('bg-muted', 'p-4', 'rounded', 'my-4', 'overflow-auto');
    });
  };
  
  // Ensure editor is focused to allow typing
  useEffect(() => {
    // Small delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      if (editorRef.current && !editorRef.current.contains(document.activeElement)) {
        editorRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Format buttons handler with improved cursor position management
  const handleFormat = useCallback((command: string, value?: string) => {
    // Prevent processing multiple commands at once to avoid race conditions
    if (isProcessingCommand) return;
    
    setIsProcessingCommand(true);
    
    try {
      // Ensure editor has focus before executing command
      if (editorRef.current) {
        editorRef.current.focus();
        
        // Save current cursor position
        saveCursorPosition();
        
        // Special handling for code block
        if (command === 'formatBlock' && value === '<pre>') {
          document.execCommand('formatBlock', false, value);
          
          // After creating pre tag, we need to add code tag inside for proper code formatting
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preElement = range.startContainer.parentElement?.closest('pre');
            
            if (preElement) {
              // Create a code element
              const codeElement = document.createElement('code');
              
              // Move pre content to code element
              while (preElement.firstChild) {
                codeElement.appendChild(preElement.firstChild);
              }
              
              // Add code element to pre
              preElement.appendChild(codeElement);
              
              // Add styling classes
              preElement.classList.add('bg-muted', 'p-4', 'rounded', 'my-4', 'overflow-auto', 'font-mono', 'text-sm');
            }
          }
        } else if (command === 'formatBlock' && (value === '<h1>' || value === '<h2>' || value === '<h3>')) {
          // Special handling for headings to ensure they're visible
          document.execCommand(command, false, value);
          
          // Apply appropriate styling based on heading level
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const headingElement = range.startContainer.parentElement?.closest(value.replace(/[<>]/g, ''));
            
            if (headingElement) {
              if (value === '<h1>') {
                headingElement.classList.add('text-3xl', 'font-bold', 'mt-6', 'mb-4');
              } else if (value === '<h2>') {
                headingElement.classList.add('text-2xl', 'font-bold', 'mt-5', 'mb-3');
              } else if (value === '<h3>') {
                headingElement.classList.add('text-xl', 'font-bold', 'mt-4', 'mb-2');
              }
            }
          }
        } else if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
          // Special handling for lists
          document.execCommand(command, false, value);
          
          // Apply styling to created list
          setTimeout(() => {
            if (editorRef.current) {
              const lists = command === 'insertUnorderedList' 
                ? editorRef.current.querySelectorAll('ul') 
                : editorRef.current.querySelectorAll('ol');
              
              lists.forEach(list => {
                if (command === 'insertUnorderedList') {
                  list.classList.add('list-disc', 'ml-6', 'mb-4');
                } else {
                  list.classList.add('list-decimal', 'ml-6', 'mb-4');
                }
              });
            }
          }, 10);
        } else {
          // Execute standard command
          document.execCommand(command, false, value);
        }
        
        // Restore cursor position and apply styles
        setTimeout(() => {
          restoreCursorPosition();
          
          // Apply styles to newly created elements
          if (editorRef.current) {
            applyStylesToContent(editorRef.current);
            
            // Get updated content
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            
            // Only add to history if content actually changed
            if (newContent !== historyStack[historyIndex]) {
              addToHistory(newContent);
            }
          }
          
          setIsProcessingCommand(false);
        }, 10);
      } else {
        setIsProcessingCommand(false);
      }
    } catch (err) {
      console.error("Error executing command:", err);
      setIsProcessingCommand(false);
      
      toast({
        title: "Error applying formatting",
        description: "There was an issue with the text formatting. Please try again.",
        variant: "destructive"
      });
    }
  }, [isProcessingCommand, historyStack, historyIndex, addToHistory, saveCursorPosition, restoreCursorPosition]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      if (editorRef.current) {
        // Save cursor position before updating
        saveCursorPosition();
        
        editorRef.current.innerHTML = historyStack[newIndex];
        setContent(historyStack[newIndex]);
        
        // Restore cursor position after a short delay
        setTimeout(() => {
          restoreCursorPosition();
        }, 10);
      }
    }
  }, [historyIndex, historyStack, saveCursorPosition, restoreCursorPosition]);
  
  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      if (editorRef.current) {
        // Save cursor position before updating
        saveCursorPosition();
        
        editorRef.current.innerHTML = historyStack[newIndex];
        setContent(historyStack[newIndex]);
        
        // Restore cursor position after a short delay
        setTimeout(() => {
          restoreCursorPosition();
        }, 10);
      }
    }
  }, [historyIndex, historyStack, saveCursorPosition, restoreCursorPosition]);

  const handleImageUpload = useCallback(() => {
    // Save current cursor position before opening dialog
    saveCursorPosition();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // For now, simulate image insertion with a placeholder
        const reader = new FileReader();
        reader.onload = () => {
          // Ensure focus before executing command
          editorRef.current?.focus();
          
          // Restore cursor position
          restoreCursorPosition();
          
          setTimeout(() => {
            document.execCommand('insertHTML', false, `<img src="${reader.result}" alt="Uploaded image" style="max-width: 100%;" />`);
            
            if (editorRef.current) {
              const newContent = editorRef.current.innerHTML;
              setContent(newContent);
              addToHistory(newContent);
            }
          }, 10);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [addToHistory, saveCursorPosition, restoreCursorPosition]);
  
  const handleLinkInsert = useCallback(() => {
    // Save current cursor position before prompting
    saveCursorPosition();
    
    const url = prompt("Enter URL:", "https://");
    if (url) {
      // Ensure focus before executing command
      editorRef.current?.focus();
      
      // Restore cursor position
      restoreCursorPosition();
      
      setTimeout(() => {
        document.execCommand('createLink', false, url);
        
        // Get updated content after link insert
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          addToHistory(newContent);
        }
      }, 10);
    }
  }, [addToHistory, saveCursorPosition, restoreCursorPosition]);
  
  // Handle content changes with improved styling
  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isContentUpdating.current) return;
    
    const newContent = editorRef.current.innerHTML;
    
    // Only update if content actually changed
    if (newContent === content) return;
    
    // Apply styles to content when it changes
    applyStylesToContent(editorRef.current);
    
    setContent(newContent);
    
    // Debounced history addition (only add to history if there's a 500ms pause)
    const timer = setTimeout(() => {
      if (newContent !== historyStack[historyIndex]) {
        addToHistory(newContent);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, historyStack, historyIndex, addToHistory]);
  
  // Auto-save functionality - separate from content changes to prevent cursor jumps
  useEffect(() => {
    // Don't trigger save if content hasn't changed from initial/last saved or if we're currently updating
    if (content === lastSavedContentRef.current || isContentUpdating.current) return;
    
    const saveTimer = setTimeout(() => {
      setIsSaving(true);
      
      // Update last saved content reference
      lastSavedContentRef.current = content;
      
      // Notify parent component of content change
      if (onContentChange) {
        onContentChange(content);
      }
      
      // Update save status
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [content, onContentChange]);
  
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
  
  // Add styling when editor mounts
  useEffect(() => {
    if (editorRef.current) {
      applyStylesToContent(editorRef.current);
    }
  }, []);
  
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
          className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[300px] prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-blockquote:border-l-2 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          spellCheck="false"
          data-gramm="false"
          style={{ 
            whiteSpace: 'pre-wrap',
            // Enhance visibility of HTML elements
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-bullets': 'var(--foreground)',
          }}
          onClick={saveCursorPosition}
          onKeyUp={saveCursorPosition}
          onBlur={() => {
            // Wait a little before saving since we might be refocusing elsewhere
            setTimeout(saveCursorPosition, 50);
          }}
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

export default RichTextEditor;
