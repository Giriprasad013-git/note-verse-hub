import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, Bold, Italic, List, ListOrdered, Link as LinkIcon,
  Heading1, Heading2, Heading3, Image, Code, Quote, Undo, Redo,
  Type
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface RichTextEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const fontOptions = [
  { name: 'Default', value: 'inherit' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
];

const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

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
  const [currentFont, setCurrentFont] = useState('inherit');
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const editorRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<Range | null>(null);
  const isContentUpdating = useRef<boolean>(false);
  const initialContentRef = useRef<string>(initialContent);
  const lastSavedContentRef = useRef<string>(initialContent);
  
  const saveCursorPosition = useCallback(() => {
    if (document.getSelection) {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        cursorPositionRef.current = selection.getRangeAt(0).cloneRange();
      }
    }
  }, []);

  const restoreCursorPosition = useCallback(() => {
    if (cursorPositionRef.current && document.getSelection) {
      const selection = document.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(cursorPositionRef.current);
      }
    }
  }, []);
  
  useEffect(() => {
    if (!initialContent) return;
    
    if (initialContent !== initialContentRef.current && editorRef.current) {
      if (initialContent !== lastSavedContentRef.current) {
        initialContentRef.current = initialContent;
        lastSavedContentRef.current = initialContent;
        
        isContentUpdating.current = true;
        
        saveCursorPosition();
        
        editorRef.current.innerHTML = initialContent;
        setContent(initialContent);
        setHistoryStack([initialContent]);
        setHistoryIndex(0);
        
        applyStylesToContent(editorRef.current);
        
        setTimeout(() => {
          restoreCursorPosition();
          isContentUpdating.current = false;
        }, 10);
      }
    }
  }, [initialContent, saveCursorPosition, restoreCursorPosition]);
  
  const applyStylesToContent = (container: HTMLElement) => {
    container.querySelectorAll('h1').forEach(el => {
      el.classList.add('text-3xl', 'font-bold', 'mt-6', 'mb-4');
    });
    container.querySelectorAll('h2').forEach(el => {
      el.classList.add('text-2xl', 'font-bold', 'mt-5', 'mb-3');
    });
    container.querySelectorAll('h3').forEach(el => {
      el.classList.add('text-xl', 'font-bold', 'mt-4', 'mb-2');
    });
    
    container.querySelectorAll('ul').forEach(el => {
      el.classList.add('list-disc', 'ml-6', 'mb-4');
    });
    container.querySelectorAll('ol').forEach(el => {
      el.classList.add('list-decimal', 'ml-6', 'mb-4');
    });
    
    container.querySelectorAll('blockquote').forEach(el => {
      el.classList.add('border-l-4', 'border-muted', 'pl-4', 'italic', 'my-4');
    });
    
    container.querySelectorAll('pre').forEach(el => {
      el.classList.add('bg-muted', 'p-4', 'rounded', 'my-4', 'overflow-auto');
    });
  };
  
  useEffect(() => {
    if (editorRef.current) {
      applyStylesToContent(editorRef.current);
    }
  }, []);
  
  const addToHistory = useCallback((newContent: string) => {
    if (historyIndex < historyStack.length - 1) {
      const newStack = historyStack.slice(0, historyIndex + 1);
      newStack.push(newContent);
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    } else {
      setHistoryStack(prev => [...prev, newContent]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyStack, historyIndex]);
  
  const handleFontChange = useCallback((fontFamily: string) => {
    if (isProcessingCommand) return;
    
    setIsProcessingCommand(true);
    setCurrentFont(fontFamily);
    
    if (editorRef.current) {
      editorRef.current.focus();
      saveCursorPosition();
      
      document.execCommand('fontName', false, fontFamily);
      
      setTimeout(() => {
        restoreCursorPosition();
        
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          
          if (newContent !== historyStack[historyIndex]) {
            addToHistory(newContent);
          }
        }
        
        setIsProcessingCommand(false);
      }, 10);
    } else {
      setIsProcessingCommand(false);
    }
  }, [isProcessingCommand, historyStack, historyIndex, addToHistory, saveCursorPosition, restoreCursorPosition]);
  
  const handleFontSizeChange = useCallback((size: number) => {
    if (isProcessingCommand) return;
    
    setIsProcessingCommand(true);
    setCurrentFontSize(size);
    
    if (editorRef.current) {
      editorRef.current.focus();
      saveCursorPosition();
      
      document.execCommand('fontSize', false, '7');
      
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0) {
        const fontElements = document.getElementsByTagName('font');
        for (let i = fontElements.length - 1; i >= 0; i--) {
          const element = fontElements[i];
          if (element.size === '7') {
            element.removeAttribute('size');
            element.style.fontSize = `${size}px`;
          }
        }
      }
      
      setTimeout(() => {
        restoreCursorPosition();
        
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          
          if (newContent !== historyStack[historyIndex]) {
            addToHistory(newContent);
          }
        }
        
        setIsProcessingCommand(false);
      }, 10);
    } else {
      setIsProcessingCommand(false);
    }
  }, [isProcessingCommand, historyStack, historyIndex, addToHistory, saveCursorPosition, restoreCursorPosition]);
  
  const handleFormat = useCallback((command: string, value?: string) => {
    if (isProcessingCommand) return;
    
    setIsProcessingCommand(true);
    
    try {
      if (editorRef.current) {
        editorRef.current.focus();
        
        saveCursorPosition();
        
        if (command === 'formatBlock' && value === '<pre>') {
          document.execCommand('formatBlock', false, value);
          
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preElement = range.startContainer.parentElement?.closest('pre');
            
            if (preElement) {
              const codeElement = document.createElement('code');
              while (preElement.firstChild) {
                codeElement.appendChild(preElement.firstChild);
              }
              preElement.appendChild(codeElement);
              
              preElement.classList.add('bg-muted', 'p-4', 'rounded', 'my-4', 'overflow-auto', 'font-mono', 'text-sm');
            }
          }
        } else if (command === 'formatBlock' && (value === '<h1>' || value === '<h2>' || value === '<h3>')) {
          document.execCommand(command, false, value);
          
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
          document.execCommand(command, false, value);
          
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
          document.execCommand(command, false, value);
        }
        
        setTimeout(() => {
          restoreCursorPosition();
          
          if (editorRef.current) {
            applyStylesToContent(editorRef.current);
            
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            
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
        saveCursorPosition();
        
        editorRef.current.innerHTML = historyStack[newIndex];
        setContent(historyStack[newIndex]);
        
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
        saveCursorPosition();
        
        editorRef.current.innerHTML = historyStack[newIndex];
        setContent(historyStack[newIndex]);
        
        setTimeout(() => {
          restoreCursorPosition();
        }, 10);
      }
    }
  }, [historyIndex, historyStack, saveCursorPosition, restoreCursorPosition]);
  
  const handleImageUpload = useCallback(() => {
    saveCursorPosition();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          editorRef.current?.focus();
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
    saveCursorPosition();
    
    const url = prompt("Enter URL:", "https://");
    if (url) {
      editorRef.current?.focus();
      restoreCursorPosition();
      
      setTimeout(() => {
        document.execCommand('createLink', false, url);
        
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          addToHistory(newContent);
        }
      }, 10);
    }
  }, [addToHistory, saveCursorPosition, restoreCursorPosition]);
  
  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isContentUpdating.current) return;
    
    const newContent = editorRef.current.innerHTML;
    
    if (newContent === content) return;
    
    applyStylesToContent(editorRef.current);
    
    setContent(newContent);
    
    const timer = setTimeout(() => {
      if (newContent !== historyStack[historyIndex]) {
        addToHistory(newContent);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, historyStack, historyIndex, addToHistory]);
  
  useEffect(() => {
    if (content === lastSavedContentRef.current || isContentUpdating.current) return;
    
    const saveTimer = setTimeout(() => {
      setIsSaving(true);
      
      lastSavedContentRef.current = content;
      
      if (onContentChange) {
        onContentChange(content);
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }, 1000);
    
    return () => clearTimeout(saveTimer);
  }, [content, onContentChange]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Type className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Font Family</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {fontOptions.map((font) => (
                        <Button
                          key={font.value}
                          variant={currentFont === font.value ? "default" : "outline"}
                          size="sm"
                          className="justify-start"
                          style={{ fontFamily: font.value }}
                          onClick={() => handleFontChange(font.value)}
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium">Font Size: {currentFontSize}px</h4>
                    </div>
                    <div className="pt-2">
                      <Slider
                        min={10}
                        max={48}
                        step={1}
                        value={[currentFontSize]}
                        onValueChange={(values) => handleFontSizeChange(values[0])}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10px</span>
                      <span>48px</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
            fontFamily: currentFont,
            fontSize: `${currentFontSize}px`
          }}
          onClick={saveCursorPosition}
          onKeyUp={saveCursorPosition}
          onBlur={() => {
            setTimeout(saveCursorPosition, 50);
          }}
        />
      </div>
    </div>
  );
};

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

const EditorToolbarGroup: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="flex items-center">
      {children}
    </div>
  );
};

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
