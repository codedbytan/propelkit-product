// src/lib/inngest/functions/license.ts
import { inngest } from '../client';
import { sendPurchaseConfirmationEmail } from '@/lib/email';

// Send purchase confirmation with download link
export const handleLicensePurchase = inngest.createFunction(
    { id: 'handle-license-purchase' },
    { event: 'license.purchased' },
    async ({ event, step }) => {
        const { userId, licenseId, planKey, email } = event.data;

        // Step 1: Generate invoice PDF
        const invoice = await step.run('generate-invoice', async () => {
            // Your PDF generation logic
            return { invoiceId: 'INV-123', pdfUrl: 'https://...' };
        });

        // Step 2: Send confirmation email with invoice
        await step.run('send-confirmation-email', async () => {
            await sendPurchaseConfirmationEmail({
                to: email,
                licenseKey: licenseId,
                planName: planKey,
                invoiceUrl: invoice.pdfUrl
            });
        });

        // Step 3: Log purchase in analytics (optional)
        await step.run('log-analytics', async () => {
            console.log(`New purchase: ${licenseId} for ${email}`);
            // Add analytics tracking here
        });
    }
);