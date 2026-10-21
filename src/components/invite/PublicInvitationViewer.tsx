import React, { useState, useEffect, useRef } from 'react';
import { 
  Invitation, 
  InvitationTemplate, 
  TemplatePage 
} from '../../types/invitation';
import { 
  getInvitationBySlug, 
  getInvitation, 
  getTemplate, 
  submitRsvp 
} from '../../services/invitationService';
import { createSeedTemplate } from '../../services/seedTemplateService';
import { useStore } from '../../context/StoreContext';
import { ElementRenderer } from '../canvas/ElementRenderer';
import { 
  Volume2, 
  VolumeX, 
  Calendar as CalendarIcon, 
  MapPin, 
  Heart, 
  CheckCircle, 
  X, 
  MessageCircle, 
  Clock, 
  Share2,
  Sparkles,
  Send,
  Users
} from 'lucide-react';

export const PublicInvitationViewer: React.FC = () => {
  const { inviteSlug, navigate, showToast } = useStore();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [template, setTemplate] = useState<InvitationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active page navigation
  const [currentPageId, setCurrentPageId] = useState<string>('page_envelope');
  const [pageHistory, setPageHistory] = useState<string[]>(['page_envelope']);

  // Music Player
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // RSVP Modal
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [rsvpCount, setRsvpCount] = useState<number>(1);
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    async function fetchInvitationData() {
      setLoading(true);
      setError(null);
      try {
        let inv: Invitation | null = null;
        if (inviteSlug) {
          inv = await getInvitationBySlug(inviteSlug);
        }

        // If no slug or demo, use demo invitation from seed template
        const seedTpl = createSeedTemplate();
        if (!inv) {
          // Provide demo mode invitation if no specific slug found
          inv = {
            id: 'demo_invitation',
            slug: inviteSlug || 'sarah-and-alexander',
            templateId: seedTpl.id,
            ownerUid: 'demo',
            ownerEmail: 'demo@mitinvitations.com',
            data: {
              groomName: 'Alexander Montgomery',
              brideName: 'Sarah Elizabeth',
              eventDate: '2026-10-24',
              eventTime: '17:00',
              venueName: 'The Glasshouse Atelier',
              venueCity: 'Portland, Oregon',
              mapUrl: 'https://maps.google.com',
              couplePhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
              polaroidPhoto1: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
              polaroidPhoto2: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
              loveStoryText: 'From our first meeting over coffee in autumn to a sunset proposal on the Oregon coast, every chapter led to this day.',
              celebrationText: 'We warmly invite you to share our joy as we exchange vows and celebrate the beginning of our forever.',
              timelineEvents: [
                { time: '4:30 PM', title: 'Guest Arrival & Welcome Refreshments', subtitle: 'Courtyard Terrace' },
                { time: '5:00 PM', title: 'The Wedding Ceremony', subtitle: 'The Rose Garden' },
                { time: '6:30 PM', title: 'Cocktail & Hors d’œuvres', subtitle: 'Veranda Glasshouse' },
                { time: '7:45 PM', title: 'Dinner, Toasts & First Dance', subtitle: 'The Grand Hall' },
                { time: '10:30 PM', title: 'Sparkler Farewell', subtitle: 'Atelier Driveway' },
              ],
              travelText: 'Complimentary valet parking is provided at the main gate. A room block is reserved at The Nines Hotel.',
              dressCodeText: 'Black Tie Optional / Formal Elegance. Guests are encouraged to wear tones from our soft sage and blush palette.',
              dressCodeColors: ['#5E8C84', '#DCE8E4', '#EEDDE0', '#F2F6F6', '#26343C'],
              giftText: 'Your presence and blessing is the greatest gift of all. For those who wish, our registry is available online.',
              rsvpDeadline: 'Please kindly respond by September 15, 2026',
            },
            fontChoice: 'Fraunces',
            status: 'live',
            paymentApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deleted: false,
          };
          setTemplate(seedTpl);
        } else {
          // Fetch template associated with invitation
          const tpl = await getTemplate(inv.templateId);
          setTemplate(tpl || seedTpl);
        }

        setInvitation(inv);

        // Start on Page 1 (envelope)
        if (seedTpl.pages.length > 0) {
          setCurrentPageId(seedTpl.pages[0].id);
        }
      } catch (err) {
        console.error('Failed to load invitation:', err);
        setError('Could not load invitation details.');
      } finally {
        setLoading(false);
      }
    }

    fetchInvitationData();
  }, [inviteSlug]);

  // Audio setup
  useEffect(() => {
    if (template?.musicUrl) {
      const audio = new Audio(template.musicUrl);
      audio.loop = true;
      audioRef.current = audio;
      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [template?.musicUrl]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch((e) => {
        console.warn('Audio play prevented by browser policy:', e);
      });
    }
  };

  // Live countdown calculation
  useEffect(() => {
    const eventDateStr = invitation?.data?.eventDate;
    if (!eventDateStr) return;

    const targetDate = new Date(`${eventDateStr}T17:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invitation?.data?.eventDate]);

  // Handle Page navigation
  const handleNavigateToPage = (targetId: string) => {
    setCurrentPageId(targetId);
    setPageHistory((prev) => [...prev, targetId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const prevPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPageId(prevPage || 'page_home');
    } else {
      setCurrentPageId('page_home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wax seal click action: play music (user gesture) and navigate to page_home
  const handleWaxSealClick = () => {
    if (audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
    handleNavigateToPage('page_home');
  };

  // Add to Calendar (.ics format download)
  const handleAddToCalendar = () => {
    const data = invitation?.data || {};
    const title = `${data.groomName || 'Wedding'} & ${data.brideName || 'Celebration'}`;
    const venue = `${data.venueName || 'Wedding Venue'}, ${data.venueCity || ''}`;
    const dateStr = (data.eventDate || '2026-10-24').replace(/-/g, '');
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MIT Invitations//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title} Wedding Celebration`,
      `DESCRIPTION:Celebration of ${title}. We can't wait to celebrate with you!`,
      `LOCATION:${venue}`,
      `DTSTART:${dateStr}T170000Z`,
      `DTEND:${dateStr}T230000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(data.groomName || 'wedding').toLowerCase()}_celebration.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar event downloaded!', 'success');
  };

  // RSVP Form submission
  const handleSubmitRsvpForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpPhone.trim()) {
      showToast('Please provide your name and phone number', 'error');
      return;
    }

    setRsvpSubmitting(true);
    try {
      const invId = invitation?.id || 'demo_invitation';
      await submitRsvp(invId, {
        name: rsvpName.trim(),
        phone: rsvpPhone.trim(),
        email: rsvpEmail.trim(),
        attending: rsvpAttending,
        guestCount: rsvpAttending === 'yes' ? rsvpCount : 0,
        message: rsvpMessage.trim(),
      });

      setRsvpSubmitted(true);
      showToast('Your RSVP response has been safely sent to the host!', 'success');
    } catch (err) {
      console.error('RSVP submission error:', err);
      showToast('Could not record RSVP. Please try again.', 'error');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#5E8C84] border-t-transparent animate-spin" />
        <p className="font-serif-brand text-sm text-[#26343C]">Unfolding your luxury invitation...</p>
      </div>
    );
  }

  if (error || !invitation || !template) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-[#5E8C84]" />
        <h2 className="font-serif-brand text-2xl text-[#26343C]">Invitation Not Found</h2>
        <p className="text-xs text-[#26343C]/70 max-w-sm">
          This digital invitation suite may have expired, or the custom link is incorrect.
        </p>
        <button
          onClick={() => navigate('home')}
          className="px-5 py-2.5 bg-[#5E8C84] text-white text-xs font-semibold rounded-xl"
        >
          Return to MIT Invitations
        </button>
      </div>
    );
  }

  const activePage = template.pages.find((p) => p.id === currentPageId) || template.pages[0];
  const isIntroPage = activePage.isIntro || activePage.id === 'page_envelope';

  return (
    <div 
      className="min-h-screen bg-[#FAF7F2] text-[#26343C] flex flex-col items-center justify-start relative select-none"
      style={{ fontFamily: invitation.fontChoice || template.defaultFont || 'Fraunces' }}
    >
      
      {/* Floating Ambient Music Control (shows on pages after intro) */}
      {!isIntroPage && template.musicUrl && (
        <button
          onClick={toggleMusic}
          className="fixed top-5 right-5 z-40 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-[#DCE8E4] text-[#26343C] hover:text-[#5E8C84] transition-all flex items-center gap-2 group cursor-pointer"
          title={isPlayingMusic ? 'Mute Music' : 'Play Music'}
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-4 h-4 text-[#5E8C84] animate-pulse" />
              <span className="text-[11px] font-sans font-medium text-[#5E8C84] pr-1 hidden group-hover:inline">
                Playing Ambient Music
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-[#26343C]/60" />
              <span className="text-[11px] font-sans font-medium text-[#26343C]/60 pr-1 hidden group-hover:inline">
                Play Music
              </span>
            </>
          )}
        </button>
      )}

      {/* Floating Quick RSVP Button on sub-pages */}
      {!isIntroPage && currentPageId !== 'page_rsvp' && (
        <button
          onClick={() => setIsRsvpOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white font-sans text-xs font-semibold rounded-full shadow-xl transition-all flex items-center gap-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
        >
          <Send className="w-4 h-4" />
          <span>RSVP Online</span>
        </button>
      )}

      {/* Main Canvas View (Responsive luxury card centering) */}
      <main className="w-full max-w-[540px] min-h-screen flex flex-col items-center bg-[#FAF7F2] shadow-2xl relative overflow-hidden">
        
        {/* Logical 1080px Canvas scaled responsively to device container */}
        <div 
          className="w-[1080px] origin-top relative"
          style={{
            height: `${activePage.customHeight || 1920}px`,
            transform: 'scale(var(--invite-scale, 0.44))',
            marginBottom: `calc((${activePage.customHeight || 1920}px * var(--invite-scale, 0.44)) - ${activePage.customHeight || 1920}px)`,
          }}
          ref={(el) => {
            if (el && el.parentElement) {
              const parentWidth = el.parentElement.clientWidth;
              const computedScale = Math.min(1, parentWidth / 1080);
              el.style.setProperty('--invite-scale', `${computedScale}`);
            }
          }}
        >
          {activePage.elements.map((elem) => (
            <ElementRenderer
              key={elem.id}
              element={elem}
              clientData={invitation.data}
              fontChoice={invitation.fontChoice}
              isPlayingMusic={isPlayingMusic}
              onAction={(action) => {
                if (action.type === 'playVideoThenGoto' || elem.id === 'env_seal_button') {
                  handleWaxSealClick();
                } else if (action.type === 'goto' && action.targetPageId) {
                  handleNavigateToPage(action.targetPageId);
                } else if (action.type === 'back') {
                  handleBack();
                } else if (action.type === 'openRsvp') {
                  setIsRsvpOpen(true);
                } else if (action.type === 'toggleMusic') {
                  toggleMusic();
                } else if (action.type === 'openMap') {
                  const url = invitation.data.mapUrl || 'https://maps.google.com';
                  window.open(url, '_blank');
                }
              }}
            />
          ))}
        </div>

        {/* Global Live Countdown & Utilities Bar (shown on home page) */}
        {currentPageId === 'page_home' && (
          <div className="w-full px-6 py-8 bg-white/60 backdrop-blur-xs border-t border-[#DCE8E4] flex flex-col items-center space-y-6">
            
            {/* Countdown block */}
            {timeLeft && (
              <div className="w-full max-w-sm text-center space-y-2">
                <span className="text-[11px] uppercase tracking-widest text-[#5E8C84] font-sans font-bold">
                  Countdown to Celebration
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Mins', val: timeLeft.minutes },
                    { label: 'Secs', val: timeLeft.seconds },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-[#DCE8E4] shadow-xs">
                      <span className="block text-2xl font-serif-brand font-bold text-[#26343C]">
                        {item.val}
                      </span>
                      <span className="text-[10px] uppercase font-sans text-[#26343C]/60 font-semibold">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar & Map Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm font-sans">
              <button
                onClick={handleAddToCalendar}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-[#FAF7F2] text-[#26343C] border border-[#DCE8E4] text-xs font-semibold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Add to Calendar</span>
              </button>

              <button
                onClick={() => {
                  const url = invitation.data.mapUrl || 'https://maps.google.com';
                  window.open(url, '_blank');
                }}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-[#FAF7F2] text-[#26343C] border border-[#DCE8E4] text-xs font-semibold rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#5E8C84]" />
                <span>Directions</span>
              </button>
            </div>

            {/* MIT Invitations Branding Footer */}
            <div className="pt-4 text-center space-y-1 font-sans">
              <p className="text-[10px] uppercase tracking-widest text-[#5E8C84] font-semibold">
                Designed with MIT Invitations
              </p>
              <p className="text-[10px] text-[#26343C]/50">
                Luxury Digital Suites · Custom Wax Seals · RSVP Management
              </p>
            </div>

          </div>
        )}

      </main>

      {/* RSVP Modal Dialog */}
      {isRsvpOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#DCE8E4] shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 font-sans">
            
            <button
              onClick={() => setIsRsvpOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-[#26343C]/40 hover:text-[#26343C] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {rsvpSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif-brand text-2xl text-[#26343C]">Response Received</h3>
                <p className="text-xs text-[#26343C]/70 max-w-xs mx-auto">
                  Thank you, <strong>{rsvpName}</strong>! Your RSVP has been confirmed and saved directly for the hosts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRsvpOpen(false);
                    setRsvpSubmitted(false);
                  }}
                  className="px-6 py-2.5 bg-[#5E8C84] text-white text-xs font-semibold rounded-xl"
                >
                  Return to Invitation
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvpForm} className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#5E8C84] font-bold">
                    Celebration Response
                  </span>
                  <h3 className="font-serif-brand text-2xl text-[#26343C]">
                    Kindly RSVP
                  </h3>
                  <p className="text-[11px] text-[#26343C]/60">
                    {invitation.data.rsvpDeadline || 'Please reply by the requested date'}
                  </p>
                </div>

                {/* Attending selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#26343C]">
                    Will you be attending?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'yes', label: 'Joyfully Accept' },
                      { val: 'no', label: 'Regretfully Decline' },
                      { val: 'maybe', label: 'Unsure Yet' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setRsvpAttending(opt.val as any)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          rsvpAttending === opt.val
                            ? 'bg-[#5E8C84] text-white border-[#5E8C84] shadow-xs'
                            : 'bg-[#F2F6F6] text-[#26343C]/80 border-transparent hover:border-[#DCE8E4]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                    Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="e.g. +92 342 5364018"
                    className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                  />
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                  />
                </div>

                {/* Guest Count (if attending) */}
                {rsvpAttending === 'yes' && (
                  <div>
                    <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                      Total Number of Guests Attending
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRsvpCount(num)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            rsvpCount === num
                              ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                              : 'bg-[#F2F6F6] text-[#26343C] border-transparent'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Message or Wishes (Supports Urdu) */}
                <div>
                  <label className="block text-xs font-medium text-[#26343C]/80 mb-1">
                    Warm Wishes or Dietary Notes for the Couple (English / Urdu)
                  </label>
                  <textarea
                    rows={2}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="Sending you both endless love and blessings..."
                    className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                    dir="auto"
                  />
                </div>

                <p className="text-[10px] text-[#26343C]/50 text-center">
                  🔒 Strictly private. Your phone and response are visible only to the hosts.
                </p>

                <button
                  type="submit"
                  disabled={rsvpSubmitting}
                  className="w-full py-3 bg-[#5E8C84] hover:bg-[#4d756e] text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{rsvpSubmitting ? 'Sending Response...' : 'Submit RSVP Response'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
