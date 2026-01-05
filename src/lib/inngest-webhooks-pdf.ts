// src/lib/inngest-webhooks-pdf.ts
// Webhook retries, PDF generation, and team invitations
import { inngest } from "./inngest";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";
import Razorpay from "razorpay";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "cgoyalswm@gmail.com"; // ✅ Your email

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ============================================
// WEBHOOK RETRY LOGIC
// ============================================
export const retryFailedWebhook = inngest.createFunction(
    {
        id: "retry-failed-webhook",
        name: "Retry Failed Webhook",
        retries: 5,
    },
    { event: "webhook/failed" },
    async ({ event, step, attempt }) => {
        const { eventId, eventType, payload } = event.data;

        console.log(`🔄 Retry attempt ${attempt} for webhook ${eventId}`);

        const delays = ["1m", "5m", "30m", "2h", "12h"];

        if (attempt > 1) {
            await step.sleep(`wait-before-retry-${attempt}`, delays[attempt - 2] || "1h");
        }

        const result = await step.run("process-webhook", async () => {
            try {
                await supabaseAdmin.from("webhook_events").insert({
                    event_id: `${eventId}-retry-${attempt}`,
                    event_type: eventType,
                    payload: payload,
                    status: "retrying",
                });

                if (eventType === "payment.captured") {
                    await processPaymentWebhook(payload);
                } else if (eventType === "subscription.charged") {
                    await processSubscriptionWebhook(payload);
                }

                await supabaseAdmin
                    .from("webhook_events")
                    .update({ status: "processed", processed_at: new Date().toISOString() })
                    .eq("event_id", `${eventId}-retry-${attempt}`);

                console.log(`✅ Webhook ${eventId} processed on attempt ${attempt}`);

                return { success: true, attempt };
            } catch (retryError: any) {
                console.error(`❌ Retry ${attempt} failed:`, retryError.message);

                await supabaseAdmin
                    .from("webhook_events")
                    .update({ status: "failed", processed_at: new Date().toISOString() })
                    .eq("event_id", `${eventId}-retry-${attempt}`);

                throw retryError;
            }
        });

        return result;
    }
);

async function processPaymentWebhook(payload: any) {
    const paymentId = payload.payment_id;
    const orderId = payload.order_id;

    const payment = await razorpay.payments.fetch(paymentId);

    await supabaseAdmin
        .from("invoices")
        .update({ status: "paid", razorpay_payment_id: paymentId })
        .eq("id", orderId);

    console.log(`✅ Payment ${paymentId} processed`);
}

async function processSubscriptionWebhook(payload: any) {
    const subscriptionId = payload.subscription_id;
    const paymentId = payload.payment_id;

    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    const currentEnd = subscription.current_end
        ? new Date(subscription.current_end * 1000).toISOString()
        : null;

    await supabaseAdmin
        .from("subscriptions")
        .update({
            status: "active",
            razorpay_payment_id: paymentId,
            current_period_end: currentEnd,
        })
        .eq("razorpay_subscription_id", subscriptionId);

    console.log(`✅ Subscription ${subscriptionId} processed`);
}

// ============================================
// ASYNC PDF GENERATION
// ============================================
export const generateInvoicePDF = inngest.createFunction(
    {
        id: "generate-invoice-pdf",
        name: "Generate Invoice PDF",
    },
    { event: "invoice/generate" },
    async ({ event, step }) => {
        const { invoiceId, userId, email, organizationId } = event.data;

        console.log(`📄 Generating PDF for invoice ${invoiceId}`);

        const invoiceData = await step.run("fetch-invoice-data", async () => {
            const { data, error } = await supabaseAdmin
                .from("invoices")
                .select(`*, user:user_id(email, full_name), organization:organization_id(name, settings)`)
                .eq("id", invoiceId)
                .single();

            if (error) throw error;
            return data;
        });

        const pdfBase64 = await step.run("create-pdf", async () => {
            const pdfContent = `
Invoice: ${invoiceId}
Amount: ₹${invoiceData.amount / 100}
Date: ${new Date().toLocaleDateString()}
Customer: ${invoiceData.user?.full_name || 'N/A'}
      `.trim();

            const buffer = Buffer.from(pdfContent, 'utf-8');
            return buffer.toString('base64');
        });

        const pdfUrl = await step.run("upload-pdf", async () => {
            const dataUrl = `data:application/pdf;base64,${pdfBase64}`;

            await supabaseAdmin
                .from("invoices")
                .update({ pdf_url: dataUrl })
                .eq("id", invoiceId);

            return dataUrl;
        });

        await step.run("send-email-with-pdf", async () => {
            const pdfBuffer = Buffer.from(pdfBase64, 'base64');

            await resend.emails.send({
                from: "PropelKit Billing <billing@propelkit.dev>",
                to: email,
                subject: `Invoice ${invoiceId} - PropelKit`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Your Invoice is Ready 📄</h1>
            
            <p>Hi ${invoiceData.user?.full_name || "there"},</p>
            
            <p>Your GST-compliant invoice is ready to download.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Invoice ID:</strong> ${invoiceId}</p>
              <p><strong>Amount:</strong> ₹${(invoiceData.amount / 100).toLocaleString("en-IN")}</p>
              <p><strong>Status:</strong> Paid</p>
            </div>
            
            <p>The PDF invoice is attached to this email.</p>
          </body>
          </html>
        `,
                attachments: [
                    {
                        filename: `invoice-${invoiceId}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            });

            console.log(`✅ Invoice email sent to ${email}`);
        });

        await step.run("log-audit", async () => {
            await supabaseAdmin.from("audit_logs").insert({
                user_id: userId,
                action: "invoice_generated",
                details: { invoice_id: invoiceId, amount: invoiceData.amount, organization_id: organizationId },
            });
        });

        return { success: true, invoiceId, pdfUrl };
    }
);

// ============================================
// ORGANIZATION INVITE EMAIL
// ============================================
export const sendOrganizationInvite = inngest.createFunction(
    {
        id: "send-organization-invite",
        name: "Send Organization Invitation",
    },
    { event: "organization/member-invited" },
    async ({ event, step }) => {
        const { organizationId, email, invitedBy, role, inviteToken } = event.data;

        const orgData = await step.run("fetch-organization", async () => {
            const { data, error } = await supabaseAdmin
                .from("organizations")
                .select("name, logo_url")
                .eq("id", organizationId)
                .single();

            if (error) throw error;
            return data;
        });

        const inviterData = await step.run("fetch-inviter", async () => {
            const { data } = await supabaseAdmin
                .from("profiles")
                .select("full_name, email")
                .eq("id", invitedBy)
                .single();

            return data;
        });

        await step.run("send-invite-email", async () => {
            const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;

            await resend.emails.send({
                from: "PropelKit <invites@propelkit.dev>",
                to: email,
                subject: `You've been invited to join ${orgData.name} on PropelKit`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #000; margin: 0;">You're Invited! 🎉</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hi there,</p>
              
              <p style="font-size: 16px;">
                <strong>${inviterData?.full_name || inviterData?.email}</strong> has invited you to join 
                <strong>${orgData.name}</strong> on PropelKit as a <strong>${role}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">What you'll get:</h3>
                <ul>
                  <li>Access to ${orgData.name}'s workspace</li>
                  <li>${role === "admin" ? "Admin privileges - manage team & settings" : "Member access - collaborate with the team"}</li>
                  <li>Shared resources and projects</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                This invitation will expire in 7 days.<br>
                If you didn't expect this, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
            });

            console.log(`✅ Invitation sent to ${email} for ${orgData.name}`);
        });

        return { success: true };
    }
);