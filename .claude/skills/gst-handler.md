# GST Handler Skill (India-Specific)

## Trigger
When user says: "Add GST invoice" or "Calculate GST" or "Generate tax invoice"

## What This Skill Does
Generates India-specific GST compliance features:
1. GST calculation (CGST/SGST/IGST)
2. GST invoice generation
3. GSTIN validation
4. HSN/SAC code integration
5. PDF invoice generation

---

## GST Basics for PropelKit

### Tax Types
- **CGST + SGST** (9% each = 18% total): Intra-state (buyer and seller in same state)
- **IGST** (18%): Inter-state (buyer and seller in different states)

### PropelKit = Software (SAC Code: 998314)
Software services fall under SAC 998314 - "Information technology consulting and support services"

### State Codes
```typescript
export const INDIAN_STATES: Record<string, { code: string; name: string }> = {
  '01': { code: '01', name: 'Jammu & Kashmir' },
  '02': { code: '02', name: 'Himachal Pradesh' },
  '03': { code: '03', name: 'Punjab' },
  '04': { code: '04', name: 'Chandigarh' },
  '05': { code: '05', name: 'Uttarakhand' },
  '06': { code: '06', name: 'Haryana' },
  '07': { code: '07', name: 'Delhi' },
  '08': { code: '08', name: 'Rajasthan' },
  '09': { code: '09', name: 'Uttar Pradesh' },
  '10': { code: '10', name: 'Bihar' },
  // ... add all 36 states/UTs
  '27': { code: '27', name: 'Maharashtra' },
  '29': { code: '29', name: 'Karnataka' },
  '33': { code: '33', name: 'Tamil Nadu' },
  '36': { code: '36', name: 'Telangana' },
};
```

---

## GST Calculation Utility

**File: `src/lib/gst.ts`**

```typescript
const GST_RATE = 0.18; // 18% GST for software

interface GSTBreakdown {
  subtotal: number;      // Pre-tax amount
  cgst: number;          // 9% for intra-state
  sgst: number;          // 9% for intra-state
  igst: number;          // 18% for inter-state
  totalTax: number;
  grandTotal: number;
  isInterState: boolean;
}

/**
 * Calculate GST based on seller and buyer locations
 * @param amount - Pre-tax amount in rupees
 * @param sellerStateCode - 2-digit state code of seller
 * @param buyerStateCode - 2-digit state code of buyer (optional for B2C)
 */
export function calculateGST(
  amount: number,
  sellerStateCode: string,
  buyerStateCode?: string
): GSTBreakdown {
  const isInterState = buyerStateCode ? sellerStateCode !== buyerStateCode : false;
  const taxAmount = amount * GST_RATE;

  if (isInterState) {
    return {
      subtotal: amount,
      cgst: 0,
      sgst: 0,
      igst: Math.round(taxAmount * 100) / 100, // Round to 2 decimals
      totalTax: Math.round(taxAmount * 100) / 100,
      grandTotal: Math.round((amount + taxAmount) * 100) / 100,
      isInterState: true,
    };
  }

  const halfTax = taxAmount / 2;
  return {
    subtotal: amount,
    cgst: Math.round(halfTax * 100) / 100,
    sgst: Math.round(halfTax * 100) / 100,
    igst: 0,
    totalTax: Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round((amount + taxAmount) * 100) / 100,
    isInterState: false,
  };
}

/**
 * Calculate reverse: from grand total to subtotal
 */
export function calculateSubtotalFromTotal(grandTotal: number): number {
  return Math.round((grandTotal / (1 + GST_RATE)) * 100) / 100;
}

/**
 * Validate GSTIN format
 * Format: 22AAAAA0000A1Z5 (15 characters)
 */
export function validateGSTIN(gstin: string): boolean {
  const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Extract state code from GSTIN
 */
export function getStateFromGSTIN(gstin: string): string | null {
  if (!validateGSTIN(gstin)) return null;
  return gstin.substring(0, 2);
}

/**
 * Format amount to Indian currency
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert number to words (for invoice totals)
 */
export function amountToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (amount === 0) return 'Zero Rupees Only';

  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const hundred = Math.floor((amount % 1000) / 100);
  const remainder = Math.floor(amount % 100);

  let words = '';
  if (crore) words += `${numberToWords(crore)} Crore `;
  if (lakh) words += `${numberToWords(lakh)} Lakh `;
  if (thousand) words += `${numberToWords(thousand)} Thousand `;
  if (hundred) words += `${numberToWords(hundred)} Hundred `;
  if (remainder) words += `${numberToWords(remainder)} `;

  return words.trim() + ' Rupees Only';

  function numberToWords(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  }
}
```

---

## GST Invoice Interface

**File: `src/types/invoice.ts`**

```typescript
export interface GSTInvoiceItem {
  description: string;
  sacCode: string;        // Service Accounting Code
  quantity: number;
  rate: number;           // Per unit rate (pre-tax)
  taxableValue: number;   // quantity * rate
}

export interface GSTInvoice {
  // Invoice identification
  invoiceNumber: string;  // Format: INV-2024-01-0001
  invoiceDate: Date;
  placeOfSupply: string;  // State name
  
  // Seller (Your company)
  seller: {
    name: string;
    gstin: string;
    pan: string;
    address: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
  };
  
  // Buyer
  buyer: {
    name: string;
    email: string;
    gstin?: string;       // Optional for B2C
    pan?: string;
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    pincode?: string;
  };
  
  // Line items
  items: GSTInvoiceItem[];
  
  // Calculations
  subtotal: number;
  cgst: number;
  cgstRate: number;       // 9
  sgst: number;
  sgstRate: number;       // 9
  igst: number;
  igstRate: number;       // 18
  totalTax: number;
  grandTotal: number;
  amountInWords: string;
  
  // Flags
  isInterState: boolean;
  isReverseCharge: boolean;
  
  // Payment
  paymentMethod: string;
  razorpayPaymentId?: string;
}
```

---

## Invoice Number Generator

**File: `src/lib/invoice-number.ts`**

```typescript
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Generate unique invoice number
 * Format: INV-YYYY-MM-NNNN
 */
export async function generateInvoiceNumber(): Promise<string> {
  const supabase = createServiceClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}-${month}`;

  // Get the last invoice number for this month
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;
  if (data && !error) {
    const lastNumber = data.invoice_number.split('-').pop();
    sequence = parseInt(lastNumber || '0', 10) + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}
```

---

## PDF Invoice Generator

**File: `src/app/api/invoice/[licenseId]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import PDFDocument from 'pdfkit';
import { calculateGST, formatINR, amountToWords } from '@/lib/gst';
import { BRAND_CONFIG } from '@/config/brand';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ licenseId: string }> }
) {
  const { licenseId } = await params;
  const supabase = await createClient();

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get license and invoice data
  const { data: license, error } = await supabase
    .from('licenses')
    .select(`
      *,
      invoices (*)
    `)
    .eq('id', licenseId)
    .eq('user_id', user.id)
    .single();

  if (error || !license) {
    return NextResponse.json({ error: 'License not found' }, { status: 404 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Generate PDF
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
  doc.moveDown();

  // Invoice details
  doc.fontSize(10);
  doc.text(`Invoice No: ${license.invoices?.[0]?.invoice_number || 'N/A'}`);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.moveDown();

  // Seller details
  doc.fontSize(12).text('From:', { underline: true });
  doc.fontSize(10);
  doc.text(BRAND_CONFIG.company.name);
  doc.text(`GSTIN: ${BRAND_CONFIG.company.gstin}`);
  doc.text(BRAND_CONFIG.company.address);
  doc.moveDown();

  // Buyer details
  doc.fontSize(12).text('To:', { underline: true });
  doc.fontSize(10);
  doc.text(profile?.full_name || user.email);
  if (profile?.gstin) doc.text(`GSTIN: ${profile.gstin}`);
  doc.text(`Email: ${user.email}`);
  doc.moveDown();

  // Item table
  const planPrice = BRAND_CONFIG.pricing.plans[license.plan_type as keyof typeof BRAND_CONFIG.pricing.plans]?.price || 0;
  const gst = calculateGST(planPrice, '27'); // Assuming seller is in Maharashtra

  doc.fontSize(12).text('Items:', { underline: true });
  doc.fontSize(10);
  doc.text(`PropelKit ${license.plan_type} License`);
  doc.text(`SAC Code: 998314`);
  doc.text(`Amount: ${formatINR(planPrice)}`);
  doc.moveDown();

  // Tax breakdown
  doc.fontSize(12).text('Tax Details:', { underline: true });
  doc.fontSize(10);
  if (gst.isInterState) {
    doc.text(`IGST (18%): ${formatINR(gst.igst)}`);
  } else {
    doc.text(`CGST (9%): ${formatINR(gst.cgst)}`);
    doc.text(`SGST (9%): ${formatINR(gst.sgst)}`);
  }
  doc.moveDown();

  // Total
  doc.fontSize(14).text(`Grand Total: ${formatINR(gst.grandTotal)}`, { bold: true });
  doc.fontSize(10).text(`(${amountToWords(gst.grandTotal)})`);

  doc.end();

  // Wait for PDF generation to complete
  await new Promise<void>((resolve) => doc.on('end', resolve));

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${licenseId}.pdf"`,
    },
  });
}
```

---

## Zod Validation for GST Fields

```typescript
import { z } from 'zod';

// GSTIN validation schema
export const gstinSchema = z
  .string()
  .length(15, 'GSTIN must be 15 characters')
  .regex(
    /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
    'Invalid GSTIN format'
  )
  .optional();

// Indian phone validation
export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');

// Indian PIN code validation
export const pinCodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'Invalid PIN code');

// State code validation
export const stateCodeSchema = z
  .string()
  .regex(/^\d{2}$/, 'Invalid state code')
  .refine((code) => parseInt(code) >= 1 && parseInt(code) <= 37, 'Invalid state code');
```

---

## Usage Examples

**User**: "Add GST calculation to checkout"

**Claude generates**: GST utility functions, invoice generation, and PDF export.

**User**: "Generate GST invoice for payment"

**Claude generates**: Complete invoice with CGST/SGST/IGST breakdown, SAC codes, and PDF generation.
