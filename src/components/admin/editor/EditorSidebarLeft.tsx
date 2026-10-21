import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Shapes, 
  UserSquare2, 
  Calendar, 
  Layers, 
  Settings, 
  FolderHeart, 
  Music, 
  MapPin, 
  Clock, 
  MousePointerClick,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { ScreenElement, TemplatePage, InvitationTemplate } from '../../../types/invitation';
import { uploadInvitationMedia } from '../../../services/invitationService';

interface EditorSidebarLeftProps {
  currentPage: TemplatePage;
  onAddElement: (element: Partial<ScreenElement>) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElement: (elementId: string, updates: Partial<ScreenElement>) => void;
  onDeleteElement: (elementId: string) => void;
  template: InvitationTemplate;
  onUpdateTemplate: (updates: Partial<InvitationTemplate>) => void;
}

type TabKey = 'elements' | 'library' | 'layers' | 'settings';

export const EditorSidebarLeft: React.FC<EditorSidebarLeftProps> = ({
  currentPage,
  onAddElement,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  template,
  onUpdateTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('elements');
  const [isUploading, setIsUploading] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<string[]>([
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadInvitationMedia(file, 'templates/library', undefined, true);
      setLibraryAssets((prev) => [url, ...prev]);
      onAddElement({
        kind: 'image',
        name: file.name.slice(0, 20),
        imageUrl: url,
        width: 400,
        height: 400,
      });
    } catch (err) {
      console.error('Failed to upload asset to library:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-[#DCE8E4] flex flex-col h-full shrink-0 select-none z-20">
      
      {/* Top Tab Switcher */}
      <div className="flex border-b border-[#DCE8E4] p-1 bg-[#F2F6F6]/50">
        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-white text-[#5E8C84] shadow-xs'
              : 'text-[#26343C]/70 hover:text-[#26343C]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'layers'
              ? 'bg-white text-[#5E8C84] shadow-xs'
              : 'text-[#26343C]/70 hover:text-[#26343C]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-white text-[#5E8C84] shadow-xs'
              : 'text-[#26343C]/70 hover:text-[#26343C]'
          }`}
        >
          <FolderHeart className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white text-[#5E8C84] shadow-xs'
              : 'text-[#26343C]/70 hover:text-[#26343C]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Suite</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* =========================================
            TAB 1: ADD ELEMENTS
        ========================================== */}
        {activeTab === 'elements' && (
          <div className="space-y-6">
            
            {/* 1. Typography */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/50 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Typography & Headings</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'text',
                    content: 'A Special Invitation',
                    fontFamily: 'Fraunces',
                    fontSize: 48,
                    color: '#26343C',
                    width: 600,
                    height: 120,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-left transition-colors cursor-pointer"
                >
                  <p className="font-serif-brand font-bold text-sm text-[#26343C]">Header</p>
                  <p className="text-[10px] text-[#26343C]/60">Fraunces 48px</p>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'text',
                    content: 'Sarah & Alexander',
                    fontFamily: 'Great Vibes',
                    fontSize: 64,
                    color: '#5E8C84',
                    width: 700,
                    height: 140,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-left transition-colors cursor-pointer"
                >
                  <p className="font-serif font-bold text-sm text-[#5E8C84] italic">Script Calligraphy</p>
                  <p className="text-[10px] text-[#26343C]/60">Great Vibes 64px</p>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'text',
                    content: 'Saturday, October 24, 2026\nat Five o’clock in the afternoon',
                    fontFamily: 'Figtree',
                    fontSize: 26,
                    color: '#26343C',
                    width: 600,
                    height: 100,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-left transition-colors cursor-pointer"
                >
                  <p className="font-sans font-semibold text-xs text-[#26343C]">Body Details</p>
                  <p className="text-[10px] text-[#26343C]/60">Figtree 26px</p>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'text',
                    content: 'بسم الله الرحمن الرحيم\nدعوت ولیمہ',
                    fontFamily: 'Noto Nastaliq Urdu',
                    fontSize: 42,
                    color: '#26343C',
                    width: 600,
                    height: 140,
                    isUrdu: true,
                    align: 'center',
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-right transition-colors cursor-pointer"
                >
                  <p className="font-serif font-bold text-sm text-[#26343C]" dir="rtl">اردو تحریر</p>
                  <p className="text-[10px] text-[#26343C]/60">Nastaliq Urdu 42px</p>
                </button>
              </div>
            </div>

            {/* 2. Client Field Text (Dynamic client-filled fields) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/50 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Client Field Text (Personalized)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'fieldText',
                    fieldKey: 'groomName',
                    name: 'Groom Name',
                    placeholder: 'Alexander Montgomery',
                    fontFamily: 'Fraunces',
                    fontSize: 48,
                    clientEditable: true,
                    clientFontEditable: true,
                    width: 500,
                    height: 90,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-medium text-[#26343C] shadow-2xs cursor-pointer"
                >
                  🤵 Groom Name
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'fieldText',
                    fieldKey: 'brideName',
                    name: 'Bride Name',
                    placeholder: 'Sarah Elizabeth Jenkins',
                    fontFamily: 'Fraunces',
                    fontSize: 48,
                    clientEditable: true,
                    clientFontEditable: true,
                    width: 500,
                    height: 90,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-medium text-[#26343C] shadow-2xs cursor-pointer"
                >
                  👰 Bride Name
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'fieldText',
                    fieldKey: 'eventDate',
                    name: 'Event Date',
                    placeholder: 'October 24, 2026',
                    fontFamily: 'Fraunces',
                    fontSize: 32,
                    clientEditable: true,
                    width: 450,
                    height: 70,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-medium text-[#26343C] shadow-2xs cursor-pointer"
                >
                  📅 Event Date
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'fieldText',
                    fieldKey: 'venueName',
                    name: 'Venue & City',
                    placeholder: 'The Glasshouse Estate, Portland',
                    fontFamily: 'Figtree',
                    fontSize: 26,
                    clientEditable: true,
                    width: 550,
                    height: 70,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-medium text-[#26343C] shadow-2xs cursor-pointer"
                >
                  🏛️ Venue & City
                </button>
              </div>
            </div>

            {/* 3. Photo Slots (Client Photos & Frames) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/50 flex items-center gap-1.5">
                <UserSquare2 className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Client Photo Slots</span>
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'photo',
                    name: 'Arch Photo Slot',
                    fieldKey: 'couplePhoto',
                    frameShape: 'arch',
                    width: 440,
                    height: 580,
                    clientEditable: true,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-center cursor-pointer transition-colors"
                >
                  <div className="w-8 h-10 mx-auto bg-slate-300 rounded-t-full mb-1" />
                  <span className="text-[10px] font-semibold text-[#26343C]">Arch</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'photo',
                    name: 'Circle Photo Slot',
                    fieldKey: 'polaroidPhoto1',
                    frameShape: 'circle',
                    width: 400,
                    height: 400,
                    clientEditable: true,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-center cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 mx-auto bg-slate-300 rounded-full mb-1" />
                  <span className="text-[10px] font-semibold text-[#26343C]">Circle</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'photo',
                    name: 'Polaroid Card Slot',
                    fieldKey: 'polaroidPhoto2',
                    frameShape: 'rounded',
                    width: 420,
                    height: 500,
                    borderRadius: 24,
                    shadow: '0 12px 30px rgba(0,0,0,0.12)',
                    clientEditable: true,
                  })}
                  className="p-3 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 border border-[#DCE8E4] rounded-xl text-center cursor-pointer transition-colors"
                >
                  <div className="w-9 h-10 mx-auto bg-slate-300 rounded-md mb-1" />
                  <span className="text-[10px] font-semibold text-[#26343C]">Polaroid</span>
                </button>
              </div>
            </div>

            {/* 4. Shapes & Florals */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/50 flex items-center gap-1.5">
                <Shapes className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Shapes & Cards</span>
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'shape',
                    shapeType: 'rounded',
                    name: 'Lace Card',
                    fill: '#FFFFFF',
                    stroke: '#DCE8E4',
                    strokeWidth: 2,
                    borderRadius: 32,
                    shadow: '0 10px 25px rgba(38, 52, 60, 0.08)',
                    width: 750,
                    height: 480,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-center cursor-pointer"
                  title="Card Surface"
                >
                  <div className="w-6 h-5 mx-auto bg-slate-100 rounded-md border border-slate-300" />
                  <span className="text-[9px] font-medium block mt-1">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'shape',
                    shapeType: 'circle',
                    name: 'Wax Seal Base',
                    fill: '#5E8C84',
                    width: 140,
                    height: 140,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-center cursor-pointer"
                  title="Circle"
                >
                  <div className="w-5 h-5 mx-auto bg-[#5E8C84] rounded-full" />
                  <span className="text-[9px] font-medium block mt-1">Seal</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'shape',
                    shapeType: 'heart',
                    name: 'Heart Icon',
                    fill: '#EEDDE0',
                    stroke: '#5E8C84',
                    strokeWidth: 2,
                    width: 80,
                    height: 80,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-center cursor-pointer"
                  title="Heart"
                >
                  <div className="w-5 h-5 mx-auto text-[#5E8C84] flex items-center justify-center">♥</div>
                  <span className="text-[9px] font-medium block mt-1">Heart</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'shape',
                    shapeType: 'line',
                    name: 'Divider Line',
                    stroke: '#DCE8E4',
                    strokeWidth: 2,
                    width: 400,
                    height: 4,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-center cursor-pointer"
                  title="Line"
                >
                  <div className="w-6 h-1 mx-auto bg-slate-400 my-2" />
                  <span className="text-[9px] font-medium block mt-1">Line</span>
                </button>
              </div>
            </div>

            {/* 5. Interactive Wedding Components */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/50 flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Interactive Blocks & Actions</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* Wax Seal Click-to-open Button */}
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'button',
                    name: 'Wax Seal Button',
                    content: 'TAP TO OPEN',
                    fill: '#5E8C84',
                    color: '#FFFFFF',
                    borderRadius: 50,
                    width: 240,
                    height: 70,
                    action: {
                      type: 'playVideoThenGoto',
                      targetPageId: 'page_2',
                    },
                    entranceAnimation: 'bounce',
                    loopAnimation: 'pulse',
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-semibold text-[#26343C] shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <span className="text-base">💌</span>
                  <div>
                    <p className="leading-tight">Open Envelope</p>
                    <p className="text-[10px] text-[#5E8C84]">Wax seal action</p>
                  </div>
                </button>

                {/* RSVP Block */}
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'rsvp',
                    name: 'RSVP Button',
                    content: 'Kindly RSVP',
                    fill: '#5E8C84',
                    color: '#FFFFFF',
                    width: 420,
                    height: 80,
                    action: {
                      type: 'openRsvp',
                    },
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-semibold text-[#26343C] shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#5E8C84]" />
                  <div>
                    <p className="leading-tight">RSVP Action</p>
                    <p className="text-[10px] text-[#26343C]/60">Opens guest form</p>
                  </div>
                </button>

                {/* Map Button */}
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'map',
                    name: 'Venue Map Button',
                    content: 'View Map Directions',
                    fieldKey: 'mapUrl',
                    width: 420,
                    height: 70,
                    action: {
                      type: 'openMap',
                      mapUrl: 'https://maps.google.com',
                    },
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-semibold text-[#26343C] shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-[#5E8C84]" />
                  <div>
                    <p className="leading-tight">Google Map</p>
                    <p className="text-[10px] text-[#26343C]/60">Directions pin</p>
                  </div>
                </button>

                {/* Timeline Block */}
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'timeline',
                    name: 'Celebration Timeline',
                    fieldKey: 'timelineEvents',
                    width: 650,
                    height: 380,
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-semibold text-[#26343C] shadow-2xs cursor-pointer flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-[#5E8C84]" />
                  <div>
                    <p className="leading-tight">Event Timeline</p>
                    <p className="text-[10px] text-[#26343C]/60">One day at a glance</p>
                  </div>
                </button>

                {/* Music Button */}
                <button
                  type="button"
                  onClick={() => onAddElement({
                    kind: 'music',
                    name: 'Ambient Music Toggle',
                    width: 80,
                    height: 80,
                    action: {
                      type: 'toggleMusic',
                    },
                  })}
                  className="p-2.5 bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl text-left font-semibold text-[#26343C] shadow-2xs cursor-pointer flex items-center gap-2 col-span-2"
                >
                  <Music className="w-4 h-4 text-[#5E8C84]" />
                  <div>
                    <p className="leading-tight">Floating Ambient Music Button</p>
                    <p className="text-[10px] text-[#26343C]/60">Plays background wedding melody on tap</p>
                  </div>
                </button>

              </div>
            </div>

          </div>
        )}

        {/* =========================================
            TAB 2: LAYERS PANEL
        ========================================== */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60">
                Page Layers ({currentPage.elements.length})
              </h4>
              <span className="text-[10px] text-[#5E8C84]">Top = Front</span>
            </div>

            {currentPage.elements.length === 0 ? (
              <p className="text-xs text-[#26343C]/60 py-6 text-center">
                No elements on this page. Click "Add" to start.
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...currentPage.elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement(el.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#5E8C84]/15 border-[#5E8C84] text-[#26343C] font-semibold'
                            : 'bg-white border-[#DCE8E4] hover:bg-slate-50 text-[#26343C]/80'
                        }`}
                      >
                        <span className="truncate max-w-[140px]">
                          {el.name || el.kind}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onUpdateElement(el.id, { hidden: !el.hidden })}
                            className="p-1 text-[#26343C]/60 hover:text-[#26343C]"
                            title={el.hidden ? 'Show element' : 'Hide element'}
                          >
                            {el.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateElement(el.id, { locked: !el.locked })}
                            className="p-1 text-[#26343C]/60 hover:text-[#26343C]"
                            title={el.locked ? 'Unlock element' : 'Lock element'}
                          >
                            {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteElement(el.id)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB 3: MY LIBRARY (Canva Asset Storage)
        ========================================== */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60">
                Atelier Media Assets
              </h4>
              <p className="text-xs text-[#26343C]/70 mt-0.5">
                Upload transparent PNG florals, wax seals, envelopes, and textures.
              </p>
            </div>

            <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-[#5E8C84] rounded-2xl cursor-pointer hover:bg-[#DCE8E4]/20 transition-colors">
              <Upload className="w-4 h-4 text-[#5E8C84]" />
              <span className="text-xs font-semibold text-[#5E8C84]">
                {isUploading ? 'Uploading...' : 'Upload PNG / JPG Asset'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              {libraryAssets.map((asset, idx) => (
                <div
                  key={idx}
                  onClick={() => onAddElement({
                    kind: 'image',
                    name: `Asset ${idx + 1}`,
                    imageUrl: asset,
                    width: 450,
                    height: 450,
                  })}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[#DCE8E4] bg-slate-50 cursor-pointer hover:border-[#5E8C84] transition-all"
                >
                  <img src={asset} alt="Asset" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-[#26343C]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity">
                    Add to Page
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: SUITE & TEMPLATE SETTINGS
        ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60">
                Template Configuration
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Presentation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateTemplate({ mode: 'page' })}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center cursor-pointer ${
                      template.mode === 'page'
                        ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                        : 'bg-white border-[#DCE8E4] text-[#26343C]'
                    }`}
                  >
                    Click to Open Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTemplate({ mode: 'scroll' })}
                    className={`py-2 px-3 rounded-xl border font-semibold text-center cursor-pointer ${
                      template.mode === 'scroll'
                        ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                        : 'bg-white border-[#DCE8E4] text-[#26343C]'
                    }`}
                  >
                    Continuous Scroll
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Background Music URL (MP3)
                </label>
                <input
                  type="text"
                  value={template.musicUrl || ''}
                  onChange={(e) => onUpdateTemplate({ musicUrl: e.target.value })}
                  placeholder="https://.../ambient_wedding.mp3"
                  className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Envelope Video (Optional Wax Seal MP4)
                </label>
                <input
                  type="text"
                  value={template.introVideoUrl || ''}
                  onChange={(e) => onUpdateTemplate({ introVideoUrl: e.target.value })}
                  placeholder="https://.../wax_seal_open.mp4"
                  className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Linked Boutique Product
                </label>
                <input
                  type="text"
                  value={template.productId || ''}
                  onChange={(e) => onUpdateTemplate({ productId: e.target.value })}
                  placeholder="prod-seraphina"
                  className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
