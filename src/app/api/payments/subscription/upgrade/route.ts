// src/app/api/subscription/upgrade/route.ts
// ✅ COMPLETE FIX - All TypeScript errors resolved
// COMPLETE PLAN SWITCHING - Upgrade/Downgrade subscriptions

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import Razorpay from "razorpay";
import { z } from "zod";
import { brand, formatPrice } from "@/config/brand";

// ✅ FIXED: Correct Razorpay instantiation
const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Type definitions
type OrganizationMembership = {
    role: string;
    organization: { name: string } | { name: string }[] | null;
};

// Available plans
const PLANS = {
    starter_monthly: {
        name: "Starter Monthly",
        amount: 99900, // ₹999/month
        interval: 'monthly',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_MONTHLY,
    },
    pro_yearly: {
        name: "Pro Yearly",
        amount: 2999900, // ₹29,999/year
        interval: 'yearly',
        razorpay_plan_id: process.env.NEXT_PUBLIC_RAZORPAY_PLAN_YEARLY,
    },
} as const;

const upgradeSchema = z.object({
    organizationId: z.string().uuid(),
    newPlanKey: z.enum(['starter_monthly', 'pro_yearly']),
});

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate request
        const body = await request.json();
        const validation = upgradeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request", details: validation.error },
                { status: 400 }
            );
        }

        const { organizationId, newPlanKey } = validation.data;
        const newPlan = PLANS[newPlanKey];

        // 3. Verify plan is configured
        if (!newPlan.razorpay_plan_id) {
            return NextResponse.json({
                error: `${newPlanKey} is not configured. Please contact support.`
            }, { status: 500 });
        }

        // 4. Verify user is owner/admin of organization
        const { data: membership } = await supabaseAdmin
            .from('organization_members')
            .select('role, organization:organization_id(name)')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single() as { data: OrganizationMembership | null };

        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
            return NextResponse.json(
                { error: "You don't have permission to change this subscription" },
                { status: 403 }
            );
        }

        const organizationName = (Array.isArray(membership.organization)
            ? membership.organization[0]?.name
            : membership.organization?.name) || 'Your Organization';

        // 5. Get current active subscription
        const { data: currentSubscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .maybeSingle();

        if (subError || !currentSubscription) {
            return NextResponse.json(
                { error: "No active subscription found. Please subscribe first." },
                { status: 404 }
            );
        }

        if (!currentSubscription.razorpay_subscription_id) {
            return NextResponse.json(
                { error: "Invalid subscription data" },
                { status: 500 }
            );
        }

        // 6. Check if trying to switch to the same plan
        if (currentSubscription.plan_id === newPlanKey) {
            return NextResponse.json(
                { error: `You're already on the ${newPlan.name} plan` },
                { status: 400 }
            );
        }

        // 7. Update subscription in Razorpay
        try {
            // Razorpay subscription update with new plan
            const updatedSubscription = await razorpay.subscriptions.update(
                currentSubscription.razorpay_subscription_id,
                {
                    plan_id: newPlan.razorpay_plan_id,
                    // Razorpay handles proration automatically
                    customer_notify: 1, // Notify customer of change
                }
            );

            console.log(`✅ Updated subscription: ${updatedSubscription.id} to ${newPlanKey}`);

            // 8. Update database
            await supabaseAdmin
                .from('subscriptions')
                .update({
                    plan_id: newPlanKey,
                    razorpay_plan_id: newPlan.razorpay_plan_id,
                    amount: newPlan.amount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', currentSubscription.id);

            // 9. Update organization
            await supabaseAdmin
                .from('organizations')
                .update({
                    subscription_plan: newPlanKey,
                })
                .eq('id', organizationId);

            // 10. Send email notification
            if (user.email) {
                await sendPlanChangedEmail({
                    to: user.email,
                    organizationName: organizationName,
                    oldPlanName: currentSubscription.plan_id || 'Previous Plan',
                    newPlanName: newPlan.name,
                    newAmount: newPlan.amount,
                    effectiveDate: new Date().toISOString(),
                });
            }

            // 11. Audit log
            await supabaseAdmin.from('audit_logs').insert({
                user_id: user.id,
                action: 'subscription_plan_changed',
                details: {
                    organization_id: organizationId,
                    old_plan: currentSubscription.plan_id,
                    new_plan: newPlanKey,
                    razorpay_subscription_id: updatedSubscription.id,
                }
            });

            // ✅ FIXED: Proper null safety with type guard
            let nextBillingDate = 'Not available';
            if (updatedSubscription.current_end && typeof updatedSubscription.current_end === 'number') {
                nextBillingDate = new Date(updatedSubscription.current_end * 1000).toLocaleDateString('en-IN');
            }

            return NextResponse.json({
                success: true,
                message: `Successfully switched to ${newPlan.name}`,
                subscription: {
                    id: updatedSubscription.id,
                    plan: newPlanKey,
                    amount: newPlan.amount,
                    status: updatedSubscription.status,
                    next_billing_date: nextBillingDate,
                }
            });

        } catch (razorpayError) {
            console.error('❌ Razorpay plan change error:', razorpayError);

            const errorMessage = razorpayError instanceof Error
                ? razorpayError.message
                : (razorpayError as { error?: { description?: string } })?.error?.description || "Failed to change subscription plan";

            return NextResponse.json({
                error: "Failed to change subscription plan",
                details: errorMessage
            }, { status: 500 });
        }

    } catch (error) {
        console.error('❌ Subscription upgrade error:', error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

// ============================================
// EMAIL NOTIFICATION
// ============================================
async function sendPlanChangedEmail(params: {
    to: string;
    organizationName: string;
    oldPlanName: string;
    newPlanName: string;
    newAmount: number;
    effectiveDate: string;
}) {
    const { Resend } = await import('resend');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY missing');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: brand.email.fromBilling,
            to: params.to,
            subject: `Subscription Plan Updated - ${brand.name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #fff; margin: 0;">Plan Updated! 🎉</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px;">
                            Your subscription plan for <strong>${params.organizationName}</strong> has been updated.
                        </p>
                        
                        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <div>
                                    <p style="margin: 0; color: #999; font-size: 14px;">Previous Plan</p>
                                    <p style="margin: 5px 0 0 0; font-size: 18px; text-decoration: line-through; color: #999;">${params.oldPlanName}</p>
                                </div>
                                <div style="font-size: 24px;">→</div>
                                <div>
                                    <p style="margin: 0; color: #999; font-size: 14px;">New Plan</p>
                                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #10b981;">${params.newPlanName}</p>
                                </div>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            
                            <p style="margin: 0;"><strong>New Amount:</strong> ${formatPrice(params.newAmount)}</p>
                            <p style="margin: 10px 0 0 0;"><strong>Effective:</strong> ${new Date(params.effectiveDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        
                        <p style="font-size: 16px;">
                            Your next billing will reflect the new plan amount. Any credit from your previous plan has been applied automatically.
                        </p>
                        
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${brand.product.url}/dashboard" 
                               style="display: inline-block; background: #10b981; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                View Dashboard
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 30px;">
                            Questions about your plan change? Contact us at ${brand.contact.email}
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

        console.log(`✅ Plan change email sent to ${params.to}`);
    } catch (error) {
        console.error('❌ Failed to send plan change email:', error);
    }
}