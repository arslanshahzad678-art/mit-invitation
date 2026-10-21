import React from 'react';
import { 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Save, 
  ChevronLeft,
  Grid,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface EditorToolbarProps {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitZoom: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  onPreview: () => void;
  currentPageIndex: number;
  totalPages: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  templateName,
  onTemplateNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onFitZoom,
  showGrid,
  onToggleGrid,
  isSaving,
  onSave,
  onClose,
  onPreview,
  currentPageIndex,
  totalPages,
}) => {
  return (
    <header className="h-14 bg-white border-b border-[#DCE8E4] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30">
      
      {/* Left: Back & Template Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 text-[#26343C]/70 hover:text-[#26343C] hover:bg-[#DCE8E4]/40 rounded-xl transition-colors cursor-pointer"
          title="Back to Templates"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => onTemplateNameChange(e.target.value)}
            className="font-serif-brand font-semibold text-sm sm:text-base text-[#26343C] bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent focus:border-[#5E8C84] rounded-lg px-2 py-1 transition-all outline-none"
            placeholder="Untitled Template"
          />
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DCE8E4]/60 text-[#5E8C84] font-medium hidden sm:inline">
            Page {currentPageIndex + 1} of {totalPages}
          </span>
        </div>
      </div>

      {/* Center: Undo / Redo & Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 text-[#26343C]/80 hover:text-[#26343C] hover:bg-[#DCE8E4]/40 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 text-[#26343C]/80 hover:text-[#26343C] hover:bg-[#DCE8E4]/40 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#F2F6F6] p-0.5 rounded-lg border border-[#DCE8E4]">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.15, zoom - 0.05))}
            className="p-1 text-[#26343C]/70 hover:text-[#26343C] rounded-sm transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <span className="text-[11px] font-mono text-[#26343C] px-1.5 min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, zoom + 0.05))}
            className="p-1 text-[#26343C]/70 hover:text-[#26343C] rounded-sm transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onFitZoom}
          className="p-1.5 text-[#26343C]/70 hover:text-[#26343C] hover:bg-[#DCE8E4]/40 rounded-lg transition-colors cursor-pointer hidden md:flex"
          title="Fit Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer hidden sm:flex ${
            showGrid ? 'bg-[#5E8C84]/15 text-[#5E8C84]' : 'text-[#26343C]/70 hover:bg-[#DCE8E4]/40'
          }`}
          title="Toggle Alignment Grid & Safe Area"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Preview & Save Action */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#26343C] bg-white border border-[#DCE8E4] hover:border-[#5E8C84] rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Live Guest Simulation"
        >
          <Play className="w-3.5 h-3.5 text-[#5E8C84]" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5E8C84] hover:bg-[#4d756e] disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
        </button>
      </div>

    </header>
  );
};
