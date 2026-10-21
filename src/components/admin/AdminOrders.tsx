import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  ShoppingBag, 
  Trash2, 
  Eye, 
  MessageCircle, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  X,
  Search,
  CheckCircle2
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, storeSettings } = useStore();

  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Client Orders ({orders.length})
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Real customer orders logged directly through checkout and WhatsApp.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#26343C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, client name, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F2F6F6] rounded-lg text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-1.5 bg-[#F2F6F6] rounded-lg text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none"
          >
            <option value="all">All Order Statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#DCE8E4] overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#26343C]/60">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCE8E4] bg-[#F2F6F6]/60 text-[#26343C]/70 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#26343C]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#26343C]/70 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#26343C]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#26343C]/60">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#26343C]/80 max-w-xs truncate">
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#5E8C84] whitespace-nowrap">
                        {storeSettings.currencySymbol}{ord.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                              ord.customerName
                            )},%20this%20is%20MIT%20Invitations%20regarding%20your%20order%20${ord.orderNumber}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#1EBE5D] hover:bg-[#25D366]/15 rounded-lg transition-colors"
                            title="Open WhatsApp Chat with client"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(ord)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(viewingOrder.status)}`}>
                    Status: {viewingOrder.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#26343C]/50">
                    {new Date(viewingOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-2xl font-serif-brand font-semibold text-[#26343C] mt-1">
                  Order #{viewingOrder.orderNumber}
                </h3>
              </div>

              {/* Client Info Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-2 text-xs">
                <p className="font-semibold text-sm text-[#26343C]">{viewingOrder.customerName}</p>
                <div className="flex items-center gap-2 text-[#26343C]/80">
                  <Phone className="w-3.5 h-3.5 text-[#5E8C84]" />
                  <span>{viewingOrder.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#26343C]/80">
                  <Mail className="w-3.5 h-3.5 text-[#5E8C84]" />
                  <span>{viewingOrder.customerEmail}</span>
                </div>
                {viewingOrder.eventDate && (
                  <div className="flex items-center gap-2 text-[#26343C]/80">
                    <Calendar className="w-3.5 h-3.5 text-[#5E8C84]" />
                    <span>Event Date: {viewingOrder.eventDate}</span>
                  </div>
                )}
              </div>

              {/* Event Notes */}
              {viewingOrder.notes && (
                <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-1.5 text-xs">
                  <span className="font-semibold text-[#5E8C84]">Customization Notes & Details:</span>
                  <p className="text-[#26343C]/80 whitespace-pre-wrap leading-relaxed">
                    {viewingOrder.notes}
                  </p>
                </div>
              )}

              {/* Ordered Items */}
              <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-3">
                <h4 className="text-xs font-semibold text-[#26343C]">Ordered Suites</h4>
                <div className="space-y-2 divide-y divide-slate-100">
                  {viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-[#26343C]">{item.productName}</p>
                        <p className="text-[11px] text-[#26343C]/60">Qty: {item.quantity}</p>
                        {item.eventDetails && (
                          <p className="text-[10px] text-[#5E8C84] mt-0.5">Note: {item.eventDetails}</p>
                        )}
                      </div>
                      <span className="font-semibold text-[#5E8C84]">
                        {storeSettings.currencySymbol}{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-serif-brand font-semibold text-sm text-[#26343C]">
                  <span>Total Amount</span>
                  <span>{storeSettings.currencySymbol}{viewingOrder.total}</span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={`https://wa.me/${viewingOrder.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(viewingOrder.customerName)}!%20This%20is%20MIT%20Invitations%20regarding%20your%20order%20${viewingOrder.orderNumber}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2.5 bg-[#DCE8E4] text-[#26343C] text-xs font-semibold rounded-xl hover:bg-[#cadfd8] transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        title="Delete Order Record"
        message={`Are you sure you want to delete order #${orderToDelete?.orderNumber} for ${orderToDelete?.customerName}? This will permanently remove this transaction from the records.`}
        confirmLabel="Delete Order"
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};
