// src/inngest/functions/email-sequences.ts
import { inngest } from "../client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendWelcomeEmail } from "@/lib/email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// ONBOARDING EMAIL SEQUENCE
// ============================================
// Day 1: Welcome + Getting Started
// Day 3: Tips & Best Practices  
// Day 7: Upgrade Prompt (for trial/free users)
// ============================================

export const onboardingSequence = inngest.createFunction(
    {
        id: "onboarding-sequence",
        name: "User Onboarding Email Sequence",
    },
    { event: "user/signed-up" },
    async ({ event, step }) => {
        const { userId, email, name } = event.data;

        // ========================================
        // DAY 1: Welcome Email
        // ========================================
        await step.run("send-welcome-email", async () => {
            console.log(`📧 Sending welcome email to ${email}`);

            await resend.emails.send({
                from: "PropelKit <onboarding@propelkit.dev>",
                to: email,
                subject: "Welcome to PropelKit! 🚀",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #000; margin: 0;">Welcome to PropelKit! 🚀</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hi ${name || "there"},</p>
              
              <p style="font-size: 16px;">
                Welcome aboard! You're now part of the PropelKit community - the fastest way to build and launch SaaS products in India.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">🎯 Get Started in 3 Steps:</h3>
                <ol style="padding-left: 20px;">
                  <li style="margin-bottom: 10px;"><strong>Set up your environment</strong> - Configure .env.local</li>
                  <li style="margin-bottom: 10px;"><strong>Customize your app</strong> - Update branding & content</li>
                  <li style="margin-bottom: 10px;"><strong>Deploy to production</strong> - Launch on Vercel</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Need help? Check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs">documentation</a> or reply to this email.
              </p>
            </div>
          </body>
          </html>
        `,
            });

            console.log(`✅ Welcome email sent to ${email}`);
        });

        // ========================================
        // Wait 2 days
        // ========================================
        await step.sleep("wait-2-days", "2d");

        // Check if user has upgraded before sending more emails
        const { data: subscription } = await step.run(
            "check-subscription-day3",
            async () => {
                return await supabaseAdmin
                    .from("subscriptions")
                    .select("status, plan_id")
                    .eq("user_id", userId)
                    .eq("status", "active")
                    .maybeSingle();
            }
        );

        // ========================================
        // DAY 3: Tips & Best Practices
        // ========================================
        if (!subscription) {
            // User hasn't upgraded yet
            await step.run("send-tips-email", async () => {
                console.log(`📧 Sending tips email to ${email}`);

                await resend.emails.send({
                    from: "PropelKit <onboarding@propelkit.dev>",
                    to: email,
                    subject: "5 Tips to Launch Your SaaS Faster 🚀",
                    html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>5 Tips to Launch Faster</h1>
              
              <p>Hi ${name || "there"},</p>
              
              <p>Here are 5 battle-tested tips to help you ship your SaaS in days, not months:</p>
              
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>1. Start with Payments 💳</h3>
                <p>Set up Razorpay first. Having a payment flow forces you to clarify your value proposition.</p>
                
                <h3>2. Use the Built-in Components 🎨</h3>
                <p>Don't rebuild forms, modals, or tables. Use what's included and customize later.</p>
                
                <h3>3. Deploy Early & Often 🚀</h3>
                <p>Deploy to Vercel on Day 1. Real URLs motivate faster than localhost.</p>
                
                <h3>4. Focus on One Feature 🎯</h3>
                <p>Launch with ONE killer feature. Add the rest based on user feedback.</p>
                
                <h3>5. Get Users Before Code 👥</h3>
                <p>Share your landing page on Twitter/Reddit ASAP. Feedback beats perfection.</p>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                Questions? Reply to this email - we read every message!
              </p>
            </body>
            </html>
          `,
                });

                console.log(`✅ Tips email sent to ${email}`);
            });

            // ========================================
            // Wait 4 more days
            // ========================================
            await step.sleep("wait-4-days", "4d");

            // Check again before upgrade prompt
            const { data: subscriptionDay7 } = await step.run(
                "check-subscription-day7",
                async () => {
                    return await supabaseAdmin
                        .from("subscriptions")
                        .select("status, plan_id")
                        .eq("user_id", userId)
                        .eq("status", "active")
                        .maybeSingle();
                }
            );

            // ========================================
            // DAY 7: Upgrade Prompt
            // ========================================
            if (!subscriptionDay7) {
                await step.run("send-upgrade-email", async () => {
                    console.log(`📧 Sending upgrade email to ${email}`);

                    await resend.emails.send({
                        from: "PropelKit <onboarding@propelkit.dev>",
                        to: email,
                        subject: "Ready to go Pro? 🌟",
                        html: `
              <!DOCTYPE html>
              <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>Unlock the Full Power of PropelKit 🌟</h1>
                
                <p>Hi ${name || "there"},</p>
                
                <p>You've been exploring PropelKit for a week now. Ready to unlock everything?</p>
                
                <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; border-radius: 10px; margin: 20px 0; color: #000;">
                  <h2 style="margin-top: 0;">Pro Plan Includes:</h2>
                  <ul style="font-size: 16px; line-height: 1.8;">
                    <li>✅ Lifetime access to all code</li>
                    <li>✅ Lifetime updates</li>
                    <li>✅ Priority support</li>
                    <li>✅ Production deployment guide</li>
                    <li>✅ GST-compliant invoices</li>
                  </ul>
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
                       style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Upgrade Now
                    </a>
                  </div>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  Limited time: Get 20% off with code <strong>LAUNCH20</strong>
                </p>
              </body>
              </html>
            `,
                    });

                    console.log(`✅ Upgrade email sent to ${email}`);
                });
            }
        }

        return { success: true, userId, email };
    }
);

// ============================================
// POST-PURCHASE EMAIL
// ============================================
export const postPurchaseSequence = inngest.createFunction(
    {
        id: "post-purchase-sequence",
        name: "Post-Purchase Email Sequence",
    },
    { event: "user/upgraded" },
    async ({ event, step }) => {
        const { userId, email, planId, amount } = event.data;

        // Send immediate thank you
        await step.run("send-thank-you", async () => {
            console.log(`📧 Sending thank you email to ${email}`);

            await resend.emails.send({
                from: "PropelKit <support@propelkit.dev>",
                to: email,
                subject: "Thank you for your purchase! 🎉",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Welcome to PropelKit Pro! 🎉</h1>
            
            <p>Your purchase is confirmed. You now have lifetime access to:</p>
            
            <ul>
              <li>✅ Full source code</li>
              <li>✅ All future updates</li>
              <li>✅ Priority support</li>
              <li>✅ Production deployment guide</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="display: inline-block; background: #FACC15; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Download Your Code
              </a>
            </div>
            
            <p>Invoice: ₹${(amount / 100).toLocaleString("en-IN")}</p>
            <p>Your GST invoice has been sent separately.</p>
          </body>
          </html>
        `,
            });
        });

        // Wait 1 day
        await step.sleep("wait-1-day", "1d");

        // Send setup guide
        await step.run("send-setup-guide", async () => {
            await resend.emails.send({
                from: "PropelKit <support@propelkit.dev>",
                to: email,
                subject: "Your Setup Guide is Ready 📚",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Let's Get You Deployed 🚀</h1>
            
            <p>Here's your step-by-step deployment guide:</p>
            
            <ol style="font-size: 16px; line-height: 1.8;">
              <li><strong>Download the code</strong> from your dashboard</li>
              <li><strong>Set up environment variables</strong> (Supabase, Razorpay, Resend)</li>
              <li><strong>Deploy to Vercel</strong> (one-click deployment)</li>
              <li><strong>Configure your domain</strong></li>
              <li><strong>Launch! 🎉</strong></li>
            </ol>
            
            <p>Need help? Our community is here: <a href="${process.env.NEXT_PUBLIC_APP_URL}/community">Join Discord</a></p>
          </body>
          </html>
        `,
            });
        });

        return { success: true };
    }
);

// ============================================
// SUBSCRIPTION RENEWAL NOTIFICATION
// ============================================
export const subscriptionRenewalReminder = inngest.createFunction(
    {
        id: "subscription-renewal-reminder",
        name: "Subscription Renewal Reminder",
    },
    { event: "subscription/charged" },
    async ({ event, step }) => {
        const { email, amount, planId } = event.data;

        await step.run("send-renewal-notification", async () => {
            await resend.emails.send({
                from: "PropelKit <billing@propelkit.dev>",
                to: email,
                subject: "Your subscription has been renewed ✅",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Payment Successful ✅</h1>
            
            <p>Your ${planId} subscription has been renewed.</p>
            
            <p><strong>Amount:</strong> ₹${(amount / 100).toLocaleString("en-IN")}</p>
            
            <p>Your GST invoice is attached.</p>
            
            <p>Thank you for being a PropelKit customer!</p>
          </body>
          </html>
        `,
            });
        });
    }
);