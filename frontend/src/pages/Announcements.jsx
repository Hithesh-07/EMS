import { useState, useEffect } from 'react';
import api from '../api/axios';

const audienceConfig = {
  everyone: { label: 'Everyone', color: 'bg-emerald-100 text-emerald-700' },
  managers_admin: { label: 'Managers & Admin', color: 'bg-blue-100 text-blue-700' },
  admin_only: { label: 'Admin Only', color: 'bg-red-100 text-red-700' },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', audience: 'everyone', is_pinned: false });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/all');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      setError('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title) { setError('Title is required.'); return; }
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('message', form.message);
      fd.append('audience', form.audience);
      fd.append('is_pinned', form.is_pinned);
      if (file) fd.append('file', file);

      await api.post('/announcements', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Announcement posted successfully!');
      setForm({ title: '', message: '', audience: 'everyone', is_pinned: false });
      setFile(null);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.announcement_id !== id));
    } catch (err) {
      alert('Failed to delete announcement.');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await api.put(`/announcements/${id}/pin`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to toggle pin.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-3xl text-[#1a4fa0]">campaign</span>
        <div>
          <h1 className="text-2xl font-headline font-black text-slate-800">Announcements</h1>
          <p className="text-sm text-slate-500">Broadcast messages to staff with targeted audience control.</p>
        </div>
      </div>

      {/* Create Announcement Form */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 p-6">
        <h2 className="font-bold text-slate-700 mb-5 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#1a4fa0]">add_circle</span>
          Post New Announcement
        </h2>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-100">{success}</div>}

        <form onSubmit={handlePost} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#1a4fa0]/20 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
                placeholder="e.g. Salary Revision – April 2026"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audience *</label>
              <select
                value={form.audience}
                onChange={e => setForm({ ...form, audience: e.target.value })}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-[#1a4fa0]/20 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
              >
                <option value="everyone">Everyone</option>
                <option value="managers_admin">Managers & Admin Only</option>
                <option value="admin_only">Admin Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-[#1a4fa0]/20 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              placeholder="Write a detailed message here..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attachment (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  id="announcementFile"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={e => setFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-[#1a4fa0]/40 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">attach_file</span>
                  <span className="text-sm text-slate-500">{file ? file.name : 'Click to attach PDF, Excel, Image...'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-amber-50 border border-amber-100 w-full">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
                  className="w-5 h-5 accent-amber-500"
                />
                <div>
                  <p className="text-sm font-bold text-amber-700">📌 Pin this announcement</p>
                  <p className="text-[11px] text-amber-600">Pinned announcements always appear at the top</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting}
              className="flex items-center gap-2 bg-[#1a4fa0] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#00387e] transition-colors shadow-md disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">{posting ? 'progress_activity' : 'send'}</span>
              {posting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#1a4fa0]">history</span>
            All Announcements ({announcements.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
            <p className="text-slate-400 mt-2 font-medium">No announcements yet. Post your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {announcements.map(a => {
              const aud = audienceConfig[a.audience] || audienceConfig.everyone;
              return (
                <div key={a.announcement_id} className={`flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors ${a.is_pinned ? 'bg-amber-50/40' : ''}`}>
                  <div className="mt-1">
                    {a.is_pinned
                      ? <span className="material-symbols-outlined text-amber-500 text-xl">push_pin</span>
                      : <span className="material-symbols-outlined text-slate-300 text-xl">campaign</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm text-slate-800">{a.title}</p>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${aud.color}`}>{aud.label}</span>
                      {a.is_pinned && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pinned</span>}
                    </div>
                    {a.message && <p className="text-xs text-slate-500 mb-1 line-clamp-2">{a.message}</p>}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>By {a.posted_by_name || 'Admin'}</span>
                      <span>{formatDate(a.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">mark_email_read</span>
                        {a.read_count} read
                      </span>
                      {a.file_name && (
                        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${a.file_url}`}
                           target="_blank" rel="noreferrer"
                           className="flex items-center gap-1 text-[#1a4fa0] font-bold hover:underline">
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          {a.file_name}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePin(a.announcement_id)}
                      title={a.is_pinned ? 'Unpin' : 'Pin'}
                      className={`p-2 rounded-lg transition-colors ${a.is_pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">push_pin</span>
                    </button>
                    <button
                      onClick={() => handleDelete(a.announcement_id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
