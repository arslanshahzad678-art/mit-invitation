import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';
import { resolveMediaUrl } from '../../services/mediaStorage';

export interface IphoneMockupProps {
  videoUrl?: string;
  posterUrl?: string;
  productTitle?: string;
  className?: string;
  size?: 'card' | 'compact' | 'modal' | 'hero' | 'detail';
  isPlaying?: boolean;
  isMuted?: boolean;
  onTogglePlay?: () => void;
  onToggleMute?: () => void;
  showAudioControl?: boolean;
  showPlayPauseOverlay?: boolean;
  interactiveCard?: {
    coupleOrHost: string;
    eventType: string;
    date: string;
    time?: string;
    venue: string;
    city?: string;
    rsvpDeadline?: string;
  };
  customPlaceholderText?: string;
}

export const IphoneMockup: React.FC<IphoneMockupProps> = ({
  videoUrl,
  posterUrl,
  productTitle = 'Bespoke Invitation',
  className = '',
  size = 'card',
  isPlaying: externalIsPlaying,
  isMuted: externalIsMuted = true,
  onTogglePlay,
  onToggleMute,
  showAudioControl = false,
  showPlayPauseOverlay = true,
  interactiveCard,
  customPlaceholderText,
}) => {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [internalMuted, setInternalMuted] = useState(true);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');
  const [resolvedPosterUrl, setResolvedPosterUrl] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isControlledPlay = externalIsPlaying !== undefined;
  const isPlaying = isControlledPlay ? externalIsPlaying : internalPlaying;
  const isMuted = onToggleMute ? externalIsMuted : internalMuted;

  // Resolve media URLs from IndexedDB if necessary
  useEffect(() => {
    let isMounted = true;
    setVideoError(false);

    if (videoUrl) {
      resolveMediaUrl(videoUrl).then((url) => {
        if (isMounted) setResolvedVideoUrl(url);
      });
    } else {
      setResolvedVideoUrl('');
    }

    if (posterUrl) {
      resolveMediaUrl(posterUrl).then((url) => {
        if (isMounted) setResolvedPosterUrl(url);
      });
    } else {
      setResolvedPosterUrl('');
    }

    return () => {
      isMounted = false;
    };
  }, [videoUrl, posterUrl]);

  // Sync playback state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedVideoUrl || videoError) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented or interrupted; fallback silently
          if (!isControlledPlay) {
            setInternalPlaying(false);
          }
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, resolvedVideoUrl, videoError, isControlledPlay]);

  // Sync mute state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePlay) {
      onTogglePlay();
    } else {
      setInternalPlaying((prev) => !prev);
    }
  };

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMute) {
      onToggleMute();
    } else {
      setInternalMuted((prev) => !prev);
    }
  };

  // Dimensions based on size preset
  const dimensionStyles = {
    card: {
      width: '210px',
      height: '430px',
      outerRadius: '42px',
      innerRadius: '36px',
      screenRadius: '30px',
      bezelPad: '7px',
      islandWidth: '78px',
      islandHeight: '22px',
    },
    compact: {
      width: '160px',
      height: '330px',
      outerRadius: '34px',
      innerRadius: '28px',
      screenRadius: '24px',
      bezelPad: '5px',
      islandWidth: '60px',
      islandHeight: '18px',
    },
    modal: {
      width: '300px',
      height: '615px',
      outerRadius: '50px',
      innerRadius: '44px',
      screenRadius: '38px',
      bezelPad: '8px',
      islandWidth: '95px',
      islandHeight: '26px',
    },
    hero: {
      width: '290px',
      height: '595px',
      outerRadius: '48px',
      innerRadius: '42px',
      screenRadius: '36px',
      bezelPad: '8px',
      islandWidth: '92px',
      islandHeight: '25px',
    },
    detail: {
      width: '310px',
      height: '635px',
      outerRadius: '52px',
      innerRadius: '44px',
      screenRadius: '38px',
      bezelPad: '9px',
      islandWidth: '100px',
      islandHeight: '27px',
    },
  }[size];

  const cardData = interactiveCard || {
    coupleOrHost: 'Camilla & Harrison',
    eventType: 'Wedding Celebration',
    date: 'Saturday, October 18, 2026',
    time: '4:30 PM Onwards',
    venue: 'Villa San Michele, Tuscan Hills',
    city: 'Florence, Italy',
    rsvpDeadline: 'Kindly RSVP by Sept 10',
  };

  return (
    <div
      className={`relative select-none transition-transform duration-300 ${className}`}
      style={{
        width: dimensionStyles.width,
        height: dimensionStyles.height,
        maxWidth: '100%',
      }}
    >
      {/* Outer Titanium Chassis */}
      <div
        className="relative w-full h-full bg-gradient-to-b from-[#E5ECE9] via-[#CAD2CF] to-[#A3ADA9] shadow-[0_20px_50px_-15px_rgba(38,52,60,0.28),0_0_0_1px_rgba(255,255,255,0.7)_inset]"
        style={{
          borderRadius: dimensionStyles.outerRadius,
          padding: dimensionStyles.bezelPad,
        }}
      >
        {/* Subtle Metallic Bevel / OLED Bezel Ring */}
        <div
          className="relative w-full h-full bg-[#181F23] shadow-inner overflow-hidden flex flex-col"
          style={{
            borderRadius: dimensionStyles.innerRadius,
            padding: '5px',
          }}
        >
          {/* Hardware buttons on chassis (Action button, volume up/down, power) */}
          <div className="absolute -left-[6px] top-[18%] w-[2px] h-[16px] bg-[#9CA9A5] rounded-l-xs opacity-80" />
          <div className="absolute -left-[6px] top-[26%] w-[2px] h-[32px] bg-[#9CA9A5] rounded-l-xs opacity-80" />
          <div className="absolute -left-[6px] top-[37%] w-[2px] h-[32px] bg-[#9CA9A5] rounded-l-xs opacity-80" />
          <div className="absolute -right-[6px] top-[30%] w-[2px] h-[48px] bg-[#9CA9A5] rounded-r-xs opacity-80" />

          {/* Screen Area */}
          <div
            onClick={handlePhoneClick}
            className="relative w-full h-full bg-[#0C1012] overflow-hidden cursor-pointer flex flex-col group"
            style={{
              borderRadius: dimensionStyles.screenRadius,
            }}
            title="Tap to toggle play/pause"
          >
            {/* Top Status Bar & Dynamic Island */}
            <div className="absolute top-0 inset-x-0 z-30 pt-2 px-4 flex items-center justify-between text-white text-[10px] font-medium tracking-tight pointer-events-none">
              <span className="opacity-90 font-sans tracking-tight pl-0.5">9:41</span>

              {/* Dynamic Island */}
              <div
                className="pointer-events-auto flex items-center justify-between px-2 bg-black rounded-full border border-white/10 shadow-sm transition-transform duration-200 hover:scale-105"
                style={{
                  width: dimensionStyles.islandWidth,
                  height: dimensionStyles.islandHeight,
                }}
              >
                {/* Front camera lens reflection */}
                <div className="w-2 h-2 rounded-full bg-[#1A2621] border border-white/20 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#2A3F36]" />
                </div>

                {/* Subtle soundwave/status when playing */}
                <div className="flex items-center gap-1 text-[8px] text-[#DCE8E4]">
                  {isPlaying ? (
                    <span className="flex gap-0.5 items-end h-2">
                      <span className="w-0.5 h-1.5 bg-[#5E8C84] animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#5E8C84] animate-pulse delay-75" />
                      <span className="w-0.5 h-1 bg-[#5E8C84] animate-pulse delay-150" />
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5E8C84]/80" />
                  )}
                  <span className="font-sans text-[8px] text-white/80 font-medium">MIT</span>
                </div>

                {/* Sensor dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-[#20272B] border border-white/10" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1 text-white/90 text-[9px] pr-0.5">
                <div className="flex gap-0.5 items-end h-2">
                  <span className="w-[1.5px] h-[3px] bg-white rounded-2xs" />
                  <span className="w-[1.5px] h-[4px] bg-white rounded-2xs" />
                  <span className="w-[1.5px] h-[6px] bg-white rounded-2xs" />
                </div>
                <div className="w-3.5 h-2 border border-white/70 rounded-xs p-[1px] flex items-center ml-0.5">
                  <div className="w-full h-full bg-white rounded-3xs" />
                </div>
              </div>
            </div>

            {/* Media Canvas: Video, Cover Image, or Soft Placeholder */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              {resolvedVideoUrl && !videoError ? (
                <video
                  ref={videoRef}
                  src={resolvedVideoUrl}
                  poster={resolvedPosterUrl || undefined}
                  muted={isMuted}
                  loop
                  playsInline
                  autoPlay={isPlaying}
                  onError={() => setVideoError(true)}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : resolvedPosterUrl ? (
                <img
                  src={resolvedPosterUrl}
                  alt={productTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Soft Elegant MIT Invitation Placeholder
                <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4EBE8] to-[#EAE2DC] p-4 flex flex-col justify-between text-center pt-14 pb-8 text-[#26343C]">
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#5E8C84_1px,transparent_1px)] [background-size:12px_12px]" />

                  <div className="relative space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-full border border-[#5E8C84]/40 flex items-center justify-center bg-white/40">
                      <Heart className="w-3.5 h-3.5 text-[#5E8C84]" />
                    </div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#5E8C84] font-medium pt-1">
                      Save The Date
                    </p>
                    <h4 className="text-sm font-serif-brand text-[#26343C] font-normal leading-tight">
                      {customPlaceholderText || cardData.coupleOrHost}
                    </h4>
                  </div>

                  <div className="my-auto py-2 border-y border-[#5E8C84]/20 space-y-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#26343C]">
                      {cardData.date}
                    </p>
                    <p className="text-[9px] text-[#5E8C84] font-medium">
                      {cardData.venue}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full py-1 bg-[#5E8C84] text-white text-[9px] rounded-full font-medium shadow-2xs">
                      Tap To RSVP
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Play / Pause Overlay on Hover or when Paused */}
              {showPlayPauseOverlay && !isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[0.5px] pointer-events-none transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>
              )}

              {/* Tap to Play / Pause Hint on Hover */}
              <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-sm text-white/95 text-[9px] rounded-full border border-white/10 tracking-wide font-medium">
                  {isPlaying ? 'Tap to pause' : 'Tap to play'}
                </span>
              </div>

              {/* Audio Sound Mute/Unmute Button if enabled */}
              {showAudioControl && resolvedVideoUrl && !videoError && (
                <button
                  type="button"
                  onClick={handleMuteClick}
                  aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  className="absolute bottom-3 right-3 z-30 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition-colors shadow-md"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#DCE8E4]" />}
                </button>
              )}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="absolute bottom-1 inset-x-0 z-30 flex justify-center pointer-events-none">
              <div className="w-20 h-1 bg-white/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
