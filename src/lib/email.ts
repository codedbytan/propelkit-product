// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ... your existing sendInvoiceEmail function ...

// ✅ ADD THIS NEW FUNCTION
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
      from: 'onboarding@resend.dev', // Change after domain verification
      to: params.to,
      subject: `You've been invited to join ${params.organizationName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You're invited!</h1>
          <p>You've been invited to join <strong>${params.organizationName}</strong> as a <strong>${params.role}</strong>.</p>
          
          <div style="margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in 7 days.<br/>
            If the button doesn't work, copy this link: <br/>
            <a href="${inviteUrl}">${inviteUrl}</a>
          </p>
        </div>
      `,
    });

    console.log('✅ Invite email sent to:', params.to);
  } catch (error) {
    console.error('❌ Failed to send invite email:', error);
    throw error;
  }
}

// ✅ ADD THIS: Welcome email for new organizations
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
      from: 'onboarding@resend.dev',
      to: params.to,
      subject: `Welcome to ${params.organizationName}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>🎉 Welcome to Acme SaaS!</h1>
          <p>Your organization <strong>${params.organizationName}</strong> is now set up.</p>
          
          <h2>Next Steps:</h2>
          <ul>
            <li>Invite team members</li>
            <li>Configure your settings</li>
            <li>Start building!</li>
          </ul>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Go to Dashboard
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
}