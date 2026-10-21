import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { IphoneMockup } from './IphoneMockup';
import { 
  X, 
  Check, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Sparkles
} from 'lucide-react';

export const QuickPreviewModal: React.FC = () => {
  const {
    quickPreviewProduct,
    setQuickPreviewProduct,
    addToCart,
    setCheckoutItem,
    setIsCheckoutOpen,
    storeSettings,
    navigate,
  } = useStore();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Enable sound in modal preview

  useEffect(() => {
    // Autoplay with sound enabled when modal opens
    setIsPlaying(true);
  }, [quickPreviewProduct]);

  if (!quickPreviewProduct) return null;

  const product = quickPreviewProduct;
  const price = product.salePrice ?? product.regularPrice;
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;

  const handleDirectOrder = () => {
    setCheckoutItem({
      product,
      quantity: 1,
      eventDetails: '',
    });
    setQuickPreviewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleViewFullDetail = () => {
    const id = product.id;
    setQuickPreviewProduct(null);
    navigate('product-detail', id);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const badgeText =
    product.customBadge ||
    (product.bestseller ? 'Bestseller' : product.isNew ? 'New' : product.featured ? 'Popular' : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto sm:p-4">
      {/* Container: Fullscreen on mobile, rounded card on tablet/desktop */}
      <div
        className="w-full min-h-screen sm:min-h-0 sm:max-w-4xl bg-[#F2F6F6] sm:rounded-3xl p-5 sm:p-8 shadow-2xl border-0 sm:border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-between my-0 sm:my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header / Close Button */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#DCE8E4]">
          <div className="flex items-center gap-2">
            <span className="font-serif-brand font-medium text-sm text-[#26343C]">
              Live Invitation Preview
            </span>
            {badgeText && (
              <span className="px-2 py-0.5 bg-[#DCE8E4] text-[#26343C] text-[10px] font-semibold uppercase tracking-wider rounded-full">
                {badgeText}
              </span>
            )}
          </div>

          <button
            onClick={() => setQuickPreviewProduct(null)}
            className="p-2 rounded-full bg-white text-[#26343C] shadow-sm hover:bg-slate-100 transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center py-4 sm:py-6 flex-1">
          
          {/* Left Column: Larger iPhone Mockup with Controls */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative">
              <IphoneMockup
                size="modal"
                videoUrl={product.previewVideo}
                posterUrl={product.previewPoster || product.image}
                productTitle={product.name}
                isPlaying={isPlaying}
                isMuted={isMuted}
                onTogglePlay={togglePlay}
                onToggleMute={toggleMute}
                showAudioControl={false}
                interactiveCard={product.eventSample}
              />
            </div>

            {/* Quick Media Toolbar: Sound on/off, Play/pause, Indicator */}
            <div className="mt-4 flex items-center justify-center gap-3 bg-white/90 backdrop-blur-xs py-2 px-4 rounded-full border border-[#DCE8E4] shadow-xs">
              {/* Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5E8C84] text-white text-xs font-semibold hover:bg-[#4d756e] transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Sound on / off button */}
              <button
                type="button"
                onClick={toggleMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isMuted
                    ? 'bg-slate-100 text-[#26343C]/70 border-slate-200 hover:bg-slate-200'
                    : 'bg-[#DCE8E4] text-[#26343C] border-[#5E8C84]/40 hover:bg-[#cbe0d9]'
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sound Off</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#5E8C84]" />
                    <span>Sound On</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Details & Ordering */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#5E8C84] font-medium tracking-wide">
                <span>Digital Motion Suite</span>
                <span aria-hidden="true">·</span>
                <span>Mobile HD Video</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-brand font-normal text-[#26343C] leading-snug">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-serif-brand font-semibold text-[#26343C]">
                  {storeSettings.currencySymbol}{price}
                </span>
                {hasSale && (
                  <span className="text-base text-[#26343C]/40 line-through">
                    {storeSettings.currencySymbol}{product.regularPrice}
                  </span>
                )}
                <span className="text-xs text-[#5E8C84] font-medium px-2.5 py-0.5 bg-[#DCE8E4] rounded-md">
                  Delivered in 24 hours
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#26343C]/80 leading-relaxed">
                {product.description}
              </p>

              {/* What's included preview */}
              <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
                  Included in this suite:
                </h4>
                <ul className="space-y-1.5 text-xs text-[#26343C]/85">
                  {product.features.slice(0, 4).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#5E8C84] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDirectOrder}
                  className="w-full py-3 px-5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 px-5 bg-white border border-[#5E8C84] text-[#5E8C84] hover:bg-[#5E8C84]/5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-[#26343C]/60">
                  3 Free Revisions Included
                </span>
                <button
                  onClick={handleViewFullDetail}
                  className="text-xs font-medium text-[#5E8C84] hover:underline flex items-center gap-1"
                >
                  <span>View Full Details & Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
