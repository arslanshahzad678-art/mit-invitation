import React, { useState, useEffect } from 'react';
import { 
  Invitation, 
  Guest 
} from '../../types/invitation';
import { 
  listAllInvitations, 
  updateInvitation, 
  softDeleteInvitation, 
  restoreInvitation, 
  permanentlyDeleteInvitation, 
  listGuests, 
  exportGuestsToCsv 
} from '../../services/invitationService';
import { useStore } from '../../context/StoreContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Heart, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Search, 
  Users, 
  Download, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CreditCard
} from 'lucide-react';

export const AdminInvitations: React.FC = () => {
  const { showToast, navigate } = useStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected invitation for viewing guest RSVPs
  const [selectedInvForGuests, setSelectedInvForGuests] = useState<Invitation | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);

  // Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const list = await listAllInvitations(true);
      setInvitations(list);
    } catch (err) {
      console.error('Error fetching admin invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleApprovePayment = async (inv: Invitation) => {
    try {
      const updated: Invitation = {
        ...inv,
        paymentApproved: true,
        status: 'live',
      };
      await updateInvitation(updated, 'Manual payment approved by administrator');
      setInvitations((prev) => prev.map((i) => (i.id === inv.id ? updated : i)));
      showToast(`Payment approved for ${inv.slug}! Public link is now LIVE.`, 'success');
    } catch (err) {
      console.error('Error approving payment:', err);
      showToast('Could not approve payment', 'error');
    }
  };

  const handleToggleDisabled = async (inv: Invitation) => {
    const newStatus = inv.status === 'live' ? 'disabled' : 'live';
    try {
      const updated: Invitation = {
        ...inv,
        status: newStatus,
      };
      await updateInvitation(updated, `Status changed to ${newStatus}`);
      setInvitations((prev) => prev.map((i) => (i.id === inv.id ? updated : i)));
      showToast(`Invitation status updated to ${newStatus}`, 'info');
    } catch (err) {
      showToast('Could not update invitation status', 'error');
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await softDeleteInvitation(deleteConfirmId, 'admin');
      setInvitations((prev) =>
        prev.map((i) => (i.id === deleteConfirmId ? { ...i, deleted: true } : i))
      );
      showToast('Invitation moved to trash (soft-deleted)', 'info');
    } catch {
      showToast('Could not soft-delete invitation', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreInvitation(id);
      setInvitations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, deleted: false } : i))
      );
      showToast('Invitation restored', 'success');
    } catch {
      showToast('Could not restore invitation', 'error');
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteId) return;
    try {
      await permanentlyDeleteInvitation(permanentDeleteId);
      setInvitations((prev) => prev.filter((i) => i.id !== permanentDeleteId));
      showToast('Invitation permanently purged from database', 'info');
    } catch {
      showToast('Could not permanently delete', 'error');
    } finally {
      setPermanentDeleteId(null);
    }
  };

  const handleOpenGuests = async (inv: Invitation) => {
    setSelectedInvForGuests(inv);
    setLoadingGuests(true);
    try {
      const list = await listGuests(inv.id, true);
      setSelectedGuests(list);
    } catch (err) {
      console.error('Failed to load guests:', err);
    } finally {
      setLoadingGuests(false);
    }
  };

  const handleExportGuestsCsv = () => {
    if (selectedGuests.length === 0) return;
    const csv = exportGuestsToCsv(selectedGuests);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${selectedInvForGuests?.slug || 'wedding'}_rsvps.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported guest RSVPs to CSV!', 'success');
  };

  const filtered = invitations.filter((inv) => {
    const couple = `${inv.data?.groomName || ''} ${inv.data?.brideName || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      couple.includes(query) ||
      inv.slug.toLowerCase().includes(query) ||
      (inv.ownerEmail && inv.ownerEmail.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterStatus === 'deleted') return inv.deleted;
    if (inv.deleted) return false; // don't show deleted unless in 'deleted' tab
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return inv.status === 'pending_payment';
    if (filterStatus === 'live') return inv.status === 'live';
    return inv.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Client Invitations & RSVPs
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Review customer orders, approve manual payments (JazzCash / Easypaisa / Bank), manage public slugs, and inspect guest lists.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#DCE8E4] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'pending', label: 'Pending Payment' },
            { id: 'live', label: 'Live Suites' },
            { id: 'deleted', label: 'Trash / Soft-Deleted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#5E8C84] text-white shadow-2xs'
                  : 'bg-[#F2F6F6] text-[#26343C]/70 hover:bg-[#DCE8E4]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#26343C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by couple, slug, email..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
          <p className="text-xs text-[#26343C]/60">Loading invitations from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#DCE8E4] space-y-2">
          <Heart className="w-10 h-10 text-[#5E8C84]/40 mx-auto" />
          <p className="font-serif-brand text-base text-[#26343C]">No Invitations Found</p>
          <p className="text-xs text-[#26343C]/60">
            {filterStatus === 'deleted' ? 'Trash is empty.' : 'No customer invitation suites match your filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inv) => {
            const couple = `${inv.data?.groomName || 'Couple'} & ${inv.data?.brideName || ''}`;
            const isPending = inv.status === 'pending_payment';
            return (
              <div
                key={inv.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all ${
                  inv.deleted 
                    ? 'border-rose-200 bg-rose-50/20' 
                    : isPending 
                    ? 'border-amber-200' 
                    : 'border-[#DCE8E4]'
                }`}
              >
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inv.status}
                    </span>

                    {inv.paymentApproved ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Paid & Approved
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Payment Verification Needed
                      </span>
                    )}

                    {inv.paymentMethodChosen ? (
                      <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1 shadow-2xs">
                        <CreditCard className="w-3 h-3 text-[#5E8C84]" />
                        <span>Paid via: <strong className="text-[#26343C]">{inv.paymentMethodChosen}</strong></span>
                      </span>
                    ) : inv.paymentMethod ? (
                      <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1 uppercase shadow-2xs">
                        <CreditCard className="w-3 h-3 text-[#5E8C84]" />
                        <span>Paid via: <strong className="text-[#26343C]">{inv.paymentMethod}</strong></span>
                      </span>
                    ) : null}

                    <span className="text-xs text-[#26343C]/40">·</span>
                    <span className="text-xs text-[#26343C]/60 font-mono">
                      Created: {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif-brand text-lg sm:text-xl font-medium text-[#26343C]">
                    {couple}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#26343C]/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5E8C84]" />
                      <span>{inv.data?.eventDate || 'Date N/A'}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#5E8C84]" />
                      <span>{inv.ownerEmail || 'client'}</span>
                    </span>

                    <span className="text-[#5E8C84] font-medium font-mono">
                      /i/{inv.slug}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DCE8E4]">
                  
                  {/* Approve Payment button if pending */}
                  {!inv.deleted && !inv.paymentApproved && (
                    <button
                      onClick={() => handleApprovePayment(inv)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve Payment & Make Live</span>
                    </button>
                  )}

                  {/* Toggle disable/live */}
                  {!inv.deleted && inv.paymentApproved && (
                    <button
                      onClick={() => handleToggleDisabled(inv)}
                      className="px-3 py-2 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 text-[#26343C] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {inv.status === 'live' ? 'Pause Suite' : 'Activate Suite'}
                    </button>
                  )}

                  {/* View RSVP guest list */}
                  <button
                    onClick={() => handleOpenGuests(inv)}
                    className="px-3 py-2 bg-[#DCE8E4]/60 hover:bg-[#DCE8E4] text-[#26343C] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#5E8C84]" />
                    <span>Guest RSVPs</span>
                  </button>

                  {/* Public Link Preview */}
                  <a
                    href={`/i/${inv.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 text-[#26343C] rounded-xl transition-colors"
                    title="Open live link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Soft Delete / Restore */}
                  {inv.deleted ? (
                    <>
                      <button
                        onClick={() => handleRestore(inv.id)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Restore"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => setPermanentDeleteId(inv.id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                        title="Permanently Purge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(inv.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Move to trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest RSVPs Drawer / Modal */}
      {selectedInvForGuests && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#DCE8E4] shadow-2xl p-6 sm:p-8 space-y-4 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8E4]">
              <div>
                <h3 className="font-serif-brand text-xl text-[#26343C]">
                  Guest RSVPs: {selectedInvForGuests.slug}
                </h3>
                <p className="text-xs text-[#26343C]/60">
                  {selectedGuests.length} Total Guest Responses
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportGuestsCsv}
                  disabled={selectedGuests.length === 0}
                  className="px-3 py-1.5 bg-[#5E8C84] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setSelectedInvForGuests(null)}
                  className="p-1.5 text-[#26343C]/40 hover:text-[#26343C] rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingGuests ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
                </div>
              ) : selectedGuests.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#26343C]/60">
                  No RSVPs have been submitted for this invitation yet.
                </div>
              ) : (
                selectedGuests.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#DCE8E4] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[#26343C]">{g.name}</p>
                      <p className="text-[#26343C]/60 text-[11px]">{g.phone} {g.email ? `· ${g.email}` : ''}</p>
                      {g.message && (
                        <p className="text-[#5E8C84] text-[11px] mt-0.5 italic" dir="auto">"{g.message}"</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.attending === 'yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.attending === 'no'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.attending} ({g.guestCount || 1})
                      </span>
                      <p className="text-[10px] text-[#26343C]/40 mt-1">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Confirm Soft Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Move to Trash"
        message="Are you sure you want to soft-delete this invitation? It will become inaccessible to the client, but you can restore it anytime."
        confirmLabel="Move to Trash"
        isDestructive={true}
        onConfirm={handleSoftDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Confirm Permanent Delete */}
      <ConfirmModal
        isOpen={Boolean(permanentDeleteId)}
        title="Permanently Purge Invitation"
        message="Are you sure? This will permanently delete this invitation, release its custom slug, and wipe all guest RSVP records. This action cannot be undone."
        confirmLabel="Permanently Purge"
        isDestructive={true}
        onConfirm={handlePermanentDelete}
        onCancel={() => setPermanentDeleteId(null)}
      />

    </div>
  );
};
