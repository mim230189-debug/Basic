import { jsPDF } from 'jspdf';
import { Invoice, Payment, CompanySettings } from '../types';

export function generateInvoicePDF(invoice: Invoice, settings: CompanySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Primary Blue: #1e40af, Accent Orange: #f97316, Dark Slate: #0f172a, Light Gray: #f8fafc
  // Header Banner
  doc.setFillColor(30, 64, 175); // #1e40af
  doc.rect(0, 0, 210, 38, 'F');

  // Orange accent bar
  doc.setFillColor(249, 115, 22); // #f97316
  doc.rect(0, 38, 210, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'WINK NETWORK ISP', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.tagline || 'High-Speed Broadband & Fiber Internet Services', 14, 25);
  doc.text(`Contact: ${settings.contactNumber} | Email: ${settings.email}`, 14, 32);

  // Invoice Title on Right
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE / BILL', 196, 20, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.id}`, 196, 28, { align: 'right' });
  doc.text(`Billing Month: ${invoice.billingMonth}`, 196, 33, { align: 'right' });

  // Status Badge box
  let statusColor: [number, number, number] = [234, 179, 8]; // yellow
  let statusText = invoice.status.toUpperCase();
  if (invoice.status === 'paid') statusColor = [22, 163, 74];
  else if (invoice.status === 'overdue') statusColor = [220, 38, 38];
  else if (invoice.status === 'unpaid') statusColor = [239, 68, 68];
  else if (invoice.status === 'partially_paid') statusColor = [249, 115, 22];

  doc.setFillColor(...statusColor);
  doc.roundedRect(160, 48, 36, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText, 178, 53.5, { align: 'center' });

  // Bill To Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO (CUSTOMER DETAILS):', 14, 54);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${invoice.customerName}`, 14, 61);
  doc.text(`Customer ID: ${invoice.customerId}`, 14, 67);
  doc.text(`Mobile: ${invoice.customerMobile}`, 14, 73);

  // Bill Dates Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${invoice.billingDate}`, 120, 67);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`Due Date: ${invoice.dueDate}`, 120, 73);

  // Line Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 80, 196, 80);

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 85, 182, 9, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM / SERVICE DESCRIPTION', 18, 91);
  doc.text('PACKAGE SPEED', 110, 91);
  doc.text('AMOUNT (BDT)', 192, 91, { align: 'right' });

  // Table Row 1: Monthly Internet Package
  let y = 101;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Monthly Broadband Internet Fee (${invoice.packageName})`, 18, y);
  doc.text(invoice.packageName, 110, y);
  doc.text(`BDT ${invoice.currentBill.toLocaleString()}`, 192, y, { align: 'right' });

  // Row 2: Additional Charges if any
  if (invoice.additionalCharges > 0) {
    y += 7;
    doc.text('Additional / Installation Charges', 18, y);
    doc.text('-', 110, y);
    doc.text(`BDT ${invoice.additionalCharges.toLocaleString()}`, 192, y, { align: 'right' });
  }

  // Row 3: Discount if any
  if (invoice.discount > 0) {
    y += 7;
    doc.setTextColor(22, 163, 74);
    doc.text('Promotional Discount', 18, y);
    doc.text('-', 110, y);
    doc.text(`- BDT ${invoice.discount.toLocaleString()}`, 192, y, { align: 'right' });
    doc.setTextColor(15, 23, 42);
  }

  // Row 4: Previous Due / Arrears if any
  if (invoice.previousDue > 0) {
    y += 7;
    doc.setTextColor(220, 38, 38);
    doc.text('Previous Outstanding Due / Arrears', 18, y);
    doc.text('-', 110, y);
    doc.text(`+ BDT ${invoice.previousDue.toLocaleString()}`, 192, y, { align: 'right' });
    doc.setTextColor(15, 23, 42);
  }

  // Summary box
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  y += 8;
  const summaryX = 120;
  const valX = 192;

  doc.setFont('helvetica', 'normal');
  doc.text('Total Payable Amount:', summaryX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`BDT ${invoice.totalPayable.toLocaleString()}`, valX, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text('Total Amount Paid:', summaryX, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`BDT ${invoice.amountPaid.toLocaleString()}`, valX, y, { align: 'right' });

  y += 8;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(summaryX - 4, y - 5, 80, 11, 1.5, 1.5, 'F');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Remaining Balance / Due:', summaryX, y + 2);
  doc.text(`BDT ${invoice.remainingBalance.toLocaleString()}`, valX, y + 2, { align: 'right' });

  // Payment Options Box
  y += 24;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'S');

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('HOW TO PAY YOUR BILL:', 18, y + 7);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`1. bKash Merchant: ${settings.bkashMerchant || '01700-112233'} (Make Payment)`, 18, y + 14);
  doc.text(`2. Nagad Merchant: ${settings.nagadMerchant || '01800-445566'} | Rocket: ${settings.rocketMerchant || '01900-778899'}`, 18, y + 20);
  doc.text(`3. Bank Account: ${settings.bankDetails || 'WINK NETWORK ISP, City Bank, A/C: 1102938481001'}`, 18, y + 26);
  doc.text('4. Please submit your Transaction ID via the Customer Mobile Portal or contact helpline.', 18, y + 31);

  // Footer notes & signature
  y += 48;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', 14, y);
  doc.text('- Bills must be cleared before the due date to avoid service interruption.', 14, y + 4.5);
  doc.text('- For any billing inquiries, call 24/7 Hotline: ' + settings.supportNumber, 14, y + 9);

  // Authorized Signature
  doc.line(145, y + 12, 192, y + 12);
  doc.text('Authorized Billing Officer', 150, y + 16);
  doc.text(settings.companyName || 'WINK NETWORK ISP', 151, y + 20);

  // Bottom color bar
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Thank you for choosing ${settings.companyName || 'WINK NETWORK ISP'}! This is an electronically generated document.`, 105, 293, { align: 'center' });

  // Save PDF
  doc.save(`${invoice.id}_${invoice.customerName.replace(/\s+/g, '_')}.pdf`);
}

export function generatePaymentReceiptPDF(payment: Payment, invoice: Invoice | undefined, settings: CompanySettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // A5 receipt format
  });

  // Header Banner
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 148, 28, 'F');

  doc.setFillColor(249, 115, 22);
  doc.rect(0, 28, 148, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'WINK NETWORK ISP', 10, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL PAYMENT RECEIPT', 10, 21);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MONEY RECEIPT', 138, 15, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt: ${payment.receiptNumber}`, 138, 22, { align: 'right' });

  // Details
  let y = 38;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  doc.text(`Payment ID: ${payment.id}`, 10, y);
  doc.text(`Date: ${payment.paymentDate}`, 95, y);

  y += 7;
  doc.text(`Customer ID: ${payment.customerId}`, 10, y);
  doc.text(`Payment Method: ${payment.method}`, 95, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Customer Name: ${payment.customerName}`, 10, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Trx ID: ${payment.transactionId || 'N/A'}`, 95, y);

  if (invoice) {
    y += 7;
    doc.text(`Invoice Ref: ${invoice.id} (${invoice.billingMonth})`, 10, y);
    doc.text(`Package: ${invoice.packageName}`, 95, y);
  }

  // Amount Box
  y += 10;
  doc.setFillColor(240, 253, 244); // light green
  doc.roundedRect(10, y, 128, 18, 2, 2, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(10, y, 128, 18, 2, 2, 'S');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('RECEIVED AMOUNT (BDT):', 15, y + 7);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`BDT ${payment.amount.toLocaleString()} /=`, 15, y + 14);

  // Status tag
  doc.setFillColor(22, 163, 74);
  doc.roundedRect(95, y + 4, 38, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text('VERIFIED & PAID', 114, y + 9.5, { align: 'center' });

  // Notes
  y += 26;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Collected by: ${payment.collectedBy} (${payment.collectedByRole})`, 10, y);
  if (payment.notes) {
    y += 5;
    doc.text(`Notes: ${payment.notes}`, 10, y);
  }

  // Signature
  y += 24;
  doc.line(90, y, 138, y);
  doc.text('Authorized Receiver Signature', 92, y + 4);

  // Footer bar
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 202, 148, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`Helpline: ${settings.supportNumber} | www.winkisp.com`, 74, 207, { align: 'center' });

  doc.save(`Receipt_${payment.receiptNumber}_${payment.customerId}.pdf`);
}
