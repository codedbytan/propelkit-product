import PDFDocument from "pdfkit";
import { TaxResult } from "./gst-engine";

interface InvoiceData {
    invoiceNumber: string;
    date: Date;
    customerName: string;
    customerGSTIN?: string;
    customerAddress?: string;
    taxResult: TaxResult;
    description: string; // 👈 Added dynamic description
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // --- 1. HEADER ---
        doc
            .fontSize(20)
            .text("TAX INVOICE", { align: "right" })
            .fontSize(10)
            .text("Original for Recipient", { align: "right" });

        doc.moveDown();

        // --- 2. SELLER DETAILS ---
        doc
            .fontSize(12)
            .text("Your Company Name", 50, 80)
            .fontSize(10)
            .text("123 Startup Hub, Tech Park")
            .text("Your City, State - 302022")
            .text("GSTIN: YOUR_GSTIN_HERE")
            .text("Email: billing@indicsaas.com");

        // --- 3. CUSTOMER DETAILS ---
        doc.text(`Invoice #: ${data.invoiceNumber}`, 400, 80);
        doc.text(`Date: ${data.date.toISOString().split("T")[0]}`, 400, 95);

        doc.moveDown(2);
        doc.text("Bill To:", 50, 180).font("Helvetica-Bold");
        doc.font("Helvetica").text(data.customerName);
        if (data.customerAddress) doc.text(data.customerAddress);
        if (data.customerGSTIN) doc.text(`GSTIN: ${data.customerGSTIN}`);

        // --- 4. TABLE ---
        const tableTop = 250;
        const colX = { item: 50, hsn: 250, qty: 300, price: 350, total: 450 };

        doc
            .font("Helvetica-Bold")
            .text("Description", colX.item, tableTop)
            .text("SAC/HSN", colX.hsn, tableTop)
            .text("Qty", colX.qty, tableTop)
            .text("Rate", colX.price, tableTop)
            .text("Amount", colX.total, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        const itemY = tableTop + 25;
        doc
            .font("Helvetica")
            .text(data.description, colX.item, itemY, { width: 190 }) // 👈 Uses the dynamic text now
            .text("9983", colX.hsn, itemY)
            .text("1", colX.qty, itemY)
            .text(data.taxResult.taxableAmount.toFixed(2), colX.price, itemY)
            .text(data.taxResult.taxableAmount.toFixed(2), colX.total, itemY);

        // --- 5. TAX BREAKDOWN ---
        let y = itemY + 30;
        const totalsX = 350;
        const valuesX = 450;

        doc.moveTo(300, y).lineTo(550, y).stroke();
        y += 10;

        doc.text("Taxable Value:", totalsX, y);
        doc.text(data.taxResult.taxableAmount.toFixed(2), valuesX, y);
        y += 15;

        if (data.taxResult.igstAmount > 0) {
            doc.text("IGST (18%):", totalsX, y);
            doc.text(data.taxResult.igstAmount.toFixed(2), valuesX, y);
            y += 15;
        } else {
            doc.text("CGST (9%):", totalsX, y);
            doc.text(data.taxResult.cgstAmount.toFixed(2), valuesX, y);
            y += 15;
            doc.text("SGST (9%):", totalsX, y);
            doc.text(data.taxResult.sgstAmount.toFixed(2), valuesX, y);
            y += 15;
        }

        doc.moveTo(300, y).lineTo(550, y).stroke();
        y += 10;

        doc.font("Helvetica-Bold").fontSize(12);
        doc.text("Total Payable:", totalsX, y);
        doc.text(`INR ${data.taxResult.totalAmount.toFixed(2)}`, valuesX, y);

        doc.fontSize(10).font("Helvetica").text("Place of Supply: " + data.taxResult.placeOfSupply, 50, 700);
        doc.text("This is a computer-generated invoice.", 50, 720, { align: "center" });

        doc.end();
    });
}