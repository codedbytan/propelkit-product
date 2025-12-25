import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What tech stack does PropelKit use?",
    answer:
      "PropelKit is built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (for auth & database), Razorpay (for payments), and Resend (for emails). It's a modern, production-ready stack optimized for performance and developer experience.",
  },
  {
    question: "Is Razorpay integration really pre-configured?",
    answer:
      "Yes! PropelKit comes with complete Razorpay integration including checkout, webhooks, subscription management, and automatic GST invoice generation. Just add your Razorpay API keys and you're ready to accept payments.",
  },
  {
    question: "What's the difference between Starter and Agency licenses?",
    answer:
      "The Starter license is for personal use — you can use it to build your own SaaS products. The Agency license allows you to use PropelKit for unlimited client projects, making it perfect for freelancers and agencies.",
  },
  {
    question: "Do I get lifetime updates?",
    answer:
      "Absolutely! Once you purchase PropelKit, you get access to all future updates forever. We regularly add new features, improvements, and security patches — all included in your one-time purchase.",
  },
  {
    question: "Can I see the code before purchasing?",
    answer:
      "We offer a live demo that showcases all the features. The full source code is available immediately after purchase. If you're not satisfied, just note that due to the digital nature of the product, we don't offer refunds once the code is delivered.",
  },
  {
    question: "What kind of support do I get?",
    answer:
      "All customers get access to our documentation and community Discord. Agency license holders get priority support with faster response times and access to a private Discord channel for direct assistance.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-card transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
