import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  getPaymentMethodBadgeConfig, 
  buildWhatsAppPaymentMessage 
} from '../../services/paymentService';
import { 
  Copy, 
  Check, 
  MessageCircle, 
  CreditCard, 
  AlertCircle,
  Building2,
  Phone,
  User,
  Info
} from 'lucide-react';

interface PaymentMethodsViewProps {
  methods?: PaymentMethod[];
  price?: number | string;
  invitationId?: string;
  templateName?: string;
  clientEmail?: string;
  coupleName?: string;
  selectedMethodId?: string;
  onSelectMethod?: (method: PaymentMethod) => void;
  showWhatsAppButton?: boolean;
  onWhatsAppClick?: (method: PaymentMethod) => void;
  className?: string;
}

export const PaymentMethodsView: React.FC<PaymentMethodsViewProps> = ({
  methods: customMethods,
  price,
  invitationId,
  templateName,
  clientEmail,
  coupleName,
  selectedMethodId: externalSelectedId,
  onSelectMethod,
  showWhatsAppButton = true,
  onWhatsAppClick,
  className = '',
}) => {
  const { storeSettings, showToast } = useStore();
  const allMethods = customMethods || storeSettings.paymentMethods || [];
  const enabledMethods = allMethods
    .filter((m) => m.enabled)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    externalSelectedId || enabledMethods[0]?.id || ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeSelectedId = externalSelectedId || internalSelectedId;
  const selectedMethod = enabledMethods.find((m) => m.id === activeSelectedId) || enabledMethods[0];

  const handleSelect = (method: PaymentMethod) => {
    setInternalSelectedId(method.id);
    if (onSelectMethod) {
      onSelectMethod(method);
    }
  };

  const copyToClipboard = (text: string, label: string, key: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`${label} copied to clipboard!`, 'info');
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleSendWhatsApp = () => {
    if (selectedMethod && onWhatsAppClick) {
      onWhatsAppClick(selectedMethod);
      return;
    }

    const badge = selectedMethod ? getPaymentMethodBadgeConfig(selectedMethod.type, selectedMethod.customTypeName) : null;
    const methodDesc = selectedMethod 
      ? `${badge?.label || selectedMethod.type} (${selectedMethod.accountTitle} - ${selectedMethod.accountNumber || selectedMethod.iban || ''})`
      : 'Manual Payment';

    const url = buildWhatsAppPaymentMessage({
      whatsAppNumber: storeSettings.whatsAppNumber,
      invitationId,
      templateName,
      clientEmail,
      paymentMethodChosen: methodDesc,
      coupleName,
      amount: price,
      currencySymbol: storeSettings.currencySymbol,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If no method is enabled, display friendly fallback message
  if (enabledMethods.length === 0) {
    return (
      <div className={`p-6 bg-white rounded-3xl border border-[#DCE8E4] text-center space-y-4 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif-brand text-base font-semibold text-[#26343C]">
            Manual Payment Details
          </h4>
          <p className="text-xs text-[#26343C]/70 max-w-sm mx-auto">
            Payment details coming soon, please contact us on WhatsApp to confirm your manual transfer details.
          </p>
        </div>
        {showWhatsAppButton && (
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-5 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact on WhatsApp</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Header Banner */}
      {price !== undefined && (
        <div className="flex items-center justify-between p-3.5 bg-[#F2F6F6] rounded-2xl border border-[#DCE8E4]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#5E8C84]" />
            <span className="text-xs font-medium text-[#26343C]">
              Digital Suite Investment:
            </span>
          </div>
          <div className="font-serif-brand font-bold text-base text-[#5E8C84]">
            {storeSettings.currencySymbol || '$'}{price}
          </div>
        </div>
      )}

      {/* Selectable tabs or cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#26343C]/80 font-medium pb-1">
          <span>
            {enabledMethods.length > 1 ? '1. Select Your Payment Method:' : 'Payment Method:'}
          </span>
          <span className="text-[11px] text-[#26343C]/60">
            {enabledMethods.length} method{enabledMethods.length > 1 ? 's' : ''} available
          </span>
        </div>

        {/* Tab strip if multiple methods */}
        {enabledMethods.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {enabledMethods.map((m) => {
              const badge = getPaymentMethodBadgeConfig(m.type, m.customTypeName);
              const isSelected = m.id === activeSelectedId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-white border-[#5E8C84] shadow-xs ring-2 ring-[#5E8C84]/20'
                      : 'bg-white/60 hover:bg-white border-[#DCE8E4]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs ${badge.bg} ${badge.text}`}
                  >
                    {badge.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#26343C] truncate">
                      {badge.label}
                    </p>
                    <p className="text-[10px] text-[#26343C]/60 truncate">
                      {m.type === 'bank' ? (m.bankName || 'Bank') : m.accountTitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Active Method Card with Copy Buttons */}
      {selectedMethod && (
        <div className="p-5 bg-white rounded-3xl border-2 border-[#5E8C84] shadow-xs space-y-4 animate-in fade-in duration-200">
          {/* Card Header */}
          {(() => {
            const badge = getPaymentMethodBadgeConfig(selectedMethod.type, selectedMethod.customTypeName);
            return (
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE8E4]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${badge.bg} ${badge.text}`}
                  >
                    {badge.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-brand font-semibold text-sm text-[#26343C]">
                        {badge.label}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.lightBg} ${badge.tagColor} border ${badge.border}`}>
                        Active
                      </span>
                    </div>
                    {selectedMethod.bankName && selectedMethod.type === 'bank' && (
                      <p className="text-xs text-[#26343C]/70">
                        {selectedMethod.bankName}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#5E8C84] bg-[#DCE8E4]/50 px-2.5 py-1 rounded-full">
                  Selected
                </span>
              </div>
            );
          })()}

          {/* Account Details with Copy Buttons */}
          <div className="space-y-2.5">
            {/* Account Title */}
            <div className="p-2.5 bg-[#F2F6F6] rounded-xl flex items-center justify-between gap-2 border border-[#DCE8E4]/60">
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-[#26343C]/50 tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#5E8C84]" /> Account Title
                </span>
                <span className="font-semibold text-xs text-[#26343C] truncate block select-all">
                  {selectedMethod.accountTitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(selectedMethod.accountTitle, 'Account Title', `title-${selectedMethod.id}`)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#DCE8E4]/40 border border-[#DCE8E4] text-[11px] font-semibold text-[#26343C] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Copy Account Title"
              >
                {copiedKey === `title-${selectedMethod.id}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#5E8C84]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Number or Phone */}
            {selectedMethod.accountNumber && (
              <div className="p-2.5 bg-[#F2F6F6] rounded-xl flex items-center justify-between gap-2 border border-[#DCE8E4]/60">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-[#26343C]/50 tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#5E8C84]" /> Account / Mobile Number
                  </span>
                  <span className="font-mono font-semibold text-xs text-[#26343C] truncate block select-all">
                    {selectedMethod.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedMethod.accountNumber, 'Account Number', `num-${selectedMethod.id}`)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#DCE8E4]/40 border border-[#DCE8E4] text-[11px] font-semibold text-[#26343C] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Copy Account Number"
                >
                  {copiedKey === `num-${selectedMethod.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#5E8C84]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* IBAN for Bank Transfer */}
            {selectedMethod.iban && (
              <div className="p-2.5 bg-[#F2F6F6] rounded-xl flex items-center justify-between gap-2 border border-[#DCE8E4]/60">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-[#26343C]/50 tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#5E8C84]" /> International Bank Account Number (IBAN)
                  </span>
                  <span className="font-mono font-semibold text-xs text-[#26343C] truncate block select-all">
                    {selectedMethod.iban}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedMethod.iban || '', 'IBAN', `iban-${selectedMethod.id}`)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#DCE8E4]/40 border border-[#DCE8E4] text-[11px] font-semibold text-[#26343C] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Copy IBAN"
                >
                  {copiedKey === `iban-${selectedMethod.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#5E8C84]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Optional Note */}
            {selectedMethod.note && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-snug">{selectedMethod.note}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp Screenshot Submission Button */}
      {showWhatsAppButton && (
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 px-6 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Send Payment Screenshot on WhatsApp</span>
          </button>
          <p className="text-center text-[11px] text-[#26343C]/60">
            Attach your transfer receipt screenshot. We will approve and activate your public suite link right away.
          </p>
        </div>
      )}
    </div>
  );
};
