import React, { useState, useRef } from 'react';
import { useBakeryDatabase, UnifiedHeroVideo } from '../../context/DatabaseContext';
import { 
  Plus, 
  Trash2, 
  X, 
  Video, 
  Upload, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Film,
  Edit3
} from 'lucide-react';

export const VideoManager: React.FC = () => {
  const { 
    heroVideos, 
    saveHeroVideo, 
    deleteHeroVideo, 
    reorderHeroVideos 
  } = useBakeryDatabase();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<UnifiedHeroVideo | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayPriority, setDisplayPriority] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Sorted active & inactive videos
  const videos = [...heroVideos].sort((a, b) => (a.displayPriority || 99) - (b.displayPriority || 99));

  const handleOpenAdd = () => {
    setTitle('');
    setVideoUrl('/Like_this_make_and_give_the_.mp4');
    setIsActive(true);
    setDisplayPriority(videos.length + 1);
    setShowAddForm(true);
  };

  const handleOpenEdit = (v: UnifiedHeroVideo) => {
    setCurrentVideo(v);
    setTitle(v.title || '');
    setVideoUrl(v.videoUrl);
    setIsActive(v.isActive);
    setDisplayPriority(v.displayPriority || 99);
    setIsEditOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditForm = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .webm, .mov)');
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    if (isEditForm) {
      setVideoUrl(blobUrl);
    } else {
      setVideoUrl(blobUrl);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    saveHeroVideo({
      id: `v-${Date.now()}`,
      title: title || `Video #${videos.length + 1}`,
      videoUrl,
      isActive,
      displayPriority: Number(displayPriority) || videos.length + 1
    });

    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVideo || !videoUrl) return;

    saveHeroVideo({
      ...currentVideo,
      title: title || currentVideo.title,
      videoUrl,
      isActive,
      displayPriority: Number(displayPriority)
    });

    setIsEditOpen(false);
    setCurrentVideo(null);
  };

  const handleToggleActive = (v: UnifiedHeroVideo) => {
    saveHeroVideo({
      ...v,
      isActive: !v.isActive
    });
  };

  const handleMovePriority = (v: UnifiedHeroVideo, direction: 'up' | 'down') => {
    const idx = videos.findIndex(item => item.id === v.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= videos.length) return;

    const updated = [...videos];
    const itemToMove = updated[idx];
    updated.splice(idx, 1);
    updated.splice(swapIdx, 0, itemToMove);

    reorderHeroVideos(updated);
  };

  return (
    <div className="space-y-6 select-none pb-12">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#2C1A17]/10 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2C1A17]">Homepage Background Videos</h2>
          <p className="text-xs text-[#2C1A17]/65 mt-1">
            Add and manage background videos. Active videos play sequentially <span className="font-bold text-brand-gold-800">one after another</span> in order on the homepage!
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-gold-850 hover:bg-brand-gold-700 text-[#1E110F] font-bold text-xs rounded-xl shadow-sm transition-all border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Background Video</span>
          </button>
        )}
      </div>

      {/* Add New Video Form Container */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#2C1A17]/5 pb-3">
            <span className="text-xs font-bold text-[#2C1A17]/70 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-gold-800" />
              <span>Add New Background Video</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[#2C1A17]/40 hover:text-[#2C1A17] text-xs font-semibold cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Video Title / Label</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Bakery Oven Cake Making"
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Display Sequence Position</label>
              <input
                type="number"
                min={1}
                value={displayPriority}
                onChange={(e) => setDisplayPriority(Number(e.target.value))}
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Video Input & Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Video URL or Choose File</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="/Like_this_make_and_give_the_.mp4 or https://..."
                className="flex-1 bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none font-mono"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e, false)}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF6F0] hover:bg-brand-gold-50 border border-[#2C1A17]/15 text-[#2C1A17] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-brand-gold-800" />
                <span>Upload File</span>
              </button>
            </div>
          </div>

          {/* Preview player */}
          {videoUrl && (
            <div className="relative rounded-xl overflow-hidden border border-[#2C1A17]/10 bg-black aspect-video max-h-48 w-full">
              <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            </div>
          )}

          {/* Active Switch & Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2C1A17]/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-brand-gold-800 focus:ring-brand-gold-500 border-gray-300"
              />
              <span className="text-xs font-bold text-[#2C1A17]">Active in Video Sequence</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-[#2C1A17]/10 text-xs font-bold text-[#2C1A17] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1E110F] text-[#FAF6F0] font-bold text-xs hover:bg-brand-brown-900 cursor-pointer shadow-sm"
              >
                Save Background Video
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid of Background Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v, idx) => (
          <div
            key={v.id}
            className={`bg-white border border-[#2C1A17]/10 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
              !v.isActive ? 'opacity-65 grayscale-[30%]' : ''
            }`}
          >
            {/* Video Player Box */}
            <div className="relative aspect-video bg-black overflow-hidden border-b border-[#2C1A17]/10">
              <video
                key={v.videoUrl}
                src={v.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Sequence Order Badge */}
              <div className="absolute top-2 left-2 bg-[#1E110F]/85 text-brand-gold-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-xs shadow">
                Sequence #{v.displayPriority || idx + 1}
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full tracking-wider uppercase shadow-xs border ${
                  v.isActive 
                    ? 'bg-emerald-500 text-white border-emerald-600' 
                    : 'bg-slate-700 text-slate-200 border-slate-600'
                }`}>
                  {v.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Info & Action Controls */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-playfair font-bold text-[#2C1A17] text-sm truncate">
                  {v.title || `Background Video #${v.displayPriority}`}
                </h3>
                <p className="text-[10px] text-[#2C1A17]/50 font-mono truncate mt-0.5">
                  {v.videoUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#2C1A17]/5">
                
                {/* Row 1: Active Toggle + Sequence Arrows */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border flex-1 justify-center ${
                      v.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {v.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{v.isActive ? 'Active' : 'Disabled'}</span>
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMovePriority(v, 'up')}
                      disabled={idx === 0}
                      title="Move earlier in sequence"
                      className="p-1.5 rounded-lg border border-[#2C1A17]/10 text-[#2C1A17]/70 hover:bg-brand-gold-50 disabled:opacity-30 cursor-pointer bg-white"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovePriority(v, 'down')}
                      disabled={idx === videos.length - 1}
                      title="Move later in sequence"
                      className="p-1.5 rounded-lg border border-[#2C1A17]/10 text-[#2C1A17]/70 hover:bg-brand-gold-50 disabled:opacity-30 cursor-pointer bg-white"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Edit + Delete */}
                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2C1A17]/10 text-[#2C1A17] hover:bg-gray-50 text-xs font-bold cursor-pointer bg-white"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-gold-800" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete video "${v.title}"?`)) {
                        deleteHeroVideo(v.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2C1A17]/10 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}

        {videos.length === 0 && !showAddForm && (
          <div className="col-span-full py-16 bg-white border border-[#2C1A17]/10 rounded-2xl text-center text-[#2C1A17]/40 font-medium">
            <Video className="w-12 h-12 mx-auto text-[#2C1A17]/20 mb-2" />
            <span>No background videos added yet. Click "Add Background Video" above to get started.</span>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && currentVideo && (
        <div className="fixed inset-0 z-50 bg-[#1E110F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white border border-[#2C1A17]/10 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C1A17]/5 pb-3">
              <h3 className="font-playfair text-base font-bold text-[#2C1A17]">Edit Background Video</h3>
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setCurrentVideo(null); }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C1A17]/70 uppercase block">Video URL or File</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-brand-gold-500 rounded-xl py-2.5 px-3 text-xs font-semibold font-mono"
                  />
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={(e) => handleFileUpload(e, true)}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-2 bg-[#FAF6F0] hover:bg-brand-gold-50 border border-[#2C1A17]/10 text-[#2C1A17] font-bold text-xs rounded-xl cursor-pointer shrink-0"
                  >
                    Upload
                  </button>
                </div>
              </div>

              {videoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#2C1A17]/10 bg-black aspect-video max-h-44 w-full">
                  <video src={videoUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-gold-800 focus:ring-brand-gold-500 border-gray-300"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-[#2C1A17] cursor-pointer">
                  Active in Video Sequence
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2C1A17]/5">
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setCurrentVideo(null); }}
                className="px-4 py-2 rounded-xl border border-[#2C1A17]/10 text-xs font-bold text-[#2C1A17] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1E110F] text-[#FAF6F0] font-bold text-xs hover:bg-brand-brown-900 cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
