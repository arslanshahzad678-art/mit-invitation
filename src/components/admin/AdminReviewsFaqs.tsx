import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Review, FAQItem } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { Plus, Edit, Trash2, Star, HelpCircle, MessageSquare, X } from 'lucide-react';

export const AdminReviewsFaqs: React.FC = () => {
  const { reviews, faqs, saveReview, deleteReview, saveFAQ, deleteFAQ } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'faqs'>('reviews');

  // Review states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  const [revAuthor, setRevAuthor] = useState('');
  const [revLocation, setRevLocation] = useState('');
  const [revEventType, setRevEventType] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  // FAQ states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);

  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('');

  // Review handlers
  const openAddReview = () => {
    setEditingReview(null);
    setRevAuthor('');
    setRevLocation('');
    setRevEventType('Wedding Celebration');
    setRevRating(5);
    setRevComment('');
    setIsReviewModalOpen(true);
  };

  const openEditReview = (r: Review) => {
    setEditingReview(r);
    setRevAuthor(r.author);
    setRevLocation(r.location || '');
    setRevEventType(r.eventType);
    setRevRating(r.rating);
    setRevComment(r.comment);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revAuthor.trim() || !revComment.trim()) return;

    const reviewData: Review = {
      id: editingReview?.id || 'rev-' + Date.now(),
      author: revAuthor,
      location: revLocation,
      eventType: revEventType,
      rating: revRating,
      comment: revComment,
      date: editingReview?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: true,
    };

    saveReview(reviewData);
    setIsReviewModalOpen(false);
  };

  // FAQ handlers
  const openAddFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('General');
    setIsFaqModalOpen(true);
  };

  const openEditFaq = (f: FAQItem) => {
    setEditingFaq(f);
    setFaqQuestion(f.question);
    setFaqAnswer(f.answer);
    setFaqCategory(f.category);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    const faqData: FAQItem = {
      id: editingFaq?.id || 'faq-' + Date.now(),
      question: faqQuestion,
      answer: faqAnswer,
      category: faqCategory || 'General',
      order: editingFaq?.order || faqs.length + 1,
    };

    saveFAQ(faqData);
    setIsFaqModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Subtab navigation */}
      <div className="flex items-center justify-between border-b border-[#DCE8E4] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'reviews'
                ? 'bg-[#5E8C84] text-white shadow-xs'
                : 'text-[#26343C]/70 hover:text-[#26343C] bg-white border border-[#DCE8E4]'
            }`}
          >
            Client Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveSubTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'faqs'
                ? 'bg-[#5E8C84] text-white shadow-xs'
                : 'text-[#26343C]/70 hover:text-[#26343C] bg-white border border-[#DCE8E4]'
            }`}
          >
            Store FAQs ({faqs.length})
          </button>
        </div>

        {activeSubTab === 'reviews' ? (
          <button
            onClick={openAddReview}
            className="px-4 py-2 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Review</span>
          </button>
        ) : (
          <button
            onClick={openAddFaq}
            className="px-4 py-2 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        )}
      </div>

      {/* REVIEWS LIST */}
      {activeSubTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#26343C]/50">{rev.date}</span>
                </div>

                <p className="text-xs text-[#26343C]/80 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                <div>
                  <h4 className="text-xs font-semibold text-[#26343C]">{rev.author}</h4>
                  <p className="text-[11px] text-[#5E8C84]">{rev.eventType} {rev.location && `· ${rev.location}`}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditReview(rev)}
                  className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] rounded-lg transition-colors"
                  title="Edit Review"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReviewToDelete(rev)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQS LIST */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-5 bg-white rounded-2xl border border-[#DCE8E4] shadow-xs flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-semibold text-[#5E8C84] uppercase tracking-wider">
                  {faq.category}
                </span>
                <h4 className="text-sm font-semibold text-[#26343C]">
                  {faq.question}
                </h4>
                <p className="text-xs text-[#26343C]/75 leading-relaxed">
                  {faq.answer}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pt-1">
                <button
                  onClick={() => openEditFaq(faq)}
                  className="p-1.5 text-[#26343C]/70 hover:text-[#5E8C84] rounded-lg transition-colors"
                  title="Edit FAQ"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFaqToDelete(faq)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif-brand font-semibold text-[#26343C] mb-4">
              {editingReview ? 'Edit Review' : 'Add Client Review'}
            </h3>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Author Name(s) *
                </label>
                <input
                  type="text"
                  required
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  placeholder="e.g. Claire & Thomas"
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={revEventType}
                    onChange={(e) => setRevEventType(e.target.value)}
                    placeholder="e.g. Wedding Suite"
                    className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#26343C] mb-1">
                    Star Rating (1-5)
                  </label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={revLocation}
                  onChange={(e) => setRevLocation(e.target.value)}
                  placeholder="e.g. Florence, Italy"
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Review Testimonial Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="What the client shared..."
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#26343C]/70 hover:text-[#26343C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsFaqModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif-brand font-semibold text-[#26343C] mb-4">
              {editingFaq ? 'Edit FAQ Item' : 'Add FAQ Item'}
            </h3>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder="e.g. Delivery & Formats"
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I send the invitation to guests?"
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Detailed answer explanation..."
                  className="w-full px-3 py-2 bg-white border border-[#DCE8E4] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#26343C]/70 hover:text-[#26343C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Review Confirm */}
      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Delete Review"
        message={`Are you sure you want to delete the review by "${reviewToDelete?.author}"?`}
        confirmLabel="Delete Review"
        onConfirm={() => {
          if (reviewToDelete) {
            deleteReview(reviewToDelete.id);
            setReviewToDelete(null);
          }
        }}
        onCancel={() => setReviewToDelete(null)}
      />

      {/* Delete FAQ Confirm */}
      <ConfirmModal
        isOpen={!!faqToDelete}
        title="Delete FAQ Item"
        message={`Are you sure you want to delete the FAQ question: "${faqToDelete?.question}"?`}
        confirmLabel="Delete FAQ"
        onConfirm={() => {
          if (faqToDelete) {
            deleteFAQ(faqToDelete.id);
            setFaqToDelete(null);
          }
        }}
        onCancel={() => setFaqToDelete(null)}
      />
    </div>
  );
};
