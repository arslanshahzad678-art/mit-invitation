import React from 'react';
import { 
  ScreenElement, 
  TemplatePage, 
  ActionType, 
  AnimationEntrance, 
  AnimationLoop 
} from '../../../types/invitation';
import { 
  Type, 
  Palette, 
  Sliders, 
  Zap, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';

interface EditorSidebarRightProps {
  element: ScreenElement | null;
  currentPage: TemplatePage;
  pages: TemplatePage[];
  onUpdateElement: (updates: Partial<ScreenElement>) => void;
  onUpdatePage: (updates: Partial<TemplatePage>) => void;
}

const GOOGLE_FONTS = [
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
  'Lora',
  'Amiri',
  'Noto Nastaliq Urdu',
];

export const EditorSidebarRight: React.FC<EditorSidebarRightProps> = ({
  element,
  currentPage,
  pages,
  onUpdateElement,
  onUpdatePage,
}) => {
  // If NO element is selected, show Page Settings
  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-[#DCE8E4] flex flex-col h-full shrink-0 select-none overflow-y-auto p-4 space-y-6 z-20">
        <div>
          <h3 className="font-serif-brand font-semibold text-sm text-[#26343C]">
            Page Properties
          </h3>
          <p className="text-[11px] text-[#26343C]/60">
            Configure {currentPage.name} dimensions and backdrop.
          </p>
        </div>

        {/* Page Identity */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Page Title
            </label>
            <input
              type="text"
              value={currentPage.name}
              onChange={(e) => onUpdatePage({ name: e.target.value })}
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#F2F6F6] rounded-xl border border-[#DCE8E4]">
            <div>
              <p className="font-semibold text-xs text-[#26343C]">Envelope Intro Page</p>
              <p className="text-[10px] text-[#26343C]/60">Wax seal click-to-open experience</p>
            </div>
            <input
              type="checkbox"
              checked={currentPage.isIntro || false}
              onChange={(e) => onUpdatePage({ isIntro: e.target.checked })}
              className="w-4 h-4 accent-[#5E8C84]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Height Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdatePage({ heightMode: 'full', customHeight: 1920 })}
                className={`py-2 px-3 rounded-xl border font-semibold text-center cursor-pointer ${
                  currentPage.heightMode !== 'scroll'
                    ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                    : 'bg-white border-[#DCE8E4] text-[#26343C]'
                }`}
              >
                Full Screen
              </button>
              <button
                type="button"
                onClick={() => onUpdatePage({ heightMode: 'scroll', customHeight: 3200 })}
                className={`py-2 px-3 rounded-xl border font-semibold text-center cursor-pointer ${
                  currentPage.heightMode === 'scroll'
                    ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                    : 'bg-white border-[#DCE8E4] text-[#26343C]'
                }`}
              >
                Long Scroll
              </button>
            </div>
          </div>

          {currentPage.heightMode === 'scroll' && (
            <div>
              <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                Custom Page Height (px)
              </label>
              <input
                type="number"
                value={currentPage.customHeight || 3200}
                onChange={(e) => onUpdatePage({ customHeight: Number(e.target.value) })}
                step={100}
                className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentPage.backgroundColor || '#FAF7F2'}
                onChange={(e) => onUpdatePage({ backgroundColor: e.target.value })}
                className="w-9 h-9 rounded-xl border border-[#DCE8E4] cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={currentPage.backgroundColor || '#FAF7F2'}
                onChange={(e) => onUpdatePage({ backgroundColor: e.target.value })}
                className="flex-1 p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Background Artwork Image URL
            </label>
            <input
              type="text"
              value={currentPage.backgroundUrl || ''}
              onChange={(e) => onUpdatePage({ backgroundUrl: e.target.value })}
              placeholder="https://.../lace_texture.png"
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Page Transition Effect
            </label>
            <select
              value={currentPage.transition || 'fade'}
              onChange={(e) => onUpdatePage({ transition: e.target.value as any })}
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            >
              <option value="fade">Smooth Fade</option>
              <option value="slide">Slide In</option>
              <option value="zoom">Zoom In</option>
              <option value="flip">Envelope Flip</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // ELEMENT SELECTED: Show Element Properties
  return (
    <div className="w-80 bg-white border-l border-[#DCE8E4] flex flex-col h-full shrink-0 select-none overflow-y-auto p-4 space-y-6 z-20">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DCE8E4] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E8C84]">
            {element.kind}
          </span>
          <h3 className="font-serif-brand font-semibold text-sm text-[#26343C] truncate max-w-[170px]">
            {element.name || element.kind}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onUpdateElement({ locked: !element.locked })}
          className={`p-1.5 rounded-lg border transition-colors ${
            element.locked ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}
          title={element.locked ? 'Unlock' : 'Lock element position'}
        >
          <Lock className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-5 text-xs">
        
        {/* =========================================
            CLIENT PERMISSIONS (Lock / Unlock for client)
        ========================================== */}
        <div className="p-3 bg-[#5E8C84]/10 rounded-2xl border border-[#5E8C84]/30 space-y-2">
          <div className="flex items-center gap-1.5 text-[#5E8C84] font-semibold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Client Edit Permissions</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={element.clientEditable || false}
              onChange={(e) => onUpdateElement({ clientEditable: e.target.checked })}
              className="w-4 h-4 accent-[#5E8C84]"
            />
            <span className="text-[11px] text-[#26343C] font-medium">
              Client can edit this content
            </span>
          </label>

          {element.clientEditable && (
            <div>
              <label className="text-[10px] text-[#26343C]/70 block mb-0.5">
                Bound Field Key:
              </label>
              <input
                type="text"
                value={element.fieldKey || ''}
                onChange={(e) => onUpdateElement({ fieldKey: e.target.value })}
                placeholder="e.g. groomName, eventDate, couplePhoto"
                className="w-full p-1.5 text-[11px] font-mono bg-white border border-[#DCE8E4] rounded-lg outline-none focus:border-[#5E8C84]"
              />
            </div>
          )}

          {(element.kind === 'text' || element.kind === 'fieldText') && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={element.clientFontEditable || false}
                onChange={(e) => onUpdateElement({ clientFontEditable: e.target.checked })}
                className="w-4 h-4 accent-[#5E8C84]"
              />
              <span className="text-[11px] text-[#26343C] font-medium">
                Client can change font family
              </span>
            </label>
          )}
        </div>

        {/* =========================================
            TYPOGRAPHY (For text, fieldText, button)
        ========================================== */}
        {(element.kind === 'text' || element.kind === 'fieldText' || element.kind === 'button') && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#5E8C84]" />
              <span>Typography</span>
            </h4>

            {element.kind === 'text' && (
              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Text Content
                </label>
                <textarea
                  rows={2}
                  value={element.content || ''}
                  onChange={(e) => onUpdateElement({ content: e.target.value })}
                  className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                Font Family
              </label>
              <select
                value={element.fontFamily || 'Fraunces'}
                onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
                className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
              >
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Size (px)
                </label>
                <input
                  type="number"
                  value={element.fontSize || 24}
                  onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                  className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={element.color || '#26343C'}
                    onChange={(e) => onUpdateElement({ color: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-[#DCE8E4] cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={element.color || '#26343C'}
                    onChange={(e) => onUpdateElement({ color: e.target.value })}
                    className="flex-1 p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-[11px] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Formatting & Alignment Toolbar */}
            <div className="flex items-center justify-between p-1 bg-[#F2F6F6] rounded-xl border border-[#DCE8E4]">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateElement({ bold: !element.bold })}
                  className={`p-1.5 rounded-lg ${element.bold ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement({ italic: !element.italic })}
                  className={`p-1.5 rounded-lg ${element.italic ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement({ underline: !element.underline })}
                  className={`p-1.5 rounded-lg ${element.underline ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateElement({ align: 'left' })}
                  className={`p-1.5 rounded-lg ${element.align === 'left' ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement({ align: 'center' })}
                  className={`p-1.5 rounded-lg ${(!element.align || element.align === 'center') ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateElement({ align: 'right' })}
                  className={`p-1.5 rounded-lg ${element.align === 'right' ? 'bg-[#5E8C84] text-white' : 'text-[#26343C]/70'}`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={element.isUrdu || false}
                onChange={(e) => onUpdateElement({ 
                  isUrdu: e.target.checked,
                  fontFamily: e.target.checked ? 'Noto Nastaliq Urdu' : element.fontFamily,
                  align: e.target.checked ? 'right' : element.align,
                })}
                className="w-4 h-4 accent-[#5E8C84]"
              />
              <span className="text-[11px] text-[#26343C] font-medium">
                RTL Urdu Nastaliq mode
              </span>
            </label>
          </div>
        )}

        {/* =========================================
            GEOMETRY & POSITION
        ========================================== */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Geometry & Bounds</span>
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#26343C]/60">X (px)</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#26343C]/60">Y (px)</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#26343C]/60">Width (px)</label>
              <input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => onUpdateElement({ width: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#26343C]/60">Height (px)</label>
              <input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => onUpdateElement({ height: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-[#26343C]/60">Rotation (°)</label>
              <input
                type="number"
                value={element.rotation || 0}
                onChange={(e) => onUpdateElement({ rotation: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#26343C]/60">Opacity</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={element.opacity ?? 1}
                onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
                className="w-full mt-2 accent-[#5E8C84]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onUpdateElement({ flipX: !element.flipX })}
              className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1 ${
                element.flipX ? 'bg-[#5E8C84] text-white' : 'bg-white border-[#DCE8E4] text-[#26343C]'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip X</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateElement({ flipY: !element.flipY })}
              className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1 ${
                element.flipY ? 'bg-[#5E8C84] text-white' : 'bg-white border-[#DCE8E4] text-[#26343C]'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Flip Y</span>
            </button>
          </div>
        </div>

        {/* =========================================
            CLICK ACTIONS (e.g. Goto, Wax seal video)
        ========================================== */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Click Action</span>
          </h4>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Action Trigger
            </label>
            <select
              value={element.action?.type || ''}
              onChange={(e) => {
                const val = e.target.value as ActionType;
                if (!val) {
                  onUpdateElement({ action: undefined });
                } else {
                  onUpdateElement({
                    action: {
                      type: val,
                      targetPageId: pages[1]?.id || '',
                    },
                  });
                }
              }}
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            >
              <option value="">None (Static element)</option>
              <option value="goto">Go to Page</option>
              <option value="playVideoThenGoto">Play Video Then Go to Page</option>
              <option value="back">Go Back</option>
              <option value="openRsvp">Open RSVP Modal</option>
              <option value="openMap">Open Venue Map</option>
              <option value="toggleMusic">Toggle Ambient Music</option>
              <option value="openLink">Open External Link</option>
            </select>
          </div>

          {(element.action?.type === 'goto' || element.action?.type === 'playVideoThenGoto') && (
            <div>
              <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                Target Page
              </label>
              <select
                value={element.action.targetPageId || ''}
                onChange={(e) => onUpdateElement({
                  action: { ...element.action!, targetPageId: e.target.value },
                })}
                className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
              >
                {pages.map((p, idx) => (
                  <option key={p.id} value={p.id}>
                    Page {idx + 1}: {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {element.action?.type === 'openLink' && (
            <div>
              <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
                External URL
              </label>
              <input
                type="text"
                value={element.action.url || ''}
                onChange={(e) => onUpdateElement({
                  action: { ...element.action!, url: e.target.value },
                })}
                placeholder="https://..."
                className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
              />
            </div>
          )}
        </div>

        {/* =========================================
            ANIMATIONS
        ========================================== */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#26343C]/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Entrance & Loop Animation</span>
          </h4>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Entrance Effect
            </label>
            <select
              value={element.entranceAnimation || 'none'}
              onChange={(e) => onUpdateElement({ entranceAnimation: e.target.value as AnimationEntrance })}
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            >
              <option value="none">None</option>
              <option value="fade">Soft Fade In</option>
              <option value="slideUp">Slide Up</option>
              <option value="slideDown">Slide Down</option>
              <option value="slideLeft">Slide from Left</option>
              <option value="slideRight">Slide from Right</option>
              <option value="zoomIn">Zoom In</option>
              <option value="bounce">Bounce</option>
              <option value="flip">Flip</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#26343C]/70 block mb-1">
              Loop Animation
            </label>
            <select
              value={element.loopAnimation || 'none'}
              onChange={(e) => onUpdateElement({ loopAnimation: e.target.value as AnimationLoop })}
              className="w-full p-2 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl outline-none focus:border-[#5E8C84]"
            >
              <option value="none">None</option>
              <option value="float">Gentle Float</option>
              <option value="pulse">Soft Pulse</option>
              <option value="shimmer">Subtle Shimmer</option>
              <option value="sway">Gentle Sway</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#26343C]/60">Delay (s)</label>
              <input
                type="number"
                step={0.1}
                min={0}
                value={element.animationDelay || 0}
                onChange={(e) => onUpdateElement({ animationDelay: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#26343C]/60">Duration (s)</label>
              <input
                type="number"
                step={0.1}
                min={0.1}
                value={element.animationDuration || 0.6}
                onChange={(e) => onUpdateElement({ animationDuration: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
