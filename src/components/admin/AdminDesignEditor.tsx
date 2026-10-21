import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { DesignSettings } from '../../types';
import { IphoneMockup } from '../common/IphoneMockup';
import { ConfirmModal } from '../common/ConfirmModal';
import { saveMediaBlob, formatFileSize } from '../../services/mediaStorage';
import { 
  Palette, 
  RotateCcw, 
  Upload, 
  Save, 
  Sparkles, 
  Check, 
  Smartphone, 
  Type, 
  Square, 
  Sliders,
  Trash2,
  AlertTriangle,
  Link,
  Info 
} from 'lucide-react';

export const AdminDesignEditor: React.FC = () => {
  const { designSettings, updateDesignSettings, resetDesignSettings, showToast } = useStore();

  const [formData, setFormData] = useState<DesignSettings>({ ...designSettings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [mediaConfirmAction, setMediaConfirmAction] = useState<{
    target: 'heroVideo' | 'heroPoster';
    title: string;
    message: string;
  } | null>(null);

  const [heroVideoWarning, setHeroVideoWarning] = useState<string | null>(null);
  const [heroVideoSize, setHeroVideoSize] = useState<number | null>(null);
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [showPosterUrlInput, setShowPosterUrlInput] = useState(false);

  // Sync if design settings change externally
  const handleChange = (field: keyof DesignSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDesignSettings(formData);
  };

  const handleReset = () => {
    resetDesignSettings();
    setFormData({
      brandName: 'MIT Invitations',
      tagline: 'Animated Digital Invitations & Bespoke Mobile Keepsakes',
      logoUrl: '',
      primaryColor: '#5E8C84',
      secondaryColor: '#DCE8E4',
      blushColor: '#EEDDE0',
      backgroundColor: '#F2F6F6',
      textColor: '#26343C',
      headingFont: 'Fraunces',
      bodyFont: 'Figtree',
      buttonRadius: 'lg',
      buttonStyle: 'solid',
      heroBadgeText: 'Digital Keepsakes for the Modern Host',
      heroTitle: 'Send Invitations They Will Never Forget.',
      heroSubtitle: 'Bespoke animated invitations crafted for mobile screens. One tap to RSVP, view map directions, and add to calendar — delivered in 24 hours.',
      heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-holding-a-bouquet-of-flowers-43187-large.mp4',
      heroPosterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    });
  };

  const heroVideoInputRef = useRef<HTMLInputElement>(null);
  const heroPosterInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'heroVideo' | 'heroPoster' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'heroVideo') {
      const size = file.size;
      setHeroVideoSize(size);
      if (size > 30 * 1024 * 1024) {
        setHeroVideoWarning(
          `Hero video is ${formatFileSize(size)}. Large files may slow initial page load. Consider compressing to under 20-30MB.`
        );
      } else {
        setHeroVideoWarning(null);
      }

      try {
        showToast('Saving hero video to IndexedDB...');
        const res = await saveMediaBlob(file, undefined, file.name);
        handleChange('heroVideoUrl', res.id);
        showToast(`Hero video updated (${formatFileSize(size)})!`);
      } catch (err) {
        console.error(err);
        showToast('Failed to save hero video to browser storage', 'error');
      }
    } else if (target === 'heroPoster') {
      try {
        const res = await saveMediaBlob(file, undefined, file.name);
        handleChange('heroPosterUrl', res.id);
        showToast('Hero poster updated in live preview!');
      } catch (err) {
        console.error(err);
        showToast('Failed to save poster', 'error');
      }
    } else {
      try {
        const res = await saveMediaBlob(file, undefined, file.name);
        handleChange('logoUrl', res.id);
        showToast('Brand logo updated!');
      } catch (err) {
        console.error(err);
        showToast('Failed to save logo', 'error');
      }
    }
  };

  const confirmRemoveMedia = () => {
    if (!mediaConfirmAction) return;

    if (mediaConfirmAction.target === 'heroVideo') {
      handleChange('heroVideoUrl', '');
      setHeroVideoSize(null);
      setHeroVideoWarning(null);
      showToast('Hero video removed', 'info');
    } else if (mediaConfirmAction.target === 'heroPoster') {
      handleChange('heroPosterUrl', '');
      showToast('Hero poster removed', 'info');
    }

    setMediaConfirmAction(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Design & Branding Atelier
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Customize typography, color swatches, button corner styles, and hero video with live simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-[#26343C]/70 hover:text-rose-600 bg-white border border-[#DCE8E4] rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Design Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Brand Identity */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5E8C84]" />
              <span>Brand Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343C] mb-1">
                Logo Image URL or Local Upload
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://... or upload PNG/SVG"
                  className="flex-1 px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
                <label className="cursor-pointer px-3 py-2 bg-[#DCE8E4] hover:bg-[#cadfd8] text-[#26343C] rounded-xl text-xs flex items-center gap-1 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Color Palette (Hex Pickers) */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#5E8C84]" />
              <span>Color System (Soft, Elegant Palette)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              
              {/* Accent Sage */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#26343C]">
                  Accent Sage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCE8E4] p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-20 px-2 py-1 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* Light Sage */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#26343C]">
                  Light Sage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCE8E4] p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-20 px-2 py-1 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* Blush */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#26343C]">
                  Blush Rose
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.blushColor}
                    onChange={(e) => handleChange('blushColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCE8E4] p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.blushColor}
                    onChange={(e) => handleChange('blushColor', e.target.value)}
                    className="w-20 px-2 py-1 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#26343C]">
                  Site Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCE8E4] p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="w-20 px-2 py-1 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* Text Slate */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#26343C]">
                  Text Slate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#DCE8E4] p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="w-20 px-2 py-1 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Typography & Buttons */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
              <Type className="w-4 h-4 text-[#5E8C84]" />
              <span>Typography & Button Geometry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Heading Font (Display Serif)
                </label>
                <select
                  value={formData.headingFont}
                  onChange={(e) => handleChange('headingFont', e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                >
                  <option value="Fraunces">Fraunces (Warm Editorial Serif - Recommended)</option>
                  <option value="Playfair Display">Playfair Display (Classic Luxury)</option>
                  <option value="Cormorant Garamond">Cormorant Garamond (Ethereal Romance)</option>
                  <option value="Cinzel">Cinzel (Roman Grandeur)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Body Font (Prose Sans)
                </label>
                <select
                  value={formData.bodyFont}
                  onChange={(e) => handleChange('bodyFont', e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                >
                  <option value="Figtree">Figtree (Legible & Soft - Recommended)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Geometric)</option>
                  <option value="DM Sans">DM Sans (Minimalist)</option>
                  <option value="Manrope">Manrope (Clean & Crisp)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Button Corner Radius
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  {(['none', 'sm', 'md', 'lg', 'full'] as const).map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => handleChange('buttonRadius', rad)}
                      className={`py-1.5 rounded-lg border transition-all ${
                        formData.buttonRadius === rad
                          ? 'border-[#5E8C84] bg-[#5E8C84] text-white font-semibold'
                          : 'border-[#DCE8E4] bg-[#F2F6F6] text-[#26343C]'
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Button Style Preset
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  {(['solid', 'soft', 'outline'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleChange('buttonStyle', st)}
                      className={`py-1.5 rounded-lg border transition-all ${
                        formData.buttonStyle === st
                          ? 'border-[#5E8C84] bg-[#5E8C84] text-white font-semibold'
                          : 'border-[#DCE8E4] bg-[#F2F6F6] text-[#26343C]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hero Video & Poster Settings */}
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif-brand text-base font-semibold text-[#26343C] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#5E8C84]" />
                <span>Homepage Hero iPhone 17 Video & Cover</span>
              </h3>
              <span className="text-[10px] text-[#5E8C84] bg-[#DCE8E4] px-2 py-0.5 rounded-full font-medium">
                IndexedDB Storage
              </span>
            </div>

            {/* Hero Video */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#26343C] flex items-center gap-1.5">
                  <span>Hero Invitation Video (MP4 / WebM)</span>
                  {heroVideoSize && (
                    <span className="text-[10px] font-normal text-slate-500">
                      ({formatFileSize(heroVideoSize)})
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

              {heroVideoWarning && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{heroVideoWarning}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={heroVideoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'heroVideo')}
                />

                {formData.heroVideoUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => heroVideoInputRef.current?.click()}
                      className="px-3.5 py-2 bg-[#DCE8E4] hover:bg-[#cadfd8] text-[#26343C] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#5E8C84]" />
                      <span>Replace Hero Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMediaConfirmAction({
                          target: 'heroVideo',
                          title: 'Remove Hero Video',
                          message: 'Are you sure you want to remove the hero video? The hero poster image will be shown inside the phone instead.',
                        })
                      }
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Video</span>
                    </button>

                    <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Video Playing in Live Phone</span>
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => heroVideoInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Hero Video (MP4/WebM)</span>
                  </button>
                )}
              </div>

              {showVideoUrlInput && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={formData.heroVideoUrl}
                    onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
                    placeholder="https://... video url"
                    className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Hero Poster */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#26343C]">
                  Hero Cover Image (shown before video plays)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPosterUrlInput((prev) => !prev)}
                  className="text-[11px] text-[#5E8C84] hover:underline flex items-center gap-1"
                >
                  <Link className="w-3 h-3" />
                  <span>{showPosterUrlInput ? 'Hide URL field' : 'Or paste direct URL'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={heroPosterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'heroPoster')}
                />

                {formData.heroPosterUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => heroPosterInputRef.current?.click()}
                      className="px-3.5 py-2 bg-[#DCE8E4] hover:bg-[#cadfd8] text-[#26343C] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#5E8C84]" />
                      <span>Replace Poster</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMediaConfirmAction({
                          target: 'heroPoster',
                          title: 'Remove Hero Poster',
                          message: 'Are you sure you want to remove the hero cover image?',
                        })
                      }
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Poster</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => heroPosterInputRef.current?.click()}
                    className="px-4 py-2.5 bg-[#DCE8E4] hover:bg-[#cadfd8] text-[#26343C] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5E8C84]" />
                    <span>Upload Poster Image</span>
                  </button>
                )}
              </div>

              {showPosterUrlInput && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={formData.heroPosterUrl}
                    onChange={(e) => handleChange('heroPosterUrl', e.target.value)}
                    placeholder="https://... image url"
                    className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs font-mono"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Hero Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={formData.heroBadgeText}
                  onChange={(e) => handleChange('heroBadgeText', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Hero Main Heading
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={formData.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-brand text-sm font-semibold text-[#26343C]">
                Live Mobile Mockup Preview
              </h3>
              <span className="text-[10px] text-[#5E8C84] bg-[#DCE8E4] px-2 py-0.5 rounded-full font-medium">
                Tap Screen to Play
              </span>
            </div>

            <div className="pt-2 flex justify-center scale-95 origin-top">
              <IphoneMockup
                videoUrl={formData.heroVideoUrl}
                posterUrl={formData.heroPosterUrl}
                productTitle="Live Hero Preview"
              />
            </div>

            {/* Live Style Palette Test Swatch */}
            <div className="p-4 rounded-2xl border border-[#DCE8E4] space-y-3" style={{ backgroundColor: formData.backgroundColor }}>
              <p className="text-xs font-semibold" style={{ color: formData.textColor, fontFamily: formData.headingFont }}>
                {formData.brandName} Style Sample
              </p>
              <p className="text-[11px]" style={{ color: formData.textColor, opacity: 0.8, fontFamily: formData.bodyFont }}>
                Body text rendered in {formData.bodyFont} font.
              </p>
              <button
                type="button"
                className={`w-full py-2 px-4 text-xs font-medium text-white shadow-xs ${
                  formData.buttonRadius === 'none' ? 'rounded-none' :
                  formData.buttonRadius === 'sm' ? 'rounded-sm' :
                  formData.buttonRadius === 'md' ? 'rounded-md' :
                  formData.buttonRadius === 'lg' ? 'rounded-xl' : 'rounded-full'
                }`}
                style={{ backgroundColor: formData.primaryColor }}
              >
                Sample Button ({formData.buttonRadius})
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Design Settings"
        message="Are you sure you want to revert brand colors, typography, and hero video back to the factory defaults?"
        confirmLabel="Reset to Default"
        onConfirm={handleReset}
        onCancel={() => setIsResetConfirmOpen(false)}
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
