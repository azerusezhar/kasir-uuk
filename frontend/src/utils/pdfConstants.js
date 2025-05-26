export const INVOICE_COLUMNS = ["Produk", "Jumlah", "Harga", "Subtotal"];
export const REPORT_COLUMNS = ["ID", "Tanggal", "Pelanggan", "Total"];

export const PDF_POSITIONS = {
  title: { x: 105, y: 20 },
  transactionId: { x: 20, y: 40 },
  date: { x: 20, y: 50 },
  customer: { x: 20, y: 60 },
  table: { y: 70 },
  reportTable: { y: 60 },
  total: { x: 190, y: 10 }
};

export const PDF_FONTS = {
  title: 22,
  content: 13
}; 