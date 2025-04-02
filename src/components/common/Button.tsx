
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          
          // Variants
          variant === 'default' && 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
          variant === 'outline' && 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
          variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
          variant === 'link' && 'text-primary underline-offset-4 hover:underline',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-9 px-4 py-2',
          size === 'lg' && 'h-10 px-8',
          size === 'icon' && 'h-9 w-9',
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
