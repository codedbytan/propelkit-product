'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { brand } from '@/config/brand';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
}

const defaultItems: FAQItem[] = [
  {
    question: `What is ${brand.name}?`,
    answer: `${brand.name} is a production-ready Next.js SaaS boilerplate designed specifically for Indian developers, featuring Razorpay integration, GST invoicing, and more.`,
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.',
  },
  {
    question: 'Can I use this for client projects?',
    answer: 'Absolutely! The Agency License allows you to use it for unlimited client projects.',
  },
  {
    question: 'Do you provide support?',
    answer: 'Yes, all licenses include email support. Pro and Agency licenses get priority support.',
  },
  {
    question: 'Is the source code included?',
    answer: 'Yes, you get full access to the source code with no restrictions.',
  },
];

export function FAQAccordion({ items = defaultItems }: FAQAccordionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
