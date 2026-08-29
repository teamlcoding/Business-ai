import jsPDF from 'jspdf';

export interface DocumentPDFData {
  title: string;
  subtitle?: string;
  documentNumber: string;
  date: string;
  organizationName: string;
  organizationGstin?: string;
  organizationAddress?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  totalAmount?: number;
  taxAmount?: number;
  grandTotal?: number;
  notes?: string;
  status?: string;
}

export function generateProfessionalPDF(data: DocumentPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.organizationName.toUpperCase(), 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  if (data.organizationGstin) {
    doc.text(`GSTIN: ${data.organizationGstin}`, 14, 25);
  }

  // Document Type & Number
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title.toUpperCase(), pageWidth - 14, 18, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`#${data.documentNumber}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Date: ${data.date}`, pageWidth - 14, 30, { align: 'right' });

  let y = 45;

  // Bill To / Client Section
  if (data.clientName) {
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, pageWidth - 28, 24, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 24, 'S');

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIPIENT / CLIENT DETAILS', 18, y + 6);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(data.clientName, 18, y + 13);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const clientMeta = [data.clientEmail, data.clientPhone].filter(Boolean).join(' | ');
    if (clientMeta) doc.text(clientMeta, 18, y + 19);

    y += 30;
  }

  // Table Headers
  if (data.items && data.items.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 8, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);

    doc.text('DESCRIPTION', 18, y + 5.5);
    doc.text('QTY', pageWidth - 80, y + 5.5, { align: 'right' });
    doc.text('UNIT PRICE', pageWidth - 45, y + 5.5, { align: 'right' });
    doc.text('AMOUNT', pageWidth - 18, y + 5.5, { align: 'right' });

    y += 10;

    // Items
    doc.setFont('helvetica', 'normal');
    data.items.forEach((item, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.text(item.description, 18, y);
      doc.text(String(item.quantity), pageWidth - 80, y, { align: 'right' });
      doc.text(`Rs. ${item.unitPrice.toLocaleString('en-IN')}`, pageWidth - 45, y, { align: 'right' });
      doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, pageWidth - 18, y, { align: 'right' });

      y += 8;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;
  }

  // Totals Section
  const total = data.grandTotal ?? data.totalAmount ?? 0;
  const tax = data.taxAmount ?? (total * 0.18);
  const grandTotal = total + (data.taxAmount ? 0 : tax);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Subtotal:', pageWidth - 60, y);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${total.toLocaleString('en-IN')}`, pageWidth - 18, y, { align: 'right' });
  y += 6;

  doc.setTextColor(100, 116, 139);
  doc.text('Tax / GST (18%):', pageWidth - 60, y);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${tax.toLocaleString('en-IN')}`, pageWidth - 18, y, { align: 'right' });
  y += 8;

  // Grand Total Highlight
  doc.setFillColor(15, 23, 42);
  doc.rect(pageWidth - 80, y - 4, 66, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', pageWidth - 76, y + 2);
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, pageWidth - 18, y + 2, { align: 'right' });

  y += 20;

  // Footer / Status & Verification
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated tax document powered by BusinessOS AI.', 14, 280);
  doc.text(`Verified Status: ${data.status || 'CONFIRMED'}`, pageWidth - 14, 280, { align: 'right' });

  return doc;
}

export function downloadPDF(data: DocumentPDFData, filename?: string) {
  const pdf = generateProfessionalPDF(data);
  const name = filename || `${data.title.toLowerCase().replace(/\s+/g, '_')}_${data.documentNumber}.pdf`;
  pdf.save(name);
}

export function sharePDFWhatsApp(data: DocumentPDFData, phone?: string) {
  const pdf = generateProfessionalPDF(data);
  const pdfBlob = pdf.output('blob');
  const file = new File([pdfBlob], `${data.title}_${data.documentNumber}.pdf`, { type: 'application/pdf' });

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({
      title: `${data.title} - ${data.documentNumber}`,
      text: `Please find attached ${data.title} #${data.documentNumber} from ${data.organizationName}.`,
      files: [file],
    }).catch((err) => console.log('Share canceled or failed:', err));
  } else {
    // Fallback download + open WhatsApp Web
    pdf.save(`${data.title}_${data.documentNumber}.pdf`);
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(`Hello, I have generated and downloaded ${data.title} #${data.documentNumber} from ${data.organizationName} (Rs. ${(data.grandTotal || data.totalAmount || 0).toLocaleString('en-IN')}).`);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  }
}
