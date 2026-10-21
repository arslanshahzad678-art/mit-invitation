import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { IphoneMockup } from './IphoneMockup';
import { Eye, MessageCircle, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onPreview: (product: Product) => void;
  onOrder: (product: Product) => void;
  onClickName?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPreview,
  onOrder,
  onClickName,
}) => {
  const { storeSettings, navigate } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver: auto-play video only when card is visible on screen
  useEffect(() => {
    const target = cardRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      },
      {
        threshold: [0, 0.25, 0.5],
        rootMargin: '50px 0px 50px 0px',
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Toggle play/pause on tap
  const handleTogglePlay = () => {
    setIsUserPaused((prev) => !prev);
  };

  const isVideoPlaying = isInView && !isUserPaused && !prefersReducedMotion && !!product.previewVideo;

  // Determine badge text
  const badgeText =
    product.customBadge ||
    (product.bestseller ? 'Bestseller' : product.isNew ? 'New' : product.featured ? 'Popular' : null);

  const price = product.salePrice ?? product.regularPrice;
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;

  const handleNameClick = () => {
    if (onClickName) {
      onClickName(product);
    } else {
      navigate('product-detail', product.id);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white/95 rounded-3xl border border-[#DCE8E4] p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center group relative overflow-hidden"
    >
      {/* Centered iPhone Mockup (Top) */}
      <div className="w-full flex justify-center items-center py-2 relative min-h-[440px]">
        {product.hasSecondScreen ? (
          // Dual phone side-by-side presentation (Dolce Vita style)
          <div className="relative flex items-center justify-center -space-x-8 sm:-space-x-10 py-1">
            {/* Phone 1 (Main / Video) */}
            <div className="relative z-10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <IphoneMockup
                size="compact"
                videoUrl={product.previewVideo}
                posterUrl={product.previewPoster || product.image}
                productTitle={product.name}
                isPlaying={isVideoPlaying}
                isMuted={true}
                onTogglePlay={handleTogglePlay}
                interactiveCard={product.eventSample}
                className="drop-shadow-md"
              />
            </div>

            {/* Phone 2 (Second Screen / Details / RSVP) */}
            <div className="relative z-0 transform rotate-2 hover:rotate-0 transition-transform duration-300 opacity-95">
              <IphoneMockup
                size="compact"
                videoUrl={product.secondScreenVideo || undefined}
                posterUrl={product.secondScreenImage || product.previewPoster || product.image}
                productTitle={`${product.name} Details`}
                isPlaying={false}
                isMuted={true}
                customPlaceholderText={product.secondScreenTitle || 'RSVP & Details'}
                interactiveCard={product.eventSample}
                className="drop-shadow-sm"
              />
            </div>
          </div>
        ) : (
          // Single Centered iPhone
          <div className="relative">
            <IphoneMockup
              size="card"
              videoUrl={product.previewVideo}
              posterUrl={product.previewPoster || product.image}
              productTitle={product.name}
              isPlaying={isVideoPlaying}
              isMuted={true}
              onTogglePlay={handleTogglePlay}
              interactiveCard={product.eventSample}
            />
          </div>
        )}
      </div>

      {/* Product Details (Below Phone) */}
      <div className="w-full mt-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name */}
          <h3
            onClick={handleNameClick}
            className="font-serif-brand text-lg font-medium text-[#26343C] hover:text-[#5E8C84] cursor-pointer transition-colors leading-snug line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Badge & Price under the name */}
          <div className="mt-2 flex items-center justify-center gap-2.5">
            {badgeText && (
              <span
                className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                  badgeText.toLowerCase() === 'bestseller'
                    ? 'bg-amber-50 text-amber-900 border-amber-200/80'
                    : badgeText.toLowerCase() === 'new'
                    ? 'bg-[#DCE8E4] text-[#26343C] border-[#5E8C84]/30'
                    : 'bg-[#EEDDE0]/70 text-[#26343C] border-[#EEDDE0]'
                }`}
              >
                {badgeText}
              </span>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="font-serif-brand text-base font-semibold text-[#26343C]">
                {storeSettings.currencySymbol}
                {price}
              </span>
              {hasSale && (
                <span className="text-xs text-[#26343C]/40 line-through">
                  {storeSettings.currencySymbol}
                  {product.regularPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Personalize, Preview, Order */}
        <div className="pt-2 w-full space-y-2">
          <button
            type="button"
            onClick={() => navigate('customize', product.id)}
            className="w-full py-2 px-3 bg-[#DCE8E4] hover:bg-[#c9ded7] text-[#26343C] text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Personalize & Preview</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Preview: Filled Sage */}
            <button
              type="button"
              onClick={() => onPreview(product)}
              className="w-full py-2 px-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            {/* Order: Outlined */}
            <button
              type="button"
              onClick={() => onOrder(product)}
              className="w-full py-2 px-3 bg-transparent border border-[#5E8C84] text-[#5E8C84] hover:bg-[#5E8C84]/10 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
