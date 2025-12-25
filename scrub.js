/**
 * 🧹 SCRUBBING SCRIPT
 * Removes PropelKit branding and makes the code generic
 * 
 * Usage: node scrub.js
 */

const fs = require('fs');
const path = require('path');

// ================================
// 1. TEXT REPLACEMENTS
// ================================
const replacements = {
    // Brand Names
    'PropelKit': 'Acme SaaS',
    'propelkit.com': 'yourdomain.com',
    'propelkit.dev': 'yourdomain.com',

    // Personal Info
    'tanishqagarwalswm@gmail.com': 'support@yourdomain.com',
    'Tanishq': 'Your Name',

    // Company Details
    'IndicSaaS Pvt Ltd': 'Your Company Name',
    'Jaipur, Rajasthan': 'Your City, State',
    '08AAAAA0000A1Z5': 'YOUR_GSTIN_HERE',

    // Marketing Copy
    'Ship your Indian SaaS in 24 Hours': 'Welcome to Your SaaS',
    'The only boilerplate with pre-built Razorpay': 'Modern SaaS boilerplate',
};

// ================================
// 2. FILES TO DELETE
// ================================
const filesToDelete = [
    'src/components/Hero.tsx',
    'src/components/PainCalculator.tsx',
    'src/components/Testimonials.tsx',
    'src/components/FounderStory.tsx',
    'src/app/admin-demo/page.tsx',
    'src/components/demo/DemoInvoicesTable.tsx',
];

// ================================
// 3. MAIN SCRUBBING FUNCTION
// ================================
function scrubFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply text replacements
    for (const [oldText, newText] of Object.entries(replacements)) {
        const regex = new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.includes(oldText)) {
            content = content.replace(regex, newText);
            modified = true;
        }
    }

    // Add helpful comments to critical files
    if (filePath.includes('gst-engine.ts') && !content.includes('💡 GST ENGINE')) {
        content = `// 💡 GST ENGINE - The Core Value Proposition
// This calculates CGST/SGST/IGST based on Indian state codes
// Customize the sellerStateCode and sellerGSTIN in your API routes

${content}`;
        modified = true;
    }

    if (filePath.includes('webhook') && !content.includes('🔔 WEBHOOK')) {
        content = `// 🔔 WEBHOOK HANDLER
// This receives payment notifications from Razorpay
// CRITICAL: Must be configured in Razorpay dashboard
// URL: https://yourdomain.com/api/webhooks/razorpay
// Events: payment.captured, payment.failed

${content}`;
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Scrubbed: ${filePath}`);
    }
}

// ================================
// 4. RECURSIVE DIRECTORY SCAN
// ================================
function scrubDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Skip node_modules and .next
        if (file === 'node_modules' || file === '.next' || file === '.git') {
            return;
        }

        if (stat.isDirectory()) {
            scrubDirectory(filePath);
        } else if (file.match(/\.(tsx?|jsx?|md|json)$/)) {
            scrubFile(filePath);
        }
    });
}

// ================================
// 5. DELETE PLATFORM-SPECIFIC FILES
// ================================
function deleteFiles() {
    console.log('\n🗑️  Removing platform-specific files...\n');

    filesToDelete.forEach(file => {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`❌ Deleted: ${file}`);
        }
    });
}

// ================================
// 6. CREATE NEW FILES
// ================================
function createNewFiles() {
    console.log('\n📝 Creating generic templates...\n');

    // Create README.md
    const readme = `# Acme SaaS Boilerplate

A modern, production-ready SaaS starter kit built with Next.js 14, Supabase, and Razorpay.

## Features

✅ Authentication (Email + OAuth)
✅ Payment processing (Razorpay)
✅ GST-compliant invoicing
✅ User dashboard
✅ Email notifications
✅ Fully responsive

## Quick Start

1. Copy \`.env.example\` to \`.env.local\`
2. Fill in your API keys
3. Run \`npm install\`
4. Run \`npm run dev\`

See **SETUP.md** for detailed instructions.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Razorpay
- **Email:** Resend
- **Styling:** Tailwind CSS + shadcn/ui

## License

This boilerplate is provided as-is for your commercial use.
`;

    fs.writeFileSync('README.md', readme);
    console.log('✅ Created: README.md');

    // Ensure .env.example exists
    if (!fs.existsSync('.env.example')) {
        console.log('⚠️  .env.example not found - please add it manually');
    }
}

// ================================
// 7. EXECUTE
// ================================
console.log('🚀 Starting scrubbing process...\n');

console.log('📂 Scanning files...\n');
scrubDirectory(path.join(process.cwd(), 'src'));
scrubDirectory(path.join(process.cwd(), 'public'));

deleteFiles();
createNewFiles();

console.log('\n✨ Scrubbing complete!\n');
console.log('Next steps:');
console.log('1. Review the changes with: git diff');
console.log('2. Test the app: npm run dev');
console.log('3. Check all placeholder text is replaced');
console.log('4. Zip the folder and upload to storage\n');