import React, { useState, useRef, useEffect } from 'react';
import { TemplatePage, ScreenElement } from '../../../types/invitation';
import { ElementRenderer } from '../../canvas/ElementRenderer';
import { RotateCw, Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface EditorCanvasProps {
  page: TemplatePage;
  zoom: number;
  showGrid: boolean;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<ScreenElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  page,
  zoom,
  showGrid,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);

  // Dragging & Resizing state
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialElemX: number;
    initialElemY: number;
  } | null>(null);

  const [resizeState, setResizeState] = useState<{
    elementId: string;
    handle: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
  } | null>(null);

  const [rotateState, setRotateState] = useState<{
    elementId: string;
    centerX: number;
    centerY: number;
  } | null>(null);

  const selectedElement = page.elements.find((el) => el.id === selectedElementId) || null;

  // Global PointerMove & PointerUp listeners for smooth dragging and resizing
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // 1. Drag move
      if (dragState) {
        const dx = (e.clientX - dragState.startX) / zoom;
        const dy = (e.clientY - dragState.startY) / zoom;
        onUpdateElement(dragState.elementId, {
          x: Math.round(dragState.initialElemX + dx),
          y: Math.round(dragState.initialElemY + dy),
        });
      }

      // 2. Resize
      if (resizeState) {
        const dx = (e.clientX - resizeState.startX) / zoom;
        const dy = (e.clientY - resizeState.startY) / zoom;
        let newX = resizeState.initialX;
        let newY = resizeState.initialY;
        let newW = resizeState.initialW;
        let newH = resizeState.initialH;

        if (resizeState.handle.includes('e')) newW = Math.max(30, resizeState.initialW + dx);
        if (resizeState.handle.includes('s')) newH = Math.max(20, resizeState.initialH + dy);
        if (resizeState.handle.includes('w')) {
          const w = Math.max(30, resizeState.initialW - dx);
          newX = resizeState.initialX + (resizeState.initialW - w);
          newW = w;
        }
        if (resizeState.handle.includes('n')) {
          const h = Math.max(20, resizeState.initialH - dy);
          newY = resizeState.initialY + (resizeState.initialH - h);
          newH = h;
        }

        onUpdateElement(resizeState.elementId, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }

      // 3. Rotate
      if (rotateState) {
        const radians = Math.atan2(e.clientY - rotateState.centerY, e.clientX - rotateState.centerX);
        let degrees = Math.round(radians * (180 / Math.PI) + 90);
        if (e.shiftKey) {
          // Snap to 15 degree increments with Shift key
          degrees = Math.round(degrees / 15) * 15;
        }
        onUpdateElement(rotateState.elementId, { rotation: degrees });
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
      setResizeState(null);
      setRotateState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, resizeState, rotateState, zoom, onUpdateElement]);

  // Keyboard navigation & deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { x: selectedElement.x - step });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { x: selectedElement.x + step });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { y: selectedElement.y - step });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedElement.id, { y: selectedElement.y + step });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElement.id);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        onDuplicateElement(selectedElement.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, onUpdateElement, onDeleteElement, onDuplicateElement]);

  const canvasHeight = page.heightMode === 'scroll' ? (page.customHeight || 3200) : 1920;

  return (
    <div 
      className="flex-1 overflow-auto bg-[#E9EFEF] flex items-center justify-center p-8 select-none relative"
      onClick={() => {
        onSelectElement(null);
        setContextMenu(null);
      }}
    >
      {/* Logical Canvas (1080 x 1920 default) */}
      <div
        ref={canvasRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 1080,
          height: canvasHeight,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          backgroundColor: page.backgroundColor || '#FAF7F2',
          backgroundImage: page.backgroundUrl ? `url(${page.backgroundUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 60px rgba(38, 52, 60, 0.25)',
        }}
        className="relative rounded-3xl overflow-hidden shrink-0 transition-transform duration-75"
      >
        {/* Alignment Grid & Safe Area Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-40">
            {/* Center Grid Lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#5E8C84]/40" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#5E8C84]/40" />

            {/* Mobile Safe Area Frame (Margin 60px) */}
            <div className="absolute inset-[60px] border border-dashed border-[#5E8C84]/30 rounded-2xl" />
          </div>
        )}

        {/* Page Elements */}
        {page.elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          return (
            <div
              key={el.id}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectElement(el.id);
                setContextMenu({ x: e.clientX, y: e.clientY, elementId: el.id });
              }}
              onPointerDown={(e) => {
                if (el.locked) return;
                e.stopPropagation();
                onSelectElement(el.id);
                setDragState({
                  elementId: el.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  initialElemX: el.x,
                  initialElemY: el.y,
                });
              }}
            >
              <ElementRenderer
                element={el}
                isEditor={true}
                isSelected={isSelected}
              />

              {/* 8 Resize Handles + Rotate Handle for Selected Element */}
              {isSelected && !el.locked && (
                <div
                  className="absolute pointer-events-auto z-50"
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: `rotate(${el.rotation || 0}deg)`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Rotate Handle */}
                  <div
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setRotateState({
                        elementId: el.id,
                        centerX: rect.left,
                        centerY: rect.top,
                      });
                    }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#5E8C84] shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110"
                    title="Rotate element (Hold Shift for 15° steps)"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#5E8C84]" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-[#5E8C84]" />

                  {/* 8 Resize Points */}
                  {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
                    let posStyle = '';
                    if (handle === 'nw') posStyle = '-top-1.5 -left-1.5 cursor-nwse-resize';
                    if (handle === 'n') posStyle = '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                    if (handle === 'ne') posStyle = '-top-1.5 -right-1.5 cursor-nesw-resize';
                    if (handle === 'e') posStyle = 'top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize';
                    if (handle === 'se') posStyle = '-bottom-1.5 -right-1.5 cursor-nwse-resize';
                    if (handle === 's') posStyle = '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
                    if (handle === 'sw') posStyle = '-bottom-1.5 -left-1.5 cursor-nesw-resize';
                    if (handle === 'w') posStyle = 'top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize';

                    return (
                      <div
                        key={handle}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setResizeState({
                            elementId: el.id,
                            handle,
                            startX: e.clientX,
                            startY: e.clientY,
                            initialX: el.x,
                            initialY: el.y,
                            initialW: el.width,
                            initialH: el.height,
                          });
                        }}
                        className={`absolute w-3.5 h-3.5 bg-white border-2 border-[#5E8C84] rounded-full shadow-xs hover:scale-125 transition-transform ${posStyle}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-[#DCE8E4] rounded-2xl shadow-xl py-1.5 w-48 text-xs select-none"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onDuplicateElement(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3.5 py-2 hover:bg-[#F2F6F6] text-[#26343C] flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#5E8C84]" />
            <span>Duplicate (Ctrl+D)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onBringToFront(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3.5 py-2 hover:bg-[#F2F6F6] text-[#26343C] flex items-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 text-[#5E8C84]" />
            <span>Bring to Front</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSendToBack(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3.5 py-2 hover:bg-[#F2F6F6] text-[#26343C] flex items-center gap-2 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4 text-[#5E8C84]" />
            <span>Send to Back</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          <button
            type="button"
            onClick={() => {
              onDeleteElement(contextMenu.elementId);
              setContextMenu(null);
            }}
            className="w-full px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Element</span>
          </button>
        </div>
      )}
    </div>
  );
};
