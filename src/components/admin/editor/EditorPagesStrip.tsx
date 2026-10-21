import React from 'react';
import { TemplatePage } from '../../../types/invitation';
import { Plus, Copy, Trash2, ArrowLeft, ArrowRight, Mail } from 'lucide-react';

interface EditorPagesStripProps {
  pages: TemplatePage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const EditorPagesStrip: React.FC<EditorPagesStripProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
}) => {
  return (
    <div className="h-24 bg-white border-t border-[#DCE8E4] px-4 flex items-center gap-3 overflow-x-auto select-none shrink-0 z-20">
      
      {/* Pages List */}
      <div className="flex items-center gap-3">
        {pages.map((page, idx) => {
          const isActive = idx === currentPageIndex;
          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(idx)}
              className={`group relative flex flex-col items-center justify-between p-1.5 rounded-2xl border transition-all cursor-pointer h-20 w-28 shrink-0 ${
                isActive
                  ? 'bg-[#5E8C84]/10 border-[#5E8C84] shadow-xs'
                  : 'bg-[#F2F6F6] border-[#DCE8E4] hover:bg-slate-100'
              }`}
            >
              {/* Top Bar: Title & Intro Badge */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-[#26343C] truncate">
                  {idx + 1}. {page.name || `Page ${idx + 1}`}
                </span>
                {page.isIntro && (
                  <span className="text-[10px] text-amber-600" title="Intro Envelope Page">
                    💌
                  </span>
                )}
              </div>

              {/* Miniature Page Canvas Preview */}
              <div 
                className="w-16 h-10 rounded-md border border-black/10 overflow-hidden flex items-center justify-center my-auto shadow-2xs"
                style={{
                  backgroundColor: page.backgroundColor || '#FAF7F2',
                  backgroundImage: page.backgroundUrl ? `url(${page.backgroundUrl})` : undefined,
                  backgroundSize: 'cover',
                }}
              >
                <span className="text-[9px] font-mono text-[#26343C]/40">
                  {page.elements.length} items
                </span>
              </div>

              {/* Hover Actions: Move left, Move right, Duplicate, Delete */}
              <div 
                className="w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity px-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-0.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => onMovePage(idx, idx - 1)}
                      className="p-0.5 text-[#26343C]/60 hover:text-[#26343C]"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < pages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => onMovePage(idx, idx + 1)}
                      className="p-0.5 text-[#26343C]/60 hover:text-[#26343C]"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onDuplicatePage(idx)}
                    className="p-0.5 text-[#26343C]/60 hover:text-[#5E8C84]"
                    title="Duplicate Page"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeletePage(idx)}
                      className="p-0.5 text-rose-400 hover:text-rose-600"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Page Button */}
      <button
        type="button"
        onClick={onAddPage}
        className="h-20 w-24 shrink-0 rounded-2xl border-2 border-dashed border-[#5E8C84]/60 hover:border-[#5E8C84] hover:bg-[#5E8C84]/5 text-[#5E8C84] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-xs font-semibold"
      >
        <Plus className="w-5 h-5" />
        <span>Add Page</span>
      </button>

    </div>
  );
};
