
import React, { useState } from 'react';
import { BrainCircuit, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface DrawIOEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

const DrawIOEditor: React.FC<DrawIOEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  const [content, setContent] = useState(initialContent);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState('select');
  
  const handleSave = () => {
    if (onContentChange) {
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your diagram has been saved successfully"
      });
    }
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };
  
  return (
    <div className={cn("flex flex-col h-full bg-muted/20", className)}>
      <div className="border-b p-2 flex items-center justify-between bg-background">
        <Tabs value={tool} onValueChange={setTool} className="w-auto">
          <TabsList>
            <TabsTrigger value="select">Select</TabsTrigger>
            <TabsTrigger value="shape">Shapes</TabsTrigger>
            <TabsTrigger value="connector">Connectors</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded p-1">
            <Button size="icon" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut size={16} />
            </Button>
            <span className="text-xs w-12 text-center">{zoom}%</span>
            <Button size="icon" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn size={16} />
            </Button>
          </div>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="text-center max-w-md">
          <BrainCircuit className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">Draw.io Integration</h2>
          <p className="text-muted-foreground mb-4">
            This page type allows you to create diagrams and flowcharts.
          </p>
          <p className="text-sm text-muted-foreground">
            The full implementation is coming soon. Currently showing a preview interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DrawIOEditor;
