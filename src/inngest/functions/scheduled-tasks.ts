// src/inngest/functions/scheduled-tasks.ts
import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// DAILY CLEANUP TASK (2 AM IST)
// ============================================
export const dailyCleanup = inngest.createFunction(
    {
        id: "daily-cleanup",
        name: "Daily Cleanup Task",
    },
    { cron: "0 2 * * *" }, // Every day at 2 AM
    async ({ step }) => {
        console.log("🧹 Starting daily cleanup...");

        // ========================================
        // 1. Delete expired organization invites
        // ========================================
        const deletedInvites = await step.run("cleanup-expired-invites", async () => {
            const { data, error } = await supabaseAdmin
                .from("organization_invites")
                .delete()
                .lt("expires_at", new Date().toISOString())
                .is("accepted_at", null);

            if (error) {
                console.error("Error deleting expired invites:", error);
                return 0;
            }

            const count = data?.length || 0;
            console.log(`✅ Deleted ${count} expired invites`);
            return count;
        });

        // ========================================
        // 2. Archive old webhook events (older than 30 days)
        // ========================================
        const archivedWebhooks = await step.run("archive-old-webhooks", async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data, error } = await supabaseAdmin
                .from("webhook_events")
                .delete()
                .lt("created_at", thirtyDaysAgo.toISOString())
                .eq("status", "processed");

            if (error) {
                console.error("Error archiving webhooks:", error);
                return 0;
            }

            const count = data?.length || 0;
            console.log(`✅ Archived ${count} old webhook events`);
            return count;
        });

        // ========================================
        // 3. Archive old audit logs (older than 90 days)
        // ========================================
        const archivedLogs = await step.run("archive-old-audit-logs", async () => {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const { data, error } = await supabaseAdmin
                .from("audit_logs")
                .delete()
                .lt("created_at", ninetyDaysAgo.toISOString());

            if (error) {
                console.error("Error archiving audit logs:", error);
                return 0;
            }

            const count = data?.length || 0;
            console.log(`✅ Archived ${count} old audit logs`);
            return count;
        });

        // ========================================
        // 4. Send cleanup summary to admin
        // ========================================
        await step.run("send-cleanup-summary", async () => {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@propelkit.dev";

            await resend.emails.send({
                from: "PropelKit System <system@propelkit.dev>",
                to: adminEmail,
                subject: `Daily Cleanup Summary - ${new Date().toLocaleDateString()}`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: monospace; padding: 20px;">
            <h2>Daily Cleanup Completed ✅</h2>
            <p>Date: ${new Date().toISOString()}</p>
            
            <h3>Summary:</h3>
            <ul>
              <li>Expired invites deleted: ${deletedInvites}</li>
              <li>Old webhooks archived: ${archivedWebhooks}</li>
              <li>Old audit logs archived: ${archivedLogs}</li>
            </ul>
            
            <p style="color: #666; font-size: 12px;">
              This is an automated message from PropelKit cleanup service.
            </p>
          </body>
          </html>
        `,
            });
        });

        return {
            success: true,
            deletedInvites,
            archivedWebhooks,
            archivedLogs,
        };
    }
);

// ============================================
// WEEKLY ANALYTICS REPORT (Monday 9 AM IST)
// ============================================
export const weeklyAnalyticsReport = inngest.createFunction(
    {
        id: "weekly-analytics-report",
        name: "Weekly Analytics Report",
    },
    { cron: "0 9 * * 1" }, // Every Monday at 9 AM
    async ({ step }) => {
        console.log("📊 Generating weekly analytics report...");

        // Get date range (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // ========================================
        // 1. New users this week
        // ========================================
        const newUsersCount = await step.run("count-new-users", async () => {
            const { count, error } = await supabaseAdmin
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .gte("created_at", startDate.toISOString());

            if (error) {
                console.error("Error counting new users:", error);
                return 0;
            }

            return count || 0;
        });

        // ========================================
        // 2. Revenue this week
        // ========================================
        const weeklyRevenue = await step.run("calculate-weekly-revenue", async () => {
            const { data, error } = await supabaseAdmin
                .from("invoices")
                .select("amount")
                .eq("status", "paid")
                .gte("created_at", startDate.toISOString());

            if (error) {
                console.error("Error calculating revenue:", error);
                return 0;
            }

            const total = data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
            return total / 100; // Convert from paise to rupees
        });

        // ========================================
        // 3. Active subscriptions
        // ========================================
        const activeSubscriptions = await step.run(
            "count-active-subscriptions",
            async () => {
                const { count, error } = await supabaseAdmin
                    .from("subscriptions")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "active");

                if (error) {
                    console.error("Error counting subscriptions:", error);
                    return 0;
                }

                return count || 0;
            }
        );

        // ========================================
        // 4. Failed payments
        // ========================================
        const failedPayments = await step.run("count-failed-payments", async () => {
            const { count, error } = await supabaseAdmin
                .from("webhook_events")
                .select("*", { count: "exact", head: true })
                .eq("status", "failed")
                .gte("created_at", startDate.toISOString());

            if (error) {
                console.error("Error counting failed payments:", error);
                return 0;
            }

            return count || 0;
        });

        // ========================================
        // 5. Total organizations
        // ========================================
        const totalOrganizations = await step.run(
            "count-organizations",
            async () => {
                const { count, error } = await supabaseAdmin
                    .from("organizations")
                    .select("*", { count: "exact", head: true })
                    .is("deleted_at", null);

                if (error) {
                    console.error("Error counting organizations:", error);
                    return 0;
                }

                return count || 0;
            }
        );

        // ========================================
        // 6. Send report to admin
        // ========================================
        await step.run("send-analytics-email", async () => {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@propelkit.dev";

            await resend.emails.send({
                from: "PropelKit Analytics <analytics@propelkit.dev>",
                to: adminEmail,
                subject: `📊 Weekly Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FACC15;">Weekly Analytics Report 📊</h1>
            
            <p><strong>Week:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #333;">Key Metrics</h2>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #FACC15;">
                  <h3 style="margin: 0; font-size: 32px; color: #000;">${newUsersCount}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">New Users</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981;">
                  <h3 style="margin: 0; font-size: 32px; color: #000;">₹${weeklyRevenue.toLocaleString("en-IN")}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">Revenue</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
                  <h3 style="margin: 0; font-size: 32px; color: #000;">${activeSubscriptions}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">Active Subscriptions</p>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #EF4444;">
                  <h3 style="margin: 0; font-size: 32px; color: #000;">${failedPayments}</h3>
                  <p style="margin: 5px 0 0 0; color: #666;">Failed Payments</p>
                </div>
              </div>
              
              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #8B5CF6;">
                <h3 style="margin: 0; font-size: 32px; color: #000;">${totalOrganizations}</h3>
                <p style="margin: 5px 0 0 0; color: #666;">Total Organizations</p>
              </div>
            </div>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <h3 style="margin-top: 0;">📈 Insights</h3>
              <ul style="margin: 10px 0;">
                <li>User growth: ${newUsersCount} new signups this week</li>
                <li>MRR (estimated): ₹${(weeklyRevenue * 4).toLocaleString("en-IN")}/month</li>
                <li>Conversion rate: ${activeSubscriptions > 0 ? ((activeSubscriptions / (newUsersCount || 1)) * 100).toFixed(1) : 0}%</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                 style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Full Dashboard
              </a>
            </p>
          </body>
          </html>
        `,
            });
        });

        return {
            success: true,
            metrics: {
                newUsers: newUsersCount,
                revenue: weeklyRevenue,
                activeSubscriptions,
                failedPayments,
                totalOrganizations,
            },
        };
    }
);

// ============================================
// MONTHLY BILLING CYCLE (1st of month, 10 AM IST)
// ============================================
export const monthlyBillingCycle = inngest.createFunction(
    {
        id: "monthly-billing-cycle",
        name: "Monthly Billing Cycle",
    },
    { cron: "0 10 1 * *" }, // 1st day of month at 10 AM
    async ({ step }) => {
        console.log("💳 Processing monthly billing cycle...");

        // ========================================
        // 1. Get all active recurring subscriptions
        // ========================================
        const subscriptions = await step.run(
            "get-active-subscriptions",
            async () => {
                const { data, error } = await supabaseAdmin
                    .from("subscriptions")
                    .select("*, organization:organization_id(name)")
                    .eq("status", "active")
                    .eq("type", "recurring");

                if (error) {
                    console.error("Error fetching subscriptions:", error);
                    return [];
                }

                return data || [];
            }
        );

        console.log(`Found ${subscriptions.length} active recurring subscriptions`);

        // ========================================
        // 2. Calculate MRR (Monthly Recurring Revenue)
        // ========================================
        const mrr = await step.run("calculate-mrr", async () => {
            const total = subscriptions.reduce((sum, sub) => {
                // If yearly, divide by 12 for monthly
                const monthlyAmount =
                    sub.plan_id?.includes("yearly") ? sub.amount / 12 : sub.amount;
                return sum + monthlyAmount;
            }, 0);

            return total / 100; // Convert to rupees
        });

        // ========================================
        // 3. Send monthly report to admin
        // ========================================
        await step.run("send-monthly-report", async () => {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@propelkit.dev";
            const monthName = new Date().toLocaleString("default", { month: "long" });

            await resend.emails.send({
                from: "PropelKit Billing <billing@propelkit.dev>",
                to: adminEmail,
                subject: `💰 Monthly Billing Report - ${monthName}`,
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Monthly Billing Report 💰</h1>
            
            <p><strong>Month:</strong> ${monthName} ${new Date().getFullYear()}</p>
            
            <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; border-radius: 10px; color: #000; text-align: center;">
              <h2 style="margin: 0; font-size: 48px;">₹${mrr.toLocaleString("en-IN")}</h2>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Monthly Recurring Revenue</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3>Subscription Breakdown:</h3>
              <ul>
                <li><strong>Active subscriptions:</strong> ${subscriptions.length}</li>
                <li><strong>Annual MRR:</strong> ₹${(mrr * 12).toLocaleString("en-IN")}</li>
              </ul>
            </div>
          </body>
          </html>
        `,
            });
        });

        return {
            success: true,
            subscriptionCount: subscriptions.length,
            mrr,
            annualProjection: mrr * 12,
        };
    }
);