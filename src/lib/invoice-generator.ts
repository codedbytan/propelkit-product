// src/lib/invoice-generator.ts
import PDFDocument from "pdfkit";
import { TaxResult } from "./gst-engine";
import { brand } from "@/config/brand";
import * as fs from "fs";
import * as path from "path";

interface InvoiceData {
    invoiceNumber: string;
    date: Date;
    customerName: string;
    customerGSTIN?: string;
    customerAddress?: string;
    taxResult: TaxResult;
    description: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // --- 1. HEADER ---
        try {
            // Try to add logo (optional - won't break if logo missing)
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 45, { width: 50 });
            }
        } catch (err) {
            // Logo is optional - continue without it
            console.log('Logo not found, continuing without logo');
        }

        doc
            .fontSize(20)
            .text("TAX INVOICE", { align: "right" })
            .fontSize(10)
            .text("Original for Recipient", { align: "right" });

        doc.moveDown();

        // --- 2. SELLER DETAILS (Dynamic from brand.ts) ---
        doc
            .fontSize(12)
            .text(brand.company.legalName, 50, 80)
            .fontSize(10)
            .text(brand.company.address.line1)
            .text(`${brand.company.address.city}, ${brand.company.address.state} - ${brand.company.address.pincode}`)
            .text(`GSTIN: ${brand.company.gstin}`)
            .text(`PAN: ${brand.company.pan}`)
            .text(`Email: ${brand.contact.email}`)
            .text(`Phone: ${brand.contact.phone}`);

        // --- 3. INVOICE DETAILS ---
        doc.text(`Invoice #: ${data.invoiceNumber}`, 400, 80);
        doc.text(`Date: ${data.date.toISOString().split("T")[0]}`, 400, 95);
        doc.text(`Place of Supply: ${data.taxResult.placeOfSupply}`, 400, 110);

        doc.moveDown(2);

        // --- 4. CUSTOMER DETAILS ---
        doc.text("Bill To:", 50, 180).font("Helvetica-Bold");
        doc.font("Helvetica").text(data.customerName);
        if (data.customerAddress) doc.text(data.customerAddress);
        if (data.customerGSTIN) doc.text(`GSTIN: ${data.customerGSTIN}`);

        // --- 5. TABLE HEADERS ---
        const tableTop = 250;
        const colX = { item: 50, sac: 250, qty: 320, rate: 390, total: 470 };

        doc
            .font("Helvetica-Bold")
            .text("Description", colX.item, tableTop)
            .text("SAC", colX.sac, tableTop)
            .text("Qty", colX.qty, tableTop)
            .text("Rate", colX.rate, tableTop)
            .text("Amount", colX.total, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // --- 6. LINE ITEM ---
        const itemY = tableTop + 25;
        doc
            .font("Helvetica")
            .text(data.description, colX.item, itemY, { width: 190 })
            .text(data.taxResult.sacCode, colX.sac, itemY)
            .text("1", colX.qty, itemY)
            .text(`${brand.pricing.currencySymbol}${data.taxResult.taxableAmount.toFixed(2)}`, colX.rate, itemY)
            .text(`${brand.pricing.currencySymbol}${data.taxResult.taxableAmount.toFixed(2)}`, colX.total, itemY);

        // --- 7. TAX SUMMARY ---
        const summaryY = itemY + 50;
        const summaryX = 350;

        doc.moveTo(50, summaryY).lineTo(550, summaryY).stroke();

        let currentY = summaryY + 10;

        // Taxable Amount
        doc
            .font("Helvetica")
            .text("Taxable Amount:", summaryX, currentY)
            .text(`${brand.pricing.currencySymbol}${data.taxResult.taxableAmount.toFixed(2)}`, 470, currentY, {
                align: "right",
            });
        currentY += 20;

        // Show CGST/SGST for intra-state or IGST for inter-state
        if (data.taxResult.cgstAmount > 0 && data.taxResult.sgstAmount > 0) {
            // Intra-state: CGST + SGST
            const cgstRate = (data.taxResult.meta.rateApplied * 100) / 2;

            doc
                .text(`CGST (${cgstRate.toFixed(2)}%):`, summaryX, currentY)
                .text(`${brand.pricing.currencySymbol}${data.taxResult.cgstAmount.toFixed(2)}`, 470, currentY, {
                    align: "right",
                });
            currentY += 20;

            doc
                .text(`SGST (${cgstRate.toFixed(2)}%):`, summaryX, currentY)
                .text(`${brand.pricing.currencySymbol}${data.taxResult.sgstAmount.toFixed(2)}`, 470, currentY, {
                    align: "right",
                });
            currentY += 20;
        }

        if (data.taxResult.igstAmount > 0) {
            // Inter-state: IGST
            const igstRate = data.taxResult.meta.rateApplied * 100;

            doc
                .text(`IGST (${igstRate.toFixed(2)}%):`, summaryX, currentY)
                .text(`${brand.pricing.currencySymbol}${data.taxResult.igstAmount.toFixed(2)}`, 470, currentY, {
                    align: "right",
                });
            currentY += 20;
        }

        // Total Tax
        doc
            .font("Helvetica-Bold")
            .text("Total Tax:", summaryX, currentY)
            .text(`${brand.pricing.currencySymbol}${data.taxResult.totalTax.toFixed(2)}`, 470, currentY, {
                align: "right",
            });
        currentY += 10;

        // Total line
        doc.moveTo(summaryX, currentY).lineTo(550, currentY).stroke();
        currentY += 10;

        // Grand Total
        doc
            .fontSize(12)
            .text("Total Amount:", summaryX, currentY)
            .text(`${brand.pricing.currencySymbol}${data.taxResult.totalAmount.toFixed(2)}`, 470, currentY, {
                align: "right",
            });

        // Amount in words
        currentY += 25;
        doc
            .fontSize(10)
            .font("Helvetica")
            .text(`Amount in words: ${numberToWords(data.taxResult.totalAmount)} Only`, 50, currentY);

        // --- 8. NOTES & TERMS ---
        currentY += 30;
        doc
            .fontSize(9)
            .text("Notes:", 50, currentY)
            .fontSize(8)
            .text("1. This is a computer-generated invoice and does not require a signature.", 50, currentY + 12)
            .text("2. Payment is non-refundable except as per our refund policy.", 50, currentY + 24)
            .text("3. All disputes are subject to the jurisdiction of courts in " + brand.company.address.city + ".", 50, currentY + 36);

        // --- 9. FOOTER ---
        doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .text("Thank you for your business!", 50, 700, { align: "center" });

        doc
            .fontSize(8)
            .font("Helvetica")
            .text(`${brand.company.legalName} | ${brand.contact.email} | ${brand.contact.phone}`, 50, 720, {
                align: "center",
            })
            .text(`${brand.company.address.city}, ${brand.company.address.state}`, 50, 732, {
                align: "center",
            });

        doc.end();
    });
}

// Helper function to convert number to words (Indian numbering system)
function numberToWords(num: number): string {
    if (num === 0) return "Zero";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    function convertLessThanThousand(n: number): string {
        if (n === 0) return "";

        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");

        return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "");
    }

    // Round to nearest integer
    const rounded = Math.round(num);

    if (rounded < 1000) return convertLessThanThousand(rounded);

    // Indian numbering: Crores, Lakhs, Thousands
    const crores = Math.floor(rounded / 10000000);
    const lakhs = Math.floor((rounded % 10000000) / 100000);
    const thousands = Math.floor((rounded % 100000) / 1000);
    const remainder = rounded % 1000;

    let result = "";

    if (crores > 0) result += convertLessThanThousand(crores) + " Crore ";
    if (lakhs > 0) result += convertLessThanThousand(lakhs) + " Lakh ";
    if (thousands > 0) result += convertLessThanThousand(thousands) + " Thousand ";
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim() + " Rupees";
}
