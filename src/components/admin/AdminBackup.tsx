import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  FileDown, 
  FileUp, 
  RotateCcw, 
  Cloud, 
  CloudCheck, 
  CheckCircle2, 
  Database,
  RefreshCw,
  Info 
} from 'lucide-react';
import { firebaseConfig } from '../../config/firebase';

export const AdminBackup: React.FC = () => {
  const { 
    exportBackup, 
    importBackup, 
    resetAllData, 
    syncAllToCloud, 
    isCloudConnected, 
    showToast 
  } = useStore();

  const [importJsonText, setImportJsonText] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setIsImportConfirmOpen(true);
    };
    reader.readAsText(file);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmImport = async () => {
    if (!importJsonText) return;
    setIsProcessing(true);
    try {
      const success = await importBackup(importJsonText);
      if (success) {
        setImportJsonText('');
        setIsImportConfirmOpen(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      await syncAllToCloud();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-serif-brand text-[#26343C]">
          Cloud Firestore & Backup Management
        </h2>
        <p className="text-xs text-[#26343C]/70">
          Your invitation suites, orders, and studio settings are stored in Cloud Firestore and synchronized in real time across every browser and device.
        </p>
      </div>

      {/* Cloud Firestore Status Card */}
      <div className="p-6 bg-white rounded-3xl border border-[#5E8C84]/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-brand text-base font-semibold text-[#26343C]">
                  Google Cloud Firestore
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-[#26343C]/70 mt-0.5">
                Connected Project: <strong className="text-[#26343C]">{firebaseConfig.projectId}</strong> · Database: <span className="font-mono text-[11px] text-[#5E8C84]">{firebaseConfig.firestoreDatabaseId || 'default'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncToCloud}
            className="px-5 py-2.5 bg-[#5E8C84] hover:bg-[#4d756e] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Force Sync to Cloud'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="p-3 bg-[#F2F6F6] rounded-xl">
            <p className="text-[#26343C]/60 text-[11px]">Real-time Listeners</p>
            <p className="font-semibold text-[#26343C] mt-0.5">Enabled (Instant Updates)</p>
          </div>
          <div className="p-3 bg-[#F2F6F6] rounded-xl">
            <p className="text-[#26343C]/60 text-[11px]">Cloud Media Storage</p>
            <p className="font-semibold text-[#26343C] mt-0.5">Firebase Storage Active</p>
          </div>
          <div className="p-3 bg-[#F2F6F6] rounded-xl">
            <p className="text-[#26343C]/60 text-[11px]">Security Rules</p>
            <p className="font-semibold text-[#26343C] mt-0.5">Owner Access Restricted</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
              <FileDown className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
              Download Offline Snapshot
            </h3>
            <p className="text-xs text-[#26343C]/70 leading-relaxed">
              Downloads a complete JSON snapshot of all products, categories, homepage sections, testimonials, FAQs, design choices, and order records.
            </p>
          </div>

          <button
            type="button"
            onClick={exportBackup}
            className="w-full py-3 px-4 bg-[#5E8C84] hover:bg-[#4d756e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 bg-white rounded-3xl border border-[#DCE8E4] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8E4] text-[#5E8C84] flex items-center justify-center">
              <FileUp className="w-6 h-6" />
            </div>
            <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
              Restore from JSON File
            </h3>
            <p className="text-xs text-[#26343C]/70 leading-relaxed">
              Upload a previously exported JSON backup file to sync into your Cloud Firestore database.
            </p>
          </div>

          <label className="cursor-pointer w-full py-3 px-4 bg-white border border-[#5E8C84] text-[#5E8C84] hover:bg-[#5E8C84]/5 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <FileUp className="w-4 h-4" />
            <span>Select JSON File to Restore</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>

      </div>

      {/* Reset to Factory Defaults Card */}
      <div className="p-6 bg-white rounded-3xl border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif-brand text-lg font-semibold text-[#26343C]">
              Reset to Factory Sample Catalog
            </h3>
            <p className="text-xs text-[#26343C]/70 leading-relaxed max-w-xl">
              This will restore the starter template suites and default settings across Cloud Firestore and local storage.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Store Data</span>
          </button>
        </div>
      </div>

      {/* Cloud Architecture Notice */}
      <div className="p-6 bg-[#DCE8E4]/40 rounded-3xl border border-[#DCE8E4] space-y-3 text-xs text-[#26343C]">
        <div className="flex items-center gap-2 font-semibold text-[#5E8C84]">
          <Info className="w-4 h-4" />
          <span>Cross-Device Cloud Architecture</span>
        </div>
        <p className="leading-relaxed">
          All data in MIT Invitations is centralized in Google Cloud Firestore and Firebase Storage:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[#26343C]/80">
          <li>
            <strong>Universal Cloud Persistence:</strong> Any edits made to invitations, prices, categories, hero videos, or store contact settings in this admin panel are immediately published to Cloud Firestore. All visitors across desktop, tablet, and mobile instantly see your latest updates.
          </li>
          <li>
            <strong>Real-time Synchronization:</strong> Changes are streamed in real time without requiring manual browser refreshes.
          </li>
          <li>
            <strong>Role-Based Security:</strong> Strict Firestore Security Rules guarantee that only the authenticated administrator (<span className="font-mono text-[#5E8C84]">arslanshahzad678@gmail.com</span>) can modify products or view customer orders. Public visitors can safely browse published templates and submit order requests.
          </li>
        </ul>
      </div>

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Entire Store"
        message="Are you sure you want to restore the store to factory defaults in Cloud Firestore? All newly added products, customized sections, and customer orders will be reset."
        confirmLabel="Confirm Full Reset"
        onConfirm={async () => {
          await resetAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Import Confirmation */}
      <ConfirmModal
        isOpen={isImportConfirmOpen}
        title="Import Backup Data"
        message="Importing this JSON file will overwrite your existing products, categories, sections, design settings, and order history in Cloud Firestore. Proceed?"
        confirmLabel="Import and Overwrite"
        isDestructive={false}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setIsImportConfirmOpen(false);
          setImportJsonText('');
        }}
      />
    </div>
  );
};
