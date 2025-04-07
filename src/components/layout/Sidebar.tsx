
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  FolderOpen, 
  Plus, 
  Search, 
  Settings,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../common/Button';
import { useNotebooks } from '@/hooks/useNotebooks';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Input from '../common/Input';
import UserSettings from './UserSettings';

const Sidebar = () => {
  const location = useLocation();
  const params = useParams<{ notebookId?: string; sectionId?: string; pageId?: string }>();
  const { notebooks, isLoading, getPageById, createNotebook } = useNotebooks();
  
  // Initialize with localStorage values if available
  const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('expandedNotebooks');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error parsing expandedNotebooks from localStorage:', error);
      return {};
    }
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('expandedSections');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error parsing expandedSections from localStorage:', error);
      return {};
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNotebookDialogOpen, setIsNewNotebookDialogOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookDescription, setNewNotebookDescription] = useState('');

  // Persist expanded states to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('expandedNotebooks', JSON.stringify(expandedNotebooks));
    } catch (error) {
      console.error('Error saving expandedNotebooks to localStorage:', error);
    }
  }, [expandedNotebooks]);

  useEffect(() => {
    try {
      localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
    } catch (error) {
      console.error('Error saving expandedSections to localStorage:', error);
    }
  }, [expandedSections]);

  // Expand notebooks and sections based on current route
  useEffect(() => {
    if (params.notebookId) {
      setExpandedNotebooks(prev => ({
        ...prev,
        [params.notebookId as string]: true
      }));
    }
    
    if (params.sectionId) {
      setExpandedSections(prev => ({
        ...prev,
        [params.sectionId as string]: true
      }));
    }
    
    if (params.pageId) {
      const pageData = getPageById(params.pageId);
      if (pageData) {
        setExpandedNotebooks(prev => ({
          ...prev,
          [pageData.notebook.id]: true
        }));
        setExpandedSections(prev => ({
          ...prev,
          [pageData.section.id]: true
        }));
      }
    }
  }, [params.notebookId, params.sectionId, params.pageId, getPageById]);

  const toggleNotebook = (id: string) => {
    setExpandedNotebooks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleNewNotebook = () => {
    setIsNewNotebookDialogOpen(true);
  };
  
  const closeNewNotebookDialog = () => {
    setIsNewNotebookDialogOpen(false);
    setNewNotebookTitle('');
    setNewNotebookDescription('');
  };
  
  const handleCreateNotebook = () => {
    if (!newNotebookTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your notebook",
        variant: "destructive"
      });
      return;
    }
    
    createNotebook(newNotebookTitle.trim(), newNotebookDescription.trim());
    toast({
      title: "Notebook created",
      description: `${newNotebookTitle} has been created successfully`
    });
    
    closeNewNotebookDialog();
  };

  const filteredNotebooks = searchQuery
    ? notebooks.filter(notebook => 
        notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notebook.sections.some(section => 
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.pages.some(page => 
            page.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : notebooks;

  // Default to showing sidebar unless explicitly set to false
  // Added logging to track the sidebar state
  console.log('Rendering Sidebar component, notebooks:', notebooks.length);

  return (
    <aside className="h-screen w-64 flex-shrink-0 border-r border-border bg-background overflow-hidden flex flex-col animate-in">
      <div className="p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 font-medium">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            N
          </div>
          <span>NoteVerse</span>
        </Link>
      </div>
      
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          <Link to="/dashboard" className={cn(
            "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md w-full transition-colors",
            location.pathname === "/dashboard"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/30"
          )}>
            <Star className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between p-2">
            <h3 className="text-xs font-medium text-muted-foreground">NOTEBOOKS</h3>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleNewNotebook}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotebooks.map((notebook) => (
                <div key={notebook.id} className="sidebar-enter" style={{ animationDelay: `${notebooks.indexOf(notebook) * 50}ms` }}>
                  <button
                    onClick={() => toggleNotebook(notebook.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
                      expandedNotebooks[notebook.id] ? "bg-accent/50" : "hover:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {expandedNotebooks[notebook.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span>{notebook.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{notebook.sections.length}</span>
                  </button>
                  
                  {expandedNotebooks[notebook.id] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {notebook.sections.map((section) => (
                        <div key={section.id}>
                          <button
                            onClick={() => toggleSection(section.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors",
                              expandedSections[section.id] ? "bg-accent/50" : "hover:bg-accent/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {expandedSections[section.id] ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                              <span>{section.title}</span>
                            </div>
                          </button>
                          
                          {expandedSections[section.id] && (
                            <div className="ml-4 mt-1 space-y-1">
                              {section.pages.map((page) => (
                                <Link
                                  key={page.id}
                                  to={`/page/${page.id}`}
                                  className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                                    location.pathname === `/page/${page.id}`
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-accent/30"
                                  )}
                                >
                                  <File className="h-3.5 w-3.5" />
                                  <span className="truncate">{page.title}</span>
                                </Link>
                              ))}
                              
                              <Link
                                to={`/new-page/${notebook.id}/${section.id}`}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:bg-accent/30"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="truncate">Add new page</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-border p-4">
        <UserSettings />
      </div>
      
      <Dialog open={isNewNotebookDialogOpen} onOpenChange={setIsNewNotebookDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter notebook title"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                placeholder="Enter notebook description"
                value={newNotebookDescription}
                onChange={(e) => setNewNotebookDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeNewNotebookDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotebook}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default Sidebar;
