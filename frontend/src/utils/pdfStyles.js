export const defaultTableStyles = {
  fontSize: 10,
  cellPadding: 4,
  overflow: 'linebreak',
  halign: 'left',
  lineColor: [230, 236, 240], // soft gray border
  lineWidth: 0.4,
  textColor: [55, 65, 81], // gray-800
  font: 'helvetica',
};

export const defaultHeadStyles = {
  fillColor: [59, 130, 246], // blue-500
  textColor: 255,
  fontStyle: 'bold',
  fontSize: 11,
  halign: 'center',
  cellPadding: 5,
  lineColor: [59, 130, 246], // blue-500
  lineWidth: 0.6,
  font: 'helvetica',
};

export const defaultMargins = {
  left: 20,
  right: 20
};

export const invoiceColumnStyles = {
  0: { cellWidth: 65 },
  1: { cellWidth: 15, halign: 'center' },
  2: { cellWidth: 35, halign: 'right' },
  3: { cellWidth: 35, halign: 'right' }
};

export const reportColumnStyles = {
  0: { cellWidth: 25 },
  1: { cellWidth: 35 },
  2: { cellWidth: 60 },
  3: { cellWidth: 35, halign: 'right' }
}; 