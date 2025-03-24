
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, FileText, FolderOpen } from 'lucide-react';
import Button from '@/components/common/Button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              N
            </div>
            <span className="font-medium text-lg">NoteVerse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Organize your thoughts with structure and clarity
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              NoteVerse is a powerful note-taking application with hierarchical organization, 
              version history, and collaborative features to enhance your productivity.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-accent">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Structured Organization</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-lg p-6 shadow-sm animate-scale-in">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Book className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Notebooks</h3>
                <p className="text-muted-foreground">
                  Create top-level workspaces to organize all your related content in one place.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm animate-scale-in" style={{ animationDelay: '100ms' }}>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Sections</h3>
                <p className="text-muted-foreground">
                  Divide your notebooks into logical sections for better categorization.
                </p>
              </div>
              <div className="bg-background rounded-lg p-6 shadow-sm animate-scale-in" style={{ animationDelay: '200ms' }}>
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium mb-2">Pages</h3>
                <p className="text-muted-foreground">
                  Create rich, detailed notes with support for text, images, code, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get organized?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start creating structured notes with NoteVerse today.
            </p>
            <Link to="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} NoteVerse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
