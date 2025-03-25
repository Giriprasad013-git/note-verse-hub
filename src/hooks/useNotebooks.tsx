import { useState, useEffect } from 'react';
import { toast } from './use-toast';

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

// Mock data
const MOCK_NOTEBOOKS: Notebook[] = [
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
            type: 'richtext'
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
            type: 'richtext'
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
            type: 'richtext'
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
            type: 'richtext'
          },
          {
            id: 'page-7',
            title: 'Research Papers',
            content: '<h1>Research Papers</h1><p>List of important papers to read:</p><ul><li>Attention Is All You Need (2017)</li><li>BERT: Pre-training of Deep Bidirectional Transformers (2018)</li></ul>',
            lastEdited: '1 week ago',
            createdAt: '2023-06-15',
            tags: ['research', 'papers'],
            type: 'richtext'
          }
        ]
      }
    ]
  }
];

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setNotebooks(MOCK_NOTEBOOKS);
        setError(null);
      } catch (err) {
        setError('Failed to fetch notebooks');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotebooks();
  }, []);

  const getNotebookById = (id: string) => {
    return notebooks.find(notebook => notebook.id === id) || null;
  };

  const getSectionById = (notebookId: string, sectionId: string) => {
    const notebook = getNotebookById(notebookId);
    return notebook?.sections.find(section => section.id === sectionId) || null;
  };

  const getPageById = (pageId: string) => {
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

  const updatePageContent = (pageId: string, newContent: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
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
        
        setTimeout(resolve, 300);
      } catch (error) {
        console.error("Error updating page content:", error);
        reject(error);
      }
    });
  };
  
  const updatePageTitle = (pageId: string, newTitle: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
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
        
        setTimeout(resolve, 300);
      } catch (error) {
        console.error("Error updating page title:", error);
        reject(error);
      }
    });
  };
  
  const updatePageTags = (pageId: string, newTags: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
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
        
        setTimeout(resolve, 300);
      } catch (error) {
        console.error("Error updating page tags:", error);
        reject(error);
      }
    });
  };
  
  const deletePage = (pageId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
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
        
        setTimeout(resolve, 300);
      } catch (error) {
        console.error("Error deleting page:", error);
        reject(error);
      }
    });
  };

  const createNotebook = (title: string, description: string) => {
    const newNotebook: Notebook = {
      id: `nb-${Date.now()}`,
      title,
      description,
      sections: [],
      lastEdited: 'just now',
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setNotebooks([...notebooks, newNotebook]);
    return newNotebook;
  };

  const createSection = (notebookId: string, title: string) => {
    const newSection: Section = {
      id: `sec-${Date.now()}`,
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
  };

  const createPage = (notebookId: string, sectionId: string, title: string, type: Page['type'] = 'richtext') => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title,
      content: '',
      lastEdited: 'just now',
      createdAt: new Date().toISOString().split('T')[0],
      tags: [],
      type
    };
    
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
  };

  return {
    notebooks,
    isLoading,
    error,
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
