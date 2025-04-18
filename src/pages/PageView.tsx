import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  Calendar, 
  Tag as TagIcon, 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Download, 
  Share2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Editor } from '@/components/editor/EditorTypes';
import { useNotebooks } from '@/hooks/useNotebooks';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPageTypeIcon, getPageTypeName } from '@/components/editor/EditorTypes';

// Constants
const SIDEBAR_VISIBILITY_KEY = 'noteverse:sidebarVisibility';

const PageView = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { getPageById, updatePageContent, updatePageTitle, updatePageTags, deletePage, isLoading, autoSaveStatus } = useNotebooks();
  
  const pageData = pageId ? getPageById(pageId) : null;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const contentUpdatesByEditor = useRef(false);
  
  // Get stored sidebar state with better error handling
  const getSavedSidebarState = () => {
    try {
      const savedValue = localStorage.getItem(SIDEBAR_VISIBILITY_KEY);
      if (savedValue !== null) {
        return JSON.parse(savedValue);
      }
      return !isMobile; // Default based on device
    } catch (error) {
      console.error('Error parsing sidebarVisibility from localStorage:', error);
      return !isMobile; // Fallback to device-based default
    }
  };
  
  const [showSidebar, setShowSidebar] = useState(getSavedSidebarState);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Setup page data
  useEffect(() => {
    if (pageData) {
      console.log('PageView: Updating page data from backend');
      setTitle(pageData.page.title);
      setTags(pageData.page.tags || []);
    }
  }, [pageData]);
  
  // Default sidebar visibility based on device, only on first load
  useEffect(() => {
    const savedValue = localStorage.getItem(SIDEBAR_VISIBILITY_KEY);
    if (savedValue === null) {
      setShowSidebar(!isMobile);
    }
  }, [isMobile]);
  
  // Persist sidebar visibility state
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_VISIBILITY_KEY, JSON.stringify(showSidebar));
      console.log('Saving sidebar state to localStorage:', showSidebar);
    } catch (error) {
      console.error('Error saving showSidebar to localStorage:', error);
    }
  }, [showSidebar]);
  
  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);
  
  // Content change handler with editing flag
  const handleContentChange = (newContent: string) => {    
    if (pageId) {
      console.log('Content change detected, updating backend');
      contentUpdatesByEditor.current = true;
      
      updatePageContent(pageId, newContent)
        .catch(() => {
          toast({
            title: "Error saving content",
            description: "There was an issue saving your changes. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  // Handle title changes
  const handleTitleChange = useCallback(() => {
    if (!pageId || !pageData) {
      setIsEditingTitle(false);
      return;
    }
    
    if (!title.trim()) {
      setTitle(pageData.page.title);
      setIsEditingTitle(false);
      return;
    }
    
    if (title === pageData.page.title) {
      setIsEditingTitle(false);
      return;
    }
    
    updatePageTitle(pageId, title.trim())
      .then(() => {
        toast({
          title: "Title updated",
          description: "The page title has been updated successfully"
        });
      })
      .catch(() => {
        setTitle(pageData.page.title || '');
        toast({
          title: "Error updating title",
          description: "There was an issue updating the title. Please try again.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsEditingTitle(false);
      });
  }, [pageId, title, pageData, updatePageTitle]);
  
  const handleTagAdd = function() {
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
  
  const handleTagRemove = function(tagToRemove: string) {
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
  
  const handleKeyDown = function(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleTitleChange();
    } else if (e.key === 'Escape') {
      setTitle(pageData?.page.title || '');
      setIsEditingTitle(false);
    }
  };
  
  const handleTagKeyDown = function(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };
  
  const handleCopyPageLink = function() {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Page link copied to clipboard"
    });
  };
  
  const handleExportAsHTML = function() {
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
          code { background: #f7f7f7; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; }
          img { max-width: 100%; height: auto; }
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
  
  const handleDeletePage = function() {
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
  
  console.log('PageView rendering, showSidebar:', showSidebar, 'pageId:', pageId);
  
  if (isLoading) {
    return (
      <div className="flex h-screen">
        {showSidebar && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <Header showBackButton toggleSidebar={() => setShowSidebar(prev => !prev)} />
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
        {showSidebar && <Sidebar />}
        <div className="flex-1 flex flex-col">
          <Header showBackButton toggleSidebar={() => setShowSidebar(prev => !prev)} />
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
        <Header 
          showBackButton 
          toggleSidebar={() => setShowSidebar(prev => !prev)} />
        
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
              <div className="flex items-center gap-1 mr-3">
                <div className="flex items-center justify-center h-5 w-5 rounded-md bg-accent/50">
                  {getPageTypeIcon(page.type)}
                </div>
                <span className="text-xs font-medium">{getPageTypeName(page.type)}</span>
              </div>
              
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
            pageType={page.type}
            onContentChange={handleContentChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default PageView;
