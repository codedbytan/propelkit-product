// src/lib/inngest/functions/license.ts
import { inngest } from "../client";
import { createClient } from "@/lib/supabase/supabase-server";
import { Resend } from "resend";
import { brand, formatPrice, generateInvoiceNumber } from "@/config/brand";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handle License Purchase
 * Triggers on: "license.purchased"
 * Actions: Generate invoice PDF, send confirmation email
 */
export const handleLicensePurchase = inngest.createFunction(
    {
        id: "handle-license-purchase",
        name: "License Purchase Handler",
    },
    { event: "license.purchased" },
    async ({ event, step }) => {
        const { userId, licenseId, planKey, email, amount } = event.data;

        console.log(`💳 Processing license purchase: ${licenseId} for ${email}`);

        // Step 1: Get license details
        const licenseData = await step.run("fetch-license-details", async () => {
            const supabase = await createClient();
            const { data: license } = await supabase
                .from("licenses")
                .select("*")
                .eq("id", licenseId)
                .single();

            return license;
        });

        if (!licenseData) {
            throw new Error(`License not found: ${licenseId}`);
        }

        // Step 2: Store invoice record in database
        const invoice = await step.run("create-invoice-record", async () => {
            const supabase = await createClient();
            const { data: invoiceRecord } = await supabase
                .from("invoices")
                .insert({
                    user_id: userId,
                    license_id: licenseId,
                    amount: amount,
                    status: "paid",
                })
                .select()
                .single();

            return {
                invoiceId: invoiceRecord?.id || licenseId,
            };
        });

        // Step 3: Send confirmation email
        await step.run("send-purchase-confirmation", async () => {
            await resend.emails.send({
                from: brand.email.fromSupport,
                to: email,
                subject: `🎉 Your ${brand.product.name} License is Ready!`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #fff; margin: 0;">Payment Successful! 🎉</h1>
                        </div>

                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <p style="font-size: 16px;">
                                Your payment of <strong>${formatPrice(amount)}</strong> has been received!
                            </p>

                            <div style="background: #fff; border: 2px dashed #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="font-size: 14px; margin: 0; color: #6b7280;">License Key:</p>
                                <p style="font-size: 18px; font-weight: bold; color: #000; margin: 10px 0; font-family: monospace;">${licenseId}</p>
                            </div>

                            <h3 style="color: #000;">📦 Next Steps:</h3>
                            <ol style="font-size: 16px; line-height: 1.8;">
                                <li>Download the source code from your dashboard</li>
                                <li>Follow the setup guide</li>
                                <li>Deploy your SaaS in minutes!</li>
                            </ol>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${brand.product.url}/dashboard"
                                   style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Download Now
                                </a>
                            </div>

                            <p style="font-size: 14px; color: #6b7280;">
                                📄 Your GST invoice will be sent separately.
                            </p>

                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                            <p style="font-size: 12px; color: #999; text-align: center;">
                                Need help? Contact us at ${brand.contact.email}<br>
                                © ${new Date().getFullYear()} ${brand.company.legalName}. All rights reserved.
                            </p>
                        </div>
                    </body>
                    </html>
                `,
            });

            console.log(`✅ Purchase confirmation sent to ${email}`);
        });

        // Step 4: Log analytics
        await step.run("log-purchase-analytics", async () => {
            const supabase = await createClient();
            await supabase.from("audit_logs").insert({
                user_id: userId,
                action: "license_purchased",
                details: {
                    license_id: licenseId,
                    plan: planKey,
                    amount: amount / 100,
                    product: brand.product.name
                }
            });

            console.log(`📊 Purchase logged: ${licenseId} | Plan: ${planKey} | Amount: ${formatPrice(amount)}`);
        });

        console.log(`✅ License purchase processing complete: ${licenseId}`);
    }
);
