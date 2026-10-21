import React, { useState, useEffect } from 'react';
import { 
  Invitation, 
  Guest 
} from '../../types/invitation';
import { 
  listMyInvitations, 
  listAllInvitations,
  listGuests, 
  addGuest, 
  updateGuest, 
  softDeleteGuest, 
  exportGuestsToCsv 
} from '../../services/invitationService';
import { clientLogout } from '../../services/firebaseAuth';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useStore } from '../../context/StoreContext';
import { ClientLogin } from './ClientLogin';
import { ConfirmModal } from '../common/ConfirmModal';
import { jsPDF } from 'jspdf';
import { 
  Users, 
  UserCheck, 
  UserX, 
  HelpCircle, 
  Search, 
  Download, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  LogOut, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Heart,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const { navigate, showToast, storeSettings } = useStore();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authChecking, setAuthChecking] = useState(true);

  // Invitation & Guests state
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeInvitation, setActiveInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'yes' | 'no' | 'maybe'>('all');

  // Modals
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);

  // Guest form fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAttending, setGuestAttending] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guestMessage, setGuestMessage] = useState('');

  // Link copied state
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      let invList: Invitation[] = [];
      if (currentUser?.uid) {
        invList = await listMyInvitations(currentUser.uid);
      }
      // If none found for this user, check all invitations to allow viewing recent guest submissions
      if (invList.length === 0) {
        const all = await listAllInvitations(false);
        invList = all.slice(0, 5);
      }

      setInvitations(invList);
      if (invList.length > 0) {
        const current = invList[0];
        setActiveInvitation(current);
        const guestList = await listGuests(current.id);
        setGuests(guestList);
      } else {
        setActiveInvitation(null);
        setGuests([]);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecking) {
      fetchClientData();
    }
  }, [currentUser, authChecking]);

  const handleSelectInvitation = async (inv: Invitation) => {
    setActiveInvitation(inv);
    setLoading(true);
    try {
      const guestList = await listGuests(inv.id);
      setGuests(guestList);
    } finally {
      setLoading(false);
    }
  };

  // Add / Edit guest submission
  const handleSaveGuestForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvitation) return;
    if (!guestName.trim() || !guestPhone.trim()) {
      showToast('Please provide guest name and phone number', 'error');
      return;
    }

    try {
      if (editingGuest) {
        const updated: Guest = {
          ...editingGuest,
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim(),
          attending: guestAttending,
          guestCount: guestAttending === 'yes' ? guestCount : 0,
          message: guestMessage.trim(),
        };
        await updateGuest(activeInvitation.id, updated);
        setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        showToast('Guest response updated', 'success');
      } else {
        const newGuest = await addGuest(activeInvitation.id, {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim(),
          attending: guestAttending,
          guestCount: guestAttending === 'yes' ? guestCount : 0,
          message: guestMessage.trim(),
          source: 'manual',
        });
        setGuests((prev) => [newGuest, ...prev]);
        showToast('Guest added to RSVP list', 'success');
      }
      setIsAddGuestOpen(false);
      setEditingGuest(null);
      resetGuestForm();
    } catch (err) {
      console.error('Failed to save guest:', err);
      showToast('Could not save guest', 'error');
    }
  };

  const resetGuestForm = () => {
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setGuestAttending('yes');
    setGuestCount(1);
    setGuestMessage('');
  };

  const handleOpenEditGuest = (g: Guest) => {
    setEditingGuest(g);
    setGuestName(g.name);
    setGuestPhone(g.phone);
    setGuestEmail(g.email || '');
    setGuestAttending(g.attending);
    setGuestCount(g.guestCount || 1);
    setGuestMessage(g.message || '');
    setIsAddGuestOpen(true);
  };

  const handleDeleteGuest = async () => {
    if (!activeInvitation || !deleteGuestId) return;
    try {
      await softDeleteGuest(activeInvitation.id, deleteGuestId);
      setGuests((prev) => prev.filter((g) => g.id !== deleteGuestId));
      showToast('Guest removed from list', 'info');
    } catch (err) {
      showToast('Could not remove guest', 'error');
    } finally {
      setDeleteGuestId(null);
    }
  };

  // CSV Export with UTF-8 BOM
  const handleExportCsv = () => {
    if (guests.length === 0) {
      showToast('No guests in list to export', 'info');
      return;
    }
    const csvContent = exportGuestsToCsv(guests);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeInvitation?.slug || 'wedding'}_guest_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file for Excel!', 'success');
  };

  // Luxury PDF Export using jsPDF
  const handleExportPdf = () => {
    if (guests.length === 0) {
      showToast('No guests in list to export', 'info');
      return;
    }

    try {
      const doc = new jsPDF();
      const couple = `${activeInvitation?.data?.groomName || 'Couple'} & ${activeInvitation?.data?.brideName || ''}`;
      const date = activeInvitation?.data?.eventDate || 'Celebration Date';

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(38, 52, 60);
      doc.text('MIT INVITATIONS · GUEST RSVP LIST', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(94, 140, 132);
      doc.text(`Suite: ${couple} (${date})`, 14, 28);

      // Summary Stats
      const totalAttending = guests.filter((g) => g.attending === 'yes').reduce((sum, g) => sum + (g.guestCount || 1), 0);
      const totalDeclined = guests.filter((g) => g.attending === 'no').length;
      const totalMaybe = guests.filter((g) => g.attending === 'maybe').length;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Total Responses: ${guests.length}  |  Attending Guests: ${totalAttending}  |  Declined: ${totalDeclined}  |  Unsure: ${totalMaybe}`,
        14,
        36
      );

      // Table Header
      let y = 46;
      doc.setFillColor(220, 232, 228);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(38, 52, 60);
      doc.text('Name', 16, y);
      doc.text('Phone', 65, y);
      doc.text('Status', 105, y);
      doc.text('Count', 135, y);
      doc.text('Notes / Wishes', 150, y);

      y += 8;
      doc.setFont('helvetica', 'normal');

      // Table Rows
      guests.forEach((g) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }

        const statusLabel = g.attending === 'yes' ? 'Attending' : g.attending === 'no' ? 'Declined' : 'Maybe';
        doc.text(g.name || 'Anonymous', 16, y);
        doc.text(g.phone || 'N/A', 65, y);
        doc.text(statusLabel, 105, y);
        doc.text(String(g.guestCount || 1), 138, y);
        doc.text((g.message || '').slice(0, 24), 150, y);

        y += 7;
      });

      doc.save(`${activeInvitation?.slug || 'wedding'}_guest_list.pdf`);
      showToast('Luxury PDF guest list generated!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Could not generate PDF', 'error');
    }
  };

  const handleCopyLink = () => {
    if (!activeInvitation) return;
    const url = `${window.location.origin}/i/${activeInvitation.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Public invitation link copied!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // If user is not logged in, show Client Login
  if (!currentUser) {
    return <ClientLogin />;
  }

  // Calculated Stats
  const attendingGuestsCount = guests
    .filter((g) => g.attending === 'yes')
    .reduce((sum, g) => sum + (g.guestCount || 1), 0);
  const declinedCount = guests.filter((g) => g.attending === 'no').length;
  const maybeCount = guests.filter((g) => g.attending === 'maybe').length;

  const filteredGuests = guests.filter((g) => {
    const matchesQuery = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      (g.email && g.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || g.attending === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F2F6F6] text-[#26343C] py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome & Account Bar */}
      <div className="bg-white rounded-3xl border border-[#DCE8E4] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center font-serif-brand font-bold text-lg">
            💌
          </div>
          <div>
            <h1 className="font-serif-brand text-xl sm:text-2xl text-[#26343C]">
              Couple RSVP & Guest Management
            </h1>
            <p className="text-xs text-[#26343C]/60 flex items-center gap-2">
              <span>Signed in as:</span>
              <strong className="text-[#5E8C84]">{currentUser.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => navigate('customize')}
            className="px-4 py-2 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 text-[#26343C] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#5E8C84]" />
            <span>Customize Suite</span>
          </button>

          <button
            onClick={async () => {
              await clientLogout();
              showToast('Signed out of Client Portal', 'info');
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Active Invitation & Public Link Card */}
      {activeInvitation && (
        <div className="bg-gradient-to-r from-[#5E8C84] to-[#4d756e] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activeInvitation.status === 'live' 
                  ? 'bg-emerald-400 text-emerald-950' 
                  : 'bg-amber-300 text-amber-950'
              }`}>
                {activeInvitation.status === 'live' ? 'Live & Active' : 'Pending Payment Confirmation'}
              </span>
              <span className="text-white/60 text-xs">·</span>
              <span className="text-white/80 text-xs font-sans">
                {activeInvitation.data?.eventDate || 'Date set'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif-brand font-medium">
              {activeInvitation.data?.groomName || 'Couple'} & {activeInvitation.data?.brideName || ''}
            </h2>

            <p className="text-xs text-white/80 font-sans">
              Public Link: <span className="font-mono text-emerald-200">mitinvitations.com/i/{activeInvitation.slug}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-white text-[#26343C] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Guest Link'}</span>
            </button>

            <button
              onClick={() => {
                navigate('invite', activeInvitation.slug);
              }}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Suite</span>
            </button>
          </div>
        </div>
      )}

      {/* RSVP Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attending Guests', count: attendingGuestsCount, icon: UserCheck, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Declined', count: declinedCount, icon: UserX, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
          { label: 'Unsure / Maybe', count: maybeCount, icon: HelpCircle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Total Parties', count: guests.length, icon: Users, color: 'text-[#5E8C84]', bg: 'bg-white border-[#DCE8E4]' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`p-5 rounded-3xl border shadow-xs ${stat.bg} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#26343C]/70">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-serif-brand font-bold ${stat.color}`}>
                {stat.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Guest Table & Management */}
      <div className="bg-white rounded-3xl border border-[#DCE8E4] shadow-xs p-6 space-y-6">
        
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'yes', 'no', 'maybe'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#5E8C84] text-white shadow-2xs'
                    : 'bg-[#F2F6F6] text-[#26343C]/70 hover:bg-[#DCE8E4]/50'
                }`}
              >
                {st === 'all' ? `All (${guests.length})` : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#26343C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guest or phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="p-2 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 text-[#26343C] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Export CSV for Excel (Supports Urdu)"
            >
              <Download className="w-3.5 h-3.5 text-[#5E8C84]" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPdf}
              className="p-2 bg-[#F2F6F6] hover:bg-[#DCE8E4]/50 text-[#26343C] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Export Luxury PDF Guest List"
            >
              <FileText className="w-3.5 h-3.5 text-[#5E8C84]" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Add Guest Manually */}
            <button
              onClick={() => {
                resetGuestForm();
                setEditingGuest(null);
                setIsAddGuestOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Guests Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#5E8C84] border-t-transparent animate-spin" />
            <p className="text-xs text-[#26343C]/60">Loading guest responses...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-[#5E8C84]/40 mx-auto" />
            <p className="font-serif-brand text-base text-[#26343C]">No Guest Responses Yet</p>
            <p className="text-xs text-[#26343C]/60 max-w-sm mx-auto">
              Share your custom link with your loved ones on WhatsApp. When they tap RSVP, their details will appear here in real time.
            </p>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-[#5E8C84] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Public Link</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2F6F6] text-[#26343C]/70 border-b border-[#DCE8E4]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Guest Name</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">RSVP Status</th>
                  <th className="py-3 px-4 font-semibold">Count</th>
                  <th className="py-3 px-4 font-semibold">Date Received</th>
                  <th className="py-3 px-4 font-semibold">Wishes / Note</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE8E4]">
                {filteredGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#26343C]">
                      {g.name}
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1 text-[#26343C]">
                        <Phone className="w-3 h-3 text-[#5E8C84]" />
                        <span>{g.phone}</span>
                      </div>
                      {g.email && (
                        <div className="flex items-center gap-1 text-[#26343C]/60 text-[11px]">
                          <Mail className="w-3 h-3" />
                          <span>{g.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.attending === 'yes'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.attending === 'no'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {g.attending === 'yes' ? 'Attending' : g.attending === 'no' ? 'Declined' : 'Maybe'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#26343C]">
                      {g.attending === 'yes' ? g.guestCount || 1 : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-[#26343C]/60 text-[11px]">
                      {new Date(g.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-[#26343C]/80 truncate" title={g.message} dir="auto">
                      {g.message || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditGuest(g)}
                          className="p-1.5 text-[#26343C]/60 hover:text-[#5E8C84] rounded-lg transition-colors cursor-pointer"
                          title="Edit response"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteGuestId(g.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Guest Modal */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#DCE8E4] shadow-xl p-6 sm:p-8 space-y-4">
            <h3 className="font-serif-brand text-xl text-[#26343C]">
              {editingGuest ? 'Edit Guest Response' : 'Add Guest Manually'}
            </h3>

            <form onSubmit={handleSaveGuestForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Liam Henderson"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="liam@example.com"
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  RSVP Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['yes', 'no', 'maybe'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setGuestAttending(st)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        guestAttending === st
                          ? 'bg-[#5E8C84] text-white border-[#5E8C84]'
                          : 'bg-[#F2F6F6] text-[#26343C] border-transparent'
                      }`}
                    >
                      {st === 'yes' ? 'Attending' : st === 'no' ? 'Declined' : 'Maybe'}
                    </button>
                  ))}
                </div>
              </div>

              {guestAttending === 'yes' && (
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Notes / Wishes (Supports Urdu)
                </label>
                <textarea
                  rows={2}
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder="Optional notes or dietary requirements..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F2F6F6] rounded-xl border border-transparent focus:border-[#5E8C84] outline-none"
                  dir="auto"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-4 py-2 bg-[#F2F6F6] text-[#26343C] rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5E8C84] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteGuestId)}
        title="Remove Guest Response"
        message="Are you sure you want to remove this guest from your RSVP list?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDeleteGuest}
        onCancel={() => setDeleteGuestId(null)}
      />

    </div>
  );
};
