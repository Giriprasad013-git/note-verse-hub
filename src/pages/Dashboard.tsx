
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/common/Button';
import NotebookItem from '@/components/notebook/NotebookItem';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useAuth } from '@/context/AuthContext';
import { AuthCheck } from '@/components/layout/AuthCheck';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { notebooks, isLoading, createNotebook } = useNotebooks();
  const { user, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredNotebooks = searchQuery
    ? notebooks.filter(notebook => 
        notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notebooks;
  
  const handleCreateNotebook = async () => {
    try {
      const newNotebook = await createNotebook(
        'New Notebook', 
        'Created on ' + new Date().toLocaleDateString()
      );
      
      toast({
        title: "Notebook created",
        description: `"${newNotebook.title}" has been created successfully.`,
      });
      
      navigate(`/notebook/${newNotebook.id}`);
    } catch (error) {
      console.error('Failed to create notebook:', error);
      toast({
        title: "Error creating notebook",
        description: "There was a problem creating your notebook.",
        variant: "destructive"
      });
    }
  };

  // Content to display in the dashboard
  const dashboardContent = (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={isGuest ? "Guest Dashboard" : "My Dashboard"} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                {isGuest ? 'Guest Notebooks' : 'My Notebooks'}
              </h1>
              <Button className="gap-2" onClick={handleCreateNotebook}>
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
                <Button onClick={handleCreateNotebook}>Create Notebook</Button>
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

  return <AuthCheck allowGuest>{dashboardContent}</AuthCheck>;
};

export default Dashboard;
