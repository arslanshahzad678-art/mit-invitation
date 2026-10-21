import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  InvitationTemplate, 
  TemplatePage, 
  ScreenElement, 
  Action 
} from '../../../types/invitation';
import { saveTemplate } from '../../../services/invitationService';
import { useStore } from '../../../context/StoreContext';
import { EditorToolbar } from './EditorToolbar';
import { EditorSidebarLeft } from './EditorSidebarLeft';
import { EditorCanvas } from './EditorCanvas';
import { EditorSidebarRight } from './EditorSidebarRight';
import { EditorPagesStrip } from './EditorPagesStrip';
import { ElementRenderer } from '../../canvas/ElementRenderer';
import { X, Play, Monitor, Smartphone, Volume2, VolumeX } from 'lucide-react';

interface TemplateEditorProps {
  initialTemplate: InvitationTemplate;
  onClose: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onClose,
}) => {
  const { showToast } = useStore();
  const [template, setTemplate] = useState<InvitationTemplate>(initialTemplate);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Canvas View Controls
  const [zoom, setZoom] = useState(0.42); // 1080 x 1920 fits nicely at ~0.42
  const [showGrid, setShowGrid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Undo / Redo history
  const [history, setHistory] = useState<InvitationTemplate[]>([initialTemplate]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newTemplate: InvitationTemplate) => {
    const sliced = history.slice(0, historyIndex + 1);
    setHistory([...sliced, newTemplate]);
    setHistoryIndex(sliced.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplate(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplate(history[historyIndex + 1]);
    }
  };

  // Safe page accessor
  const currentPage = template.pages[currentPageIndex] || template.pages[0];

  const updateCurrentPage = (updates: Partial<TemplatePage>) => {
    const updatedPages = [...template.pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      ...updates,
    };
    const updatedTemplate = { ...template, pages: updatedPages };
    setTemplate(updatedTemplate);
    pushHistory(updatedTemplate);
  };

  // Element CRUD on current page
  const handleAddElement = (elemPartial: Partial<ScreenElement>) => {
    const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newElement: ScreenElement = {
      id,
      kind: elemPartial.kind || 'text',
      name: elemPartial.name || elemPartial.kind || 'Element',
      x: elemPartial.x ?? 200,
      y: elemPartial.y ?? 400,
      width: elemPartial.width ?? 300,
      height: elemPartial.height ?? 100,
      zIndex: currentPage.elements.length + 1,
      ...elemPartial,
    };

    const updatedElements = [...currentPage.elements, newElement];
    updateCurrentPage({ elements: updatedElements });
    setSelectedElementId(id);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<ScreenElement>) => {
    const updatedElements = currentPage.elements.map((el) =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateCurrentPage({ elements: updatedElements });
  };

  const handleDeleteElement = (elementId: string) => {
    const updatedElements = currentPage.elements.filter((el) => el.id !== elementId);
    updateCurrentPage({ elements: updatedElements });
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const handleDuplicateElement = (elementId: string) => {
    const target = currentPage.elements.find((el) => el.id === elementId);
    if (!target) return;

    const copyId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: ScreenElement = {
      ...target,
      id: copyId,
      name: `${target.name || target.kind} (Copy)`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: currentPage.elements.length + 1,
    };

    const updatedElements = [...currentPage.elements, duplicated];
    updateCurrentPage({ elements: updatedElements });
    setSelectedElementId(copyId);
  };

  const handleBringToFront = (elementId: string) => {
    const maxZ = Math.max(0, ...currentPage.elements.map((e) => e.zIndex));
    handleUpdateElement(elementId, { zIndex: maxZ + 1 });
  };

  const handleSendToBack = (elementId: string) => {
    const minZ = Math.min(1, ...currentPage.elements.map((e) => e.zIndex));
    handleUpdateElement(elementId, { zIndex: Math.max(0, minZ - 1) });
  };

  // Page Operations
  const handleAddPage = () => {
    const newPageId = `page_${Date.now()}`;
    const newPage: TemplatePage = {
      id: newPageId,
      name: `Page ${template.pages.length + 1}`,
      order: template.pages.length + 1,
      heightMode: 'full',
      customHeight: 1920,
      backgroundColor: '#FAF7F2',
      transition: 'fade',
      elements: [],
    };
    const updated = { ...template, pages: [...template.pages, newPage] };
    setTemplate(updated);
    pushHistory(updated);
    setCurrentPageIndex(template.pages.length);
    setSelectedElementId(null);
  };

  const handleDuplicatePage = (index: number) => {
    const target = template.pages[index];
    const newPageId = `page_${Date.now()}`;
    const copy: TemplatePage = {
      ...target,
      id: newPageId,
      name: `${target.name} (Copy)`,
      order: template.pages.length + 1,
      elements: target.elements.map((el) => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    const updatedPages = [...template.pages];
    updatedPages.splice(index + 1, 0, copy);
    const updated = { ...template, pages: updatedPages };
    setTemplate(updated);
    pushHistory(updated);
    setCurrentPageIndex(index + 1);
  };

  const handleDeletePage = (index: number) => {
    if (template.pages.length <= 1) {
      showToast('A template suite must have at least one page', 'error');
      return;
    }
    const updatedPages = template.pages.filter((_, i) => i !== index);
    const updated = { ...template, pages: updatedPages };
    setTemplate(updated);
    pushHistory(updated);
    setCurrentPageIndex(Math.max(0, index - 1));
    setSelectedElementId(null);
  };

  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= template.pages.length) return;
    const reordered = [...template.pages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const updated = { ...template, pages: reordered };
    setTemplate(updated);
    pushHistory(updated);
    setCurrentPageIndex(toIndex);
  };

  // Save to Cloud Firestore
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTemplate(template);
      showToast('Template published to Cloud Firestore!', 'success');
    } catch (err: any) {
      console.error('Failed to save template:', err);
      showToast(`Save error: ${err.message || 'Permissions'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview Guest Simulation state
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [previewHistory, setPreviewHistory] = useState<number[]>([0]);

  const handlePreviewAction = (action: Action) => {
    if (action.type === 'goto' || action.type === 'playVideoThenGoto') {
      const targetIdx = template.pages.findIndex((p) => p.id === action.targetPageId);
      if (targetIdx >= 0) {
        setPreviewPageIndex(targetIdx);
        setPreviewHistory((prev) => [...prev, targetIdx]);
      }
    } else if (action.type === 'back') {
      if (previewHistory.length > 1) {
        const nextHist = [...previewHistory];
        nextHist.pop();
        const prevIdx = nextHist[nextHist.length - 1];
        setPreviewPageIndex(prevIdx);
        setPreviewHistory(nextHist);
      }
    } else if (action.type === 'openRsvp') {
      showToast('RSVP modal simulated', 'info');
    } else if (action.type === 'openMap') {
      showToast('Map location simulated', 'info');
    }
  };

  const selectedElement = currentPage.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F6F6] flex flex-col overflow-hidden font-sans">
      
      {/* Top Application Toolbar */}
      <EditorToolbar
        templateName={template.name}
        onTemplateNameChange={(name) => setTemplate((prev) => ({ ...prev, name }))}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitZoom={() => setZoom(0.42)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={onClose}
        onPreview={() => {
          setPreviewPageIndex(0);
          setPreviewHistory([0]);
          setIsPreviewOpen(true);
        }}
        currentPageIndex={currentPageIndex}
        totalPages={template.pages.length}
      />

      {/* Main Workspace (Left Sidebar + Canvas + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Drawer: Add Elements, Library, Layers, Suite Settings */}
        <EditorSidebarLeft
          currentPage={currentPage}
          onAddElement={handleAddElement}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          template={template}
          onUpdateTemplate={(updates) => setTemplate((prev) => ({ ...prev, ...updates }))}
        />

        {/* Center: Scaled Interactive Canvas */}
        <EditorCanvas
          page={currentPage}
          zoom={zoom}
          showGrid={showGrid}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
        />

        {/* Right Drawer: Properties & Style Panel */}
        <EditorSidebarRight
          element={selectedElement}
          currentPage={currentPage}
          pages={template.pages}
          onUpdateElement={(updates) => {
            if (selectedElementId) {
              handleUpdateElement(selectedElementId, updates);
            }
          }}
          onUpdatePage={updateCurrentPage}
        />

      </div>

      {/* Bottom Filmstrip: Pages strip */}
      <EditorPagesStrip
        pages={template.pages}
        currentPageIndex={currentPageIndex}
        onSelectPage={(idx) => {
          setCurrentPageIndex(idx);
          setSelectedElementId(null);
        }}
        onAddPage={handleAddPage}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={handleDeletePage}
        onMovePage={handleMovePage}
      />

      {/* =========================================================
          LIVE PREVIEW MODAL (Simulates full guest invitation view)
      ========================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[88vh] bg-[#FAF7F2] rounded-[48px] border-8 border-[#26343C] shadow-2xl flex flex-col overflow-hidden">
            
            {/* Top Phone Speaker / Island Bar */}
            <div className="h-6 bg-[#26343C] flex items-center justify-center shrink-0 z-50">
              <div className="w-20 h-3.5 bg-black rounded-full" />
            </div>

            {/* Close Preview Button */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-8 right-4 z-50 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulated Page Content */}
            <div className="flex-1 relative overflow-hidden">
              {template.pages[previewPageIndex] && (
                <div
                  className="w-full h-full relative"
                  style={{
                    backgroundColor: template.pages[previewPageIndex].backgroundColor || '#FAF7F2',
                    backgroundImage: template.pages[previewPageIndex].backgroundUrl
                      ? `url(${template.pages[previewPageIndex].backgroundUrl})`
                      : undefined,
                    backgroundSize: 'cover',
                  }}
                >
                  {/* Watermark in preview */}
                  <div className="absolute top-12 left-4 z-40 px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-medium tracking-wide">
                    Guest Preview Mode
                  </div>

                  {/* Render Elements scaled to phone dimensions */}
                  <div 
                    className="absolute inset-0 origin-top-left"
                    style={{
                      transform: `scale(${375 / 1080})`,
                      width: 1080,
                      height: 1920,
                    }}
                  >
                    {template.pages[previewPageIndex].elements.map((el) => (
                      <ElementRenderer
                        key={el.id}
                        element={el}
                        isEditor={false}
                        onAction={handlePreviewAction}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Indicator & Back Button if navigated */}
            <div className="h-10 bg-[#FAF7F2] border-t border-[#DCE8E4] px-4 flex items-center justify-between text-xs text-[#26343C]/70 shrink-0">
              {previewHistory.length > 1 ? (
                <button
                  type="button"
                  onClick={() => handlePreviewAction({ type: 'back' })}
                  className="font-semibold text-[#5E8C84] hover:underline cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <span className="text-[10px] text-[#26343C]/50">Page 1: Envelope</span>
              )}

              <span className="text-[10px] font-mono">
                {previewPageIndex + 1} / {template.pages.length}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
