export const formatToRupiah = (amount) => {
  if (typeof amount !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString, format = 'long') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = format === 'long' 
    ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

export const formatTransactionId = (id) => {
  if (!id) return '-';
  return `#${id.substring(id.length - 7).toUpperCase()}`;
}; 