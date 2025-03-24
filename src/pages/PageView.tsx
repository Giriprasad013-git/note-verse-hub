
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import Editor from '@/components/editor/Editor';
import { useNotebooks } from '@/hooks/useNotebooks';

const PageView = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { getPageById, isLoading } = useNotebooks();
  
  const pageData = pageId ? getPageById(pageId) : null;
  const [content, setContent] = useState(pageData?.page.content || '');
  
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
  
  if (!pageData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header showBackButton />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium mb-2">Page not found</h2>
              <p className="text-muted-foreground mb-4">
                The page you're looking for doesn't exist or has been deleted.
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
  
  const { page, section, notebook } = pageData;
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={page.title} showBackButton />
        
        <div className="flex-1 overflow-auto animate-fade-in">
          <div className="mb-4 px-8 pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to={`/notebook/${notebook.id}`} className="hover:underline">
                {notebook.title}
              </Link>
              <span>/</span>
              <Link 
                to={`/notebook/${notebook.id}/section/${section.id}`} 
                className="hover:underline"
              >
                {section.title}
              </Link>
            </div>
          </div>
          
          <Editor 
            initialContent={page.content} 
            pageId={page.id} 
            onContentChange={setContent} 
          />
        </div>
      </div>
    </div>
  );
};

export default PageView;
