import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// INVOICE EMAIL (for payment receipts)
// ============================================
export async function sendInvoiceEmail(to: string, pdfBuffer: Buffer, invoiceId: string) {
  console.log(`📧 PREPARING INVOICE EMAIL for: ${to}`);

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ CRITICAL: RESEND_API_KEY is missing!");
    throw new Error("Email service not configured");
  }

  // For testing: redirect all emails to your verified address
  const FORCE_TO_ME = false; // Set to true during testing
  const MY_EMAIL = "support@yourdomain.com";
  const recipient = FORCE_TO_ME ? MY_EMAIL : to;

  // Production check
  if (process.env.NODE_ENV === 'production' && to.includes('@resend.dev')) {
    throw new Error('CRITICAL: Update email sender in lib/email.ts for production!');
  }

  try {
    const data = await resend.emails.send({
      from: 'Acme SaaS <onboarding@resend.dev>', // ⚠️ Change after domain verification
      to: recipient,
      subject: `Payment Successful - Invoice #${invoiceId}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Successful</title>
                </head>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #000; margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Thank you for your purchase! Your payment has been processed successfully.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FACC15;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Invoice Number</p>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">#${invoiceId}</p>
                        </div>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Your license key is now active and you can access your dashboard.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                               style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Your GST invoice is attached to this email. Please save it for your records.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            Need help? Contact us at support@yourdomain.com<br>
                            © ${new Date().getFullYear()} Acme SaaS. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
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

    console.log(`✅ INVOICE EMAIL SENT! ID: ${data.data?.id}`);
    return data;

  } catch (error) {
    console.error("❌ Error sending invoice email:", error);
    throw error;
  }
}

// ============================================
// INVITE EMAIL (for organization invitations)
// ============================================
export async function sendInviteEmail(params: {
  to: string;
  organizationName: string;
  inviteToken: string;
  role: 'admin' | 'member';
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${params.inviteToken}`;

  try {
    await resend.emails.send({
      from: 'Acme SaaS <onboarding@resend.dev>',
      to: params.to,
      subject: `You've been invited to join ${params.organizationName}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #000; margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">Hi there,</p>
                        
                        <p style="font-size: 16px;">
                            You've been invited to join <strong>${params.organizationName}</strong> as a <strong>${params.role}</strong>.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteUrl}" 
                               style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Accept Invitation
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            This invitation will expire in 7 days.<br>
                            If the button doesn't work, copy and paste this link:<br>
                            <a href="${inviteUrl}" style="color: #FACC15; word-break: break-all;">${inviteUrl}</a>
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © ${new Date().getFullYear()} Acme SaaS. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
            `,
    });

    console.log('✅ Invite email sent to:', params.to);
  } catch (error) {
    console.error('❌ Failed to send invite email:', error);
    throw error;
  }
}

// ============================================
// WELCOME EMAIL (for new organizations)
// ============================================
export async function sendOrganizationWelcomeEmail(params: {
  to: string;
  organizationName: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: 'Acme SaaS <onboarding@resend.dev>',
      to: params.to,
      subject: `Welcome to ${params.organizationName}!`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #000; margin: 0; font-size: 28px;">🚀 Welcome to Acme SaaS!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">Hi there,</p>
                        
                        <p style="font-size: 16px;">
                            Your organization <strong>${params.organizationName}</strong> is now set up and ready to go!
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="margin-top: 0; color: #000; font-size: 18px;">🎯 Next Steps:</h2>
                            <ul style="padding-left: 20px;">
                                <li style="margin-bottom: 10px;">Invite team members</li>
                                <li style="margin-bottom: 10px;">Configure your organization settings</li>
                                <li style="margin-bottom: 10px;">Start building amazing things!</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                               style="display: inline-block; background: #000; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            Need help? Contact us at support@yourdomain.com<br>
                            © ${new Date().getFullYear()} Acme SaaS. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
            `,
    });

    console.log('✅ Welcome email sent to:', params.to);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}

// ============================================
// SUBSCRIPTION CHARGED EMAIL (recurring billing)
// ============================================
export async function sendSubscriptionChargedEmail(params: {
  to: string;
  amount: number;
  planName: string;
  nextBillingDate: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: 'Acme SaaS <onboarding@resend.dev>',
      to: params.to,
      subject: `Payment Received - ${params.planName}`,
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Payment Received</h1>
                    <p>Your subscription payment of <strong>₹${(params.amount / 100).toLocaleString('en-IN')}</strong> has been processed successfully.</p>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Plan:</strong> ${params.planName}</p>
                        <p style="margin: 10px 0 0 0;"><strong>Next billing date:</strong> ${new Date(params.nextBillingDate).toLocaleDateString()}</p>
                    </div>
                    
                    <p>Thank you for your continued support!</p>
                </body>
                </html>
            `,
    });
  } catch (error) {
    console.error('❌ Failed to send subscription charged email:', error);
  }
}

// ============================================
// SUBSCRIPTION CANCELLED EMAIL
// ============================================
export async function sendSubscriptionCancelledEmail(params: {
  to: string;
  organizationName: string;
  endDate: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: 'Acme SaaS <onboarding@resend.dev>',
      to: params.to,
      subject: 'Subscription Cancelled',
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Subscription Cancelled</h1>
                    <p>Your subscription for <strong>${params.organizationName}</strong> has been cancelled.</p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0;">You'll continue to have access until <strong>${new Date(params.endDate).toLocaleDateString()}</strong></p>
                    </div>
                    
                    <p>We're sorry to see you go. If you change your mind, you can reactivate anytime from your dashboard.</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                           style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                            Go to Dashboard
                        </a>
                    </div>
                </body>
                </html>
            `,
    });
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error);
  }
}