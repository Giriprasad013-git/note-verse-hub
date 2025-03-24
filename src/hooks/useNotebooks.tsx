
import { useState, useEffect } from 'react';

// Type definitions
export interface Page {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  createdAt: string;
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
          },
          {
            id: 'page-2',
            title: 'Meeting Notes (Oct 20)',
            content: '<h1>Meeting Notes</h1><p>Attendees: John, Sarah, Mike</p><p>Key decisions:</p><ul><li>Launch date set for December 1st</li><li>Budget approved for external contractors</li></ul>',
            lastEdited: '1 day ago',
            createdAt: '2023-10-20',
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
          },
          {
            id: 'page-7',
            title: 'Research Papers',
            content: '<h1>Research Papers</h1><p>List of important papers to read:</p><ul><li>Attention Is All You Need (2017)</li><li>BERT: Pre-training of Deep Bidirectional Transformers (2018)</li></ul>',
            lastEdited: '1 week ago',
            createdAt: '2023-06-15',
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
    // Simulate API fetch with a delay
    const fetchNotebooks = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
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

  return {
    notebooks,
    isLoading,
    error,
    getNotebookById,
    getSectionById,
    getPageById,
  };
}
