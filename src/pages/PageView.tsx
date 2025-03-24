
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit2, Calendar, Tag as TagIcon, ArrowLeft, Copy, Trash2, Download, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import Editor from '@/components/editor/Editor';
import Input from '@/components/common/Input';
import { useNotebooks } from '@/hooks/useNotebooks';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

const PageView = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { getPageById, updatePageContent, updatePageTitle, updatePageTags, deletePage, isLoading } = useNotebooks();
  
  const pageData = pageId ? getPageById(pageId) : null;
  const [content, setContent] = useState(pageData?.page.content || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(pageData?.page.title || '');
  const [tags, setTags] = useState<string[]>(pageData?.page.tags || []);
  const [newTag, setNewTag] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (pageData) {
      setContent(pageData.page.content);
      setTitle(pageData.page.title);
      setTags(pageData.page.tags || []);
    }
  }, [pageData]);
  
  // Handle sidebar visibility based on screen size
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);
  
  // Handle title focus when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);
  
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (pageId) {
      setAutoSaveStatus('saving');
      updatePageContent(pageId, newContent)
        .then(() => {
          setAutoSaveStatus('saved');
        })
        .catch(() => {
          setAutoSaveStatus('error');
          toast({
            title: "Error saving content",
            description: "There was an issue saving your changes. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleTitleChange = () => {
    if (!title.trim()) {
      setTitle(pageData?.page.title || '');
      setIsEditingTitle(false);
      return;
    }
    
    setIsEditingTitle(false);
    
    if (pageId && title !== pageData?.page.title) {
      updatePageTitle(pageId, title.trim())
        .then(() => {
          toast({
            title: "Title updated",
            description: "The page title has been updated successfully"
          });
        })
        .catch(() => {
          setTitle(pageData?.page.title || '');
          toast({
            title: "Error updating title",
            description: "There was an issue updating the title. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleTagAdd = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');
    
    if (pageId) {
      updatePageTags(pageId, updatedTags)
        .then(() => {
          toast({
            title: "Tag added",
            description: `Tag "${newTag.trim()}" has been added successfully`
          });
        })
        .catch(() => {
          setTags(pageData?.page.tags || []);
          toast({
            title: "Error adding tag",
            description: "There was an issue adding the tag. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleTagRemove = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    
    if (pageId) {
      updatePageTags(pageId, updatedTags)
        .then(() => {
          toast({
            title: "Tag removed",
            description: `Tag "${tagToRemove}" has been removed`
          });
        })
        .catch(() => {
          setTags(pageData?.page.tags || []);
          toast({
            title: "Error removing tag",
            description: "There was an issue removing the tag. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleChange();
    } else if (e.key === 'Escape') {
      setTitle(pageData?.page.title || '');
      setIsEditingTitle(false);
    }
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  const handleCopyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Page link copied to clipboard"
    });
  };
  
  const handleExportAsHTML = () => {
    if (!pageData) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${pageData.page.title}</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1, h2, h3 { margin-top: 1.5rem; margin-bottom: 1rem; }
          p { margin-bottom: 1rem; }
          ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
          blockquote { border-left: 3px solid #ddd; padding-left: 1rem; margin-left: 0; color: #555; }
          pre { background: #f7f7f7; padding: 1rem; overflow: auto; border-radius: 3px; }
          code { background: #f7f7f7; padding: 0.2rem 0.4rem; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>${pageData.page.title}</h1>
        ${pageData.page.content}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageData.page.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Page exported",
      description: "Your page has been exported as HTML"
    });
  };
  
  const handleDeletePage = () => {
    if (!pageId || !pageData) return;
    
    const { notebook, section } = pageData;
    
    deletePage(pageId)
      .then(() => {
        toast({
          title: "Page deleted",
          description: "The page has been deleted successfully"
        });
        navigate(`/notebook/${notebook.id}/section/${section.id}`);
      })
      .catch(() => {
        toast({
          title: "Error deleting page",
          description: "There was an issue deleting the page. Please try again.",
          variant: "destructive"
        });
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
      {showSidebar && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header showBackButton toggleSidebar={() => setShowSidebar(prev => !prev)} />
        
        <div className="flex-1 overflow-auto animate-fade-in">
          <div className="mb-4 px-4 md:px-8 pt-6">
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
            
            <div className="mt-2 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-start gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <Input
                      ref={titleInputRef}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xl font-bold"
                      autoFocus
                      onBlur={handleTitleChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {autoSaveStatus === 'saving' ? (
                    <span>Saving...</span>
                  ) : autoSaveStatus === 'error' ? (
                    <span className="text-destructive">Save error</span>
                  ) : (
                    <span>Saved</span>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleCopyPageLink}
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleExportAsHTML}
                  title="Export as HTML"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete page"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Delete this page?</h4>
                      <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDeletePage}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Last edited {page.lastEdited}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-xs bg-accent/30 hover:bg-accent"
                      >
                        {tag}
                        <button
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleTagRemove(tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6"
                    >
                      <span className="text-xs">+</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="h-8 text-sm"
                        onKeyDown={handleTagKeyDown}
                      />
                      <Button 
                        size="sm"
                        onClick={handleTagAdd}
                      >
                        Add
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <Editor 
            initialContent={page.content} 
            pageId={page.id} 
            onContentChange={handleContentChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default PageView;
