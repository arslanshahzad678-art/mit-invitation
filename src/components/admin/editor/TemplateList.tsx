import React, { useState, useEffect } from 'react';
import { 
  InvitationTemplate 
} from '../../../types/invitation';
import { 
  listTemplates, 
  saveTemplate, 
  deleteTemplate, 
  duplicateTemplate 
} from '../../../services/invitationService';
import { useStore } from '../../../context/StoreContext';
import { TemplateEditor } from './TemplateEditor';
import { ConfirmModal } from '../../common/ConfirmModal';
import { 
  Plus, 
  Sparkles, 
  Edit3, 
  Copy, 
  Trash2, 
  Layers, 
  Search, 
  RefreshCw,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { createSeedTemplate } from '../../../services/seedTemplateService';

export const TemplateList: React.FC = () => {
  const { products, showToast } = useStore();
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEditorTemplate, setActiveEditorTemplate] = useState<InvitationTemplate | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      let list = await listTemplates();
      // If no templates exist in Firestore, initialize the comprehensive seed template!
      if (list.length === 0) {
        const seed = createSeedTemplate();
        await saveTemplate(seed);
        list = [seed];
      }
      setTemplates(list);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateNew = () => {
    const newId = `tpl_${Date.now()}`;
    const newTemplate: InvitationTemplate = {
      id: newId,
      name: 'New Invitation Suite',
      mode: 'page',
      status: 'draft',
      createdAt: new Date().toISOString(),
      fontOptions: [
        'Fraunces',
        'Figtree',
        'Playfair Display',
        'Cormorant Garamond',
        'Great Vibes',
        'Dancing Script',
        'Pinyon Script',
        'Allura',
        'Cinzel',
        'Montserrat',
        'Noto Nastaliq Urdu',
      ],
      defaultFont: 'Fraunces',
      fields: [
        { key: 'groomName', label: 'Groom Name', type: 'text', defaultValue: 'Alexander Montgomery', editable: true },
        { key: 'brideName', label: 'Bride Name', type: 'text', defaultValue: 'Sarah Elizabeth', editable: true },
        { key: 'eventDate', label: 'Wedding Date', type: 'date', defaultValue: '2026-10-24', editable: true },
        { key: 'eventTime', label: 'Ceremony Time', type: 'time', defaultValue: '17:00', editable: true },
        { key: 'venueName', label: 'Venue Name', type: 'text', defaultValue: 'The Glasshouse Atelier', editable: true },
        { key: 'venueCity', label: 'City & State', type: 'text', defaultValue: 'Portland, OR', editable: true },
      ],
      pages: [
        {
          id: 'page_intro',
          name: 'Envelope & Seal',
          order: 1,
          isIntro: true,
          heightMode: 'full',
          customHeight: 1920,
          backgroundColor: '#FAF7F2',
          transition: 'fade',
          elements: [
            {
              id: 'el_title',
              kind: 'text',
              name: 'Tagline',
              content: 'A SPECIAL INVITATION FROM',
              fontFamily: 'Figtree',
              fontSize: 22,
              color: '#5E8C84',
              uppercase: true,
              letterSpacing: 4,
              x: 140,
              y: 350,
              width: 800,
              height: 60,
              zIndex: 1,
            },
            {
              id: 'el_names',
              kind: 'fieldText',
              fieldKey: 'groomName',
              name: 'Couple Names',
              content: 'Sarah & Alexander',
              fontFamily: 'Great Vibes',
              fontSize: 68,
              color: '#26343C',
              clientEditable: true,
              clientFontEditable: true,
              x: 90,
              y: 440,
              width: 900,
              height: 140,
              zIndex: 2,
            },
            {
              id: 'el_envelope_card',
              kind: 'shape',
              shapeType: 'rounded',
              name: 'Envelope Fold',
              fill: '#FFFFFF',
              stroke: '#DCE8E4',
              strokeWidth: 3,
              borderRadius: 36,
              shadow: '0 20px 45px rgba(38, 52, 60, 0.12)',
              x: 140,
              y: 650,
              width: 800,
              height: 550,
              zIndex: 3,
            },
            {
              id: 'el_wax_seal',
              kind: 'button',
              name: 'Wax Seal Button',
              content: 'TAP TO OPEN',
              fill: '#5E8C84',
              color: '#FFFFFF',
              borderRadius: 50,
              x: 400,
              y: 1250,
              width: 280,
              height: 80,
              zIndex: 4,
              action: {
                type: 'playVideoThenGoto',
                targetPageId: 'page_home',
              },
              loopAnimation: 'pulse',
            },
          ],
        },
        {
          id: 'page_home',
          name: 'Home Invitation',
          order: 2,
          heightMode: 'full',
          customHeight: 1920,
          backgroundColor: '#FAF7F2',
          transition: 'fade',
          elements: [
            {
              id: 'el_home_names',
              kind: 'fieldText',
              fieldKey: 'groomName',
              name: 'Bride & Groom Title',
              content: 'Sarah & Alexander',
              fontFamily: 'Fraunces',
              fontSize: 54,
              color: '#26343C',
              clientEditable: true,
              clientFontEditable: true,
              x: 90,
              y: 280,
              width: 900,
              height: 120,
              zIndex: 1,
            },
            {
              id: 'el_home_rsvp',
              kind: 'rsvp',
              name: 'RSVP Trigger',
              content: 'Kindly RSVP',
              x: 290,
              y: 1400,
              width: 500,
              height: 90,
              zIndex: 2,
              action: {
                type: 'openRsvp',
              },
            },
          ],
        },
      ],
    };

    setActiveEditorTemplate(newTemplate);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateTemplate(id);
      if (copy) {
        setTemplates((prev) => [copy, ...prev]);
        showToast('Template duplicated successfully', 'success');
      }
    } catch {
      showToast('Could not duplicate template', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteTemplate(deleteConfirmId);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteConfirmId));
      showToast('Template deleted', 'info');
    } catch {
      showToast('Could not delete template', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Canva Invitation Template Builder
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Design multi-page interactive mobile invitation suites with wax seal animations, guest RSVP, and locked client fields.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template Suite</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DCE8E4]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#26343C]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F2F6F6] rounded-xl outline-none border border-transparent focus:border-[#5E8C84]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-[#26343C]/70 w-full sm:w-auto justify-between sm:justify-end">
          <span>{templates.length} Active Template(s)</span>
          <button
            type="button"
            onClick={fetchTemplates}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-[#5E8C84]"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
          <p className="text-xs text-[#26343C]/60">Loading invitation suites...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#DCE8E4] space-y-3">
          <Sparkles className="w-10 h-10 text-[#5E8C84] mx-auto" />
          <h3 className="font-serif-brand text-lg text-[#26343C]">No Templates Found</h3>
          <p className="text-xs text-[#26343C]/70 max-w-md mx-auto">
            Get started by creating your first digital invitation suite with custom artwork backgrounds and interactive wax-seal actions.
          </p>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2 bg-[#5E8C84] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Suite</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const linkedProduct = products.find((p) => p.id === tpl.productId);
            return (
              <div
                key={tpl.id}
                className="bg-white rounded-3xl border border-[#DCE8E4] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Visual Thumbnail */}
                <div 
                  className="relative aspect-[9/10] bg-[#FAF7F2] border-b border-[#DCE8E4] flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => setActiveEditorTemplate(tpl)}
                >
                  {/* Subtle envelope representation */}
                  <div className="w-48 h-64 bg-white rounded-2xl border border-[#DCE8E4] shadow-md flex flex-col items-center justify-between p-4 text-center">
                    <span className="text-[9px] uppercase tracking-widest text-[#5E8C84] font-semibold">
                      MIT Invitations
                    </span>
                    <div>
                      <div className="w-10 h-10 rounded-full bg-[#5E8C84]/15 mx-auto flex items-center justify-center text-sm font-serif-brand font-bold text-[#5E8C84]">
                        💌
                      </div>
                      <h4 className="font-serif-brand text-sm font-semibold text-[#26343C] mt-2 leading-tight">
                        {tpl.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#26343C]/50">
                      {tpl.pages.length} Interactive Page(s)
                    </span>
                  </div>

                  {/* Mode Badge */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-[#26343C] border border-[#DCE8E4] shadow-2xs">
                    {tpl.mode === 'scroll' ? 'Scroll Mode' : 'Click to Open'}
                  </span>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-[#26343C]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      className="px-4 py-2 bg-white text-[#26343C] text-xs font-semibold rounded-xl shadow-lg flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#5E8C84]" />
                      <span>Open in Studio</span>
                    </button>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-brand font-semibold text-base text-[#26343C] truncate">
                        {tpl.name}
                      </h3>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {tpl.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#26343C]/60 mt-0.5">
                      Linked Product:{' '}
                      <strong className="text-[#26343C]">
                        {linkedProduct ? linkedProduct.name : tpl.productId || 'Not Linked'}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTemplate(tpl)}
                      className="text-xs font-semibold text-[#5E8C84] hover:text-[#4d756e] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Suite</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tpl.id)}
                        className="p-1.5 text-[#26343C]/60 hover:text-[#5E8C84] rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Template"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(tpl.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Template Editor Modal */}
      {activeEditorTemplate && (
        <TemplateEditor
          initialTemplate={activeEditorTemplate}
          onClose={() => {
            setActiveEditorTemplate(null);
            fetchTemplates();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Template Suite"
        message="Are you sure you want to delete this invitation template? This action cannot be undone."
        confirmLabel="Delete Template"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

    </div>
  );
};
