// src/lib/billing-logic.ts
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendInvoiceEmail } from "@/lib/email";
import { generateInvoicePDF } from "@/lib/invoice-generator";
import { GSTCalculator } from "@/lib/gst-engine";
import { brand } from "@/config/brand";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// HELPER: Audit Logging
// ============================================
async function logAudit(userId: string, action: string, details: any) {
    await supabaseAdmin.from("audit_logs").insert({
        user_id: userId,
        action,
        details,
        created_at: new Date().toISOString(),
    });
}

// ============================================
// 1. HANDLER: Payment Succeeded
// ============================================
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
    const calculator = new GSTCalculator({
        sellerStateCode: brand.company.address.stateCode,
        sellerGSTIN: brand.company.gstin
    });

    const taxResult = calculator.calculate(
        {
            stateCode: entity.notes?.stateCode || "27",
            gstin: entity.notes?.gstin
        },
        [{
            description: `${brand.product.name} License`,
            sacCode: brand.invoice.sacCode,
            unitPrice: entity.amount / 100,
            quantity: 1
        }]
    );

    const invoiceData = {
        invoiceNumber: "INV-" + entity.id.slice(-6),
        date: new Date(),
        customerName: email.split("@")[0],
        customerGSTIN: entity.notes?.gstin,
        taxResult: taxResult,
        description: `${brand.product.name} Lifetime License`
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // ✅ FIXED: Now passing all 4 required arguments including amount
    await sendInvoiceEmail(
        email,
        pdfBuffer,
        invoiceData.invoiceNumber,
        entity.amount  // ← Added the missing amount parameter
    );

    // C. Audit Log
    await logAudit(userId, "subscription_activated", {
        payment_id: entity.id,
        amount: entity.amount
    });

    console.log(`✅ Subscription activated for user ${userId}`);
}

// ============================================
// 2. HANDLER: Payment Failed (Recovery Email)
// ============================================
export async function processPaymentFailure(event: any) {
    console.log("⚠️ Processing FAILED Payment...");
    const entity = event.payload.payment.entity;
    const email = entity.email;

    // Send "Please Retry" Email
    if (email) {
        await resend.emails.send({
            from: brand.email.fromSupport,
            to: email,
            subject: `Payment Failed - ${brand.name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #ef4444;">Payment Failed</h1>
                    
                    <p>Hi there,</p>
                    
                    <p>We noticed your payment of <strong>₹${(entity.amount / 100).toLocaleString('en-IN')}</strong> failed.</p>
                    
                    <p>This could be due to:</p>
                    <ul>
                        <li>Insufficient funds</li>
                        <li>Card declined</li>
                        <li>Network error</li>
                    </ul>
                    
                    <p>Please try again:</p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${brand.product.url}/dashboard" 
                           style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Retry Payment
                        </a>
                    </div>
                    
                    <p>Need help? Contact us at ${brand.contact.email}</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        © ${new Date().getFullYear()} ${brand.company.legalName}
                    </p>
                </body>
                </html>
            `
        });

        console.log(`⚠️ Payment failure email sent to ${email}`);
    }
}

// ============================================
// 3. HANDLER: Subscription Charged (Monthly/Yearly)
// ============================================
export async function processSubscriptionCharged(event: any) {
    console.log("💰 Processing Subscription Charge...");
    const subscription = event.payload.subscription.entity;
    const payment = event.payload.payment?.entity;

    if (!payment) {
        console.error("❌ No payment entity in subscription.charged event");
        return;
    }

    const userId = subscription.notes?.userId;
    const email = payment.email;
    const amount = payment.amount;

    if (!userId) throw new Error("No User ID found in subscription notes");

    // A. Update subscription in DB
    const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", subscription.id);

    if (error) console.error("❌ Error updating subscription:", error);

    // B. Generate Invoice
    const calculator = new GSTCalculator({
        sellerStateCode: brand.company.address.stateCode,
        sellerGSTIN: brand.company.gstin
    });

    const taxResult = calculator.calculate(
        {
            stateCode: subscription.notes?.stateCode || "27",
            gstin: subscription.notes?.gstin
        },
        [{
            description: `${brand.product.name} Subscription`,
            sacCode: brand.invoice.sacCode,
            unitPrice: amount / 100,
            quantity: 1
        }]
    );

    const invoiceData = {
        invoiceNumber: "INV-" + payment.id.slice(-6),
        date: new Date(),
        customerName: email.split("@")[0],
        customerGSTIN: subscription.notes?.gstin,
        taxResult: taxResult,
        description: `${brand.product.name} Subscription - ${subscription.plan_id}`
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // C. Send invoice email
    await sendInvoiceEmail(
        email,
        pdfBuffer,
        invoiceData.invoiceNumber,
        amount  // ✅ Amount passed correctly
    );

    // D. Audit Log
    await logAudit(userId, "subscription_charged", {
        subscription_id: subscription.id,
        payment_id: payment.id,
        amount: amount
    });

    console.log(`✅ Subscription charged and invoice sent for user ${userId}`);
}

// ============================================
// 4. HANDLER: Subscription Cancelled
// ============================================
export async function processSubscriptionCancelled(event: any) {
    console.log("❌ Processing Subscription Cancellation...");
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;

    if (!userId) throw new Error("No User ID found in subscription notes");

    // A. Update status in DB
    const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", subscription.id);

    if (error) console.error("❌ Error cancelling subscription:", error);

    // B. Get user email
    const { data: user } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

    if (user?.email) {
        // C. Send cancellation email
        await resend.emails.send({
            from: brand.email.fromSupport,
            to: user.email,
            subject: `Subscription Cancelled - ${brand.name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Subscription Cancelled</h1>
                    
                    <p>Your subscription has been cancelled.</p>
                    
                    <p>You'll continue to have access until your current period ends on <strong>${new Date(subscription.current_end * 1000).toLocaleDateString('en-IN')}</strong></p>
                    
                    <p>We're sorry to see you go! If you change your mind, you can reactivate anytime from your dashboard.</p>
                    
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${brand.product.url}/dashboard" 
                           style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <p>Questions? Contact us at ${brand.contact.email}</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        © ${new Date().getFullYear()} ${brand.company.legalName}
                    </p>
                </body>
                </html>
            `
        });

        console.log(`✅ Cancellation email sent to ${user.email}`);
    }

    // D. Audit Log
    await logAudit(userId, "subscription_cancelled", {
        subscription_id: subscription.id,
        end_date: new Date(subscription.current_end * 1000).toISOString()
    });
}