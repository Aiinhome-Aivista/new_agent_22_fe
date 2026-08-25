import { useState, useEffect, useRef } from 'react';
import { getStandards, saveStandard, uploadStandard, parseFileContent, deleteStandard } from '../api/api';
import Loader from '../components/Loader';
import { DocumentTextIcon, PlusIcon, TrashIcon, ArrowUpTrayIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';

export default function StandardsPage() {
  const { user } = useAuth();
  const { currentTrack, currentProject } = useProject();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('standards');
  
  const [manualForm, setManualForm] = useState({ filename: '', folder: 'standards', content: '' });
  const [uploadForm, setUploadForm] = useState({ filename: '', folder: 'standards', content: '' });
  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [uploadedFileStatus, setUploadedFileStatus] = useState(null);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [isSavingUploaded, setIsSavingUploaded] = useState(false);
  const [modalNotice, setModalNotice] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showNotice = (title, message, type = 'warning') => {
    setModalNotice({ title, message, type });
  };

  const tabs = [
    { id: 'standards', label: 'Architecture Standards' },
    { id: 'validation_rules', label: 'Validation Rules' },
    { id: 'sample_scripts', label: 'Sample Scripts' }
  ];

  const fetchStandards = (selectFirst = true, tabToSelect = activeTab) => {
    setLoading(true);
    getStandards(currentTrack?.id).then(res => {
      const list = res.data || [];
      setStandards(list);
      
      if (selectFirst) {
        const filteredList = list.filter(std => std.folder === tabToSelect);
        if (filteredList.length > 0) {
          setSelectedStandard(filteredList[0]);
        } else {
          setSelectedStandard(null);
        }
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStandards(true, activeTab);
  }, [currentTrack]);

  const handleTabChange = (tabId) => {
    if (isEditing) {
      setConfirmModal({
        title: "Discard Changes",
        message: "You have unsaved changes. Are you sure you want to discard them?",
        onConfirm: () => {
          setConfirmModal(null);
          setIsEditing(false);
          setActiveTab(tabId);
          const filteredList = standards.filter(std => std.folder === tabId);
          setSelectedStandard(filteredList.length > 0 ? filteredList[0] : null);
        }
      });
      return;
    }
    setActiveTab(tabId);
    const filteredList = standards.filter(std => std.folder === tabId);
    setSelectedStandard(filteredList.length > 0 ? filteredList[0] : null);
  };

  const getAuthorIdentifier = () => {
    return user?.id ? String(user.id) : '1';
  };

  const normalizeFilename = (name) => {
    let n = (name || '').trim();
    if (!n) return '';
    return n.toLowerCase().endsWith('.md') ? n.toLowerCase() : `${n.toLowerCase()}.md`;
  };

  const handleSaveManual = async () => {
    const targetFilename = manualForm.filename.trim();
    if (!targetFilename) {
      showNotice("Filename Required", "Please enter a valid filename before saving.", "warning");
      return;
    }

    const targetNorm = normalizeFilename(targetFilename);
    const tabLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;
    const duplicate = standards.find(std => 
      std.folder === activeTab && 
      normalizeFilename(std.filename) === targetNorm &&
      (!selectedStandard || std.id !== selectedStandard.id)
    );

    if (duplicate) {
      showNotice(
        "Duplicate Filename Error", 
        `A file named "${duplicate.filename}" already exists in ${tabLabel}.\n\nPlease choose a unique filename.`, 
        "warning"
      );
      return;
    }

    setIsSavingManual(true);
    try {
      const res = await saveStandard({ 
        filename: targetFilename,
        folder: activeTab,
        content: manualForm.content,
        created_by: getAuthorIdentifier(),
        track_id: currentTrack?.id ? parseInt(currentTrack.id, 10) : null,
        is_edit: !!selectedStandard
      });

      if (res && res.success === false) {
        showNotice("Duplicate Filename Error", res.message || "A file with this name already exists.", "warning");
        return;
      }

      setIsEditing(false);
      fetchStandards(true, activeTab);
    } catch (err) {
      console.error("Save manual error:", err);
      const errMsg = err?.response?.data?.message || "Failed to save standard due to duplicate filename or server error.";
      showNotice("Save Error", errMsg, "error");
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleSaveUploaded = async () => {
    const targetFilename = uploadForm.filename.trim();
    if (!targetFilename) {
      showNotice("File Required", "Please upload file(s) or specify a filename.", "warning");
      return;
    }

    const targetNorm = normalizeFilename(targetFilename);
    const tabLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;
    const duplicate = standards.find(std => 
      std.folder === activeTab && 
      normalizeFilename(std.filename) === targetNorm &&
      (!selectedStandard || std.id !== selectedStandard.id)
    );

    if (duplicate) {
      showNotice(
        "Duplicate Filename Error", 
        `A file named "${duplicate.filename}" already exists in ${tabLabel}.\n\nPlease choose a unique filename.`, 
        "warning"
      );
      return;
    }

    setIsSavingUploaded(true);
    const trackIdVal = currentTrack?.id ? parseInt(currentTrack.id, 10) : null;
    
    try {
      if (extractedItems.length > 1 && uploadForm.filename.startsWith('batch_upload_')) {
        for (const item of extractedItems) {
          const itemNorm = normalizeFilename(item.filename);
          const batchDup = standards.find(std => std.folder === activeTab && normalizeFilename(std.filename) === itemNorm);
          if (batchDup) {
            showNotice(
              "Duplicate Filename Error", 
              `File "${batchDup.filename}" already exists in ${tabLabel}.\n\nPlease remove or rename duplicate files before saving.`, 
              "warning"
            );
            setIsSavingUploaded(false);
            return;
          }
        }
        for (const item of extractedItems) {
          await saveStandard({
            filename: item.filename,
            folder: activeTab,
            content: item.content,
            created_by: getAuthorIdentifier(),
            track_id: trackIdVal,
            is_edit: false
          });
        }
      } else {
        const res = await saveStandard({ 
          filename: targetFilename,
          folder: activeTab,
          content: uploadForm.content,
          created_by: getAuthorIdentifier(),
          track_id: trackIdVal,
          is_edit: !!selectedStandard
        });

        if (res && res.success === false) {
          showNotice("Duplicate Filename Error", res.message || "A file with this name already exists.", "warning");
          return;
        }
      }
      setIsEditing(false);
      fetchStandards(true, activeTab);
    } catch (err) {
      console.error("Save uploaded error:", err);
      const errMsg = err?.response?.data?.message || "Failed to save uploaded standard due to duplicate filename or server error.";
      showNotice("Save Error", errMsg, "error");
    } finally {
      setIsSavingUploaded(false);
    }
  };

  const handleFileSelectedForUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedUploadFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newUnique = files.filter(f => !existingNames.has(f.name));
      return [...prev, ...newUnique];
    });
    setIsExtracted(false);
    setExtractedItems([]);
    setUploadForm({ filename: '', folder: activeTab, content: '' });
    setUploadedFileStatus(null);
  };

  const handleRemoveSingleFile = (index) => {
    const updated = selectedUploadFiles.filter((_, i) => i !== index);
    setSelectedUploadFiles(updated);
    if (updated.length === 0) {
      setIsExtracted(false);
      setExtractedItems([]);
      setUploadForm({ filename: '', folder: activeTab, content: '' });
      setUploadedFileStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearAllFiles = () => {
    setSelectedUploadFiles([]);
    setIsExtracted(false);
    setExtractedItems([]);
    setUploadForm({ filename: '', folder: activeTab, content: '' });
    setUploadedFileStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtractContent = async () => {
    if (selectedUploadFiles.length === 0) return;

    setIsExtracting(true);
    const formData = new FormData();
    selectedUploadFiles.forEach(file => {
      formData.append('file', file);
    });

    try {
      const res = await parseFileContent(formData);
      if (res.success) {
        setUploadForm({
          filename: res.filename || 'extracted_standard.md',
          folder: activeTab,
          content: res.content || ''
        });
        setExtractedItems(res.items || []);
        setIsExtracted(true);
        if (res.count > 1) {
          setUploadedFileStatus(`Extracted content from ${res.count} files. Unlocked for review & edit.`);
        } else {
          setUploadedFileStatus(`Extracted content & filename from "${selectedUploadFiles[0].name}". Fields are now unlocked for review & edit.`);
        }
      } else {
        alert(res.message || 'Failed to extract content from files.');
      }
    } catch (err) {
      console.error("Extraction error:", err);
      alert("Failed to extract content from files.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      title: "Delete File",
      message: "Are you sure you want to delete this file? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(null);
        await deleteStandard(id);
        fetchStandards(true, activeTab);
      }
    });
  };

  const openNew = () => {
    const defaultContent = activeTab === 'validation_rules' 
      ? '# New Validation Rule\n\nExplain the rule here.'
      : (activeTab === 'sample_scripts' ? '// New Sample Script\n\n' : '# New Architecture Standard\n\nExplain the rules here...');

    setManualForm({ filename: '', folder: activeTab, content: defaultContent });
    setUploadForm({ filename: '', folder: activeTab, content: '' });
    setSelectedUploadFiles([]);
    setExtractedItems([]);
    setIsExtracted(false);
    setUploadedFileStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsEditing(true);
    setSelectedStandard(null);
  };

  const openEdit = (std) => {
    setManualForm({ filename: std.filename, folder: std.folder, content: std.content });
    setUploadForm({ filename: '', folder: std.folder, content: '' });
    setSelectedUploadFiles([]);
    setExtractedItems([]);
    setUploadedFileStatus(null);
    setIsEditing(true);
  };

  if (loading) return <Loader />;

  const filteredStandards = standards.filter(std => std.folder === activeTab);

  return (
    <div className="animate-fade-in-up flex flex-col h-full">
      <div className="mb-4 flex flex-col px-6 pt-6 gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-sidebar tracking-tight">
              {activeTab === 'standards' ? 'Architecture Standards' : activeTab === 'validation_rules' ? 'Validation Rules' : 'Sample Scripts'}
            </h1>
            <p className="text-text-secondary mt-1">
              {activeTab === 'standards' && 'Manage blueprint generation rules and architectural design standards.'}
              {activeTab === 'validation_rules' && 'Manage automated code validation rules and compliance checks.'}
              {activeTab === 'sample_scripts' && 'Manage sample code generation scripts and reusable pattern templates.'}
            </p>
          </div>
          {!isEditing ? (
            <button onClick={openNew} className="flex items-center gap-2 bg-primary-orange text-white px-5 py-2.5 rounded-lg font-bold hover:bg-hover-orange transition-colors shadow-md shadow-orange-500/20">
              <PlusIcon className="w-5 h-5" /> Add / Upload File
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
              ← Back to List
            </button>
          )}
        </div>

        {/* Tabs */}
        {!isEditing && (
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-orange text-primary-orange' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
        {isEditing ? (
          /* Side-by-Side Dual Screen View */
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pr-1">
            
            {/* LEFT SIDE: Manual File Creation */}
            <div className={`bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all ${selectedUploadFiles.length > 0 ? 'opacity-60' : ''}`}>
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary-orange flex items-center justify-center font-bold">📝</div>
                  <div>
                    <h3 className="font-extrabold text-sidebar text-base">Create Manually</h3>
                    <p className="text-xs text-gray-500">
                      {selectedUploadFiles.length > 0 ? '🔒 Blocked - File(s) selected on right panel.' : 'Type filename and content manually to save.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Filename</label>
                    <input 
                      type="text" 
                      disabled={selectedUploadFiles.length > 0}
                      value={manualForm.filename} 
                      onChange={e => setManualForm({...manualForm, filename: e.target.value})} 
                      className={`w-full border rounded-lg p-2.5 text-sm outline-none font-semibold shadow-sm transition-all ${selectedUploadFiles.length > 0 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-sidebar hover:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange'}`} 
                      placeholder={selectedUploadFiles.length > 0 ? "🔒 Blocked (File selected on right)" : "e.g. custom_rule.md"} 
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Folder (Tab)</label>
                    <input 
                      type="text" 
                      value={tabs.find(t => t.id === manualForm.folder)?.label || manualForm.folder} 
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 font-bold truncate"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Content</label>
                  <textarea 
                    rows={14}
                    disabled={selectedUploadFiles.length > 0}
                    value={manualForm.content} 
                    onChange={e => setManualForm({...manualForm, content: e.target.value})} 
                    className={`w-full border rounded-xl p-4 font-mono text-xs outline-none transition-all resize-none shadow-sm ${selectedUploadFiles.length > 0 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-sidebar hover:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange'}`} 
                    placeholder={selectedUploadFiles.length > 0 ? "🔒 Blocked (Remove selected file(s) on right to unlock manual creation)..." : "Type rules or script logic here..."}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button 
                  onClick={handleSaveManual} 
                  disabled={isSavingManual || selectedUploadFiles.length > 0 || !manualForm.filename.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary-orange text-white rounded-lg text-xs font-bold hover:bg-hover-orange transition-colors shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingManual ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Direct File Upload & Auto-fill */}
            <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary-orange flex items-center justify-center font-bold">📤</div>
                    <div>
                      <h3 className="font-extrabold text-sidebar text-base">Upload File & Extract</h3>
                      <p className="text-xs text-gray-500">Choose single or multiple files, then click Extract.</p>
                    </div>
                  </div>

                  {/* Upload Trigger Input */}
                  <input 
                    type="file" 
                    multiple
                    ref={fileInputRef} 
                    onChange={handleFileSelectedForUpload} 
                    className="hidden" 
                    accept=".md,.txt,.json,.yaml,.yml,.java,.py,.js,.sql,.properties,.pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-1.5 bg-white text-sidebar border border-gray-300 px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-50 hover:border-primary-orange hover:text-primary-orange transition-colors shadow-sm"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4 text-primary-orange" />
                    {selectedUploadFiles.length > 0 ? '+ Add More Files' : 'Choose Files'}
                  </button>
                </div>

                {/* Selected Files Badge & Extract Button */}
                {selectedUploadFiles.length > 0 ? (
                  <div className="mb-4 p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-orange-200/60 pb-2">
                      <span className="text-xs font-extrabold text-sidebar flex items-center gap-1.5">
                        <DocumentTextIcon className="w-4 h-4 text-primary-orange" />
                        Selected Files ({selectedUploadFiles.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleExtractContent}
                          disabled={isExtracting}
                          className="flex items-center gap-1.5 bg-primary-orange text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-hover-orange transition-colors shadow-sm disabled:opacity-50"
                        >
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {isExtracting ? 'Extracting...' : `⚡ Extract ${selectedUploadFiles.length > 1 ? 'All' : ''} Content`}
                        </button>
                        <button 
                          onClick={handleClearAllFiles}
                          title="Clear all files"
                          className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {selectedUploadFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-100 text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="text-gray-400 font-mono text-[10px]">{idx + 1}.</span>
                            <span className="font-bold text-sidebar truncate">{file.name}</span>
                            <span className="text-[10px] text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveSingleFile(idx)}
                            title="Remove this file"
                            className="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-gray-100"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs text-gray-500 text-center font-medium">
                    Click <strong>"Choose Files"</strong> above to select one or multiple files from your computer.
                  </div>
                )}

                {/* File Status Alert */}
                {uploadedFileStatus && (
                  <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-2">
                    <span>✅</span> {uploadedFileStatus}
                  </div>
                )}

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Filename</label>
                    <input 
                      type="text" 
                      disabled={!isExtracted}
                      value={uploadForm.filename} 
                      onChange={e => setUploadForm({...uploadForm, filename: e.target.value})} 
                      className={`w-full border rounded-lg p-2.5 text-sm outline-none font-semibold shadow-sm transition-all ${!isExtracted ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-sidebar hover:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange'}`} 
                      placeholder={!isExtracted ? "Click Extract above to unlock & pre-fill filename" : "Enter or edit filename"} 
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Folder (Tab)</label>
                    <input 
                      type="text" 
                      value={tabs.find(t => t.id === uploadForm.folder)?.label || uploadForm.folder} 
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500 font-bold truncate"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Content</label>
                  <textarea 
                    rows={14}
                    disabled={!isExtracted}
                    value={uploadForm.content} 
                    onChange={e => setUploadForm({...uploadForm, content: e.target.value})} 
                    className={`w-full border rounded-xl p-4 font-mono text-xs outline-none transition-all resize-none shadow-sm ${!isExtracted ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-sidebar hover:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange'}`} 
                    placeholder={!isExtracted ? "Choose a file above and click Extract to populate and unlock content..." : "Type or edit content..."}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button 
                  onClick={handleSaveUploaded} 
                  disabled={isSavingUploaded || !isExtracted || !uploadForm.filename.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-primary-orange text-white rounded-lg text-xs font-bold hover:bg-hover-orange transition-colors shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingUploaded ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Normal List & Detail Viewer Mode */
          <>
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border border-border-light rounded-xl overflow-y-auto p-4 flex flex-col gap-3 shadow-sm">
              {filteredStandards.map(std => (
                <div 
                  key={std.id}
                  onClick={() => setSelectedStandard(std)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${selectedStandard?.id === std.id ? 'border-primary-orange bg-orange-50' : 'border-border-light hover:border-gray-300 bg-gray-50'}`}
                >
                  <DocumentTextIcon className="w-6 h-6 text-gray-400 mt-1" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{std.filename}</h4>
                  </div>
                </div>
              ))}
              {filteredStandards.length === 0 && <p className="text-gray-500 text-sm text-center mt-4">No files found.</p>}
            </div>

            {/* Detail View */}
            <div className="w-2/3 bg-white border border-border-light rounded-xl shadow-sm p-6 flex flex-col">
              {selectedStandard ? (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{selectedStandard.filename}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{selectedStandard.folder.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(selectedStandard)} className="px-3 py-1.5 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(selectedStandard.id)} className="p-1.5 border border-red-200 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto prose prose-sm max-w-none prose-headings:font-bold">
                    <pre className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap text-gray-700 border border-gray-100">{selectedStandard.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <DocumentTextIcon className="w-16 h-16 mb-4 opacity-50" />
                  <p>Select a file to view or edit</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Custom UI Popup Modal Notice */}
      {modalNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center transform transition-all scale-100">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-sm ${
              modalNotice.type === 'error' 
                ? 'bg-red-50 text-red-500 border border-red-100' 
                : 'bg-amber-50 text-amber-500 border border-amber-100'
            }`}>
              {modalNotice.type === 'error' ? '❌' : '⚠️'}
            </div>
            <h3 className="text-base font-extrabold text-sidebar mb-2">{modalNotice.title}</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed whitespace-pre-line font-medium">{modalNotice.message}</p>
            <button 
              onClick={() => setModalNotice(null)}
              className="w-full py-2.5 bg-primary-orange text-white rounded-xl text-xs font-bold hover:bg-hover-orange transition-colors shadow-md shadow-orange-500/20"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Custom UI Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center transform transition-all scale-100">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-sm bg-red-50 text-red-500 border border-red-100">
              ⚠️
            </div>
            <h3 className="text-base font-extrabold text-sidebar mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed whitespace-pre-line font-medium">{confirmModal.message}</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
