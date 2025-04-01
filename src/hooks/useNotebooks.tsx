
import { useState, useEffect, useMemo } from 'react';
import { toast } from './use-toast';
import { supabase } from '@/lib/supabase';

// Type definitions
export interface Page {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  createdAt: string;
  tags: string[];
  type: 'richtext' | 'drawio' | 'flatpage' | 'flatpagev2' | 'pagegroup' | 'spreadsheet' | 'table';
}

export interface Section {
  id: string;
  title: string;
  pages: Page[];
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  lastEdited: string;
  createdAt: string;
}

// Helper function to ensure page type is valid
const ensureValidPageType = (type: string | null): Page['type'] => {
  const validTypes: Page['type'][] = ['richtext', 'drawio', 'flatpage', 'flatpagev2', 'pagegroup', 'spreadsheet', 'table'];
  return (type && validTypes.includes(type as Page['type'])) ? (type as Page['type']) : 'richtext';
};

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Load notebooks from Supabase when component mounts
  useEffect(() => {
    if (!isInitialized) {
      const fetchNotebooks = async () => {
        try {
          setIsLoading(true);
          
          // Get notebooks
          const { data: notebooksData, error: notebooksError } = await supabase
            .from('notebooks')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (notebooksError) throw notebooksError;
          
          // Process each notebook to get its sections and pages
          const notebooksWithSections = await Promise.all(
            (notebooksData || []).map(async (notebook) => {
              const { data: sectionsData, error: sectionsError } = await supabase
                .from('sections')
                .select('*')
                .eq('notebook_id', notebook.id)
                .order('order', { ascending: true });
              
              if (sectionsError) throw sectionsError;
              
              const sections = await Promise.all(
                (sectionsData || []).map(async (section) => {
                  const { data: pagesData, error: pagesError } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('section_id', section.id)
                    .order('order', { ascending: true });
                  
                  if (pagesError) throw pagesError;
                  
                  const pages = (pagesData || []).map(page => ({
                    id: String(page.id),
                    title: page.title,
                    content: page.content || '',
                    lastEdited: formatTimestamp(page.last_edited_at),
                    createdAt: formatTimestamp(page.created_at),
                    tags: page.tags || [],
                    type: ensureValidPageType(page.type)
                  }));
                  
                  return {
                    id: String(section.id),
                    title: section.title,
                    pages
                  };
                })
              );
              
              return {
                id: String(notebook.id),
                title: notebook.title,
                description: notebook.description || '',
                sections,
                lastEdited: formatTimestamp(notebook.last_edited_at),
                createdAt: formatTimestamp(notebook.created_at)
              };
            })
          );
          
          setNotebooks(notebooksWithSections);
          setError(null);
        } catch (err) {
          console.error('Error fetching notebooks:', err);
          setError('Failed to fetch notebooks');
          
          // Use mock data as fallback
          loadMockData();
        } finally {
          setIsLoading(false);
          setIsInitialized(true);
        }
      };
      
      fetchNotebooks();
    }
  }, [isInitialized]);
  
  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  // Fallback to mock data if Supabase fails
  const loadMockData = () => {
    const mockedNotebooks = MOCK_NOTEBOOKS.map(notebook => ({
      ...notebook,
      sections: notebook.sections.map(section => ({
        ...section,
        pages: section.pages.map(page => ({
          ...page,
          type: ensureValidPageType(page.type)
        }))
      }))
    }));
    
    setNotebooks(mockedNotebooks);
  };

  // Memoize these functions to prevent recreation on each render
  const getNotebookById = useMemo(() => {
    return (id: string) => {
      return notebooks.find(notebook => notebook.id === id) || null;
    };
  }, [notebooks]);

  const getSectionById = useMemo(() => {
    return (notebookId: string, sectionId: string) => {
      const notebook = getNotebookById(notebookId);
      return notebook?.sections.find(section => section.id === sectionId) || null;
    };
  }, [getNotebookById]);

  const getPageById = useMemo(() => {
    return (pageId: string) => {
      for (const notebook of notebooks) {
        for (const section of notebook.sections) {
          const page = section.pages.find(page => page.id === pageId);
          if (page) {
            return { page, section, notebook };
          }
        }
      }
      return null;
    };
  }, [notebooks]);

  const updatePageContent = async (pageId: string, newContent: string): Promise<void> => {
    try {
      setAutoSaveStatus('saving');
      
      // Update local state first for immediate UI feedback
      setNotebooks(currentNotebooks => {
        const updatedNotebooks = currentNotebooks.map(notebook => {
          const updatedSections = notebook.sections.map(section => {
            const updatedPages = section.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page, 
                  content: newContent,
                  lastEdited: 'just now'
                };
              }
              return page;
            });
            return { ...section, pages: updatedPages };
          });
          return { ...notebook, sections: updatedSections };
        });
        
        return updatedNotebooks;
      });
      
      // Update in Supabase - Convert string ID to number for Supabase
      const numericPageId = parseInt(pageId, 10);
      
      // Check if conversion was successful
      if (isNaN(numericPageId)) {
        throw new Error(`Invalid page ID: ${pageId}`);
      }
      
      const { error } = await supabase
        .from('pages')
        .update({ 
          content: newContent,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', numericPageId);
      
      if (error) throw error;
      
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error("Error updating page content:", error);
      setAutoSaveStatus('error');
      throw error;
    }
  };
  
  const updatePageTitle = async (pageId: string, newTitle: string): Promise<void> => {
    try {
      // Update local state first
      setNotebooks(currentNotebooks => {
        const updatedNotebooks = currentNotebooks.map(notebook => {
          const updatedSections = notebook.sections.map(section => {
            const updatedPages = section.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page, 
                  title: newTitle,
                  lastEdited: 'just now'
                };
              }
              return page;
            });
            return { ...section, pages: updatedPages };
          });
          return { ...notebook, sections: updatedSections };
        });
        
        return updatedNotebooks;
      });
      
      // Update in Supabase - Convert string ID to number
      const numericPageId = parseInt(pageId, 10);
      
      if (isNaN(numericPageId)) {
        throw new Error(`Invalid page ID: ${pageId}`);
      }
      
      const { error } = await supabase
        .from('pages')
        .update({ 
          title: newTitle,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', numericPageId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating page title:", error);
      throw error;
    }
  };
  
  const updatePageTags = async (pageId: string, newTags: string[]): Promise<void> => {
    try {
      // Update local state first
      setNotebooks(currentNotebooks => {
        const updatedNotebooks = currentNotebooks.map(notebook => {
          const updatedSections = notebook.sections.map(section => {
            const updatedPages = section.pages.map(page => {
              if (page.id === pageId) {
                return {
                  ...page, 
                  tags: newTags,
                  lastEdited: 'just now'
                };
              }
              return page;
            });
            return { ...section, pages: updatedPages };
          });
          return { ...notebook, sections: updatedSections };
        });
        
        return updatedNotebooks;
      });
      
      // Update in Supabase - Convert string ID to number
      const numericPageId = parseInt(pageId, 10);
      
      if (isNaN(numericPageId)) {
        throw new Error(`Invalid page ID: ${pageId}`);
      }
      
      const { error } = await supabase
        .from('pages')
        .update({ 
          tags: newTags,
          last_edited_at: new Date().toISOString()
        })
        .eq('id', numericPageId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating page tags:", error);
      throw error;
    }
  };
  
  const deletePage = async (pageId: string): Promise<void> => {
    try {
      // Get page info before deleting for optimistic update
      const pageInfo = getPageById(pageId);
      if (!pageInfo) throw new Error("Page not found");
      
      // Update local state first
      setNotebooks(currentNotebooks => {
        const updatedNotebooks = currentNotebooks.map(notebook => {
          const updatedSections = notebook.sections.map(section => {
            const updatedPages = section.pages.filter(page => page.id !== pageId);
            
            if (updatedPages.length !== section.pages.length) {
              notebook.lastEdited = 'just now';
            }
            
            return { ...section, pages: updatedPages };
          });
          return { ...notebook, sections: updatedSections };
        });
        
        return updatedNotebooks;
      });
      
      // Delete from Supabase - Convert string ID to number
      const numericPageId = parseInt(pageId, 10);
      
      if (isNaN(numericPageId)) {
        throw new Error(`Invalid page ID: ${pageId}`);
      }
      
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', numericPageId);
      
      if (error) throw error;
      
      // Update notebook's last_edited_at - Convert string ID to number
      const numericNotebookId = parseInt(pageInfo.notebook.id, 10);
      
      if (isNaN(numericNotebookId)) {
        throw new Error(`Invalid notebook ID: ${pageInfo.notebook.id}`);
      }
      
      await supabase
        .from('notebooks')
        .update({ last_edited_at: new Date().toISOString() })
        .eq('id', numericNotebookId);
    } catch (error) {
      console.error("Error deleting page:", error);
      throw error;
    }
  };

  const createNotebook = async (title: string, description: string) => {
    try {
      // Send insert request to Supabase
      const now = new Date().toISOString();
      
      // First create notebook in Supabase - Remove ID field as it's auto-generated
      const { data: notebookData, error: notebookError } = await supabase
        .from('notebooks')
        .insert({
          title,
          description,
          created_at: now,
          last_edited_at: now,
          user_id: 'anonymous' // Replace with actual user ID when auth is implemented
        })
        .select()
        .single();
      
      if (notebookError) throw notebookError;
      if (!notebookData) throw new Error("Failed to create notebook");
      
      // Create default section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          title: 'Default Section',
          notebook_id: notebookData.id,
          created_at: now,
          order: 0
        })
        .select()
        .single();
      
      if (sectionError) throw sectionError;
      if (!sectionData) throw new Error("Failed to create section");
      
      // Update local state
      const newNotebook: Notebook = {
        id: String(notebookData.id),
        title,
        description,
        sections: [
          {
            id: String(sectionData.id),
            title: 'Default Section',
            pages: []
          }
        ],
        lastEdited: 'just now',
        createdAt: formatTimestamp(now),
      };
      
      setNotebooks(prev => [...prev, newNotebook]);
      return newNotebook;
    } catch (error) {
      console.error("Error creating notebook:", error);
      toast({
        title: "Error creating notebook",
        description: "There was a problem creating your notebook. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createSection = async (notebookId: string, title: string) => {
    try {
      const now = new Date().toISOString();
      
      // Convert string ID to number for Supabase
      const numericNotebookId = parseInt(notebookId, 10);
      
      if (isNaN(numericNotebookId)) {
        throw new Error(`Invalid notebook ID: ${notebookId}`);
      }
      
      // Get current sections count for order
      const { data, error: countError } = await supabase
        .from('sections')
        .select('id')
        .eq('notebook_id', numericNotebookId);
      
      if (countError) throw countError;
      
      const order = data?.length || 0;
      
      // Create section in Supabase - Remove ID field as it's auto-generated
      const { data: sectionData, error } = await supabase
        .from('sections')
        .insert({
          title,
          notebook_id: numericNotebookId,
          created_at: now,
          order
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!sectionData) throw new Error("Failed to create section");
      
      // Update notebook's last_edited_at
      await supabase
        .from('notebooks')
        .update({ last_edited_at: now })
        .eq('id', numericNotebookId);
      
      // Update local state
      const newSection: Section = {
        id: String(sectionData.id),
        title,
        pages: [],
      };
      
      setNotebooks(currentNotebooks => {
        return currentNotebooks.map(notebook => {
          if (notebook.id === notebookId) {
            return {
              ...notebook,
              sections: [...notebook.sections, newSection],
              lastEdited: 'just now'
            };
          }
          return notebook;
        });
      });
      
      return newSection;
    } catch (error) {
      console.error("Error creating section:", error);
      toast({
        title: "Error creating section",
        description: "There was a problem creating your section. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createPage = async (notebookId: string, sectionId: string, title: string, type: Page['type'] = 'richtext') => {
    try {
      // Validate the page type
      const validType = ensureValidPageType(type);
      
      // Convert string ID to number for Supabase
      const numericSectionId = parseInt(sectionId, 10);
      const numericNotebookId = parseInt(notebookId, 10);
      
      if (isNaN(numericSectionId) || isNaN(numericNotebookId)) {
        throw new Error(`Invalid IDs: notebookId=${notebookId}, sectionId=${sectionId}`);
      }
      
      const now = new Date().toISOString();
      
      // Get current pages count for order
      const { data, error: countError } = await supabase
        .from('pages')
        .select('id')
        .eq('section_id', numericSectionId);
      
      if (countError) throw countError;
      
      const order = data?.length || 0;
      
      // Create page in Supabase - Remove ID field as it's auto-generated
      const { data: pageData, error } = await supabase
        .from('pages')
        .insert({
          title,
          content: '',
          section_id: numericSectionId,
          type: validType,
          created_at: now,
          last_edited_at: now,
          tags: [],
          order
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!pageData) throw new Error("Failed to create page");
      
      // Update notebook's last_edited_at
      await supabase
        .from('notebooks')
        .update({ last_edited_at: now })
        .eq('id', numericNotebookId);
      
      const newPage: Page = {
        id: String(pageData.id),
        title,
        content: '',
        lastEdited: 'just now',
        createdAt: formatTimestamp(now),
        tags: [],
        type: validType
      };
      
      // Update the notebooks state with the new page
      setNotebooks(currentNotebooks => {
        return currentNotebooks.map(notebook => {
          if (notebook.id === notebookId) {
            const updatedSections = notebook.sections.map(section => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  pages: [...section.pages, newPage]
                };
              }
              return section;
            });
            
            return {
              ...notebook,
              sections: updatedSections,
              lastEdited: 'just now'
            };
          }
          return notebook;
        });
      });
      
      return newPage;
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error creating page",
        description: "There was a problem creating your page. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    notebooks,
    isLoading,
    error,
    autoSaveStatus,
    getNotebookById,
    getSectionById,
    getPageById,
    updatePageContent,
    updatePageTitle,
    updatePageTags,
    deletePage,
    createNotebook,
    createSection,
    createPage
  };
}

// Fallback mock data (will be used if Supabase connection fails)
const MOCK_NOTEBOOKS = [
  {
    id: 'nb-1',
    title: 'Work Projects',
    description: 'All notes related to current work projects and tasks',
    lastEdited: '2 hours ago',
    createdAt: '2023-10-15',
    sections: [
      {
        id: 'sec-1',
        title: 'Project Alpha',
        pages: [
          {
            id: 'page-1',
            title: 'Requirements Specification',
            content: '<h1>Requirements Specification</h1><p>This document outlines the key requirements for Project Alpha...</p>',
            lastEdited: '2 hours ago',
            createdAt: '2023-10-15',
            tags: ['documentation', 'requirements'],
            type: 'richtext'
          },
          {
            id: 'page-2',
            title: 'Meeting Notes (Oct 20)',
            content: '<h1>Meeting Notes</h1><p>Attendees: John, Sarah, Mike</p><p>Key decisions:</p><ul><li>Launch date set for December 1st</li><li>Budget approved for external contractors</li></ul>',
            lastEdited: '1 day ago',
            createdAt: '2023-10-20',
            tags: ['meeting', 'decisions'],
            type: 'richtext'
          }
        ]
      },
      {
        id: 'sec-2',
        title: 'Project Beta',
        pages: [
          {
            id: 'page-3',
            title: 'Technical Architecture',
            content: '<h1>Technical Architecture</h1><p>This document describes the technical architecture for Project Beta...</p>',
            lastEdited: '3 days ago',
            createdAt: '2023-09-28',
            tags: ['technical', 'architecture'],
            type: 'drawio'
          }
        ]
      }
    ]
  },
  {
    id: 'nb-2',
    title: 'Personal Notes',
    description: 'Personal journal entries and thoughts',
    lastEdited: '1 day ago',
    createdAt: '2023-08-05',
    sections: [
      {
        id: 'sec-3',
        title: 'Journal',
        pages: [
          {
            id: 'page-4',
            title: 'Goals for 2023',
            content: '<h1>2023 Goals</h1><ol><li>Learn a new programming language</li><li>Read 20 books</li><li>Exercise 3 times per week</li></ol>',
            lastEdited: '1 week ago',
            createdAt: '2023-01-05',
            tags: ['goals', 'planning'],
            type: 'flatpage'
          }
        ]
      },
      {
        id: 'sec-4',
        title: 'Book Notes',
        pages: [
          {
            id: 'page-5',
            title: 'Atomic Habits',
            content: '<h1>Atomic Habits</h1><p>Key takeaways from the book:</p><ul><li>Small habits compound over time</li><li>Focus on systems rather than goals</li><li>Identity-based habits are more effective than outcome-based habits</li></ul>',
            lastEdited: '1 day ago',
            createdAt: '2023-07-12',
            tags: ['book', 'productivity'],
            type: 'spreadsheet'
          }
        ]
      }
    ]
  },
  {
    id: 'nb-3',
    title: 'Research',
    description: 'Academic and personal research projects',
    lastEdited: '4 days ago',
    createdAt: '2023-06-10',
    sections: [
      {
        id: 'sec-5',
        title: 'AI & Machine Learning',
        pages: [
          {
            id: 'page-6',
            title: 'Transformer Architecture',
            content: '<h1>Transformer Architecture</h1><p>Notes on the transformer architecture used in modern language models...</p>',
            lastEdited: '4 days ago',
            createdAt: '2023-06-10',
            tags: ['AI', 'machine learning'],
            type: 'table'
          },
          {
            id: 'page-7',
            title: 'Research Papers',
            content: '<h1>Research Papers</h1><p>List of important papers to read:</p><ul><li>Attention Is All You Need (2017)</li><li>BERT: Pre-training of Deep Bidirectional Transformers (2018)</li></ul>',
            lastEdited: '1 week ago',
            createdAt: '2023-06-15',
            tags: ['research', 'papers'],
            type: 'pagegroup'
          }
        ]
      }
    ]
  }
];
