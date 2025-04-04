
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const UserSettings = () => {
  const { user, isGuest, guestId, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const displayName = user?.user_metadata?.username || 
                     user?.email?.split('@')[0] || 
                     (isGuest ? 'Guest User' : 'User');
  
  const userEmail = user?.email || (isGuest ? 'Guest session' : '');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
    setOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast({
      title: `${theme === 'dark' ? 'Light' : 'Dark'} theme activated`,
      description: `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-accent/50 rounded-md p-2 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {displayName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left hidden md:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{userEmail}</p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground md:hidden" />
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="flex flex-col gap-1">
          <div className="px-2 py-1.5 text-sm font-medium">
            Account Settings
          </div>
          <div className="h-px bg-border my-1" />
          
          <button 
            onClick={() => {
              toast({
                title: "Profile settings",
                description: "This feature is coming soon!"
              });
              setOpen(false);
            }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>Toggle theme</span>
          </button>
          
          <div className="h-px bg-border my-1" />
          
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-500 hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserSettings;
