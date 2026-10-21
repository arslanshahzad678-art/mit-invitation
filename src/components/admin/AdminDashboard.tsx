import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Layers, 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  PlusCircle, 
  Palette,
  FileDown
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { orders, products, categories, reviews, storeSettings, updateOrderStatus } = useStore();

  // STRICTLY REAL STORED DATA - NO FAKE STATS
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'new').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E8C84]">
            Store Metrics (Cloud Firestore Live)
          </span>
          <h2 className="text-2xl font-serif-brand text-[#26343C] mt-0.5">
            Atelier Overview
          </h2>
          <p className="text-xs text-[#26343C]/70 mt-1">
            All statistics reflect authentic shared Cloud Firestore records across devices.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className="px-3.5 py-2 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Template</span>
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className="px-3.5 py-2 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] text-[#26343C] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Design Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className="px-3.5 py-2 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] text-[#26343C] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#26343C]/70">
            <span>Recorded Revenue</span>
            <DollarSign className="w-4 h-4 text-[#5E8C84]" />
          </div>
          <p className="text-3xl font-serif-brand font-bold text-[#26343C]">
            {storeSettings.currencySymbol}{totalRevenue}
          </p>
          <p className="text-[11px] text-[#26343C]/50">
            From {totalOrders} total submitted orders
          </p>
        </div>

        {/* New Orders */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#26343C]/70">
            <span>Pending New Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-serif-brand font-bold text-amber-700">
            {newOrders}
          </p>
          <p className="text-[11px] text-[#26343C]/50">
            {confirmedOrders} confirmed · {completedOrders} completed
          </p>
        </div>

        {/* Products */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#26343C]/70">
            <span>Active Products</span>
            <Package className="w-4 h-4 text-[#5E8C84]" />
          </div>
          <p className="text-3xl font-serif-brand font-bold text-[#26343C]">
            {publishedProducts}
          </p>
          <p className="text-[11px] text-[#26343C]/50">
            Plus {draftProducts} drafts in catalog
          </p>
        </div>

        {/* Categories & Reviews */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#26343C]/70">
            <span>Categories & Reviews</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-3xl font-serif-brand font-bold text-[#26343C]">
            {categories.length} <span className="text-sm font-normal text-[#26343C]/60">cats</span> / {reviews.length} <span className="text-sm font-normal text-[#26343C]/60">revs</span>
          </p>
          <p className="text-[11px] text-[#26343C]/50">
            Average customer rating: {avgRating} / 5.0
          </p>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-[#DCE8E4] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
              Recent Client Orders
            </h3>
            <p className="text-xs text-[#26343C]/60">
              Orders placed by customers via the web checkout form
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-semibold text-[#5E8C84] hover:underline flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#26343C]/60">
            No orders submitted yet. When a visitor places an order, it will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCE8E4] text-[#26343C]/60 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => {
                  const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-medium text-[#26343C]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-[#26343C]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#26343C]/60">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-3 text-[#26343C]/80 max-w-[200px] truncate">
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#5E8C84]">
                        {storeSettings.currencySymbol}{ord.total}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${
                            ord.status === 'new'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : ord.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#25D366]/10 text-[#1EBE5D] hover:bg-[#25D366]/20 rounded-md transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Chat</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
