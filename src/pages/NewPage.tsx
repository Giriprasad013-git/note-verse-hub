
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { 
  PenSquare, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  Layers, 
  Layout, 
  BrainCircuit
} from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

// Define the page types with strict typing
const pageTypes = [
  {
    id: 'richtext' as const,
    name: 'Rich Text',
    description: 'A document with formatted text, images, and more',
    icon: PenSquare
  },
  {
    id: 'drawio' as const,
    name: 'Draw.io',
    description: 'Create diagrams, flowcharts, and mind maps',
    icon: BrainCircuit
  },
  {
    id: 'flatpage' as const,
    name: 'Flat Page',
    description: 'A simple flat document with minimal formatting',
    icon: FileText
  },
  {
    id: 'flatpagev2' as const,
    name: 'Enhanced Flat Page',
    description: 'Enhanced page with markdown formatting and styling options',
    icon: Layout
  },
  {
    id: 'pagegroup' as const,
    name: 'Page Group',
    description: 'Group multiple pages together',
    icon: Layers
  },
  {
    id: 'spreadsheet' as const,
    name: 'Spreadsheet',
    description: 'Create tables with calculations',
    icon: FileSpreadsheet
  },
  {
    id: 'table' as const,
    name: 'Table',
    description: 'Simple table for structured data',
    icon: Table
  }
];

// Union type based on the pageTypes array
type PageType = typeof pageTypes[number]['id'];

const NewPage = () => {
  const { notebookId, sectionId } = useParams<{ notebookId: string; sectionId: string }>();
  const navigate = useNavigate();
  const { createPage, getNotebookById, getSectionById } = useNotebooks();
  
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<PageType>('richtext');
  const [isCreating, setIsCreating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const notebook = notebookId ? getNotebookById(notebookId) : null;
  const section = notebookId && sectionId ? getSectionById(notebookId, sectionId) : null;
  
  const handleCreatePage = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your page",
        variant: "destructive"
      });
      return;
    }
    
    if (!notebookId || !sectionId) {
      toast({
        title: "Error",
        description: "Notebook or section not found",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newPage = await createPage(notebookId, sectionId, title.trim(), selectedType);
      toast({
        title: "Page created",
        description: `${title} has been created successfully`
      });
      
      navigate(`/page/${newPage.id}`);
    } catch (error) {
      console.error("Error creating page:", error);
      
      toast({
        title: "Error creating page",
        description: "There was a problem connecting to the database. Using local storage as fallback.",
        variant: "destructive"
      });
      
      // Automatically retry with local storage
      if (retryCount < 1) {
        setRetryCount(prev => prev + 1);
        // The useNotebooks hook already has fallback to mock data
        handleCreatePage();
      } else {
        toast({
          title: "Still having issues",
          description: "Please check your internet connection and try again later.",
          variant: "destructive"
        });
        setIsCreating(false);
      }
    }
  };
  
  if (!notebook || !section) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header showBackButton title="New Page" />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Notebook or section not found</h2>
              <p className="text-muted-foreground mb-4">
                The notebook or section you're trying to add a page to doesn't exist.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header showBackButton title="Create New Page" />
        
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{notebook?.title}</span>
                <span>/</span>
                <span>{section?.title}</span>
                <span>/</span>
                <span>New Page</span>
              </div>
              <h1 className="text-2xl font-bold mt-2">Create New Page</h1>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Page Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
                className="w-full max-w-md"
                autoFocus
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Page Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pageTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedType === type.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/30'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-md ${
                        selectedType === type.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{type.name}</h3>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleCreatePage} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Page'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/notebook/${notebookId}/section/${sectionId}`)}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewPage;
