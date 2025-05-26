import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatToRupiah, formatDate, formatTransactionId } from '../utils/formatters';
import {
  defaultTableStyles,
  defaultHeadStyles,
  defaultMargins,
  invoiceColumnStyles,
  reportColumnStyles
} from '../utils/pdfStyles';
import {
  INVOICE_COLUMNS,
  REPORT_COLUMNS,
  PDF_POSITIONS,
  PDF_FONTS
} from '../utils/pdfConstants';

export const generateTransactionPDF = (transaction, items) => {
  const doc = new jsPDF();
  let finalY;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.title + 2);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text('Invoice Transaksi', PDF_POSITIONS.title.x, PDF_POSITIONS.title.y, { align: 'center' });
  // Line under title
  doc.setDrawColor(230, 236, 240); // soft gray
  doc.setLineWidth(0.8);
  doc.line(30, PDF_POSITIONS.title.y + 4, 180, PDF_POSITIONS.title.y + 4);

  // Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.content);
  doc.setTextColor(55, 65, 81); // gray-800
  doc.text(`ID Transaksi: ${formatTransactionId(transaction._id)}`, PDF_POSITIONS.transactionId.x, PDF_POSITIONS.transactionId.y);
  doc.text(`Tanggal: ${formatDate(transaction.transactionDate)}`, PDF_POSITIONS.date.x, PDF_POSITIONS.date.y);
  doc.text(`Pelanggan: ${transaction.customer?.name || 'Tidak diketahui'}`, PDF_POSITIONS.customer.x, PDF_POSITIONS.customer.y);

  const tableRows = items.map(item => [
    item.product?.name || 'Produk tidak tersedia',
    item.quantity.toString(),
    formatToRupiah(item.priceAtTransaction || (item.subtotal / item.quantity)),
    formatToRupiah(item.subtotal)
  ]);

  autoTable(doc, {
    head: [INVOICE_COLUMNS],
    body: tableRows,
    startY: PDF_POSITIONS.table.y,
    theme: 'grid',
    styles: defaultTableStyles,
    headStyles: defaultHeadStyles,
    columnStyles: invoiceColumnStyles,
    margin: defaultMargins,
    tableLineWidth: 0.4,
    tableLineColor: [230, 236, 240],
    didDrawPage: (data) => {
      finalY = data.cursor.y;
    }
  });

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.content + 2);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(`Total: ${formatToRupiah(transaction.totalAmount)}`, PDF_POSITIONS.total.x, finalY + PDF_POSITIONS.total.y, { align: 'right' });

  doc.save(`Invoice_${transaction._id}.pdf`);
};

export const generateTransactionsReport = (transactions) => {
  const doc = new jsPDF();
  let finalY;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.title + 2);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text('Laporan Transaksi', PDF_POSITIONS.title.x, PDF_POSITIONS.title.y, { align: 'center' });
  // Line under title
  doc.setDrawColor(230, 236, 240);
  doc.setLineWidth(0.8);
  doc.line(30, PDF_POSITIONS.title.y + 4, 180, PDF_POSITIONS.title.y + 4);

  // Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(PDF_FONTS.content);
  doc.setTextColor(55, 65, 81); // gray-800
  doc.text(`Tanggal Cetak: ${formatDate(new Date(), 'short')}`, PDF_POSITIONS.transactionId.x, PDF_POSITIONS.transactionId.y);
  doc.text(`Total Transaksi: ${transactions.length}`, PDF_POSITIONS.date.x, PDF_POSITIONS.date.y);

  const tableRows = transactions.map(transaction => [
    formatTransactionId(transaction._id),
    formatDate(transaction.transactionDate, 'short'),
    transaction.customer?.name || 'Tidak diketahui',
    formatToRupiah(transaction.totalAmount)
  ]);

  autoTable(doc, {
    head: [REPORT_COLUMNS],
    body: tableRows,
    startY: PDF_POSITIONS.reportTable.y,
    theme: 'grid',
    styles: defaultTableStyles,
    headStyles: defaultHeadStyles,
    columnStyles: reportColumnStyles,
    margin: defaultMargins,
    tableLineWidth: 0.4,
    tableLineColor: [230, 236, 240],
    didDrawPage: (data) => {
      finalY = data.cursor.y;
    }
  });

  // Total
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_FONTS.content + 2);
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text(`Total Penjualan: ${formatToRupiah(totalAmount)}`, PDF_POSITIONS.total.x, finalY + PDF_POSITIONS.total.y, { align: 'right' });

  doc.save(`Laporan_Transaksi_${formatDate(new Date(), 'short').replace(/\//g, '-')}.pdf`);
}; 