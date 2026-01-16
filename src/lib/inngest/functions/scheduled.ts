// src/lib/inngest/functions/scheduled.ts
import { inngest } from "../client";
import { createClient } from "@/lib/supabase/supabase-server";
import { Resend } from "resend";
import { brand } from "@/config/brand";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Daily Cleanup Job
 * Runs at 2 AM IST every day
 * Cleans up expired data and sends daily report
 */
export const dailyCleanup = inngest.createFunction(
    {
        id: "daily-cleanup",
        name: "Daily Cleanup Task",
    },
    { cron: "0 2 * * *" }, // 2 AM UTC (7:30 AM IST) every day
    async ({ step }) => {
        console.log("🧹 Starting daily cleanup...");

        // Step 1: Delete expired password reset tokens
        const deletedTokens = await step.run("cleanup-expired-tokens", async () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const supabase = await createClient();

            const { count } = await supabase
                .from("password_reset_tokens")
                .select("*", { count: "exact", head: true })
                .lt("expires_at", yesterday);

            const { error } = await supabase
                .from("password_reset_tokens")
                .delete()
                .lt("expires_at", yesterday);

            if (error) {
                console.error("Error deleting expired tokens:", error);
                return 0;
            }

            console.log(`✅ Deleted ${count || 0} expired tokens`);
            return count || 0;
        });

        // Step 2: Clean up old webhook events (keep last 30 days)
        const deletedWebhooks = await step.run("cleanup-old-webhooks", async () => {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const supabase = await createClient();

            const { count } = await supabase
                .from("webhook_events")
                .select("*", { count: "exact", head: true })
                .lt("created_at", thirtyDaysAgo);

            const { error } = await supabase
                .from("webhook_events")
                .delete()
                .lt("created_at", thirtyDaysAgo);

            if (error) {
                console.error("Error cleaning webhook events:", error);
                return 0;
            }

            console.log(`✅ Cleaned ${count || 0} old webhook events`);
            return count || 0;
        });

        // Step 3: Generate daily stats
        const stats = await step.run("generate-daily-stats", async () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const supabase = await createClient();

            // New users in last 24h
            const { count: newUsers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .gte("created_at", yesterday);

            // New licenses in last 24h
            const { count: newLicenses } = await supabase
                .from("licenses")
                .select("*", { count: "exact", head: true })
                .gte("created_at", yesterday);

            // Total revenue in last 24h
            const { data: revenueData } = await supabase
                .from("licenses")
                .select("amount")
                .gte("created_at", yesterday);

            const totalRevenue = revenueData?.reduce((sum, license) => sum + (license.amount || 0), 0) || 0;

            return {
                newUsers: newUsers || 0,
                newLicenses: newLicenses || 0,
                totalRevenue,
                deletedTokens,
                deletedWebhooks,
            };
        });

        // Step 4: Send daily report to admin
        await step.run("send-daily-report", async () => {
            const adminEmail = process.env.ADMIN_EMAIL || brand.contact.email;

            try {
                await resend.emails.send({
                    from: `${brand.name} Reports <${brand.contact.email}>`,
                    to: adminEmail,
                    subject: `📊 Daily Report - ${new Date().toLocaleDateString("en-IN")}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #000;">Daily Report</h1>
                            <p style="font-size: 16px;">Here's what happened in the last 24 hours:</p>

                            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h2 style="margin-top: 0; color: #000;">📈 Key Metrics</h2>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 10px 0; font-size: 16px;">New Users</td>
                                        <td style="padding: 10px 0; font-size: 20px; font-weight: bold; text-align: right;">${stats.newUsers}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 10px 0; font-size: 16px;">New Licenses</td>
                                        <td style="padding: 10px 0; font-size: 20px; font-weight: bold; text-align: right;">${stats.newLicenses}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 10px 0; font-size: 16px;">Total Revenue</td>
                                        <td style="padding: 10px 0; font-size: 20px; font-weight: bold; text-align: right; color: #10b981;">₹${(stats.totalRevenue / 100).toLocaleString("en-IN")}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 10px 0; font-size: 16px;">Deleted Tokens</td>
                                        <td style="padding: 10px 0; font-size: 16px; text-align: right;">${stats.deletedTokens}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; font-size: 16px;">Cleaned Webhooks</td>
                                        <td style="padding: 10px 0; font-size: 16px; text-align: right;">${stats.deletedWebhooks}</td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${brand.product.url}/admin"
                                   style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                                    View Admin Dashboard
                                </a>
                            </div>
                        </body>
                        </html>
                    `,
                });

                console.log(`✅ Daily report sent to ${adminEmail}`);
            } catch (error) {
                console.error("Error sending daily report:", error);
            }
        });

        console.log("✅ Daily cleanup complete!");
    }
);
