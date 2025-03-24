
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { File, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import PageItem from '@/components/notebook/PageItem';
import { useNotebooks } from '@/hooks/useNotebooks';
import { toast } from '@/hooks/use-toast';

const SectionView = () => {
  const { notebookId, sectionId } = useParams<{ notebookId: string; sectionId: string }>();
  const { getSectionById, getNotebookById, isLoading } = useNotebooks();
  
  const notebook = notebookId ? getNotebookById(notebookId) : null;
  const section = notebookId && sectionId ? getSectionById(notebookId, sectionId) : null;
  
  const handleNewPage = () => {
    toast({
      title: "Feature coming soon",
      description: "Creating new pages will be available in the next update"
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header showBackButton />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!notebook || !section) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header showBackButton />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Section not found</h2>
              <p className="text-muted-foreground mb-4">
                The section you're looking for doesn't exist or has been deleted.
              </p>
              <Link to="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
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
        <Header title={section.title} showBackButton />
        
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to={`/notebook/${notebook.id}`} className="hover:underline">
                  {notebook.title}
                </Link>
                <span>/</span>
                <span>{section.title}</span>
              </div>
              <h1 className="text-2xl font-bold mt-2">{section.title}</h1>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Pages</h2>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleNewPage}>
                  <Plus className="h-4 w-4" />
                  New Page
                </Button>
              </div>
              
              {section.pages.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No pages yet.</p>
                  <Button variant="outline" onClick={handleNewPage}>Create Page</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {section.pages.map((page, index) => (
                    <div 
                      key={page.id} 
                      className="animate-fade-in" 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PageItem 
                        page={page} 
                        className="block w-full p-3 rounded-md border border-border hover:bg-accent/40 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SectionView;
