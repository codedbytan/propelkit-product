'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';

// This is a wrapper/example for using shadcn's toast
// The actual toast component is already in @/components/ui/toast

export function useNotification() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  return { showSuccess, showError, showInfo, toast };
}

// Example component showing toast usage
export function ToastExample() {
  const { showSuccess, showError, showInfo } = useNotification();

  return (
    <div className="space-y-4 p-4">
      <Button onClick={() => showSuccess('Success!', 'Operation completed successfully.')}>
        Show Success Toast
      </Button>
      
      <Button 
        variant="destructive" 
        onClick={() => showError('Error!', 'Something went wrong.')}
      >
        Show Error Toast
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => showInfo('Info', 'This is an informational message.')}
      >
        Show Info Toast
      </Button>
    </div>
  );
}
