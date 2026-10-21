import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    cartCount,
    storeSettings,
    setIsCheckoutOpen,
    setCheckoutItem,
    navigate,
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setCheckoutItem(null); // Full cart checkout
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F2F6F6] shadow-2xl flex flex-col border-l border-[#DCE8E4]">
          
          {/* Header */}
          <div className="p-6 bg-white border-b border-[#DCE8E4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#5E8C84]" />
              <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
                Your Selection ({cartCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-[#26343C]/60 hover:text-[#26343C] hover:bg-[#DCE8E4]/50 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#DCE8E4] flex items-center justify-center text-[#5E8C84] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif-brand text-lg font-medium text-[#26343C]">
                  Your cart is empty
                </h4>
                <p className="mt-1 text-xs text-[#26343C]/70 max-w-xs">
                  Discover our animated digital templates and add your favorite design to get started.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#5E8C84] text-white text-xs font-semibold rounded-xl hover:bg-[#4d756e] transition-colors"
                >
                  Explore Invitation Shop
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const price = item.product.salePrice ?? item.product.regularPrice;
                return (
                  <div
                    key={item.product.id}
                    className="p-4 bg-white rounded-2xl border border-[#DCE8E4] shadow-xs flex gap-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-xl bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-serif-brand text-sm font-medium text-[#26343C] leading-snug">
                            {item.product.name}
                          </h5>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[#26343C]/40 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-[#5E8C84] mt-1">
                          {storeSettings.currencySymbol}{price}
                        </p>
                        {item.eventDetails && (
                          <p className="text-[11px] text-[#26343C]/60 truncate max-w-[200px] mt-1">
                            Note: {item.eventDetails}
                          </p>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#DCE8E4] rounded-lg bg-[#F2F6F6]">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2.5 py-0.5 text-xs text-[#26343C] hover:bg-[#DCE8E4] rounded-l-md"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium text-[#26343C]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2.5 py-0.5 text-xs text-[#26343C] hover:bg-[#DCE8E4] rounded-r-md"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-[#26343C]">
                          {storeSettings.currencySymbol}{price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#DCE8E4] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#26343C]/70 text-xs">
                  <span>Subtotal</span>
                  <span>{storeSettings.currencySymbol}{cartTotal}</span>
                </div>
                <div className="flex justify-between text-[#26343C]/70 text-xs">
                  <span>Digital Delivery (WhatsApp & Email)</span>
                  <span className="text-[#5E8C84] font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-serif-brand text-base font-semibold text-[#26343C] pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span>{storeSettings.currencySymbol}{cartTotal}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#DCE8E4]/40 rounded-xl flex items-center gap-2 text-[11px] text-[#26343C]/80">
                <ShieldCheck className="w-4 h-4 text-[#5E8C84] shrink-0" />
                <span>Orders are submitted directly to our designer on WhatsApp with zero waiting.</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-sm font-medium rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Complete Order on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
