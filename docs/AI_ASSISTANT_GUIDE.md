# 🤖 AI Assistant Guide - Claude Code Skills

Learn how to use PropelKit's built-in AI code generation skills to ship features faster.

---

## Table of Contents

1. [What Are Claude Code Skills?](#what-are-claude-code-skills)
2. [Setup](#setup)
3. [Available Skills](#available-skills)
4. [How to Use](#how-to-use)
5. [Examples](#examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## What Are Claude Code Skills?

PropelKit includes **10 pre-configured Claude Code skills** that teach AI assistants (like Claude, Cursor, Windsurf) how to generate production-ready code for your specific codebase.

**Benefits:**
- ✅ Generate features in seconds (not hours)
- ✅ Code follows your project patterns
- ✅ India-specific implementations (Razorpay, GST, GSTIN validation)
- ✅ Uses your `brand.ts` configuration automatically
- ✅ Production-ready with proper TypeScript types

---

## Setup

### For Claude Code (CLI)

```bash
# Claude Code reads skills automatically from .claude/ folder
# No setup needed - skills are already in your project!

# Usage:
claude "Create CRUD page for Products"
```

### For Cursor IDE

```bash
# 1. Open Cursor Settings
# 2. Go to "Cursor Rules"
# 3. Add this path to custom rules:
.claude/PROJECT_CONTEXT.md

# Now Cursor will use PropelKit skills!
```

### For Windsurf IDE

```bash
# 1. Open Windsurf Settings
# 2. Go to "AI Rules"
# 3. Add custom rules file:
.windsurfrules

# Windsurf will now follow PropelKit patterns!
```

---

## Available Skills

### 1. **create-crud-page** - Full CRUD Generator

**Trigger:** "Create CRUD page for [Entity]"

**Generates:**
- Database schema with RLS
- API routes (GET, POST, PUT, DELETE)
- Form components with validation
- List/table view
- Edit/delete modals

**Example:**
```bash
claude "Create CRUD page for Products with name, price, description"
```

**Output:**
- `supabase/migrations/20240109_products.sql`
- `src/app/api/products/route.ts`
- `src/app/dashboard/products/page.tsx`
- `src/components/product-form.tsx`

---

### 2. **add-api-route** - API Endpoint Generator

**Trigger:** "Add API route for [feature]"

**Generates:**
- Next.js 15 App Router API
- TypeScript types
- Zod validation
- Supabase integration
- Error handling

**Example:**
```bash
claude "Add API route for sending contact form emails"
```

**Output:**
- `src/app/api/contact/route.ts`

---

### 3. **payments-handler** - Razorpay Integration

**Trigger:** "Add payment integration" or "Create checkout for [product]"

**Generates:**
- Razorpay order creation
- Payment verification
- Webhook handling
- Invoice generation
- Database updates

**Example:**
```bash
claude "Add payment integration for Pro plan"
```

**Output:**
- `src/app/api/checkout/route.ts`
- `src/app/api/checkout/verify/route.ts`
- `src/app/api/webhooks/razorpay/route.ts`

---

### 4. **create-email-template** - Email Generator

**Trigger:** "Create email template for [purpose]"

**Generates:**
- Responsive HTML email
- Dynamic branding from `brand.ts`
- Plain text fallback
- Resend integration

**Example:**
```bash
claude "Create email template for password reset"
```

**Output:**
- `src/emails/password-reset-email.tsx`

---

### 5. **db-handler** - Database Schema Generator

**Trigger:** "Create table for [Entity]"

**Generates:**
- SQL migration
- Row Level Security (RLS) policies
- Indexes for performance
- Foreign key constraints

**Example:**
```bash
claude "Create table for Comments with user_id, post_id, content"
```

**Output:**
- `supabase/migrations/20240109_comments.sql`

---

### 6. **ui-handler** - UI Component Generator

**Trigger:** "Create [component name]"

**Generates:**
- React component with TypeScript
- shadcn/ui integration
- Responsive design
- Dark mode compatible

**Example:**
```bash
claude "Create a pricing table component"
```

**Output:**
- `src/components/pricing-table.tsx`

---

### 7. **inngest-handler** - Background Job Generator

**Trigger:** "Create background job for [task]"

**Generates:**
- Inngest function
- Event types
- Error handling
- Retries & scheduling

**Example:**
```bash
claude "Create background job for sending weekly reports"
```

**Output:**
- `src/lib/inngest/functions/weekly-reports.ts`

---

### 8. **auth-handler** - Auth Guard Generator

**Trigger:** "Protect [route]"

**Generates:**
- Server-side auth checks
- Middleware protection
- Role-based access
- Redirect logic

**Example:**
```bash
claude "Protect admin dashboard with admin role check"
```

**Output:**
- `src/app/admin/layout.tsx` (updated)

---

### 9. **gst-handler** - GST Calculation

**Trigger:** "Add GST calculation" or "Generate GST invoice"

**Generates:**
- CGST/SGST/IGST calculation
- GSTIN validation
- GST-compliant invoices
- State code mapping

**Example:**
```bash
claude "Add GST calculation to checkout"
```

**Output:**
- Updates to checkout flow with GST breakdown

---

### 10. **seo-specialist** - SEO Optimizer

**Trigger:** "Optimize SEO for [page]"

**Generates:**
- Meta tags (title, description, keywords)
- Open Graph tags
- Twitter Card tags
- JSON-LD structured data

**Example:**
```bash
claude "Optimize SEO for homepage"
```

**Output:**
- `src/app/page.tsx` (updated with metadata)

---

## How to Use

### Method 1: Claude Code CLI

```bash
# Install Claude Code (if not installed)
npm install -g @anthropic-ai/claude-cli

# Generate code with natural language
claude "Create CRUD page for Blog Posts"
claude "Add API route for user profile updates"
claude "Create email template for welcome email"
```

### Method 2: Cursor IDE

```
# 1. Open Cursor
# 2. Press Cmd+K (Mac) or Ctrl+K (Windows)
# 3. Type your request:
Create CRUD page for Products with name, price, category

# Cursor will generate code using PropelKit skills!
```

### Method 3: Windsurf IDE

```
# 1. Open Windsurf
# 2. Open AI chat panel
# 3. Type your request:
Add API route for exporting data to CSV

# Windsurf follows .windsurfrules automatically!
```

---

## Examples

### Example 1: Create Complete Feature

**Request:**
```
Create a complete task management feature with:
- Table: tasks (title, description, status, user_id, due_date)
- API routes for CRUD operations
- Dashboard page with list and form
- Email notification when task is assigned
```

**AI Generates:**
1. Migration file with RLS
2. API routes (4 endpoints)
3. Dashboard page
4. Task form component
5. Email template

**Time Saved:** 4-6 hours → 2 minutes

---

### Example 2: Add Payment for New Plan

**Request:**
```
Add payment integration for Enterprise plan at ₹29,999
```

**AI Generates:**
1. Updates `brand.ts` pricing
2. Creates checkout flow
3. Adds GST calculation
4. Sets up webhook handling
5. Generates invoice

**Time Saved:** 3-4 hours → 2 minutes

---

### Example 3: Build Admin Feature

**Request:**
```
Create admin feature to:
- View all users
- Search by email
- Impersonate users
- Export to CSV
```

**AI Generates:**
1. Admin API route with auth
2. User list component
3. Search functionality
4. Impersonation logic
5. CSV export

**Time Saved:** 5-7 hours → 3 minutes

---

## Best Practices

### 1. Be Specific

**❌ Bad:**
```
Create a form
```

**✅ Good:**
```
Create a user registration form with:
- Name (required, min 2 chars)
- Email (required, validated)
- Password (required, min 8 chars, confirmed)
- Company (optional)
- Submit with loading state
```

### 2. Reference Existing Patterns

**✅ Good:**
```
Create a pricing page similar to the homepage hero, but with:
- 3 tier cards (Starter, Pro, Enterprise)
- Monthly/yearly toggle
- Feature comparison table
```

### 3. Specify Data Structures

**✅ Good:**
```
Create a blog post table with:
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- title (text, required)
- slug (text, unique)
- content (text)
- published (boolean, default false)
- published_at (timestamp)
- created_at (timestamp)
```

### 4. Use Brand Configuration

**✅ Good:**
```
Create welcome email using brand.name and brand.email.fromSupport
```

The AI will automatically pull from your `brand.ts` config!

---

## Understanding AI-Generated Code

### What AI Does Well

✅ **Patterns & Boilerplate**
- CRUD operations
- Form validation
- API routes
- Database schemas
- Component structure

✅ **India-Specific Features**
- Razorpay integration
- GST calculations
- GSTIN validation
- Indian phone formats

✅ **Best Practices**
- TypeScript types
- Error handling
- RLS policies
- Zod validation

### What to Review Manually

⚠️ **Business Logic**
- Complex calculations
- Custom workflows
- Edge cases

⚠️ **Security**
- Review RLS policies
- Verify auth checks
- Check input validation

⚠️ **Performance**
- Review database queries
- Check for N+1 queries
- Optimize if needed

---

## Customizing Skills

You can modify skills to match your specific needs:

### 1. Edit Skill File

```bash
# Open skill file
code .claude/skills/create-crud-page.md

# Modify the templates or examples
# Save and AI will use new patterns!
```

### 2. Add Company-Specific Rules

```markdown
# .claude/PROJECT_CONTEXT.md

## Custom Rules

Always use our company's:
- Error handling pattern: try/catch with specific error types
- Logging format: console.log('[Module:Function]', message)
- Date format: YYYY-MM-DD HH:mm:ss IST
```

### 3. Create New Skill

```bash
# Create new skill file
touch .claude/skills/my-custom-skill.md

# Add skill definition with examples
# AI will automatically use it!
```

---

## Troubleshooting

### AI Not Following Skills

**Problem:** Generated code doesn't match PropelKit patterns

**Solutions:**
1. **Verify skill files exist:**
   ```bash
   ls .claude/skills/
   ```

2. **For Cursor:** Re-add `.claude/PROJECT_CONTEXT.md` to rules

3. **Be explicit in prompt:**
   ```
   Using PropelKit's brand configuration, create...
   ```

---

### Generated Code Has Errors

**Problem:** TypeScript errors or runtime issues

**Solutions:**
1. **Check imports:**
   ```typescript
   // AI might use wrong import
   import { brand } from '@/config/brand';  // ✅
   import { BRAND_CONFIG } from '@/config/brand';  // ❌
   ```

2. **Verify types:**
   ```bash
   npm run build  # Check for type errors
   ```

3. **Ask AI to fix:**
   ```
   Fix TypeScript errors in the generated code
   ```

---

### AI Uses Hardcoded Values

**Problem:** Code has "PropelKit" or "Acme SaaS" instead of your brand

**Solutions:**
1. **Remind AI:**
   ```
   Create checkout page using dynamic brand.name, not hardcoded values
   ```

2. **Add to PROJECT_CONTEXT:**
   ```markdown
   CRITICAL: Never hardcode product names.
   Always use: ${brand.name}
   ```

---

## Advanced Usage

### Chaining Multiple Skills

```bash
# Generate full feature stack
claude "
1. Create table for products (id, name, price, description)
2. Add API routes for products CRUD
3. Create admin page to manage products
4. Add product listing page for users
5. Create email template for new product notifications
"
```

### Iterative Development

```bash
# First pass
claude "Create basic blog post feature"

# Review and refine
claude "Add categories and tags to blog posts"

# Add more features
claude "Add search and filtering to blog posts"
```

---

## Tips for Maximum Productivity

1. **Start with Database Schema**
   ```
   First create tables, then build on top
   ```

2. **Use Existing Components**
   ```
   Create product form similar to organization form in /dashboard/settings
   ```

3. **Ask for Explanations**
   ```
   Explain how the GST calculation works in this code
   ```

4. **Request Tests**
   ```
   Add unit tests for the payment verification logic
   ```

5. **Optimize After Working**
   ```
   First: Get it working
   Then: "Optimize this API route for performance"
   ```

---

## Learn More

- 📖 **Full Skill Docs:** `.claude/skills/` folder
- 💬 **Discord:** [Join community](https://discord.gg/propelkit) for tips
- 📹 **Video Tutorials:** [propelkit.dev/videos](https://propelkit.dev/videos)

---

## Support

Having issues with AI code generation?

1. ✅ Check this guide
2. ✅ Review skill files in `.claude/skills/`
3. ✅ Try rephrasing your request
4. ✅ Ask in Discord for help

---

**Ship 10x faster with AI-assisted development! 🚀**