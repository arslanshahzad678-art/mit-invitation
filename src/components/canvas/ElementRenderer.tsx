import React from 'react';
import { motion } from 'motion/react';
import { ScreenElement, Action } from '../../types/invitation';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  Music, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ElementRendererProps {
  element: ScreenElement;
  clientData?: Record<string, any>;
  fontChoice?: string;
  isEditor?: boolean;
  isSelected?: boolean;
  onElementClick?: (element: ScreenElement, e: React.MouseEvent) => void;
  onAction?: (action: Action) => void;
  isPlayingMusic?: boolean;
  scale?: number;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  clientData = {},
  fontChoice,
  isEditor = false,
  isSelected = false,
  onElementClick,
  onAction,
  isPlayingMusic = false,
  scale = 1,
}) => {
  if (element.hidden) return null;

  // Resolve content based on element kind & client data bindings
  let displayContent = element.content || '';
  if (element.fieldKey && clientData[element.fieldKey] !== undefined) {
    displayContent = String(clientData[element.fieldKey]);
  } else if (element.fieldKey && !displayContent) {
    displayContent = element.placeholder || `[${element.fieldKey}]`;
  }

  // Resolve font: element font or client's overall font choice if clientFontEditable
  const resolvedFont = (element.clientFontEditable && fontChoice) ? fontChoice : (element.fontFamily || 'Fraunces');

  // Check if text is Urdu / Arabic script for RTL
  const isUrduText = element.isUrdu || /[\u0600-\u06FF]/.test(displayContent);

  // Entrance motion variants
  const getEntranceAnimation = () => {
    if (isEditor) return {};
    const duration = element.animationDuration || 0.6;
    const delay = element.animationDelay || 0;

    switch (element.entranceAnimation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: element.opacity ?? 1 },
          transition: { duration, delay },
        };
      case 'slideUp':
        return {
          initial: { opacity: 0, y: 50 },
          animate: { opacity: element.opacity ?? 1, y: 0 },
          transition: { duration, delay },
        };
      case 'slideDown':
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: element.opacity ?? 1, y: 0 },
          transition: { duration, delay },
        };
      case 'slideLeft':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: element.opacity ?? 1, x: 0 },
          transition: { duration, delay },
        };
      case 'slideRight':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: element.opacity ?? 1, x: 0 },
          transition: { duration, delay },
        };
      case 'zoomIn':
        return {
          initial: { opacity: 0, scale: 0.7 },
          animate: { opacity: element.opacity ?? 1, scale: 1 },
          transition: { duration, delay },
        };
      case 'zoomOut':
        return {
          initial: { opacity: 0, scale: 1.3 },
          animate: { opacity: element.opacity ?? 1, scale: 1 },
          transition: { duration, delay },
        };
      case 'bounce':
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: { opacity: element.opacity ?? 1, scale: [0.3, 1.05, 0.95, 1] },
          transition: { duration, delay },
        };
      case 'flip':
        return {
          initial: { opacity: 0, rotateY: 90 },
          animate: { opacity: element.opacity ?? 1, rotateY: 0 },
          transition: { duration, delay },
        };
      default:
        return {
          initial: { opacity: element.opacity ?? 1 },
          animate: { opacity: element.opacity ?? 1 },
        };
    }
  };

  // Loop motion variants
  const getLoopAnimation = () => {
    if (isEditor) return {};
    switch (element.loopAnimation) {
      case 'float':
        return {
          y: [0, -8, 0],
          transition: {
            repeat: Infinity,
            duration: 3.5,
            ease: 'easeInOut',
          },
        };
      case 'pulse':
        return {
          scale: [1, 1.03, 1],
          transition: {
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut',
          },
        };
      case 'shimmer':
        return {
          opacity: [(element.opacity ?? 1) * 0.85, element.opacity ?? 1, (element.opacity ?? 1) * 0.85],
          transition: {
            repeat: Infinity,
            duration: 2.5,
            ease: 'easeInOut',
          },
        };
      case 'sway':
        return {
          rotate: [-2, 2, -2],
          transition: {
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          },
        };
      default:
        return {};
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditor) {
      if (onElementClick) {
        onElementClick(element, e);
      }
      return;
    }

    if (element.action && onAction) {
      e.stopPropagation();
      onAction(element.action);
    }
  };

  // Shape rendering
  const renderShape = () => {
    const fill = element.fill || '#5E8C84';
    const stroke = element.stroke || 'transparent';
    const strokeWidth = element.strokeWidth || 0;
    const radius = element.borderRadius || 0;

    switch (element.shapeType) {
      case 'circle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fill,
              borderColor: stroke,
              borderWidth: strokeWidth,
              borderStyle: strokeWidth > 0 ? 'solid' : 'none',
              borderRadius: '50%',
              boxShadow: element.shadow,
            }}
          />
        );
      case 'heart':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <Heart
              style={{
                width: '100%',
                height: '100%',
                fill,
                stroke,
                strokeWidth,
                filter: element.shadow ? `drop-shadow(${element.shadow})` : undefined,
              }}
            />
          </div>
        );
      case 'line':
        return (
          <div
            style={{
              width: '100%',
              height: Math.max(2, strokeWidth || 2),
              backgroundColor: stroke || fill,
              borderRadius: radius,
            }}
          />
        );
      case 'rounded':
      case 'rectangle':
      default:
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: fill,
              borderColor: stroke,
              borderWidth: strokeWidth,
              borderStyle: strokeWidth > 0 ? 'solid' : 'none',
              borderRadius: radius,
              boxShadow: element.shadow,
            }}
          />
        );
    }
  };

  // Photo slot rendering (supports client photo upload or placeholder)
  const renderPhotoSlot = () => {
    const clientPhoto = element.fieldKey ? clientData[element.fieldKey] : null;
    const photoUrl = clientPhoto || element.imageUrl;
    const frameShape = element.frameShape || 'rounded';

    let borderRadiusClass = 'rounded-2xl';
    let clipPathStyle: React.CSSProperties = {};

    if (frameShape === 'circle') borderRadiusClass = 'rounded-full';
    else if (frameShape === 'oval') borderRadiusClass = 'rounded-[50%]';
    else if (frameShape === 'arch') borderRadiusClass = 'rounded-t-full rounded-b-lg';
    else if (frameShape === 'rectangle') borderRadiusClass = 'rounded-none';

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div
          className={`relative w-full h-full overflow-hidden flex items-center justify-center bg-slate-100 ${borderRadiusClass}`}
          style={{
            ...clipPathStyle,
            boxShadow: element.shadow,
            border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.stroke || '#DCE8E4'}` : undefined,
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={element.name || 'Couple Photo'}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FAF7F2] to-[#EAE2DC] text-[#26343C]/60 text-center">
              <Sparkles className="w-8 h-8 text-[#5E8C84] mb-2" />
              <p className="text-xs font-serif-brand font-medium">
                {element.placeholder || 'Client Photo Slot'}
              </p>
              <p className="text-[10px] text-[#26343C]/50 mt-1">
                {element.fieldKey ? `[${element.fieldKey}]` : 'Personalized by client'}
              </p>
            </div>
          )}

          {/* Optional Decorative PNG Frame Overlay */}
          {element.frameUrl && (
            <img
              src={element.frameUrl}
              alt="Decorative Frame"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />
          )}
        </div>
      </div>
    );
  };

  // Timeline events rendering
  const renderTimeline = () => {
    const rawEvents = (element.fieldKey && clientData[element.fieldKey]) || [
      { time: '4:00 PM', title: 'Arrival & Welcome Drinks', subtitle: 'Courtyard Terrace' },
      { time: '5:00 PM', title: 'Wedding Ceremony', subtitle: 'The Rose Garden' },
      { time: '6:30 PM', title: 'Cocktail & Hors d’œuvres', subtitle: 'Glasshouse Veranda' },
      { time: '8:00 PM', title: 'Dinner & Toasts', subtitle: 'Grand Ballroom' },
    ];
    const events: any[] = Array.isArray(rawEvents) ? rawEvents : [];

    return (
      <div 
        className="w-full h-full overflow-y-auto p-4 space-y-4 text-[#26343C]"
        style={{ fontFamily: resolvedFont }}
      >
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#5E8C84]/30">
          {events.map((evt, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-[#5E8C84] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs z-10">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-[#DCE8E4] flex-1 shadow-2xs">
                <span className="text-[11px] font-semibold tracking-wide text-[#5E8C84] block">
                  {evt.time || 'Time'}
                </span>
                <h5 className="font-serif-brand text-sm font-semibold text-[#26343C] leading-snug">
                  {evt.title || 'Event Name'}
                </h5>
                {evt.subtitle && (
                  <p className="text-[11px] text-[#26343C]/70 mt-0.5">
                    {evt.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Map button rendering
  const renderMapButton = () => {
    const mapUrl = (element.fieldKey && clientData[element.fieldKey]) || element.action?.mapUrl || 'https://maps.google.com';
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-full flex items-center justify-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-[#26343C] hover:text-[#5E8C84] rounded-2xl border border-[#DCE8E4] shadow-md transition-all cursor-pointer font-serif-brand text-xs font-semibold"
        style={{
          boxShadow: element.shadow,
          borderRadius: element.borderRadius || 16,
          backgroundColor: element.fill || '#FFFFFF',
          color: element.color || '#26343C',
          borderColor: element.stroke || '#DCE8E4',
        }}
      >
        <MapPin className="w-4 h-4 text-[#5E8C84] shrink-0" />
        <span className="truncate">{displayContent || 'View Venue Location'}</span>
        <ExternalLink className="w-3 h-3 text-[#5E8C84]/60 ml-auto" />
      </button>
    );
  };

  // Music toggle button
  const renderMusicButton = () => {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Toggle Background Music"
        className="w-full h-full rounded-full flex items-center justify-center bg-white/90 hover:bg-white border border-[#DCE8E4] shadow-md transition-all text-[#5E8C84] cursor-pointer"
        style={{
          borderRadius: '50%',
          backgroundColor: element.fill || 'rgba(255,255,255,0.9)',
          boxShadow: element.shadow,
        }}
      >
        {isPlayingMusic ? (
          <Volume2 className="w-5 h-5 animate-pulse text-[#5E8C84]" />
        ) : (
          <VolumeX className="w-5 h-5 text-[#26343C]/60" />
        )}
      </button>
    );
  };

  // RSVP Trigger Button
  const renderRsvpButton = () => {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-full flex items-center justify-center gap-2 px-6 py-3 bg-[#5E8C84] hover:bg-[#4d756e] active:scale-98 text-white font-serif-brand font-semibold rounded-2xl shadow-lg transition-all cursor-pointer"
        style={{
          backgroundColor: element.fill || '#5E8C84',
          color: element.color || '#FFFFFF',
          borderRadius: element.borderRadius || 16,
          boxShadow: element.shadow,
          fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
        }}
      >
        <Calendar className="w-4 h-4 text-white/80" />
        <span>{displayContent || 'Kindly RSVP'}</span>
        <ChevronRight className="w-4 h-4 text-white/80 ml-1" />
      </button>
    );
  };

  return (
    <motion.div
      onClick={handleClick}
      initial={getEntranceAnimation().initial as any}
      animate={{
        ...(getEntranceAnimation().animate as any),
        ...(getLoopAnimation() as any),
      } as any}
      transition={getEntranceAnimation().transition as any}
      className={`absolute select-none ${isEditor ? 'cursor-move' : element.action ? 'cursor-pointer hover:opacity-95' : ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex,
        transform: `rotate(${element.rotation || 0}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
        opacity: element.opacity ?? 1,
      }}
    >
      {/* Editor Selection Indicator */}
      {isEditor && isSelected && (
        <div className="absolute -inset-1 border-2 border-[#5E8C84] rounded-xs pointer-events-none z-50 shadow-xs">
          <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-[#5E8C84] text-white text-[9px] font-sans rounded-xs whitespace-nowrap shadow-xs">
            {element.name || element.kind} {element.fieldKey ? `(${element.fieldKey})` : ''}
          </span>
        </div>
      )}

      {/* Editor Action Badge */}
      {isEditor && element.action && (
        <span 
          className="absolute -top-2 -right-2 z-50 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs"
          title={`Action: ${element.action.type}`}
        >
          ⚡
        </span>
      )}

      {/* Element Content by Kind */}
      {element.kind === 'text' || element.kind === 'fieldText' ? (
        <div
          dir={isUrduText ? 'rtl' : 'ltr'}
          className="w-full h-full flex flex-col justify-center"
          style={{
            fontFamily: resolvedFont,
            fontSize: `${element.fontSize || 24}px`,
            color: element.color || '#26343C',
            fontWeight: element.bold ? 'bold' : 'normal',
            fontStyle: element.italic ? 'italic' : 'normal',
            textDecoration: element.underline ? 'underline' : 'none',
            textTransform: element.uppercase ? 'uppercase' : 'none',
            letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
            lineHeight: element.lineHeight || 1.3,
            textAlign: element.align || (isUrduText ? 'right' : 'center'),
            textShadow: element.textShadow,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {displayContent}
        </div>
      ) : element.kind === 'image' ? (
        <img
          src={element.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
          alt={element.name || 'Artwork element'}
          className="w-full h-full object-contain pointer-events-none"
          style={{
            borderRadius: element.borderRadius || 0,
            boxShadow: element.shadow,
          }}
        />
      ) : element.kind === 'shape' ? (
        renderShape()
      ) : element.kind === 'photo' ? (
        renderPhotoSlot()
      ) : element.kind === 'timeline' ? (
        renderTimeline()
      ) : element.kind === 'map' ? (
        renderMapButton()
      ) : element.kind === 'music' ? (
        renderMusicButton()
      ) : element.kind === 'rsvp' ? (
        renderRsvpButton()
      ) : element.kind === 'button' ? (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-full flex items-center justify-center px-4 py-2 font-serif-brand font-semibold text-xs transition-transform active:scale-95"
          style={{
            backgroundColor: element.fill || 'transparent',
            borderColor: element.stroke || 'transparent',
            borderWidth: element.strokeWidth || 0,
            borderStyle: element.strokeWidth ? 'solid' : 'none',
            color: element.color || '#26343C',
            borderRadius: element.borderRadius || 8,
            boxShadow: element.shadow,
            fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
          }}
        >
          {displayContent}
        </button>
      ) : null}
    </motion.div>
  );
};
