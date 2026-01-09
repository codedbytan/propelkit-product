'use client';

import { Button } from '@/components/ui/button';
import { RefreshCcw, Home } from 'lucide-react';
import { brand } from '@/config/brand';
import Link from 'next/link';

export function Error500() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 500 Number */}
        <div>
          <h1 className="text-9xl font-bold bg-gradient-to-br from-destructive to-destructive/50 bg-clip-text text-transparent">
            500
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            We're experiencing technical difficulties. Our team has been notified and is working on a fix.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            If the problem persists:
          </p>
          <p className="text-sm">
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
