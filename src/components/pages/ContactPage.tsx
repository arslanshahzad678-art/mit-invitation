import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { storeSettings, showToast } = useStore();
  const cleanPhone = storeSettings.whatsAppNumber.replace(/[^0-9]/g, '');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Send formatted message via WhatsApp or simulated success
    const text = encodeURIComponent(
      `💌 *Contact Message from MIT Invitations Website*\n\nFrom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setSubmitted(true);
    showToast('Inquiry launched to WhatsApp atelier!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5E8C84]">
          We’d Love to Hear From You
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif-brand text-[#26343C]">
          Contact Our Atelier
        </h1>
        <p className="text-sm sm:text-base text-[#26343C]/70 max-w-md mx-auto">
          Whether you have a question about an existing design or wish to commission a bespoke suite, we are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact Info */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-[#DCE8E4] p-8 space-y-6 shadow-xs">
          <h3 className="font-serif-brand text-xl font-semibold text-[#26343C]">
            Direct Concierge
          </h3>

          <div className="space-y-4 text-xs text-[#26343C]/80">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-2xl bg-[#DCE8E4]/40 hover:bg-[#DCE8E4] transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-[#5E8C84] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#26343C]">WhatsApp Studio</p>
                <p className="text-[#26343C]/70">{storeSettings.phone}</p>
                <p className="text-[10px] text-[#5E8C84] mt-0.5 font-medium">Fastest response (under 2 hours)</p>
              </div>
            </a>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50">
              <Mail className="w-5 h-5 text-[#5E8C84] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#26343C]">Email Atelier</p>
                <p className="text-[#26343C]/70">{storeSettings.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50">
              <MapPin className="w-5 h-5 text-[#5E8C84] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#26343C]">Studio Address</p>
                <p className="text-[#26343C]/70">{storeSettings.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50">
              <Clock className="w-5 h-5 text-[#5E8C84] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#26343C]">Business Hours</p>
                <p className="text-[#26343C]/70">{storeSettings.workingHours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-[#DCE8E4] p-8 shadow-xs">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif-brand text-xl font-semibold text-[#26343C] mb-2">
                Send a Message
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jessica Miller"
                  className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jessica@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Your Message or Event Question *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your event, wedding theme, timeline, or any questions..."
                  className="w-full px-3.5 py-2.5 bg-[#F2F6F6] border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send via WhatsApp Concierge</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#5E8C84] mx-auto" />
              <h4 className="font-serif-brand text-2xl text-[#26343C]">
                Thank you for contacting us!
              </h4>
              <p className="text-xs text-[#26343C]/70 max-w-sm mx-auto">
                Your message has been initiated. Our team will review your details and respond promptly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-medium text-[#5E8C84] hover:underline pt-2 block mx-auto"
              >
                Send another message
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
