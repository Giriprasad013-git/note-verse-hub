import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, Copy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface FlatPageEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const FlatPageEditor: React.FC<FlatPageEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentUpdatedFromProps = useRef(false);
  const cursorPositionRef = useRef<{start: number, end: number}>({start: 0, end: 0});
  const isContentUpdating = useRef(false);
  
  console.log(`FlatPageEditor render for page ${pageId}, isEditing: ${isEditing}`);
  
  // Initialize content when initialContent changes (only if we're not in edit mode)
  useEffect(() => {
    if (initialContent && !isEditing) {
      console.log('Initial content updated, setting editor content');
      isContentUpdating.current = true;
      setContent(initialContent);
      updateCounts(initialContent);
      contentUpdatedFromProps.current = true;
      
      setTimeout(() => {
        isContentUpdating.current = false;
      }, 10);
    }
  }, [initialContent, isEditing]);
  
  const updateCounts = (text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
  };
  
  // Save cursor position before any content changes
  const saveCursorPosition = () => {
    if (textareaRef.current) {
      cursorPositionRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      };
    }
  };
  
  // Restore cursor position after content changes
  const restoreCursorPosition = () => {
    if (textareaRef.current && !isContentUpdating.current) {
      const { start, end } = cursorPositionRef.current;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, end);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    saveCursorPosition();
    const newContent = e.target.value;
    setIsEditing(true);
    contentUpdatedFromProps.current = false;
    setContent(newContent);
    updateCounts(newContent);
    
    setTimeout(restoreCursorPosition, 10);
  };
  
  const handleSave = () => {
    saveCursorPosition();
    
    if (onContentChange) {
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your document has been saved successfully"
      });
      // Keep isEditing true to prevent reinitializing from initialContent
    }
    
    setTimeout(restoreCursorPosition, 10);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Content copied",
      description: "Document content copied to clipboard"
    });
  };
  
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${pageId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document downloaded",
      description: "Your document has been downloaded as a text file"
    });
  };
  
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Flat Page Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy to clipboard">
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download as text file">
            <Download className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleSave} disabled={!isEditing} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto" onClick={focusTextarea}>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={() => saveCursorPosition()}
          onMouseUp={() => saveCursorPosition()}
          placeholder="Start typing your content here..."
          className="w-full h-full min-h-[calc(100vh-12rem)] p-4 text-base"
        />
      </div>
      
      <div className="border-t p-2 flex justify-between text-xs text-muted-foreground">
        <div>Characters: {charCount}</div>
        <div>Words: {wordCount}</div>
      </div>
    </div>
  );
};

export default FlatPageEditor;
