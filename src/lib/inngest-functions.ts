// src/lib/inngest-functions.ts
// Email sequence functions for your EXISTING @/lib/inngest setup

import { inngest } from './inngest';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// ONBOARDING EMAIL SEQUENCE
// ============================================
export const onboardingSequence = inngest.createFunction(
    {
        id: "onboarding-sequence",
        name: "User Onboarding Email Sequence",
    },
    { event: "user/signed-up" },
    async ({ event, step }) => {
        const { userId, email, name } = event.data;

        // DAY 1: Welcome Email
        await step.run("send-welcome-email", async () => {
            console.log(`📧 Sending welcome email to ${email}`);

            await resend.emails.send({
                from: "PropelKit <support@propelkit.dev>",
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
                Welcome aboard! You're now part of the PropelKit community.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
            </div>
          </body>
          </html>
        `,
            });

            console.log(`✅ Welcome email sent to ${email}`);
        });

        // Wait 2 days
        await step.sleep("wait-2-days", "2d");

        // DAY 3: Tips Email
        await step.run("send-tips-email", async () => {
            console.log(`📧 Sending tips email to ${email}`);

            await resend.emails.send({
                from: "PropelKit <support@propelkit.dev>",
                to: email,
                subject: "5 Tips to Launch Your SaaS Faster 🚀",
                html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>5 Tips to Launch Faster</h1>
            
            <p>Hi ${name || "there"},</p>
            
            <p>Here are 5 tips to help you ship fast:</p>
            
            <ol style="font-size: 16px; line-height: 1.8;">
              <li><strong>Start with Payments</strong> - Set up Razorpay first</li>
              <li><strong>Use Built-in Components</strong> - Don't rebuild everything</li>
              <li><strong>Deploy Early</strong> - Get a real URL on Day 1</li>
              <li><strong>One Feature First</strong> - Launch with your killer feature</li>
              <li><strong>Get Users First</strong> - Share before perfection</li>
            </ol>
            
            <p>Questions? Reply to this email!</p>
          </body>
          </html>
        `,
            });

            console.log(`✅ Tips email sent to ${email}`);
        });

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
            
            <p>Your purchase is confirmed!</p>
            
            <ul>
              <li>✅ Full source code</li>
              <li>✅ Lifetime updates</li>
              <li>✅ Priority support</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="display: inline-block; background: #FACC15; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Download Your Code
              </a>
            </div>
            
            <p>Invoice: ₹${(amount / 100).toLocaleString("en-IN")}</p>
          </body>
          </html>
        `,
            });
        });

        return { success: true };
    }
);