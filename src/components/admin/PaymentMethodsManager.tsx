import React, { useState, useEffect } from 'react';
import { PaymentMethod, PaymentMethodType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  getPaymentMethodBadgeConfig, 
  migrateLegacyPaymentSettings 
} from '../../services/paymentService';
import { PaymentMethodsView } from '../payment/PaymentMethodsView';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Check, 
  Building2, 
  Phone, 
  User, 
  Eye, 
  Save, 
  HelpCircle,
  X,
  CheckCircle2
} from 'lucide-react';

export const PaymentMethodsManager: React.FC = () => {
  const { storeSettings, updateStoreSettings, showToast } = useStore();

  const [methods, setMethods] = useState<PaymentMethod[]>(() => {
    return migrateLegacyPaymentSettings(storeSettings);
  });

  const [isSaved, setIsSaved] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<{
    id?: string;
    type: PaymentMethodType;
    customTypeName: string;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    iban: string;
    note: string;
    enabled: boolean;
  }>({
    type: 'easypaisa',
    customTypeName: '',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    note: '',
    enabled: true,
  });

  // Sync if storeSettings from cloud updates
  useEffect(() => {
    if (storeSettings.paymentMethods && storeSettings.paymentMethods.length > 0) {
      setMethods([...storeSettings.paymentMethods].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } else {
      const migrated = migrateLegacyPaymentSettings(storeSettings);
      setMethods(migrated);
    }
  }, [storeSettings]);

  const saveMethodsToStore = async (newMethods: PaymentMethod[]) => {
    const sorted = newMethods.map((m, idx) => ({ ...m, order: idx + 1 }));
    setMethods(sorted);
    setIsSaved(true);

    try {
      await updateStoreSettings({
        ...storeSettings,
        paymentMethods: sorted,
      });
      showToast('Payment methods saved successfully!', 'success');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Error saving payment methods:', err);
      showToast('Failed to save payment methods', 'error');
    }
  };

  const handleToggleEnabled = (id: string) => {
    const updated = methods.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    saveMethodsToStore(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...methods];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    saveMethodsToStore(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === methods.length - 1) return;
    const reordered = [...methods];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    saveMethodsToStore(reordered);
  };

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setFormData({
      type: 'easypaisa',
      customTypeName: '',
      accountTitle: storeSettings.easypaisaTitle || 'MIT Invitations Studio',
      accountNumber: '',
      bankName: 'Meezan Bank Limited',
      iban: '',
      note: 'Send payment receipt screenshot on WhatsApp',
      enabled: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (m: PaymentMethod) => {
    setEditingMethod(m);
    setFormData({
      id: m.id,
      type: m.type,
      customTypeName: m.customTypeName || '',
      accountTitle: m.accountTitle || '',
      accountNumber: m.accountNumber || '',
      bankName: m.bankName || '',
      iban: m.iban || '',
      note: m.note || '',
      enabled: m.enabled,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountTitle.trim()) {
      showToast('Please provide an Account Title', 'error');
      return;
    }

    if (formData.type === 'bank' && !formData.iban.trim() && !formData.accountNumber.trim()) {
      showToast('Please provide an IBAN or Account Number for Bank Transfer', 'error');
      return;
    }

    if (formData.type !== 'bank' && !formData.accountNumber.trim()) {
      showToast('Please provide an Account / Phone Number', 'error');
      return;
    }

    if (editingMethod) {
      // Update existing
      const updated = methods.map((m) =>
        m.id === editingMethod.id
          ? {
              ...m,
              type: formData.type,
              customTypeName: formData.type === 'other' ? formData.customTypeName.trim() : undefined,
              accountTitle: formData.accountTitle.trim(),
              accountNumber: formData.accountNumber.trim(),
              bankName: formData.type === 'bank' ? formData.bankName.trim() : undefined,
              iban: formData.type === 'bank' ? formData.iban.trim() : undefined,
              note: formData.note.trim() || undefined,
              enabled: formData.enabled,
            }
          : m
      );
      saveMethodsToStore(updated);
      showToast(`Updated ${formData.type} payment method`, 'success');
    } else {
      // Add new
      const newMethod: PaymentMethod = {
        id: `pay-${formData.type}-${Date.now()}`,
        type: formData.type,
        customTypeName: formData.type === 'other' ? formData.customTypeName.trim() : undefined,
        accountTitle: formData.accountTitle.trim(),
        accountNumber: formData.accountNumber.trim(),
        bankName: formData.type === 'bank' ? formData.bankName.trim() : undefined,
        iban: formData.type === 'bank' ? formData.iban.trim() : undefined,
        note: formData.note.trim() || undefined,
        enabled: formData.enabled,
        order: methods.length + 1,
      };
      saveMethodsToStore([...methods, newMethod]);
      showToast(`Added ${formData.type} payment method`, 'success');
    }

    setIsAddModalOpen(false);
    setEditingMethod(null);
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const filtered = methods.filter((m) => m.id !== deleteConfirmId);
    saveMethodsToStore(filtered);
    setDeleteConfirmId(null);
    showToast('Payment method removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
                  Manual Payment Methods
                </h3>
                {isSaved && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-[#26343C]/70">
                Configure Easypaisa, JazzCash, NayaPay, SadaPay, and Bank Transfer accounts for receiving manual payments from clients.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Method</span>
            </button>
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-[#F2F6F6] rounded-2xl border border-[#DCE8E4] text-xs text-[#26343C]/80 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#5E8C84] shrink-0" />
          <span>
            Enabled methods will be displayed to clients when finalizing an invitation suite or inside their pending payment portal. You can enable multiple methods at once.
          </span>
        </div>

        {/* Payment Methods Cards List */}
        <div className="space-y-3 pt-2">
          {methods.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-[#DCE8E4] rounded-2xl p-6 space-y-2">
              <CreditCard className="w-8 h-8 text-[#5E8C84]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#26343C]">No payment methods configured yet</p>
              <p className="text-[11px] text-[#26343C]/60">Click &ldquo;Add Payment Method&rdquo; to add your first account details.</p>
            </div>
          ) : (
            methods.map((method, index) => {
              const badge = getPaymentMethodBadgeConfig(method.type, method.customTypeName);
              return (
                <div
                  key={method.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    method.enabled
                      ? 'bg-white border-[#DCE8E4] shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 opacity-70'
                  }`}
                >
                  {/* Left: Badge + Account Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${badge.bg} ${badge.text}`}
                    >
                      {badge.initials}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-brand font-semibold text-xs sm:text-sm text-[#26343C]">
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                            method.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {method.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#26343C]/80">
                        <span className="font-medium">
                          {method.accountTitle}
                        </span>
                        {method.accountNumber && (
                          <span className="font-mono text-[#5E8C84]">
                            {method.accountNumber}
                          </span>
                        )}
                        {method.type === 'bank' && method.bankName && (
                          <span className="text-[#26343C]/60">
                            ({method.bankName})
                          </span>
                        )}
                        {method.iban && (
                          <span className="font-mono text-[11px] text-[#26343C]/70">
                            IBAN: {method.iban}
                          </span>
                        )}
                      </div>

                      {method.note && (
                        <p className="text-[11px] text-[#26343C]/60 italic truncate max-w-md">
                          Note: {method.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Toggle, Reorder, Edit, Delete) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {/* Enable/Disable Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(method.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                        method.enabled
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                      title={method.enabled ? 'Click to disable' : 'Click to enable'}
                    >
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* Reorder Buttons */}
                    <div className="flex items-center rounded-lg border border-[#DCE8E4] bg-[#F2F6F6] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-[#26343C]/70 hover:text-[#26343C] disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === methods.length - 1}
                        className="p-1 rounded text-[#26343C]/70 hover:text-[#26343C] disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(method)}
                      className="p-1.5 text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Account Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(method.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Live Preview Box: What the client sees */}
      <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#5E8C84]" />
            <h4 className="font-serif-brand text-base font-semibold text-[#26343C]">
              Client Live Preview
            </h4>
          </div>
          <span className="text-[11px] text-[#26343C]/60 bg-[#F2F6F6] px-2.5 py-1 rounded-full border border-[#DCE8E4]">
            Real-time Client Perspective
          </span>
        </div>

        <p className="text-xs text-[#26343C]/70">
          This preview reflects exactly how your enabled manual payment options appear to couples during order confirmation and inside their private Client Portal.
        </p>

        <div className="p-4 sm:p-6 bg-[#FAF7F2] rounded-2xl border border-[#DCE8E4]">
          <PaymentMethodsView
            methods={methods}
            price={38}
            templateName="The Seraphina Botanical Suite"
            clientEmail="client@example.com"
            coupleName="Aria & Ezra"
            showWhatsAppButton={false}
          />
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE8E4]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
                  {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#26343C]/60 hover:text-[#26343C] hover:bg-[#DCE8E4]/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 pt-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Payment Method Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as PaymentMethodType,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                >
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="nayapay">NayaPay</option>
                  <option value="sadapay">SadaPay</option>
                  <option value="bank">Bank Transfer (IBAN)</option>
                  <option value="other">Other (Custom Name)</option>
                </select>
              </div>

              {/* If 'other', ask for custom name */}
              {formData.type === 'other' && (
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Custom Method Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customTypeName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customTypeName: e.target.value }))
                    }
                    placeholder="e.g. Raast ID, Western Union, Cash on Delivery"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                  />
                </div>
              )}

              {/* Account Title */}
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Account Title (Recipient Name) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accountTitle: e.target.value }))
                  }
                  placeholder="e.g. MIT Invitations / Arslan Shahzad"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              {/* Account Number / Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  {formData.type === 'bank'
                    ? 'Bank Account Number'
                    : 'Account / Mobile Number *'}
                </label>
                <input
                  type="text"
                  required={formData.type !== 'bank'}
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))
                  }
                  placeholder={
                    formData.type === 'bank'
                      ? 'e.g. 01010102938475'
                      : 'e.g. 0342 5364018'
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              {/* Bank-specific fields */}
              {formData.type === 'bank' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, bankName: e.target.value }))
                      }
                      placeholder="e.g. Meezan Bank Limited, HBL, Bank Alfalah"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26343C] mb-1">
                      International Bank Account Number (IBAN)
                    </label>
                    <input
                      type="text"
                      value={formData.iban}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, iban: e.target.value }))
                      }
                      placeholder="e.g. PK45MEZN0001010102938475"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                    />
                  </div>
                </>
              )}

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Optional Note (One Line)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="e.g. Send screenshot of receipt on WhatsApp for instant activation"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              {/* Enabled toggle */}
              <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="rounded text-[#5E8C84] focus:ring-0"
                />
                <span className="font-medium text-[#26343C]">
                  Enable this method immediately for clients
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#DCE8E4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-[#26343C] text-xs font-semibold rounded-xl border border-[#DCE8E4] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingMethod ? 'Save Changes' : 'Add Method'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? Clients will no longer see this account for manual payments."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
        isDestructive={true}
      />
    </div>
  );
};
