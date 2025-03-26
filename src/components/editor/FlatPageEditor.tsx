
import React, { useState, useEffect } from 'react';
import { FileText, Save } from 'lucide-react';
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
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Flat Page Editor</span>
        </div>
        
        <Button onClick={handleSave} disabled={!isEditing}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <Textarea
          value={content}
          onChange={handleChange}
          placeholder="Start typing your content here..."
          className="w-full h-full min-h-[calc(100vh-12rem)] p-4 text-base"
        />
      </div>
    </div>
  );
};

export default FlatPageEditor;
