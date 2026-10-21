import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, MessageCircle, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Order } from '../../types';

export const OrderModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutItem,
    setCheckoutItem,
    cart,
    cartTotal,
    storeSettings,
    designSettings,
    submitOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');

  // Submitted state
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string>('');

  if (!isCheckoutOpen) return null;

  // Items to order (either single direct item or entire cart)
  const items = checkoutItem
    ? [
        {
          productId: checkoutItem.product.id,
          productName: checkoutItem.product.name,
          price: checkoutItem.product.salePrice ?? checkoutItem.product.regularPrice,
          quantity: checkoutItem.quantity,
          eventDetails: checkoutItem.eventDetails,
          image: checkoutItem.product.image,
        },
      ]
    : cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.salePrice ?? item.product.regularPrice,
        quantity: item.quantity,
        eventDetails: item.eventDetails,
        image: item.product.image,
      }));

  const orderTotal = checkoutItem
    ? (checkoutItem.product.salePrice ?? checkoutItem.product.regularPrice) * checkoutItem.quantity
    : cartTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) return;

    try {
      const result = await submitOrder({
        customerName,
        customerPhone,
        customerEmail,
        eventDate,
        notes,
        items,
      });

      setSubmittedOrder(result.order);
      setWhatsAppUrl(result.whatsAppUrl);
    } catch (err) {
      console.error('Order submission error:', err);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCheckoutItem(null);
    setSubmittedOrder(null);
    setWhatsAppUrl('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setEventDate('');
    setNotes('');
  };

  const handleOpenWhatsApp = () => {
    if (whatsAppUrl) {
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200 my-8"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C] shadow-xs transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedOrder ? (
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                Direct Atelier Order
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-brand text-[#26343C] mt-1">
                Customize Your Invitation Suite
              </h2>
              <p className="text-xs sm:text-sm text-[#26343C]/70 mt-1">
                Provide your celebration details below. Your order will be safely logged and forwarded to our designer via WhatsApp for instant proofing.
              </p>
            </div>

            {/* Order Items Summary Box */}
            <div className="mb-6 p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#5E8C84] border-b border-slate-100 pb-2">
                <span>Selected Items ({items.length})</span>
                <span>Total: {storeSettings.currencySymbol}{orderTotal}</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-xs text-[#26343C]">
                    <span className="font-medium truncate max-w-[280px]">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold text-[#5E8C84]">
                      {storeSettings.currencySymbol}{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Camilla Dupont"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Event Details & Customization Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Names of couple or host, venue location, ceremony time, dress code, RSVP deadline, preferred music track or special requests..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84] transition-colors"
                />
              </div>

              <div className="p-3 bg-[#DCE8E4]/40 rounded-xl flex items-center gap-2.5 text-[11px] text-[#26343C]/80">
                <ShieldCheck className="w-4 h-4 text-[#5E8C84] shrink-0" />
                <span>
                  No online card payment required right now. You review proofs and pay conveniently via your preferred method during WhatsApp consultation.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Save Order & Send on WhatsApp ({storeSettings.phone})</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#DCE8E4] text-[#5E8C84] mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                Order Confirmed & Saved
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-brand text-[#26343C] mt-1">
                Order #{submittedOrder.orderNumber}
              </h2>
              <p className="text-xs sm:text-sm text-[#26343C]/70 mt-2 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-[#26343C]">{submittedOrder.customerName}</span>! Your invitation request is recorded in our system.
              </p>
            </div>

            {/* Big WhatsApp CTA */}
            <div className="p-5 bg-white rounded-2xl border border-[#5E8C84]/40 shadow-sm max-w-md mx-auto space-y-3">
              <p className="text-xs text-[#26343C]/80">
                Click the button below to open WhatsApp with your pre-filled order details and chat directly with our design atelier:
              </p>
              
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Send on WhatsApp ({storeSettings.phone})</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>

              <p className="text-[10px] text-[#26343C]/60">
                Target WhatsApp: {storeSettings.whatsAppNumber} (Configured in Admin Settings)
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 text-xs font-medium text-[#26343C] bg-[#DCE8E4]/60 hover:bg-[#DCE8E4] rounded-xl transition-colors"
              >
                Back to Boutique
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
