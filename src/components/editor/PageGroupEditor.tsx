import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Pencil, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface PageGroupEditorProps {
  initialContent?: string;
  pageId: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface PageLink {
  id: string;
  title: string;
  url: string;
}

const PageGroupEditor: React.FC<PageGroupEditorProps> = ({
  initialContent = '',
  pageId,
  onContentChange,
  className,
}) => {
  // Parse initial content or set empty array
  const [pageLinks, setPageLinks] = useState<PageLink[]>(() => {
    try {
      return initialContent ? JSON.parse(initialContent) : [];
    } catch (e) {
      console.error('Error parsing initial content in PageGroupEditor:', e);
      return [];
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageLink | null>(null);
  const contentHasChangedRef = useRef(false);
  
  console.log(`PageGroupEditor render for page ${pageId}, isEditing: ${isEditing}`);
  
  // Handle initial content changes (only when not editing)
  useEffect(() => {
    if (initialContent && !isEditing && !contentHasChangedRef.current) {
      try {
        console.log('Initial content updated, parsing content');
        const parsed = initialContent ? JSON.parse(initialContent) : [];
        setPageLinks(parsed);
      } catch (e) {
        console.error('Error parsing updated initialContent in PageGroupEditor:', e);
      }
    }
  }, [initialContent, isEditing]);
  
  const handleSave = () => {
    if (onContentChange) {
      const content = JSON.stringify(pageLinks);
      onContentChange(content);
      toast({
        title: "Changes saved",
        description: "Your page group has been updated"
      });
      setIsEditing(false);
      contentHasChangedRef.current = false;
    }
  };
  
  const handleAddPage = () => {
    setCurrentPage({ id: Date.now().toString(), title: '', url: '' });
    setIsDialogOpen(true);
  };
  
  const handleEditPage = (page: PageLink) => {
    setCurrentPage({ ...page });
    setIsDialogOpen(true);
  };
  
  const handleDeletePage = (id: string) => {
    setPageLinks(prev => prev.filter(page => page.id !== id));
    setIsEditing(true);
    contentHasChangedRef.current = true;
  };
  
  const handleSaveDialog = () => {
    if (!currentPage || !currentPage.title.trim() || !currentPage.url.trim()) {
      toast({
        title: "Invalid input",
        description: "Title and URL are required",
        variant: "destructive"
      });
      return;
    }
    
    setPageLinks(prev => {
      const existing = prev.find(p => p.id === currentPage.id);
      if (existing) {
        return prev.map(p => p.id === currentPage.id ? currentPage : p);
      } else {
        return [...prev, currentPage];
      }
    });
    
    setIsDialogOpen(false);
    setCurrentPage(null);
    setIsEditing(true);
    contentHasChangedRef.current = true;
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Page Group Editor</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddPage}>
            <Plus className="h-4 w-4 mr-2" />
            Add Page
          </Button>
          <Button onClick={handleSave} disabled={!isEditing}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {pageLinks.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No Pages Added Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start adding pages to create a page group.
            </p>
            <Button onClick={handleAddPage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Page
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {pageLinks.map((page) => (
              <div 
                key={page.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/10"
              >
                <div>
                  <h3 className="font-medium">{page.title}</h3>
                  <a 
                    href={page.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {page.url}
                  </a>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleEditPage(page)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDeletePage(page.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPage && currentPage.title ? 'Edit Page' : 'Add New Page'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <Input
                value={currentPage?.title || ''}
                onChange={(e) => setCurrentPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Enter page title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Page URL</label>
              <Input
                value={currentPage?.url || ''}
                onChange={(e) => setCurrentPage(prev => prev ? { ...prev, url: e.target.value } : null)}
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a full URL including http:// or https://
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDialog}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageGroupEditor;
