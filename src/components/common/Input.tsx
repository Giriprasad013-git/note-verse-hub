
import React from 'react';
import { cn } from '@/lib/utils';
import { Input as ShadcnInput } from '@/components/ui/input';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <ShadcnInput
        className={cn(className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
