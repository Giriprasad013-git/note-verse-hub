
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full px-4 py-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6">Note-Verse Hub</h1>
        <p className="text-gray-600 mb-8">
          Your digital notebook for organizing thoughts, ideas, and knowledge.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-green-600">
              Logged in as {user.email}
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button asChild>
              <Link to="/auth">Sign In / Register</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Continue as Guest</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
