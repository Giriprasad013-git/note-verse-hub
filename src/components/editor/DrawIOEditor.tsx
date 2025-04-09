
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
  const [editorContent, setEditorContent] = useState(initialContent);
  const initialLoadRef = useRef(false);
  const isEditingRef = useRef(false);
  
  // Function to handle messages from the Draw.io iframe
  const handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      try {
        const message = JSON.parse(event.data);
        
        // Handle initialization message
        if (message.event === 'init') {
          console.log('Draw.io editor initialized');
          setIsLoaded(true);
          initialLoadRef.current = true;
          
          // Load the content (either from state or initial prop)
          const contentToLoad = editorContent || initialContent;
          if (contentToLoad && iframeRef.current?.contentWindow) {
            console.log('Loading content into Draw.io editor');
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({
                action: 'load',
                xml: contentToLoad,
                autosave: 1
              }), 
              '*'
            );
          }
        }
        
        // Handle autosave message
        if (message.event === 'autosave' && message.xml) {
          console.log('Auto-saving Draw.io content');
          setEditorContent(message.xml);
          isEditingRef.current = true;
          if (onContentChange) {
            onContentChange(message.xml);
          }
          setIsSaving(false);
        }
        
        // Handle save message
        if (message.event === 'save' && message.xml) {
          console.log('Manually saving Draw.io content');
          setEditorContent(message.xml);
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
          console.log('Draw.io editor exit event received');
          isEditingRef.current = false;
        }
      } catch (error) {
        console.error('Error processing message from Draw.io:', error);
      }
    }
  };
  
  // Add message event listener on mount
  useEffect(() => {
    console.log('Setting up Draw.io message listener');
    window.addEventListener('message', handleMessage);
    
    return () => {
      console.log('Cleaning up Draw.io message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Update editorContent when initialContent changes and we're not in edit mode
  useEffect(() => {
    // Only update if we're not currently editing and the content actually changed
    if (initialContent && initialContent !== editorContent && !isEditingRef.current) {
      console.log('Initial content changed, updating editor content');
      setEditorContent(initialContent);
      
      // If editor is already loaded, reload the content
      if (isLoaded && iframeRef.current?.contentWindow) {
        console.log('Reloading content into Draw.io editor');
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
  }, [initialContent, isLoaded]);
  
  // Function to manually trigger save
  const handleSave = () => {
    if (iframeRef.current?.contentWindow) {
      console.log('Triggering manual save in Draw.io');
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
