'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
}

interface TestimonialGridProps {
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    name: 'Rajesh Kumar',
    role: 'Founder',
    company: 'TechStart India',
    content: 'This boilerplate saved us months of development time. The Razorpay integration works flawlessly!',
  },
  {
    name: 'Priya Sharma',
    role: 'CTO',
    company: 'StartupHub',
    content: 'Best investment for our SaaS. The GST invoice generation is perfect for Indian businesses.',
  },
  {
    name: 'Amit Patel',
    role: 'Developer',
    company: 'CodeCraft',
    content: 'Clean code, great documentation, and excellent support. Highly recommended!',
  },
];

export function TestimonialGrid({ testimonials = defaultTestimonials }: TestimonialGridProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Loved by developers
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
