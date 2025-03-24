
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  FolderOpen, 
  Plus, 
  Search, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../common/Button';
import { useNotebooks } from '@/hooks/useNotebooks';

const Sidebar = () => {
  const location = useLocation();
  const { notebooks, isLoading } = useNotebooks();
  const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

  return (
    <aside className="h-screen w-64 flex-shrink-0 border-r border-border bg-sidebar overflow-hidden flex flex-col animate-in">
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
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between p-2">
            <h3 className="text-xs font-medium text-muted-foreground">NOTEBOOKS</h3>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {notebooks.map((notebook) => (
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
                                  <span>{page.title}</span>
                                </Link>
                              ))}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div>
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">user@example.com</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
