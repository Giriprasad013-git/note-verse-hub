
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderOpen, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import SectionItem from '@/components/notebook/SectionItem';
import { useNotebooks } from '@/hooks/useNotebooks';

const NotebookView = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { getNotebookById, isLoading } = useNotebooks();
  
  const notebook = notebookId ? getNotebookById(notebookId) : null;
  
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
  
  if (!notebook) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header showBackButton />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Notebook not found</h2>
              <p className="text-muted-foreground mb-4">
                The notebook you're looking for doesn't exist or has been deleted.
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
        <Header title={notebook.title} showBackButton />
        
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{notebook.title}</h1>
              <p className="text-muted-foreground">{notebook.description}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sections</h2>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Section
                </Button>
              </div>
              
              {notebook.sections.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No sections yet.</p>
                  <Button variant="outline">Create Section</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {notebook.sections.map((section, index) => (
                    <div 
                      key={section.id} 
                      className="animate-fade-in" 
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <SectionItem section={section} notebookId={notebook.id} />
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

export default NotebookView;
