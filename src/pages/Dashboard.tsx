
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import NotebookItem from '@/components/notebook/NotebookItem';
import { useNotebooks } from '@/hooks/useNotebooks';

const Dashboard = () => {
  const { notebooks, isLoading } = useNotebooks();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotebooks = searchQuery
    ? notebooks.filter(notebook => 
        notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notebooks;

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Notebooks</h1>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Notebook
              </Button>
            </div>
            
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search notebooks..."
                className="w-full max-w-md rounded-md border border-input bg-background px-4 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-48 bg-muted rounded-lg"></div>
                ))}
              </div>
            ) : filteredNotebooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No notebooks found.</p>
                <Button>Create Notebook</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotebooks.map((notebook, index) => (
                  <div 
                    key={notebook.id} 
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NotebookItem notebook={notebook} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
