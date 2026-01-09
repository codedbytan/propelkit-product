// src/lib/email.ts
import { Resend } from 'resend';
import { brand, formatPrice } from '@/config/brand';

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// INVOICE EMAIL (for payment receipts)
// ============================================
export async function sendInvoiceEmail(to: string, pdfBuffer: Buffer, invoiceId: string, amount: number) {
  console.log(`📧 PREPARING INVOICE EMAIL for: ${to}`);

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ CRITICAL: RESEND_API_KEY is missing!");
    throw new Error("Email service not configured");
  }

  // Production check
  if (process.env.NODE_ENV === 'production' && brand.email.fromSupport.includes('@resend.dev')) {
    throw new Error('CRITICAL: Update email sender in brand.ts for production!');
  }

  try {
    const data = await resend.emails.send({
      from: brand.email.fromSupport,
      to: to,
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
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #fff; margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Thank you for your purchase! Your payment of <strong>${formatPrice(amount)}</strong> has been processed successfully.
                        </p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Invoice Number</p>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">#${invoiceId}</p>
                        </div>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">
                            Your license key is now active and you can access your dashboard.
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${brand.product.url}/dashboard" 
                               style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                Access Dashboard
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            📄 Your GST-compliant invoice is attached to this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 10px;">
                            Need help? Contact us at ${brand.contact.email}
                        </p>
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © ${new Date().getFullYear()} ${brand.company.legalName}. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>
            `,
      attachments: [
        {
          filename: `${brand.name}-Invoice-${invoiceId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (data.error) {
      console.error("❌ Resend API Error:", data.error);
      throw new Error(data.error.message);
    }

    console.log(`✅ EMAIL SENT SUCCESSFULLY! ID: ${data.data?.id}`);
    return data;

  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

// ============================================
// WELCOME EMAIL (for new users)
// ============================================
export async function sendWelcomeEmail(to: string, userName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: brand.email.fromSupport,
      to: to,
      subject: `Welcome to ${brand.name}! 🎉`,
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #fff; margin: 0;">Welcome to ${brand.name}! 🚀</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">Hi ${userName},</p>
                        
                        <p style="font-size: 16px;">
                            Welcome aboard! We're excited to have you with us.
                        </p>
                        
                        <p style="font-size: 16px;">
                            ${brand.tagline}
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${brand.product.url}/dashboard" 
                               style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Get Started
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            Need help? We're here for you at ${brand.contact.email}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            © ${new Date().getFullYear()} ${brand.company.legalName}
                        </p>
                    </div>
                </body>
                </html>
            `,
    });
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}

// ============================================
// SUBSCRIPTION ACTIVATED EMAIL
// ============================================
export async function sendSubscriptionActivatedEmail(params: {
  to: string;
  organizationName: string;
  planName: string;
  amount: number;
  nextBillingDate: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: brand.email.fromBilling,
      to: params.to,
      subject: `${brand.name} Subscription Activated 🎉`,
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #fff; margin: 0;">Subscription Activated! 🎉</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">
                            Your <strong>${params.planName}</strong> subscription for <strong>${params.organizationName}</strong> is now active!
                        </p>
                        
                        <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <p style="margin: 0;"><strong>Plan:</strong> ${params.planName}</p>
                            <p style="margin: 10px 0;"><strong>Amount:</strong> ${formatPrice(params.amount)}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Next billing:</strong> ${new Date(params.nextBillingDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${brand.product.url}/dashboard" 
                               style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                Access Dashboard
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            Questions? Contact ${brand.contact.email}<br>
                            © ${new Date().getFullYear()} ${brand.company.legalName}
                        </p>
                    </div>
                </body>
                </html>
            `,
    });
  } catch (error) {
    console.error('❌ Failed to send subscription activated email:', error);
  }
}

// ============================================
// SUBSCRIPTION CHARGED EMAIL (Monthly/Yearly)
// ============================================
export async function sendSubscriptionChargedEmail(params: {
  to: string;
  organizationName: string;
  planName: string;
  amount: number;
  nextBillingDate: string;
  invoiceUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing');
    return;
  }

  try {
    await resend.emails.send({
      from: brand.email.fromBilling,
      to: params.to,
      subject: `${brand.name} Payment Receipt`,
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #fff; margin: 0;">Payment Successful ✅</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">
                            Your subscription payment of <strong>${formatPrice(params.amount)}</strong> has been processed successfully.
                        </p>
                        
                        <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Organization:</strong> ${params.organizationName}</p>
                            <p style="margin: 10px 0;"><strong>Plan:</strong> ${params.planName}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Next billing:</strong> ${new Date(params.nextBillingDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        
                        ${params.invoiceUrl ? `
                        <div style="margin: 20px 0; text-align: center;">
                            <a href="${params.invoiceUrl}" 
                               style="display: inline-block; background: #10b981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                                Download Invoice
                            </a>
                        </div>
                        ` : ''}
                        
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            Thank you for your continued support!
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            ${brand.contact.email}<br>
                            © ${new Date().getFullYear()} ${brand.company.legalName}
                        </p>
                    </div>
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
      from: brand.email.fromSupport,
      to: params.to,
      subject: `${brand.name} Subscription Cancelled`,
      html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1>Subscription Cancelled</h1>
                    <p>Your subscription for <strong>${params.organizationName}</strong> has been cancelled.</p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                        <p style="margin: 0;">You'll continue to have access until <strong>${new Date(params.endDate).toLocaleDateString('en-IN')}</strong></p>
                    </div>
                    
                    <p>We're sorry to see you go. If you change your mind, you can reactivate anytime from your dashboard.</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${brand.product.url}/dashboard" 
                           style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        © ${new Date().getFullYear()} ${brand.company.legalName}
                    </p>
                </body>
                </html>
            `,
    });
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error);
  }
}