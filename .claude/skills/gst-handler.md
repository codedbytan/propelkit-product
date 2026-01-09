# GST Handler Skill (India Tax)

---
## 🎯 CRITICAL: Read Project Context First
1. ✅ Read `.claude/PROJECT_CONTEXT.md`
2. ✅ This is India-specific (18% GST)
3. ✅ Use `brand.invoicing.*` config

---

## Trigger
"Add GST calculation" or "Generate GST invoice"

## What This Does
- Calculates CGST/SGST (intra-state) or IGST (inter-state)
- Generates GST-compliant invoices
- Validates GSTIN format

---

## GST Calculation

```typescript
interface GSTCalculation {
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
}

function calculateGST(
  amount: number, 
  isInterState: boolean,
  gstRate: number = 0.18 // 18% GST
): GSTCalculation {
  const taxAmount = amount * gstRate;
  
  if (isInterState) {
    return {
      baseAmount: amount,
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
      totalTax: taxAmount,
      totalAmount: amount + taxAmount,
    };
  }
  
  return {
    baseAmount: amount,
    cgst: taxAmount / 2,
    sgst: taxAmount / 2,
    igst: 0,
    totalTax: taxAmount,
    totalAmount: amount + taxAmount,
  };
}
```

---

## GSTIN Validation

```typescript
import { z } from 'zod';

const gstinSchema = z
  .string()
  .regex(
    /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
    'Invalid GSTIN format'
  );
```

---

## Invoice Generation

```typescript
import { brand } from '@/config/brand';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerGSTIN: string;
  amount: number;
  isInterState: boolean;
}

function generateGSTInvoice(data: InvoiceData) {
  const gst = calculateGST(data.amount, data.isInterState);
  
  return {
    sellerDetails: {
      name: brand.company,
      gstin: brand.invoicing.gstin,
      pan: brand.invoicing.pan,
      address: brand.invoicing.address,
    },
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    customerDetails: {
      name: data.customerName,
      gstin: data.customerGSTIN,
    },
    items: [{
      description: 'Software License',
      amount: gst.baseAmount,
    }],
    tax: {
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalTax: gst.totalTax,
    },
    totalAmount: gst.totalAmount,
  };
}
```

---

## Usage Example

**User:** "Generate GST invoice for payment"

**Claude generates:** Invoice PDF with CGST/SGST breakdown using `brand.invoicing.*` config.
