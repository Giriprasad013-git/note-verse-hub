
import React, { useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BrainCircuit, Save } from 'lucide-react';
import Button from '@/components/common/Button';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Function to handle messages from the Draw.io iframe
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      try {
        const message = JSON.parse(event.data);
        
        // Handle initialization message
        if (message.event === 'init') {
          setIsLoaded(true);
          
          // Load the initial content
          if (initialContent && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                action: 'load',
                xml: initialContent,
                autosave: 1
              }), 
              '*'
            );
          }
        }
        
        // Handle autosave message
        if (message.event === 'autosave' && message.xml) {
          if (onContentChange) {
            onContentChange(message.xml);
          }
          setIsSaving(false);
        }
        
        // Handle save message
        if (message.event === 'save' && message.xml) {
          if (onContentChange) {
            onContentChange(message.xml);
            toast({
              title: "Diagram saved",
              description: "Your diagram has been saved successfully"
            });
          }
          setIsSaving(false);
        }
        
        // Handle exit message
        if (message.event === 'exit') {
          // We can handle exiting here if needed
        }
      } catch (error) {
        console.error('Error processing message from Draw.io:', error);
      }
    }
  };
  
  // Add message event listener on mount
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Function to manually trigger save
  const handleSave = () => {
    if (iframeRef.current?.contentWindow) {
      setIsSaving(true);
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ action: 'save' }), 
        '*'
      );
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <div className="border-b p-2 flex items-center justify-between gap-2 bg-background">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-medium">Draw.io Diagram Editor</h2>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={!isLoaded || isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      
      <div className="flex-1 relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        <iframe 
          ref={iframeRef}
          src="https://embed.diagrams.net/?embed=1&proto=json&spin=1&libraries=1&saveAndExit=0&noSaveBtn=1&noExitBtn=1"
          className="w-full h-full border-0"
          title="Draw.io Editor"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default DrawIOEditor;
