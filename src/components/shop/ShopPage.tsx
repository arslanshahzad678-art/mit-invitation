import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Eye, ShoppingBag, MessageCircle, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../common/ProductCard';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    storeSettings,
    setQuickPreviewProduct,
    setCheckoutItem,
    setIsCheckoutOpen,
    addToCart,
    navigate,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');

  const publishedProducts = useMemo(() => {
    return products.filter((p) => p.status === 'published');
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...publishedProducts];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by Search Term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice ?? a.regularPrice) - (b.salePrice ?? b.regularPrice));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice ?? b.regularPrice) - (a.salePrice ?? a.regularPrice));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order);
        break;
    }

    return result;
  }, [publishedProducts, selectedCategory, searchTerm, sortBy]);

  const handlePreview = (product: Product) => {
    setQuickPreviewProduct(product);
  };

  const handleDirectOrder = (product: Product) => {
    setCheckoutItem({
      product,
      quantity: 1,
      eventDetails: '',
    });
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
          Boutique Templates
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-brand text-[#26343C]">
          Digital Invitation Suites
        </h1>
        <p className="text-sm sm:text-base text-[#26343C]/70">
          Discover handcrafted animated invitations with interactive RSVP buttons, mobile maps, and custom audio tracks.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-[#26343C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, theme (e.g. botanical, modern, gold, birthday)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F2F6F6] rounded-xl text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84]"
            />
          </div>

          {/* Sort selector */}
          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#5E8C84] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-[#F2F6F6] rounded-xl text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84]"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Designs</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#5E8C84] text-white shadow-xs'
                : 'bg-[#F2F6F6] text-[#26343C]/80 hover:bg-[#DCE8E4]'
            }`}
          >
            All Collections ({publishedProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#5E8C84] text-white shadow-xs'
                  : 'bg-[#F2F6F6] text-[#26343C]/80 hover:bg-[#DCE8E4]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#DCE8E4]">
          <p className="text-base font-serif-brand text-[#26343C]">
            No invitation templates matched your search.
          </p>
          <p className="text-xs text-[#26343C]/60">
            Try adjusting your search terms or filter selection.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2 text-xs font-semibold text-[#5E8C84] bg-[#DCE8E4] rounded-xl hover:bg-[#c9ddd7]"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPreview={handlePreview}
              onOrder={handleDirectOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
};
