import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IphoneMockup } from '../common/IphoneMockup';
import { 
  ArrowLeft, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  Clock, 
  Sparkles, 
  Share2, 
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    storeSettings,
    addToCart,
    setCheckoutItem,
    setIsCheckoutOpen,
    navigate,
    showToast,
  } = useStore();

  const [customEventDetails, setCustomEventDetails] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Find target product
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p>Product not found.</p>
        <button
          onClick={() => navigate('shop')}
          className="mt-4 px-4 py-2 bg-[#5E8C84] text-white rounded-xl text-xs"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const price = product.salePrice ?? product.regularPrice;
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;

  const handleDirectOrder = () => {
    setCheckoutItem({
      product,
      quantity,
      eventDetails: customEventDetails,
    });
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, customEventDetails);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#26343C]/70 hover:text-[#5E8C84] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Invitation Templates</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Large iPhone Mockup with Video */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-28 space-y-4">
          <div className="relative">
            <IphoneMockup
              size="detail"
              videoUrl={product.previewVideo}
              posterUrl={product.previewPoster || product.image}
              productTitle={product.name}
              interactiveCard={product.eventSample}
              showAudioControl={true}
            />
          </div>

          {/* If second screen is enabled for this product, show second phone thumbnail / preview */}
          {product.hasSecondScreen && (
            <div className="w-full max-w-xs bg-white/90 rounded-2xl p-3 border border-[#DCE8E4] shadow-xs flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5E8C84]" />
                <span className="font-medium text-[#26343C]">Dual Screen Suite Included</span>
              </div>
              <span className="text-[11px] text-[#5E8C84] bg-[#DCE8E4] px-2 py-0.5 rounded-full font-medium">
                {product.secondScreenTitle || 'RSVP & Map'}
              </span>
            </div>
          )}

          <p className="text-xs text-[#26343C]/60 text-center">
            Tap screen to play or pause · Tap speaker icon for music
          </p>
        </div>

        {/* Right Column: Product Details & Order Form */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header & Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#5E8C84] font-medium tracking-wide">
                <span>Digital Invitation Suite</span>
                <span aria-hidden="true">·</span>
                <span>HD Motion Video</span>
                {(product.customBadge || product.bestseller || product.isNew) && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-800 font-semibold px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                      {product.customBadge || (product.bestseller ? 'Bestseller' : 'New Design')}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleShare}
                className="p-2 text-[#26343C]/60 hover:text-[#26343C] rounded-lg border border-[#DCE8E4] bg-white transition-colors flex items-center gap-1.5 text-xs"
                title="Share this design"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif-brand text-[#26343C] leading-snug">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-serif-brand font-semibold text-[#26343C]">
                {storeSettings.currencySymbol}{price}
              </span>
              {hasSale && (
                <span className="text-lg text-[#26343C]/40 line-through">
                  {storeSettings.currencySymbol}{product.regularPrice}
                </span>
              )}
              <span className="text-xs text-[#5E8C84] font-medium px-2.5 py-1 bg-[#DCE8E4] rounded-lg">
                Complete Customization Included
              </span>
            </div>

            <p className="text-sm text-[#26343C]/80 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Included Features Checklist */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <h3 className="font-serif-brand text-base font-semibold text-[#26343C]">
              What You Receive in this Suite:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#26343C]/80">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#DCE8E4] flex items-center justify-center text-[#5E8C84] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional Event Details Input */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#26343C]">
                Event Customization Details (Optional)
              </label>
              <span className="text-[11px] text-[#26343C]/50">
                You can also message us later on WhatsApp
              </span>
            </div>
            <textarea
              rows={3}
              value={customEventDetails}
              onChange={(e) => setCustomEventDetails(e.target.value)}
              placeholder="Names, event date, venue address, ceremony time, RSVP contact number, preferred music..."
              className="w-full p-3.5 bg-[#F2F6F6] rounded-xl text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84]"
            />

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('customize', product.id)}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#5E8C84] to-[#4d756e] hover:from-[#4d756e] hover:to-[#3d5e58] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Personalize This Template & Live Preview</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleDirectOrder}
                  className="w-full sm:flex-1 py-3 px-6 bg-[#26343C] hover:bg-[#1a242a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Order Directly via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto py-3 px-6 bg-white border border-[#DCE8E4] hover:bg-[#FAF7F2] text-[#26343C] text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#5E8C84]" />
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Quick Consultation Link */}
            <div className="pt-2 text-center">
              <a
                href={`https://wa.me/${(storeSettings.whatsAppNumber || '923425364018').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in "${product.name}" (${storeSettings.currencySymbol}${price}). Can I ask a few customization questions?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#5E8C84] hover:underline font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Questions about this suite? Chat on WhatsApp ({storeSettings.phone})</span>
              </a>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white/70 rounded-2xl border border-[#DCE8E4] flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#5E8C84] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#26343C]">24h Delivery</p>
                <p className="text-[10px] text-[#26343C]/60">Direct to your phone</p>
              </div>
            </div>

            <div className="p-4 bg-white/70 rounded-2xl border border-[#DCE8E4] flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-[#5E8C84] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#26343C]">3 Free Revisions</p>
                <p className="text-[10px] text-[#26343C]/60">Venue or timing shifts</p>
              </div>
            </div>

            <div className="p-4 bg-white/70 rounded-2xl border border-[#DCE8E4] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#5E8C84] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#26343C]">1080p Crystal HD</p>
                <p className="text-[10px] text-[#26343C]/60">Perfect for iPhone/Android</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
