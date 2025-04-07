
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Book, PenSquare, Sparkles, BookText, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, signOut, signInAsGuest, isGuest } = useAuth();

  const handleGuestAccess = () => {
    signInAsGuest();
    toast({
      title: "Guest mode active",
      description: "You can now access the app as a guest. Your data will be stored locally in your browser."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Note-Verse Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your digital notebook for organizing thoughts, ideas, and knowledge in one beautiful, searchable space.
          </p>
          
          {user || isGuest ? (
            <div className="space-y-4">
              <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium px-4 py-2 rounded-full mb-4">
                {isGuest 
                  ? '🔓 Using as guest - your data is stored locally' 
                  : `🔐 Logged in as ${user?.email || 'User'}`}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={handleGuestAccess} className="gap-2">
                Try as Guest
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card hover:bg-card/80 p-6 rounded-xl border border-border transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Organized Notebooks</h3>
            <p className="text-muted-foreground">
              Create digital notebooks organized into sections and pages for all your needs.
            </p>
          </div>
          
          <div className="bg-card hover:bg-card/80 p-6 rounded-xl border border-border transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <PenSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rich Text Editing</h3>
            <p className="text-muted-foreground">
              Format your notes with rich text editing, add images, lists, and more.
            </p>
          </div>
          
          <div className="bg-card hover:bg-card/80 p-6 rounded-xl border border-border transition-colors">
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sync Across Devices</h3>
            <p className="text-muted-foreground">
              Access your notes from anywhere, on any device, with seamless cloud synchronization.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookText className="h-5 w-5 text-primary" />
            <span className="font-semibold">Note-Verse Hub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Note-Verse Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
