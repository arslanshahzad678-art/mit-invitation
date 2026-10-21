import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { Plus, Edit, Trash2, Folder, X, Layers } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, products, saveCategory, deleteCategory, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat: Category = {
      id: editingCategory?.id || 'cat-' + Date.now(),
      name,
      slug,
      description,
    };

    saveCategory(cat);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif-brand text-[#26343C]">
            Categories ({categories.length})
          </h2>
          <p className="text-xs text-[#26343C]/70">
            Organize invitation templates by occasion and event genre.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
                    <Folder className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#5E8C84] px-2.5 py-1 bg-[#DCE8E4]/50 rounded-full">
                    {productCount} {productCount === 1 ? 'Suite' : 'Suites'}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#26343C]/70 mt-1 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 text-[#26343C]/70 hover:text-[#5E8C84] hover:bg-[#DCE8E4]/50 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#F2F6F6] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DCE8E4] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#26343C]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif-brand font-semibold text-[#26343C] mb-4">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weddings & Elopements"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343C] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note describing what templates fit here..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE8E4] rounded-xl text-xs text-[#26343C] focus:outline-none focus:border-[#5E8C84]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#26343C]/70 hover:text-[#26343C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? Products in this category will become uncategorized.`}
        confirmLabel="Delete Category"
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
          }
        }}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
