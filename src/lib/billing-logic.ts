import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendInvoiceEmail } from "@/lib/email";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { GSTCalculator } from "@/lib/gst-engine";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. HANDLER: Payment Succeeded
export async function processSubscription(event: any) {
    console.log("🚀 Processing SUCCESSFUL Payment...");
    const entity = event.payload.payment.entity;
    const userId = entity.notes?.userId;
    const email = entity.email;

    if (!userId) throw new Error("No User ID found in payment notes");

    // A. Activate in DB
    const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
            user_id: userId,
            status: "active",
            plan_id: entity.notes?.planKey || "pro_monthly",
            amount: entity.amount / 100,
            currency: entity.currency,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            razorpay_payment_id: entity.id
        });

    if (error) throw error;

    // B. Generate Invoice & Email
    const calculator = new GSTCalculator({ sellerStateCode: "08", sellerGSTIN: "YOUR_GSTIN_HERE" });
    const taxResult = calculator.calculate(
        { stateCode: entity.notes?.stateCode || "27", gstin: entity.notes?.gstin },
        [{ description: "Acme SaaS License", sacCode: "9983", unitPrice: entity.amount / 100, quantity: 1 }]
    );

    const invoiceData = {
        invoiceNumber: "INV-" + entity.id.slice(-6),
        date: new Date(),
        customerName: email.split("@")[0],
        customerGSTIN: entity.notes?.gstin,
        taxResult: taxResult,
        description: "Acme SaaS Lifetime License" // 👈 Added Missing Field
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);
    await sendInvoiceEmail(email, pdfBuffer, invoiceData.invoiceNumber);

    // C. Audit Log
    await logAudit(userId, "subscription_activated", { payment_id: entity.id, amount: entity.amount });
}

// 2. HANDLER: Payment Failed (Recovery Email)
export async function processPaymentFailure(event: any) {
    console.log("⚠️ Processing FAILED Payment...");
    const entity = event.payload.payment.entity;
    const email = entity.email;

    // Send "Please Retry" Email
    if (email) {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Payment Failed - IndicSaaS',
            html: `<p>Hi,</p><p>We noticed your payment of ₹${entity.amount / 100} failed.</p><p><a href="https://yourdomain.com/dashboard">Click here to retry</a></p>`
        });
    }
}

// 3. HANDLER: Refund Processed (Revoke Access)
export async function processRefund(event: any) {
    console.log("🔄 Processing REFUND...");
    const entity = event.payload.payment.entity;
    const userId = entity.notes?.userId;

    if (userId) {
        // Downgrade user immediately
        await supabaseAdmin
            .from("subscriptions")
            .update({ status: "refunded", current_period_end: new Date().toISOString() })
            .eq("user_id", userId);

        await logAudit(userId, "subscription_refunded", { payment_id: entity.id });
    }
}

// Helper for Audit Logs (This was likely missing in your file)
async function logAudit(userId: string, action: string, details: any) {
    await supabaseAdmin.from("audit_logs").insert({ user_id: userId, action, details });
}