import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 💡 CUSTOMIZE: Replace these with YOUR product's FAQs
const faqs = [
  {
    question: "How does the payment work?",
    answer:
      "We use Razorpay for secure payment processing. You can pay using credit/debit cards, UPI, or net banking. All payments are encrypted and secure.",
  },
  {
    question: "What happens after I purchase?",
    answer:
      "You'll immediately receive access to your dashboard and a confirmation email with your invoice. You can start using all features right away.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "Yes! We offer a 7-day money-back guarantee. If you're not satisfied for any reason, contact us within 7 days for a full refund.",
  },
  {
    question: "Do I get updates?",
    answer:
      "Yes! Your purchase includes all future updates and improvements. We regularly add new features and fix bugs based on user feedback.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption, secure servers, and follow best practices for data protection. Your information is never shared with third parties.",
  },
  {
    question: "Do you offer support?",
    answer:
      "Yes! All customers get email support. Professional plan includes priority support with faster response times.",
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
