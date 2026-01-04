export async function GET_USERS(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check admin status
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Parse query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "all";

        // Build query
        let query = supabaseAdmin
            .from("profiles")
            .select(`
        id,
        email,
        created_at,
        licenses (
          status,
          plan_key,
          created_at
        ),
        invoices (
          amount,
          created_at
        )
      `)
            .order("created_at", { ascending: false });

        // Fetch users
        const { data: usersData, error } = await query;

        if (error) throw error;

        // Transform data
        const users = usersData.map((user: any) => {
            const license = user.licenses?.[0];
            const totalSpent = user.invoices?.reduce((sum: number, inv: any) => sum + inv.amount, 0) || 0;
            const lastPayment = user.invoices?.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            return {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                license_status: license?.status || "inactive",
                plan_key: license?.plan_key || "none",
                total_spent: totalSpent / 100, // Convert to rupees
                last_payment_date: lastPayment?.created_at || null,
            };
        });

        // Filter by status if needed
        const filteredUsers = status === "all"
            ? users
            : users.filter((u: any) => u.license_status === status);

        return NextResponse.json({ users: filteredUsers });

    } catch (error: any) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
