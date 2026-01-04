import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    try {
        // 1. Verify Admin Access
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin (you need to add is_admin column to profiles table)
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch Total Revenue
        const { data: invoices } = await supabaseAdmin
            .from("invoices")
            .select("amount")
            .eq("status", "paid");

        const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

        // 3. Fetch Total Users
        const { count: totalUsers } = await supabaseAdmin
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // 4. Fetch Active Subscriptions
        const { count: activeSubscriptions } = await supabaseAdmin
            .from("licenses")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");

        // 5. Calculate Monthly Growth
        const currentMonth = new Date().getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const { data: currentMonthInvoices } = await supabaseAdmin
            .from("invoices")
            .select("amount")
            .eq("status", "paid")
            .gte("created_at", new Date(new Date().getFullYear(), currentMonth, 1).toISOString());

        const { data: lastMonthInvoices } = await supabaseAdmin
            .from("invoices")
            .select("amount")
            .eq("status", "paid")
            .gte("created_at", new Date(new Date().getFullYear(), lastMonth, 1).toISOString())
            .lt("created_at", new Date(new Date().getFullYear(), currentMonth, 1).toISOString());

        const currentMonthRevenue = currentMonthInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
        const lastMonthRevenue = lastMonthInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

        const monthlyGrowth = lastMonthRevenue > 0
            ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        // 6. Revenue by Month (Last 6 months)
        const revenueByMonth = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const { data: monthInvoices } = await supabaseAdmin
                .from("invoices")
                .select("amount")
                .eq("status", "paid")
                .gte("created_at", monthStart.toISOString())
                .lte("created_at", monthEnd.toISOString());

            const revenue = monthInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

            revenueByMonth.push({
                month: monthStart.toLocaleDateString("en-US", { month: "short" }),
                revenue: revenue / 100, // Convert from paise to rupees
            });
        }

        // 7. Revenue by Plan
        const { data: licenses } = await supabaseAdmin
            .from("licenses")
            .select("plan_key");

        const planCounts = licenses?.reduce((acc: any, license) => {
            acc[license.plan_key] = (acc[license.plan_key] || 0) + 1;
            return acc;
        }, {});

        const revenueByPlan = Object.entries(planCounts || {}).map(([plan, users]) => ({
            plan: plan === "agency_lifetime" ? "Agency" : "Starter",
            users: users as number,
            revenue: (plan === "agency_lifetime" ? 9999 : 3999) * (users as number),
        }));

        return NextResponse.json({
            totalRevenue: totalRevenue / 100, // Convert to rupees
            totalUsers: totalUsers || 0,
            activeSubscriptions: activeSubscriptions || 0,
            monthlyGrowth,
            revenueByMonth,
            revenueByPlan,
        });

    } catch (error: any) {
        console.error("Revenue analytics error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
