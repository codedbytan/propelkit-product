import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(to: string, pdfBuffer: Buffer, invoiceId: string) {
    console.log(`📧 PREPARING EMAIL for: ${to}`);

    if (!process.env.RESEND_API_KEY) {
        throw new Error("❌ CRITICAL: RESEND_API_KEY is missing!");
    }

    // --- THE FIX: SAFE EMAIL HANDLING ---
    // If you haven't verified a domain (e.g., indicsaas.com), you MUST send to your own email.
    // This logic redirects all customer emails to YOU for testing purposes.
    // set FORCE_TO_ME = false later when you have verified your domain.
    const FORCE_TO_ME = true;
    const MY_EMAIL = "support@yourdomain.com"; // Your registered Resend email

    const recipient = FORCE_TO_ME ? MY_EMAIL : to;

    // PRODUCTION CHECK
    if (process.env.NODE_ENV === 'production' && to.includes('@resend.dev')) {
        throw new Error('CRITICAL: Update email sender in lib/email.ts for production!');
    }
    // ------------------------------------

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Change this ONLY after verifying your domain
            to: recipient,
            subject: `Invoice #${invoiceId} - Payment Successful`,
            html: `
                <h1>Payment Successful! 🚀</h1>
                <p><strong>Customer Email:</strong> ${to}</p> <p>Your license key is active.</p>
                <p>Find your invoice attached.</p>
            `,
            attachments: [
                {
                    filename: `invoice-${invoiceId}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        if (data.error) {
            console.error("❌ Resend API Error:", data.error);
            throw new Error(data.error.message);
        }

        console.log(`✅ EMAIL SENT SUCCESSFULLY! ID: ${data.data?.id}`);
        return data;

    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
}