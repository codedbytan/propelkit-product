/**
 * 💡 GST ENGINE - CUSTOMIZE THIS
 * 
 * Update these values in your API routes:
 * - sellerStateCode: Your business state (e.g., "27" for Maharashtra)
 * - sellerGSTIN: Your GST registration number
 * 
 * State codes can be found in the STATE_CODES object below.
 */

// --- 1. CONSTANTS & CONFIGURATION ---

export const SAC_CODE_SAAS = "9983"; // Information technology services

// Standard GST State Codes (ISO 3166-2:IN / GST Council)
export const STATE_CODES: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
    "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
    "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
    "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra", "29": "Karnataka",
    "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
    "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
    "97": "Other Territory", "96": "Foreign Country" // Custom code for exports
};

// --- 2. TYPES ---

export type GSTRoundingMode = "LINE_LEVEL" | "INVOICE_LEVEL";
export type TransactionType = "B2B" | "B2C" | "SEZ_WITH_PAYMENT" | "SEZ_WITHOUT_PAYMENT" | "EXPORT" | "DEEMED_EXPORT";

export interface TaxConfig {
    sellerStateCode: string;
    sellerGSTIN: string;
    roundingMode?: GSTRoundingMode;
    forceDate?: Date; // For backdated calculations
}

export interface LineItem {
    description: string;
    sacCode: string;
    unitPrice: number;
    quantity: number;
    discount?: number; // Absolute amount
}

export interface CustomerDetails {
    gstin?: string; // Optional for B2C
    stateCode?: string; // Mandatory if GSTIN missing
    isSEZ?: boolean;
    hasLUT?: boolean; // Letter of Undertaking (for SEZ/Export without payment)
    isForeign?: boolean;
}

export interface TaxResult {
    transactionType: TransactionType;
    placeOfSupply: string;
    isRCM: boolean;

    // Amounts
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTax: number;
    totalAmount: number;

    // Invoice Compliance Data
    invoiceNumberSuggestion: string; // e.g., "FY24-25/001"
    sacCode: string;

    // Audit Trail
    meta: {
        rateApplied: number;
        calculationTimestamp: string;
        posSource: "GSTIN" | "MANUAL_STATE" | "EXPORT_DEFAULT";
        logicTrace: string[];
    };
}

// --- 3. UTILITIES ---

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGSTIN(gstin: string): boolean {
    return GSTIN_REGEX.test(gstin);
}

export function getStateFromGSTIN(gstin: string): string {
    if (!validateGSTIN(gstin)) throw new Error(`Invalid GSTIN format: ${gstin}`);
    return gstin.substring(0, 2);
}

function getRate(date: Date = new Date()): number {
    // Future-proofing: Logic to fetch rate based on date
    // Standard SaaS Rate is 18%
    return 0.18;
}

function generateInvoiceNumber(fyStartYear: number, sequence: number): string {
    const yy = fyStartYear % 100;
    const nextYY = (yy + 1);
    return `INV/${yy}-${nextYY}/${sequence.toString().padStart(4, '0')}`;
}

// --- 4. CORE ENGINE ---

export class GSTCalculator {
    private config: TaxConfig;
    private auditLog: string[] = [];

    constructor(config: TaxConfig) {
        if (!validateGSTIN(config.sellerGSTIN)) throw new Error("Seller GSTIN is invalid");
        this.config = config;
    }

    private log(message: string) {
        this.auditLog.push(message);
    }

    public calculate(customer: CustomerDetails, lineItems: LineItem[], isRCM: boolean = false): TaxResult {
        this.auditLog = []; // Reset log
        const calcDate = this.config.forceDate || new Date();
        const rate = getRate(calcDate);

        // 1. Determine Place of Supply (POS)
        let pos: string;
        let posSource: "GSTIN" | "MANUAL_STATE" | "EXPORT_DEFAULT";

        if (customer.isForeign) {
            pos = "96";
            posSource = "EXPORT_DEFAULT";
            this.log("Customer is foreign -> POS: 96 (Export)");
        } else if (customer.gstin) {
            pos = getStateFromGSTIN(customer.gstin);
            posSource = "GSTIN";
            this.log(`POS derived from GSTIN (${customer.gstin}) -> ${pos}`);
        } else {
            if (!customer.stateCode) throw new Error("State code required for non-GST registered customer");
            if (!STATE_CODES[customer.stateCode]) throw new Error(`Invalid State Code: ${customer.stateCode}`);
            pos = customer.stateCode;
            posSource = "MANUAL_STATE";
            this.log(`POS used manual state code -> ${pos}`);
        }

        // 2. Determine Transaction Type
        let type: TransactionType = "B2C";
        let applyIGST = false;
        let taxMultiplier = 1;

        if (customer.isForeign) {
            type = "EXPORT";
            applyIGST = true; // Technically IGST applies, but might be zero-rated
            if (customer.hasLUT) {
                taxMultiplier = 0;
                this.log("Export with LUT -> Zero Rated Tax");
            }
        } else if (customer.isSEZ) {
            type = customer.hasLUT ? "SEZ_WITHOUT_PAYMENT" : "SEZ_WITH_PAYMENT";
            applyIGST = true; // SEZ is always considered Inter-state
            if (customer.hasLUT) {
                taxMultiplier = 0;
                this.log("SEZ supply under LUT -> Zero Tax");
            }
        } else if (customer.gstin) {
            type = "B2B";
            this.log("Customer has GSTIN -> B2B Transaction");
        }

        // 3. Intra vs Inter State Logic (if not already Export/SEZ)
        if (type === "B2B" || type === "B2C") {
            if (pos !== this.config.sellerStateCode) {
                applyIGST = true;
                this.log(`Inter-state supply: Seller(${this.config.sellerStateCode}) != Buyer(${pos})`);
            } else {
                applyIGST = false;
                this.log(`Intra-state supply: Seller(${this.config.sellerStateCode}) == Buyer(${pos})`);
            }
        }

        // 4. Handle Reverse Charge Mechanism (RCM)
        if (isRCM) {
            taxMultiplier = 0;
            this.log("RCM Applied -> Tax liability shifted to recipient. Invoice tax = 0");
        }

        // 5. Calculate Line Totals
        let totalTaxable = 0;

        lineItems.forEach(item => {
            const lineTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
            totalTaxable += lineTotal;
        });

        // 6. Calculate Tax Amounts
        const effectiveRate = rate * taxMultiplier;
        let cgst = 0, sgst = 0, igst = 0;

        if (applyIGST) {
            igst = totalTaxable * effectiveRate;
        } else {
            cgst = (totalTaxable * effectiveRate) / 2;
            sgst = (totalTaxable * effectiveRate) / 2;
        }

        // 7. Rounding (Invoice Level)
        const format = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

        const finalTaxable = format(totalTaxable);
        const finalCGST = format(cgst);
        const finalSGST = format(sgst);
        const finalIGST = format(igst);
        const totalTax = format(finalCGST + finalSGST + finalIGST);
        const totalAmount = Math.round(finalTaxable + totalTax); // Round off total to nearest rupee

        return {
            transactionType: type,
            placeOfSupply: `${pos} - ${STATE_CODES[pos] || 'Unknown'}`,
            isRCM,

            taxableAmount: finalTaxable,
            cgstAmount: finalCGST,
            sgstAmount: finalSGST,
            igstAmount: finalIGST,
            totalTax: totalTax,
            totalAmount: totalAmount,

            invoiceNumberSuggestion: generateInvoiceNumber(new Date().getFullYear(), Math.floor(Math.random() * 1000)), // Placeholder sequence
            sacCode: SAC_CODE_SAAS,

            meta: {
                rateApplied: effectiveRate,
                calculationTimestamp: new Date().toISOString(),
                posSource,
                logicTrace: this.auditLog
            }
        };
    }
}
