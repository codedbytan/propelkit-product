'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  slug: string;
  image?: string;
}

interface BlogGridProps {
  posts?: BlogPost[];
}

const defaultPosts: BlogPost[] = [
  {
    title: 'Getting Started with Next.js 15',
    excerpt: 'Learn how to build modern web applications with the latest features in Next.js 15.',
    category: 'Tutorial',
    date: '2024-01-15',
    readTime: '5 min read',
    slug: 'getting-started-nextjs-15',
  },
  {
    title: 'Building SaaS with Supabase',
    excerpt: 'A comprehensive guide to building scalable SaaS applications using Supabase.',
    category: 'Guide',
    date: '2024-01-10',
    readTime: '8 min read',
    slug: 'building-saas-supabase',
  },
  {
    title: 'Razorpay Integration Guide',
    excerpt: 'Step-by-step tutorial for integrating Razorpay payments in your Next.js app.',
    category: 'Tutorial',
    date: '2024-01-05',
    readTime: '6 min read',
    slug: 'razorpay-integration-guide',
  },
];

export function BlogGrid({ posts = defaultPosts }: BlogGridProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Latest from our blog
          </h2>
          <p className="text-lg text-muted-foreground">
            Tutorials, guides, and updates
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
