import { PaymentMethod, PaymentMethodType, StoreSettings } from '../types';

export interface PaymentBadgeConfig {
  label: string;
  initials: string;
  bg: string;
  text: string;
  lightBg: string;
  border: string;
  tagColor: string;
}

export function getPaymentMethodBadgeConfig(
  type: PaymentMethodType,
  customName?: string
): PaymentBadgeConfig {
  switch (type) {
    case 'easypaisa':
      return {
        label: 'Easypaisa',
        initials: 'EP',
        bg: 'bg-emerald-600',
        text: 'text-white',
        lightBg: 'bg-emerald-50',
        border: 'border-emerald-200',
        tagColor: 'text-emerald-700',
      };
    case 'jazzcash':
      return {
        label: 'JazzCash',
        initials: 'JC',
        bg: 'bg-rose-600',
        text: 'text-white',
        lightBg: 'bg-rose-50',
        border: 'border-rose-200',
        tagColor: 'text-rose-700',
      };
    case 'nayapay':
      return {
        label: 'NayaPay',
        initials: 'NP',
        bg: 'bg-orange-500',
        text: 'text-white',
        lightBg: 'bg-orange-50',
        border: 'border-orange-200',
        tagColor: 'text-orange-700',
      };
    case 'sadapay':
      return {
        label: 'SadaPay',
        initials: 'SP',
        bg: 'bg-teal-500',
        text: 'text-white',
        lightBg: 'bg-teal-50',
        border: 'border-teal-200',
        tagColor: 'text-teal-700',
      };
    case 'bank':
      return {
        label: 'Bank Transfer (IBAN)',
        initials: 'BT',
        bg: 'bg-slate-700',
        text: 'text-white',
        lightBg: 'bg-slate-50',
        border: 'border-slate-200',
        tagColor: 'text-slate-800',
      };
    case 'other':
    default:
      return {
        label: customName?.trim() || 'Other Payment',
        initials: (customName?.trim() || 'OT').slice(0, 2).toUpperCase(),
        bg: 'bg-gray-600',
        text: 'text-white',
        lightBg: 'bg-gray-50',
        border: 'border-gray-200',
        tagColor: 'text-gray-700',
      };
  }
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-easypaisa-1',
    type: 'easypaisa',
    accountTitle: 'MIT Invitations Studio',
    accountNumber: '0342 5364018',
    note: 'Send payment receipt screenshot on WhatsApp for instant activation',
    enabled: true,
    order: 1,
  },
  {
    id: 'pay-jazzcash-1',
    type: 'jazzcash',
    accountTitle: 'MIT Invitations Studio',
    accountNumber: '0342 5364018',
    note: 'Send screenshot with transaction ID on WhatsApp',
    enabled: true,
    order: 2,
  },
  {
    id: 'pay-bank-1',
    type: 'bank',
    accountTitle: 'MIT Invitations Studio',
    bankName: 'Meezan Bank Limited',
    accountNumber: '01010102938475',
    iban: 'PK45MEZN0001010102938475',
    note: 'Interbank funds transfer (Raast / IBFT supported)',
    enabled: true,
    order: 3,
  },
];

/**
 * Automatically migrates existing saved payment fields from store settings
 * into the new flexible paymentMethods array.
 */
export function migrateLegacyPaymentSettings(settings: StoreSettings): PaymentMethod[] {
  // If paymentMethods is already populated and valid, return it sorted
  if (Array.isArray(settings.paymentMethods) && settings.paymentMethods.length > 0) {
    return [...settings.paymentMethods].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const migrated: PaymentMethod[] = [];
  let orderIndex = 1;

  // 1. Check Easypaisa
  if (settings.easypaisaNumber && settings.easypaisaNumber.trim()) {
    migrated.push({
      id: `migrated-easypaisa-${Date.now()}-${orderIndex}`,
      type: 'easypaisa',
      accountTitle: settings.easypaisaTitle?.trim() || 'MIT Invitations',
      accountNumber: settings.easypaisaNumber.trim(),
      note: 'Send receipt screenshot on WhatsApp',
      enabled: true,
      order: orderIndex++,
    });
  }

  // 2. Check JazzCash
  if (settings.jazzcashNumber && settings.jazzcashNumber.trim()) {
    migrated.push({
      id: `migrated-jazzcash-${Date.now()}-${orderIndex}`,
      type: 'jazzcash',
      accountTitle: settings.jazzcashTitle?.trim() || 'MIT Invitations',
      accountNumber: settings.jazzcashNumber.trim(),
      note: 'Send receipt screenshot on WhatsApp',
      enabled: true,
      order: orderIndex++,
    });
  }

  // 3. Check Bank Transfer
  if ((settings.bankIban && settings.bankIban.trim()) || (settings.bankAccountNumber && settings.bankAccountNumber.trim())) {
    migrated.push({
      id: `migrated-bank-${Date.now()}-${orderIndex}`,
      type: 'bank',
      accountTitle: settings.bankAccountTitle?.trim() || 'MIT Invitations',
      bankName: settings.bankName?.trim() || 'Meezan Bank',
      accountNumber: settings.bankAccountNumber?.trim() || '',
      iban: settings.bankIban?.trim() || '',
      note: 'Raast / IBFT bank transfer',
      enabled: true,
      order: orderIndex++,
    });
  }

  // If no legacy details were saved at all, return the sensible defaults
  if (migrated.length === 0) {
    return DEFAULT_PAYMENT_METHODS;
  }

  return migrated;
}

export function buildWhatsAppPaymentMessage(params: {
  whatsAppNumber: string;
  invitationId?: string;
  templateName?: string;
  clientEmail?: string;
  paymentMethodChosen?: string;
  coupleName?: string;
  amount?: string | number;
  currencySymbol?: string;
}): string {
  const {
    whatsAppNumber,
    invitationId,
    templateName,
    clientEmail,
    paymentMethodChosen,
    coupleName,
    amount,
    currencySymbol = '$',
  } = params;

  const phone = (whatsAppNumber || '+923425364018').replace(/[^0-9]/g, '');

  let text = `*Payment Confirmation & Activation - MIT Invitations*\n\n`;
  if (invitationId) text += `• *Invitation ID:* ${invitationId}\n`;
  if (templateName) text += `• *Suite Template:* ${templateName}\n`;
  if (coupleName) text += `• *Couple:* ${coupleName}\n`;
  if (clientEmail) text += `• *Client Email:* ${clientEmail}\n`;
  if (amount) text += `• *Amount:* ${currencySymbol}${amount}\n`;
  if (paymentMethodChosen) text += `• *Payment Method Used:* ${paymentMethodChosen}\n`;
  text += `\nI have sent the payment for my invitation suite. Please find my receipt screenshot attached. Looking forward to your approval & public link activation!\n\nThank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
