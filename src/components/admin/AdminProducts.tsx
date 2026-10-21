import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { IphoneMockup } from '../common/IphoneMockup';
import { saveMediaBlob, formatFileSize } from '../../services/mediaStorage';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Eye, 
  Check, 
  Upload, 
  X,
  AlertTriangle,
  Film,
  Image as ImageIcon,
  Link,
  Smartphone,
  Layers,
  Info
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    saveProduct,
    deleteProduct,
    duplicateProduct,
    reorderProducts,
    storeSettings,
    setQuickPreviewProduct,
    showToast,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Delete confirm modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Confirm dialog for removing media
  const [mediaConfirmAction, setMediaConfirmAction] = useState<{
    target: 'video' | 'image' | 'secondScreen';
    title: string;
    message: string;
  } | null>(null);

  // File input refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const secondScreenMediaRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formVideo, setFormVideo] = useState('');
  const [formRegularPrice, setFormRegularPrice] = useState<string>('');
  const [formSalePrice, setFormSalePrice] = useState<string>('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formBestseller, setFormBestseller] = useState(false);
  const [formCustomBadge, setFormCustomBadge] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formFeatures, setFormFeatures] = useState('');

  // Second screen fields
  const [formHasSecondScreen, setFormHasSecondScreen] = useState(false);
  const [formSecondScreenImage, setFormSecondScreenImage] = useState('');
  const [formSecondScreenVideo, setFormSecondScreenVideo] = useState('');
  const [formSecondScreenTitle, setFormSecondScreenTitle] = useState('RSVP & Details');

  // Upload metadata & warnings
  const [videoFileSize, setVideoFileSize] = useState<number | null>(null);
  const [videoSizeWarning, setVideoSizeWarning] = useState<string | null>(null);
  const [imageFileSize, setImageFileSize] = useState<number | null>(null);

  // URL input modes
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  // Sample event preview values
  const [sampleHost, setSampleHost] = useState('');
  const [sampleDate, setSampleDate] = useState('');
  const [sampleVenue, setSampleVenue] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormCategory(categories[0]?.id || '');
    setFormTags('Wedding, Botanical, Romantic');
    setFormImage('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
    setFormVideo('https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4');
    setFormRegularPrice('45');
    setFormSalePrice('35');
    setFormFeatured(true);
    setFormIsNew(true);
    setFormBestseller(false);
    setFormCustomBadge('New');
    setFormStatus('published');
    setFormFeatures('Full HD 1080x1920 MP4 Video, WhatsApp RSVP Link, Google Maps Pin, 3 Free Revisions');
    setFormHasSecondScreen(false);
    setFormSecondScreenImage('');
    setFormSecondScreenVideo('');
    setFormSecondScreenTitle('RSVP & Details');
    setVideoFileSize(null);
    setVideoSizeWarning(null);
    setImageFileSize(null);
    setShowVideoUrlInput(false);
    setShowImageUrlInput(false);
    setSampleHost('Claire & Thomas');
    setSampleDate('Saturday, October 18, 2026');
    setSampleVenue('The Glasshouse Conservatory');
    setIsEditModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormCategory(p.categoryId);
    setFormTags(p.tags.join(', '));
    setFormImage(p.image);
    setFormVideo(p.previewVideo);
    setFormRegularPrice(p.regularPrice.toString());
    setFormSalePrice(p.salePrice ? p.salePrice.toString() : '');
    setFormFeatured(p.featured);
    setFormIsNew(p.isNew);
    setFormBestseller(p.bestseller);
    setFormCustomBadge(p.customBadge || (p.bestseller ? 'Bestseller' : p.isNew ? 'New' : ''));
    setFormStatus(p.status);
    setFormFeatures(p.features.join(', '));
    setFormHasSecondScreen(!!p.hasSecondScreen);
    setFormSecondScreenImage(p.secondScreenImage || '');
    setFormSecondScreenVideo(p.secondScreenVideo || '');
    setFormSecondScreenTitle(p.secondScreenTitle || 'RSVP & Details');
    setVideoFileSize(null);
    setVideoSizeWarning(null);
    setImageFileSize(null);
    setShowVideoUrlInput(false);
    setShowImageUrlInput(false);
    setSampleHost(p.eventSample?.coupleOrHost || '');
    setSampleDate(p.eventSample?.date || '');
    setSampleVenue(p.eventSample?.venue || '');
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRegularPrice) {
      showToast('Please fill in required fields (Name and Regular Price)', 'error');
      return;
    }

    const regPriceNum = parseFloat(formRegularPrice);
    const salePriceNum = formSalePrice.trim() ? parseFloat(formSalePrice) : null;

    if (isNaN(regPriceNum)) {
      showToast('Invalid price format', 'error');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const featuresArray = formFeatures
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const productData: Product = {
      id: editingProduct?.id || 'prod-' + Date.now(),
      name: formName,
      slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDesc,
      categoryId: formCategory || categories[0]?.id || 'cat-weddings',
      tags: tagsArray,
      image: formImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      previewVideo: formVideo,
      previewPoster: formImage,
      regularPrice: regPriceNum,
      salePrice: salePriceNum,
      featured: formFeatured,
      isNew: formIsNew,
      bestseller: formBestseller,
      customBadge: formCustomBadge.trim() || undefined,
      hasSecondScreen: formHasSecondScreen,
      secondScreenImage: formSecondScreenImage || undefined,
      secondScreenVideo: formSecondScreenVideo || undefined,
      secondScreenTitle: formSecondScreenTitle || undefined,
      status: formStatus,
      order: editingProduct?.order || products.length + 1,
      features: featuresArray.length > 0 ? featuresArray : ['HD MP4 Video', 'WhatsApp RSVP', 'Google Maps Pin'],
      eventSample: {
        coupleOrHost: sampleHost || 'Celebration Hosts',
        eventType: 'Invitation Suite',
        date: sampleDate || 'Saturday, October 18, 2026',
        time: '5:00 PM',
        venue: sampleVenue || 'Grand Ballroom',
        city: 'Destination',
        rsvpDeadline: 'Kindly RSVP 3 weeks prior',
      },
    };

    saveProduct(productData);
    setIsEditModalOpen(false);
  };

  // Video file upload with IndexedDB and 30MB warning check
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const size = file.size;
    setVideoFileSize(size);

    // Friendly 30MB check
    if (size > 30 * 1024 * 1024) {
      setVideoSizeWarning(
        `Video size is ${formatFileSize(size)}. Videos over 30MB may take longer to load on mobile connections. Consider compressing to under 20-30MB.`
      );
    } else {
      setVideoSizeWarning(null);
    }

    try {
      showToast('Saving video to browser IndexedDB storage...');
      const res = await saveMediaBlob(file, undefined, file.name);
      setFormVideo(res.id);
      showToast(`Invitation video saved (${formatFileSize(size)})!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save video to storage. Please check browser permissions or use a direct URL.', 'error');
    }
  };

  // Image cover upload with IndexedDB
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileSize(file.size);

    try {
      showToast('Saving cover image to browser storage...');
      const res = await saveMediaBlob(file, undefined, file.name);
      setFormImage(res.id);
      showToast(`Cover image saved (${formatFileSize(file.size)})!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save image to storage.', 'error');
    }
  };

  // Second screen media upload
  const handleSecondScreenMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await saveMediaBlob(file, undefined, file.name);
      if (file.type.startsWith('video/')) {
        setFormSecondScreenVideo(res.id);
        showToast('Second screen video saved!');
      } else {
        setFormSecondScreenImage(res.id);
        showToast('Second screen image saved!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save second screen media.', 'error');
    }
  };

  // Confirm remove media action
  const confirmRemoveMedia = () => {
    if (!mediaConfirmAction) return;

    if (mediaConfirmAction.target === 'video') {
      setFormVideo('');
      setVideoFileSize(null);
      setVideoSizeWarning(null);
      showToast('Invitation video removed from product', 'info');
    } else if (mediaConfirmAction.target === 'image') {
      setFormImage('');
      setImageFileSize(null);
      showToast('Cover image removed from product', 'info');
    } else if (mediaConfirmAction.target === 'secondScreen') {
      setFormSecondScreenImage('');
      setFormSecondScreenVideo('');
      showToast('Second screen media removed', 'info');
    }

    setMediaConfirmAction(null);
  };

  // Reorder up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= products.length) return;

    const list = [...products];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    reorderProducts(list.map((p) => p.id));
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Product Catalog ({products.length})
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Upload invitation videos, configure live iPhone mockups, badges, and dual-screen presentations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Storage Architecture Notice */}
      <div className="p-4 bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-2xl flex items-start gap-3 text-xs text-[#26343C]">
        <Info className="w-4 h-4 text-[#5E8C84] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-[#26343C]">
            IndexedDB Browser Media Storage Enabled
          </p>
          <p className="text-[#26343C]/75">
            Uploaded MP4 videos and cover images are stored directly in this browser's IndexedDB database without 5MB storage limits. Remember to use the Backup panel to export your full data snapshot.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#26343C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#F2F6F6] rounded-lg text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none focus:border-[#5E8C84]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F2F6F6] rounded-lg text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#F2F6F6] rounded-lg text-xs text-[#26343C] border border-[#DCE8E4] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#DCE8E4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE8E4] bg-[#F2F6F6]/60 text-[#26343C]/70 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">iPhone Preview</th>
                <th className="py-3 px-4">Name & Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4">Screens</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p, idx) => {
                const categoryObj = categories.find((c) => c.id === p.categoryId);
                const badge = p.customBadge || (p.bestseller ? 'Bestseller' : p.isNew ? 'New' : p.featured ? 'Popular' : null);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Order & Reorder buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[#26343C]/50 w-5">{idx + 1}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 hover:bg-[#DCE8E4] rounded disabled:opacity-20 transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3 text-[#26343C]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(idx, 'down')}
                            disabled={idx === products.length - 1}
                            className="p-1 hover:bg-[#DCE8E4] rounded disabled:opacity-20 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3 text-[#26343C]" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Thumbnail / Quick View */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setQuickPreviewProduct(p)}
                        className="w-12 h-14 rounded-lg border border-[#DCE8E4] bg-slate-900 cursor-pointer overflow-hidden relative group flex items-center justify-center shadow-2xs"
                        title="Click for full-screen preview"
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-white/50" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Name & Category */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-[#26343C] hover:text-[#5E8C84] cursor-pointer" onClick={() => openEditModal(p)}>
                        {p.name}
                      </p>
                      <p className="text-[11px] text-[#5E8C84] mt-0.5">
                        {categoryObj?.name || 'Uncategorized'}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#26343C]">
                        {storeSettings.currencySymbol}{p.salePrice ?? p.regularPrice}
                      </span>
                      {p.salePrice && p.salePrice < p.regularPrice && (
                        <span className="text-[10px] text-[#26343C]/40 line-through ml-1.5">
                          {storeSettings.currencySymbol}{p.regularPrice}
                        </span>
                      )}
                    </td>

                    {/* Badge */}
                    <td className="py-3 px-4">
                      {badge ? (
                        <span className="text-[9px] font-semibold px-2 py-0.5 bg-[#DCE8E4] text-[#26343C] rounded-full border border-[#5E8C84]/30">
                          {badge}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    {/* Screens */}
                    <td className="py-3 px-4">
                      {p.hasSecondScreen ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Layers className="w-3 h-3" />
                          <span>Dual Phone</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Single</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        p.status === 'published' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setQuickPreviewProduct(p)}
                          className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateProduct(p.id)}
                          className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal with Live iPhone Preview */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-5xl bg-[#F2F6F6] rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE8E4] shrink-0">
              <h3 className="text-xl font-serif-brand font-semibold text-[#26343C]">
                {editingProduct ? `Edit Invitation: ${formName || 'Untitled'}` : 'Add New Invitation Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form & Live Preview Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 overflow-y-auto pr-1">
              
              {/* Left Column: Form Fields */}
              <form id="productForm" onSubmit={handleSave} className="lg:col-span-7 space-y-5">
                
                {/* Product Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. The Seraphina Botanical Suite"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Atmosphere, typography details, background audio, suitability..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                  />
                </div>

                {/* Price, Sale Price, and Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-[#DCE8E4]">
                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Regular Price ({storeSettings.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formRegularPrice}
                      onChange={(e) => setFormRegularPrice(e.target.value)}
                      placeholder="45"
                      className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Sale Price ({storeSettings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Product Badge
                    </label>
                    <input
                      type="text"
                      value={formCustomBadge}
                      onChange={(e) => setFormCustomBadge(e.target.value)}
                      placeholder="e.g. New, Popular, Bestseller"
                      className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>
                </div>

                {/* MEDIA UPLOAD SECTION (VERY IMPORTANT) */}
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#DCE8E4] space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#5E8C84]" />
                      <h4 className="text-xs font-semibold text-[#26343C]">
                        Invitation Video & Cover Media (Plays Inside iPhone)
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#5E8C84] bg-[#DCE8E4] px-2 py-0.5 rounded-full font-medium">
                      IndexedDB Storage
                    </span>
                  </div>

                  {/* 1. Video Upload / Replace / Remove / URL */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#26343C] flex items-center gap-1.5">
                        <span>Invitation Video (MP4 or WebM)</span>
                        {videoFileSize && (
                          <span className="text-[10px] font-normal text-slate-500">
                            ({formatFileSize(videoFileSize)})
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowVideoUrlInput((prev) => !prev)}
                        className="text-[11px] text-[#5E8C84] hover:underline flex items-center gap-1"
                      >
                        <Link className="w-3 h-3" />
                        <span>{showVideoUrlInput ? 'Hide URL field' : 'Or paste direct URL'}</span>
                      </button>
                    </div>

                    {/* Friendly 30MB warning message */}
                    {videoSizeWarning && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p>{videoSizeWarning}</p>
                      </div>
                    )}

                    {/* Video Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Hidden file input */}
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />

                      {formVideo ? (
                        <>
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-3.5 py-2 bg-[#DCE8E4] hover:bg-[#cbe0d9] text-[#26343C] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#5E8C84]" />
                            <span>Replace Video</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setMediaConfirmAction({
                                target: 'video',
                                title: 'Remove Invitation Video',
                                message: 'Are you sure you want to remove this video from the product? The cover image will be displayed inside the phone instead.',
                              })
                            }
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Video</span>
                          </button>

                          <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Video Active in Live Phone</span>
                          </span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-4 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload Invitation Video (MP4/WebM)</span>
                        </button>
                      )}
                    </div>

                    {showVideoUrlInput && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={formVideo}
                          onChange={(e) => {
                            setFormVideo(e.target.value);
                            setVideoSizeWarning(null);
                          }}
                          placeholder="Paste direct MP4/WebM URL (e.g. https://...)"
                          className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Cover Image Upload / Replace / Remove / URL */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#26343C] flex items-center gap-1.5">
                        <span>Upload Cover Image (Shown before video plays or as fallback)</span>
                        {imageFileSize && (
                          <span className="text-[10px] font-normal text-slate-500">
                            ({formatFileSize(imageFileSize)})
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowImageUrlInput((prev) => !prev)}
                        className="text-[11px] text-[#5E8C84] hover:underline flex items-center gap-1"
                      >
                        <Link className="w-3 h-3" />
                        <span>{showImageUrlInput ? 'Hide URL field' : 'Or paste direct URL'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {formImage ? (
                        <>
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-3.5 py-2 bg-[#DCE8E4] hover:bg-[#cbe0d9] text-[#26343C] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#5E8C84]" />
                            <span>Replace Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setMediaConfirmAction({
                                target: 'image',
                                title: 'Remove Cover Image',
                                message: 'Are you sure you want to remove the cover image? A soft invitation canvas placeholder will be shown if no video is available.',
                              })
                            }
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Image</span>
                          </button>

                          <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Cover Image Loaded</span>
                          </span>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-4 py-2.5 bg-[#DCE8E4] hover:bg-[#cbe0d9] text-[#26343C] text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-4 h-4 text-[#5E8C84]" />
                          <span>Upload Cover Image</span>
                        </button>
                      )}
                    </div>

                    {showImageUrlInput && (
                      <div className="pt-1">
                        <input
                          type="text"
                          value={formImage}
                          onChange={(e) => setFormImage(e.target.value)}
                          placeholder="Paste image URL (e.g. https://...)"
                          className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SECOND SCREEN (DUAL PHONE) OPTION */}
                <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHasSecondScreen}
                        onChange={(e) => setFormHasSecondScreen(e.target.checked)}
                        className="rounded text-[#5E8C84] focus:ring-0"
                      />
                      <span className="text-xs font-semibold text-[#26343C]">
                        Enable Second Screen (Dual Phones in Product Card — Dolce Vita Style)
                      </span>
                    </label>
                  </div>

                  {formHasSecondScreen && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <p className="text-[11px] text-[#26343C]/70">
                        When enabled, two phones sit side-by-side in this product's card in the gallery, showcasing the animated invitation alongside an RSVP or detail screen.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#26343C] mb-1">
                            Second Screen Label
                          </label>
                          <input
                            type="text"
                            value={formSecondScreenTitle}
                            onChange={(e) => setFormSecondScreenTitle(e.target.value)}
                            placeholder="e.g. RSVP & Itinerary"
                            className="w-full px-3 py-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#26343C] mb-1">
                            Second Screen Media
                          </label>
                          <div className="flex gap-2">
                            <input
                              ref={secondScreenMediaRef}
                              type="file"
                              accept="image/*,video/mp4"
                              onChange={handleSecondScreenMediaUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => secondScreenMediaRef.current?.click()}
                              className="px-3 py-1.5 bg-[#DCE8E4] hover:bg-[#cbe0d9] text-[#26343C] text-xs font-medium rounded-lg flex items-center gap-1"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#5E8C84]" />
                              <span>Upload Media</span>
                            </button>
                            <input
                              type="text"
                              value={formSecondScreenImage}
                              onChange={(e) => setFormSecondScreenImage(e.target.value)}
                              placeholder="Or paste media URL"
                              className="flex-1 px-3 py-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags & Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="Wedding, Botanical, Romantic"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Included Features (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="HD Video, WhatsApp RSVP, Maps Pin"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Status and Flags */}
                <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded text-[#5E8C84] focus:ring-0"
                    />
                    <span>Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsNew}
                      onChange={(e) => setFormIsNew(e.target.checked)}
                      className="rounded text-[#5E8C84] focus:ring-0"
                    />
                    <span>New Design</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formBestseller}
                      onChange={(e) => setFormBestseller(e.target.checked)}
                      className="rounded text-[#5E8C84] focus:ring-0"
                    />
                    <span>Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="bg-[#F2F6F6] text-xs py-1 px-2 rounded-lg border border-[#DCE8E4]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                </div>

                {/* Sample Event Mockup Data for iPhone Simulation */}
                <div className="p-4 bg-white rounded-2xl border border-[#DCE8E4] space-y-3">
                  <h4 className="text-xs font-semibold text-[#26343C]">
                    Sample Preview Data for Mobile Screen Mockup
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={sampleHost}
                      onChange={(e) => setSampleHost(e.target.value)}
                      placeholder="Host / Couple Names"
                      className="px-3 py-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={sampleDate}
                      onChange={(e) => setSampleDate(e.target.value)}
                      placeholder="Sample Event Date"
                      className="px-3 py-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={sampleVenue}
                      onChange={(e) => setSampleVenue(e.target.value)}
                      placeholder="Sample Venue Location"
                      className="px-3 py-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column: Live iPhone Mockup Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3">
                <div className="w-full bg-white rounded-2xl p-4 border border-[#DCE8E4] text-center space-y-1">
                  <span className="text-[11px] font-semibold text-[#5E8C84] uppercase tracking-wider">
                    Live iPhone Mockup Preview
                  </span>
                  <p className="text-[11px] text-[#26343C]/60">
                    Uploaded video or image appears here instantly
                  </p>
                </div>

                <div className="py-2 flex justify-center items-center">
                  {formHasSecondScreen ? (
                    <div className="relative flex items-center justify-center -space-x-8 scale-90">
                      <IphoneMockup
                        size="compact"
                        videoUrl={formVideo}
                        posterUrl={formImage}
                        productTitle={formName || 'Primary Invitation'}
                        isPlaying={true}
                        isMuted={true}
                      />
                      <IphoneMockup
                        size="compact"
                        videoUrl={formSecondScreenVideo || undefined}
                        posterUrl={formSecondScreenImage || formImage}
                        productTitle="Second Screen"
                        isPlaying={false}
                        isMuted={true}
                        customPlaceholderText={formSecondScreenTitle || 'RSVP Screen'}
                      />
                    </div>
                  ) : (
                    <IphoneMockup
                      size="card"
                      videoUrl={formVideo}
                      posterUrl={formImage}
                      productTitle={formName || 'Invitation Preview'}
                      isPlaying={true}
                      isMuted={true}
                    />
                  )}
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  Tap screen to test play/pause simulation
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE8E4] shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-[#26343C]/70 hover:text-[#26343C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="productForm"
                className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Invitation Product"
        message={`Are you sure you want to permanently remove "${productToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }
        }}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Remove Media Confirmation Modal */}
      <ConfirmModal
        isOpen={!!mediaConfirmAction}
        title={mediaConfirmAction?.title || 'Remove Media'}
        message={mediaConfirmAction?.message || ''}
        confirmLabel="Remove Media"
        onConfirm={confirmRemoveMedia}
        onCancel={() => setMediaConfirmAction(null)}
      />
    </div>
  );
};
