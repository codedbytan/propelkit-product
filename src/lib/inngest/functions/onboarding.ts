// src/lib/inngest/functions/onboarding.ts
import { inngest } from "../client";
import { Resend } from "resend";
import { brand } from "@/config/brand";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Onboarding Email Sequence
 * Triggers on: "user.signed-up"
 * Sends: Day 1, Day 3, Day 7 emails
 */
export const onboardingSequence = inngest.createFunction(
    {
        id: "onboarding-sequence",
        name: "User Onboarding Email Sequence",
    },
    { event: "user.signed-up" },
    async ({ event, step }) => {
        const { userId, email, name } = event.data;

        // DAY 1: Welcome Email
        await step.run("send-day-1-welcome", async () => {
            console.log(`📧 Day 1: Sending welcome email to ${email}`);

            await resend.emails.send({
                from: brand.email.fromSupport,
                to: email,
                subject: `Welcome to ${brand.product.name}! 🚀`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: #000; margin: 0;">Welcome to ${brand.product.name}! 🚀</h1>
                        </div>

                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <p style="font-size: 16px;">Hi ${name || "there"},</p>

                            <p style="font-size: 16px;">
                                Thanks for signing up! You're now part of the ${brand.product.name} community.
                            </p>

                            <h3 style="color: #000;">🎯 Quick Start Guide:</h3>
                            <ol style="font-size: 16px; line-height: 1.8;">
                                <li>Complete your profile</li>
                                <li>Explore the dashboard</li>
                                <li>Purchase a license to unlock all features</li>
                            </ol>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${brand.product.url}/dashboard"
                                   style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Go to Dashboard
                                </a>
                            </div>

                            <p style="font-size: 14px; color: #6b7280;">
                                Need help? Reply to this email or visit our <a href="${brand.social.discord}">Discord community</a>
                            </p>
                        </div>
                    </body>
                    </html>
                `,
            });
        });

        // Wait 2 days
        await step.sleep("wait-2-days", "2d");

        // DAY 3: Tips & Best Practices
        await step.run("send-day-3-tips", async () => {
            console.log(`📧 Day 3: Sending tips email to ${email}`);

            await resend.emails.send({
                from: brand.email.fromSupport,
                to: email,
                subject: `💡 Pro Tips to Ship Faster with ${brand.product.name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #000;">Quick Tips to Get the Most Out of ${brand.product.name}</h1>

                        <p style="font-size: 16px;">Hi ${name || "there"},</p>

                        <p style="font-size: 16px;">Here are 3 things successful founders do with ${brand.product.name}:</p>

                        <ol style="font-size: 16px; line-height: 1.8;">
                            <li><strong>Customize the branding first</strong> - Replace logos, colors, and text to make it yours</li>
                            <li><strong>Set up payments early</strong> - Configure Razorpay and test the payment flow</li>
                            <li><strong>Deploy quickly</strong> - Get it live on Vercel in under 10 minutes</li>
                        </ol>

                        <p style="font-size: 16px;">Need help? Just reply to this email!</p>
                    </body>
                    </html>
                `,
            });
        });

        // Wait 4 more days
        await step.sleep("wait-4-days", "4d");

        // DAY 7: Check-in & Upgrade Prompt
        await step.run("send-day-7-checkin", async () => {
            console.log(`📧 Day 7: Sending check-in email to ${email}`);

            await resend.emails.send({
                from: brand.email.fromSupport,
                to: email,
                subject: "🎯 How's Your SaaS Coming Along?",
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #000;">We'd Love Your Feedback!</h1>

                        <p style="font-size: 16px;">Hi ${name || "there"},</p>

                        <p style="font-size: 16px;">
                            It's been a week since you joined ${brand.product.name}. How's your experience so far?
                        </p>

                        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 16px;">
                                <strong>Quick Question:</strong> What's the #1 thing holding you back from launching?
                            </p>
                        </div>

                        <p style="font-size: 16px;">Reply to this email - we read every response!</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${brand.product.url}/pricing"
                               style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                View Plans
                            </a>
                        </div>
                    </body>
                    </html>
                `,
            });
        });

        console.log(`✅ Onboarding sequence completed for ${email}`);
    }
);
