import { CheckCircle, XCircle, RefreshCw, Package } from 'lucide-react';

export const getStatusInfo = (status) => {
  const statusText = {
    completed: "Selesai",
    pending: "Tertunda",
    cancelled: "Dibatalkan",
    refunded: "Dikembalikan"
  };

  const badgeClasses = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-purple-100 text-purple-700 border-purple-200"
  };

  const Icon = {
    completed: CheckCircle,
    pending: RefreshCw,
    cancelled: XCircle,
    refunded: RefreshCw
  }[status] || Package;

  return {
    text: statusText[status] || status.charAt(0).toUpperCase() + status.slice(1),
    className: `${badgeClasses[status] || "bg-gray-100 text-gray-600 border-gray-200"} px-3 py-1.5 inline-flex items-center text-sm leading-5 font-semibold rounded-lg border`,
    Icon
  };
}; 