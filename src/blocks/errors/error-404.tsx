'use client';

import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { brand } from '@/config/brand';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Error404() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Number */}
        <div>
          <h1 className="text-9xl font-bold bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-muted-foreground">
          Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
