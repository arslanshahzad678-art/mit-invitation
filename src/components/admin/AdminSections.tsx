import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PageSection, SectionType } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  X,
  Check
} from 'lucide-react';

export const AdminSections: React.FC = () => {
  const { sections, saveSection, deleteSection, reorderSections } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<PageSection | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [type, setType] = useState<SectionType>('text');
  const [content, setContent] = useState('');

  const openAdd = () => {
    setEditingSection(null);
    setTitle('');
    setSubtitle('');
    setBadge('');
    setType('text');
    setContent('');
    setIsModalOpen(true);
  };

  const openEdit = (sec: PageSection) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setSubtitle(sec.subtitle || '');
    setBadge(sec.badge || '');
    setType(sec.type);
    setContent(sec.content || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const sec: PageSection = {
      id: editingSection?.id || 'sec-' + Date.now(),
      type,
      title,
      subtitle,
      badge,
      content,
      isVisible: editingSection ? editingSection.isVisible : true,
      order: editingSection?.order || sections.length + 1,
    };

    saveSection(sec);
    setIsModalOpen(false);
  };

  const toggleVisibility = (sec: PageSection) => {
    saveSection({
      ...sec,
      isVisible: !sec.isVisible,
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const list = [...sections];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    reorderSections(list.map((s) => s.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Homepage Sections Layout ({sections.length})
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Reorder, customize headings, show/hide, or add new content blocks to your homepage flow.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCE8E4] overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                !sec.isVisible ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/40'
              }`}
            >
              {/* Order Controls & Position */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#26343C]/40 w-5">
                  {idx + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-[#DCE8E4] rounded disabled:opacity-20 transition-colors"
                    title="Move section up"
                  >
                    <ArrowUp className="w-3 h-3 text-[#26343C]" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1 hover:bg-[#DCE8E4] rounded disabled:opacity-20 transition-colors"
                    title="Move section down"
                  >
                    <ArrowDown className="w-3 h-3 text-[#26343C]" />
                  </button>
                </div>
              </div>

              {/* Title & Type */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCE8E4] text-[#26343C]">
                    {sec.type.replace('_', ' ')}
                  </span>
                  {!sec.isVisible && (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hidden from Live Site
                    </span>
                  )}
                </div>
                <h4 className="font-serif-brand text-base font-semibold text-[#26343C] mt-1 truncate">
                  {sec.title}
                </h4>
                {sec.subtitle && (
                  <p className="text-xs text-[#26343C]/60 truncate mt-0.5">
                    {sec.subtitle}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleVisibility(sec)}
                  className={`p-2 rounded-xl transition-colors ${
                    sec.isVisible
                      ? 'text-[#5E8C84] hover:bg-[#DCE8E4]/50'
                      : 'text-slate-400 hover:bg-slate-200'
                  }`}
                  title={sec.isVisible ? 'Hide Section' : 'Show Section'}
                >
                  {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => openEdit(sec)}
                  className="p-2 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-xl transition-colors"
                  title="Edit Section Details"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSectionToDelete(sec)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif-brand font-semibold text-[#26343C] mb-4">
              {editingSection ? 'Edit Section' : 'Add New Homepage Section'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Section Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                >
                  <option value="hero">Hero (iPhone Mockup with Video)</option>
                  <option value="why_choose_us">Why Choose Us (6 Feature Cards)</option>
                  <option value="product_grid">Product Gallery Grid</option>
                  <option value="whats_included">What's Included Breakdown</option>
                  <option value="reviews">Testimonials & Reviews</option>
                  <option value="steps">How It Works in 3 Steps</option>
                  <option value="faq">FAQ Accordion</option>
                  <option value="cta">Call to Action Banner</option>
                  <option value="text">Custom Text Section</option>
                  <option value="banner">Promotional Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Curated Template Gallery"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Subtitle or Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Supporting subtitle..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Eyebrow Badge (Optional)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Modern Standard"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#26343C]/70 hover:text-[#26343C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {editingSection ? 'Save Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!sectionToDelete}
        title="Delete Homepage Section"
        message={`Are you sure you want to remove "${sectionToDelete?.title}" from your homepage flow?`}
        confirmLabel="Delete Section"
        onConfirm={() => {
          if (sectionToDelete) {
            deleteSection(sectionToDelete.id);
            setSectionToDelete(null);
          }
        }}
        onCancel={() => setSectionToDelete(null)}
      />
    </div>
  );
};
