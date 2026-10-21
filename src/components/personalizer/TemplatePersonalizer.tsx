import React, { useState, useEffect, useRef } from 'react';
import { 
  InvitationTemplate, 
  Invitation, 
  TemplateField 
} from '../../types/invitation';
import { 
  getTemplate, 
  listTemplates, 
  createInvitation, 
  updateInvitation,
  isSlugAvailable, 
  formatSlug, 
  generateSlugSuggestions, 
  uploadInvitationMedia 
} from '../../services/invitationService';
import { createSeedTemplate } from '../../services/seedTemplateService';
import { useStore } from '../../context/StoreContext';
import { ElementRenderer } from '../canvas/ElementRenderer';
import { auth } from '../../config/firebase';
import { 
  Sparkles, 
  Smartphone, 
  Upload, 
  Check, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  MessageCircle, 
  Layers, 
  Calendar, 
  MapPin, 
  Heart, 
  Type, 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const TemplatePersonalizer: React.FC = () => {
  const { 
    customizeTemplateId, 
    navigate, 
    showToast, 
    storeSettings 
  } = useStore();

  const [template, setTemplate] = useState<InvitationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fontChoice, setFontChoice] = useState<string>('Fraunces');
  const [slug, setSlug] = useState<string>('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [countdownEnabled, setCountdownEnabled] = useState(true);
  const [rsvpEnabled, setRsvpEnabled] = useState(true);

  // Uploading state
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile / Desktop tab view on small screens
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let tpl: InvitationTemplate | null = null;
        if (customizeTemplateId) {
          tpl = await getTemplate(customizeTemplateId);
        }
        if (!tpl) {
          const list = await listTemplates();
          tpl = list.length > 0 ? list[0] : createSeedTemplate();
        }
        setTemplate(tpl);

        // Pre-fill default values from fields
        const initialData: Record<string, any> = {};
        tpl.fields.forEach((f) => {
          initialData[f.key] = f.defaultValue;
        });
        setFormData(initialData);

        if (tpl.defaultFont) {
          setFontChoice(tpl.defaultFont);
        }

        // Suggest default slug from couple names
        const baseName = `${initialData.groomName || 'sarah'}-${initialData.brideName || 'alexander'}`;
        const clean = formatSlug(baseName);
        setSlug(clean);
        setSlugSuggestions(generateSlugSuggestions(clean));
      } catch (err) {
        console.error('Failed to load template for personalizing:', err);
        showToast('Could not load template details', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customizeTemplateId]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const avail = await isSlugAvailable(slug);
      setSlugStatus(avail ? 'available' : 'taken');
    }, 450);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleFieldChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));

    // Auto update slug suggestions when couple names change
    if (key === 'groomName' || key === 'brideName') {
      const g = key === 'groomName' ? val : formData.groomName || '';
      const b = key === 'brideName' ? val : formData.brideName || '';
      if (g || b) {
        const clean = formatSlug(`${g} ${b}`);
        setSlugSuggestions(generateSlugSuggestions(clean));
      }
    }
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingField(key);
    try {
      const downloadUrl = await uploadInvitationMedia(file, 'client_uploads');
      handleFieldChange(key, downloadUrl);
      showToast('Photo uploaded and compressed successfully!', 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback to local object URL for preview
      const localUrl = URL.createObjectURL(file);
      handleFieldChange(key, localUrl);
      showToast('Uploaded for preview (saved locally)', 'info');
    } finally {
      setUploadingField(null);
    }
  };

  const handleOrderWhatsApp = async () => {
    if (!template) return;
    if (slugStatus === 'taken') {
      showToast('Please choose an available URL slug for your invitation link.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const invId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const user = auth.currentUser;
      const ownerUid = user?.uid || 'guest_client';
      const ownerEmail = user?.email || (formData.customerEmail || 'client@mitinvitations.com');

      const cleanSlug = formatSlug(slug) || `mit-${Date.now().toString().slice(-6)}`;

      const newInvitation: Invitation = {
        id: invId,
        slug: cleanSlug,
        templateId: template.id,
        ownerUid,
        ownerEmail,
        data: formData,
        fontChoice,
        countdownEnabled,
        countdownDate: formData.eventDate,
        rsvpEnabled,
        status: 'pending_payment',
        paymentApproved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      };

      await createInvitation(newInvitation);

      // WhatsApp Order message
      const phone = storeSettings.whatsAppNumber || '+923425364018';
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const couple = `${formData.groomName || 'Couple'} & ${formData.brideName || ''}`;
      const msg = `*New Invitation Suite Order - MIT Invitations*\n\n` +
        `• Suite: ${template.name}\n` +
        `• Couple: ${couple}\n` +
        `• Event Date: ${formData.eventDate || 'N/A'}\n` +
        `• Venue: ${formData.venueName || 'N/A'}, ${formData.venueCity || ''}\n` +
        `• Requested Custom Link: mitinvitations.com/i/${cleanSlug}\n` +
        `• Font: ${fontChoice}\n` +
        `• Invitation ID: ${invId}\n\n` +
        `I have customized my wedding suite and would like to confirm my order & payment details (JazzCash / Easypaisa / Bank Transfer). Thank you!`;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      showToast('Invitation saved! Opening WhatsApp to finalize order.', 'success');
      navigate('portal');
    } catch (err) {
      console.error('Error saving invitation:', err);
      showToast('Could not save invitation draft', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !template) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
        <p className="text-xs text-[#26343C]/70">Loading invitation personalizer...</p>
      </div>
    );
  }

  const currentPage = template.pages[activePageIndex] || template.pages[0];

  return (
    <div className="min-h-screen bg-[#F2F6F6] text-[#26343C] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-[#DCE8E4] px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('shop')}
            className="p-1.5 text-[#26343C]/70 hover:text-[#26343C] rounded-lg transition-colors cursor-pointer"
            title="Back to Boutique"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif-brand font-semibold text-sm sm:text-base text-[#26343C]">
              Personalize: {template.name}
            </h1>
            <p className="text-[11px] text-[#5E8C84] flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3" />
              <span>Original Artwork & Animations Locked · Edit text, dates & photos</span>
            </p>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={() => setMobileTab('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              mobileTab === 'edit' ? 'bg-[#5E8C84] text-white' : 'bg-[#DCE8E4]/50 text-[#26343C]'
            }`}
          >
            Form
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              mobileTab === 'preview' ? 'bg-[#5E8C84] text-white' : 'bg-[#DCE8E4]/50 text-[#26343C]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>

        {/* Desktop WhatsApp Action */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={handleOrderWhatsApp}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>{isSubmitting ? 'Saving...' : 'Order on WhatsApp'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left Personalization Form, Right iPhone Watermarked Preview */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column */}
        <div className={`lg:col-span-6 space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Card 1: Couple & Event Details */}
          <section className="bg-white p-6 rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#26343C]">
              <Heart className="w-4 h-4 text-[#5E8C84]" />
              <span>Couple & Event Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Groom Name / Host 1
                </label>
                <input
                  type="text"
                  value={formData.groomName || ''}
                  onChange={(e) => handleFieldChange('groomName', e.target.value)}
                  placeholder="e.g. Alexander Montgomery"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Bride Name / Host 2
                </label>
                <input
                  type="text"
                  value={formData.brideName || ''}
                  onChange={(e) => handleFieldChange('brideName', e.target.value)}
                  placeholder="e.g. Sarah Elizabeth"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={formData.eventDate || ''}
                  onChange={(e) => handleFieldChange('eventDate', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Event Time
                </label>
                <input
                  type="time"
                  value={formData.eventTime || '17:00'}
                  onChange={(e) => handleFieldChange('eventTime', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Venue Name & Hall
                </label>
                <input
                  type="text"
                  value={formData.venueName || ''}
                  onChange={(e) => handleFieldChange('venueName', e.target.value)}
                  placeholder="e.g. The Glasshouse Atelier"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  City & State / Country
                </label>
                <input
                  type="text"
                  value={formData.venueCity || ''}
                  onChange={(e) => handleFieldChange('venueCity', e.target.value)}
                  placeholder="e.g. Portland, Oregon"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Google Maps Link (For Guests)
                </label>
                <input
                  type="text"
                  value={formData.mapUrl || ''}
                  onChange={(e) => handleFieldChange('mapUrl', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Photo Uploads */}
          <section className="bg-white p-6 rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26343C]">
                <ImageIcon className="w-4 h-4 text-[#5E8C84]" />
                <span>Couple Photos (Compressed automatically)</span>
              </div>
              <span className="text-[11px] text-[#26343C]/50">JPG/PNG up to 10MB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'couplePhoto', label: 'Main Arch Photo' },
                { key: 'polaroidPhoto1', label: 'Story Photo 1' },
                { key: 'polaroidPhoto2', label: 'Story Photo 2' },
              ].map(({ key, label }) => {
                const imgUrl = formData[key];
                const isUploading = uploadingField === key;
                return (
                  <div key={key} className="space-y-1.5">
                    <p className="text-[11px] font-medium text-[#26343C]/80">{label}</p>
                    <div className="relative aspect-[3/4] rounded-2xl border border-dashed border-[#DCE8E4] bg-[#FAF7F2] overflow-hidden flex flex-col items-center justify-center p-2 text-center group">
                      {imgUrl ? (
                        <>
                          <img
                            src={imgUrl}
                            alt={label}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          <label className="absolute inset-0 bg-[#26343C]/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[11px] font-medium">
                            <Upload className="w-4 h-4 mb-1" />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(key, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                          {isUploading ? (
                            <RefreshCw className="w-5 h-5 text-[#5E8C84] animate-spin mb-1" />
                          ) : (
                            <Upload className="w-5 h-5 text-[#5E8C84] mb-1" />
                          )}
                          <span className="text-[10px] text-[#26343C]/70">
                            {isUploading ? 'Uploading...' : 'Choose Image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(key, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 3: Curated Fonts (English & Urdu Nastaliq) */}
          <section className="bg-white p-6 rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26343C]">
                <Type className="w-4 h-4 text-[#5E8C84]" />
                <span>Typography & Font Style</span>
              </div>
              <span className="text-[11px] text-[#5E8C84] font-medium">
                Active: {fontChoice}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {template.fontOptions.map((font) => {
                const isSelected = fontChoice === font;
                const isUrduFont = font.includes('Urdu') || font.includes('Amiri');
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setFontChoice(font)}
                    style={{ fontFamily: font }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#5E8C84] bg-[#DCE8E4]/30 shadow-2xs font-bold text-[#26343C]'
                        : 'border-[#DCE8E4] bg-white hover:bg-[#FAF7F2] text-[#26343C]/80'
                    }`}
                  >
                    <div className="text-xs truncate">{font}</div>
                    <div className="text-[13px] text-[#5E8C84] mt-1" dir={isUrduFont ? 'rtl' : 'ltr'}>
                      {isUrduFont ? 'بسم اللہ الرحمن الرحیم' : 'Sarah & Alexander'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 4: Story & Celebration Message (Supports Urdu) */}
          <section className="bg-white p-6 rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26343C]">
                <Sparkles className="w-4 h-4 text-[#5E8C84]" />
                <span>Our Story & Celebration Message</span>
              </div>
              <span className="text-[11px] text-[#26343C]/50">Urdu / English</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  Our Story Paragraph
                </label>
                <textarea
                  rows={2}
                  value={formData.loveStoryText || ''}
                  onChange={(e) => handleFieldChange('loveStoryText', e.target.value)}
                  placeholder="From our first meeting over coffee in autumn..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                  RSVP Deadline Notice
                </label>
                <input
                  type="text"
                  value={formData.rsvpDeadline || ''}
                  onChange={(e) => handleFieldChange('rsvpDeadline', e.target.value)}
                  placeholder="Please kindly respond by September 15, 2026"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>
            </div>
          </section>

          {/* Card 5: Custom Public Link (Slug) */}
          <section className="bg-white p-6 rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#26343C]">
                <ExternalLink className="w-4 h-4 text-[#5E8C84]" />
                <span>Your Public Invitation Link</span>
              </div>
              {slugStatus === 'available' && (
                <span className="text-emerald-700 text-[11px] font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3" /> Available
                </span>
              )}
              {slugStatus === 'taken' && (
                <span className="text-rose-700 text-[11px] font-semibold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <AlertCircle className="w-3 h-3" /> Taken
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center rounded-xl bg-[#F2F6F6] border border-[#DCE8E4] px-3 py-2 text-xs text-[#26343C]">
                <span className="text-[#26343C]/50 select-none">mitinvitations.com/i/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(formatSlug(e.target.value))}
                  placeholder="couple-wedding-2026"
                  className="flex-1 bg-transparent font-medium outline-none ml-0.5"
                />
              </div>
              <p className="text-[11px] text-[#26343C]/50 mt-1.5">
                This is the custom link your guests will open to receive the wax-seal envelope and RSVP.
              </p>
            </div>

            {/* Suggestions */}
            {slugSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#26343C]/40 tracking-wider">
                  Suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {slugSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlug(s)}
                      className="px-2.5 py-1 rounded-lg bg-[#DCE8E4]/50 hover:bg-[#DCE8E4] text-[11px] font-medium text-[#26343C] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Bottom WhatsApp Order CTA */}
          <div className="pt-2">
            <button
              onClick={handleOrderWhatsApp}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>{isSubmitting ? 'Saving Suite...' : 'Save & Order on WhatsApp'}</span>
            </button>
            <p className="text-center text-[11px] text-[#26343C]/60 mt-2">
              Pay manually via JazzCash, Easypaisa, or Bank Transfer. Our team approves and activates your suite immediately.
            </p>
          </div>

        </div>

        {/* Right iPhone Watermarked Live Preview */}
        <div className={`lg:col-span-6 sticky top-24 flex flex-col items-center space-y-4 ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Page Selector Strip */}
          <div className="w-full max-w-sm flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-[#DCE8E4] shadow-xs">
            <button
              onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="p-1 rounded-lg text-[#26343C] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-[#26343C] font-serif-brand">
              Page {activePageIndex + 1} of {template.pages.length}: {currentPage.name}
            </span>

            <button
              onClick={() => setActivePageIndex((prev) => Math.min(template.pages.length - 1, prev + 1))}
              disabled={activePageIndex === template.pages.length - 1}
              className="p-1 rounded-lg text-[#26343C] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* iPhone Frame with Watermark */}
          <div className="relative w-[340px] sm:w-[380px] h-[680px] sm:h-[740px] bg-[#1E262B] rounded-[52px] p-3 shadow-2xl border-4 border-[#323D42] flex flex-col items-center">
            
            {/* Dynamic Island */}
            <div className="absolute top-5 z-40 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3">
              <span className="text-[9px] text-white/60 font-sans">MIT</span>
              <div className="w-2 h-2 rounded-full bg-[#1E262B]" />
            </div>

            {/* Inner Screen */}
            <div className="relative w-full h-full bg-[#FAF7F2] rounded-[42px] overflow-hidden overflow-y-auto shadow-inner flex flex-col">
              
              {/* Semi-transparent Watermark Overlay across preview */}
              <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center rotate-[-35deg] select-none">
                <div className="space-y-12 text-center opacity-25">
                  <p className="text-xl font-serif-brand font-bold text-[#26343C] tracking-widest uppercase">
                    MIT INVITATIONS
                  </p>
                  <p className="text-sm font-sans tracking-wide text-[#5E8C84] uppercase">
                    PREVIEW · SAMPLE WATERMARK
                  </p>
                  <p className="text-xl font-serif-brand font-bold text-[#26343C] tracking-widest uppercase">
                    MIT INVITATIONS
                  </p>
                </div>
              </div>

              {/* Logical 1080 canvas scaled to phone width (340 - 24 = 316 width -> scale ~ 0.3) */}
              <div 
                className="relative origin-top-left"
                style={{
                  width: '1080px',
                  height: `${currentPage.customHeight || 1920}px`,
                  transform: 'scale(0.315)',
                  backgroundColor: currentPage.backgroundColor || '#FAF7F2',
                }}
              >
                {currentPage.elements.map((el) => (
                  <ElementRenderer
                    key={el.id}
                    element={el}
                    clientData={formData}
                    fontChoice={fontChoice}
                    onAction={(action) => {
                      if (action.type === 'goto' && action.targetPageId) {
                        const targetIdx = template.pages.findIndex((p) => p.id === action.targetPageId);
                        if (targetIdx !== -1) setActivePageIndex(targetIdx);
                      } else if (action.type === 'playVideoThenGoto' && action.targetPageId) {
                        const targetIdx = template.pages.findIndex((p) => p.id === action.targetPageId);
                        if (targetIdx !== -1) setActivePageIndex(targetIdx);
                      } else if (action.type === 'back') {
                        setActivePageIndex(1);
                      }
                    }}
                  />
                ))}
              </div>

            </div>

          </div>

          <p className="text-[11px] text-[#26343C]/60 text-center max-w-xs">
            Interactive Preview · Click buttons & cards to test the flow. Watermark disappears upon activation.
          </p>

        </div>

      </div>
    </div>
  );
};
