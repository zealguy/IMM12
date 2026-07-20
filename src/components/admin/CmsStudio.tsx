/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle, ArrowUpRight, BookOpen, Layers, 
  Settings, Undo, Eye, Download, Terminal, Plus, Trash, HelpCircle, AlertCircle
} from 'lucide-react';
import { CMSBlock, MarketingCampaign, INITIAL_CMS_BLOCKS } from './MockData';

interface CmsStudioProps {
  blogs?: any[];
  onAddBlog?: (blog: any) => void;
  onDeleteBlog?: (blogId: string) => void;
}

export default function CmsStudio({ blogs = [], onAddBlog, onDeleteBlog }: CmsStudioProps) {
  const [activeSubTab, setActiveSubTab] = useState<'cms' | 'blog'>('cms');

  // CMS page builder states
  const [blocks, setBlocks] = useState<CMSBlock[]>([...INITIAL_CMS_BLOCKS]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('cms-1');
  const [versionHistory, setVersionHistory] = useState<Array<{ version: number; date: string; author: string; title: string }>>([
    { version: 4, date: '2026-07-09 01:10', author: 'Benjamin Danso', title: 'IMMORTAL ELECTRONICS' },
    { version: 3, date: '2026-07-08 15:30', author: 'Isaac (Chief Tech)', title: 'IMMORTAL PLATINUM DIAGNOSTICS' },
    { version: 2, date: '2026-07-06 09:45', author: 'Sandra A.', title: 'IMMORTAL ELECTRONICS TRADING' }
  ]);

  // Block editor fields
  const activeBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];
  const [editorTitle, setEditorTitle] = useState(activeBlock?.title || '');
  const [editorSubtitle, setEditorSubtitle] = useState(activeBlock?.subtitle || '');
  const [editorContent, setEditorContent] = useState(activeBlock?.content || '');
  const [editorBgColor, setEditorBgColor] = useState(activeBlock?.backgroundColor || '#0F172A');

  // Sync editor fields on block switch
  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id);
    const target = blocks.find(b => b.id === id);
    if (target) {
      setEditorTitle(target.title);
      setEditorSubtitle(target.subtitle || '');
      setEditorContent(target.content);
      setEditorBgColor(target.backgroundColor);
    }
  };

  // Save changes and increment revision numbers
  const handleDeployCmsBlock = () => {
    setBlocks(prev => prev.map(b => {
      if (b.id === selectedBlockId) {
        const nextVer = b.version + 1;
        setVersionHistory(old => [
          { version: nextVer, date: new Date().toLocaleString(), author: 'Benjamin Danso (CEO)', title: editorTitle },
          ...old
        ]);
        return {
          ...b,
          title: editorTitle,
          subtitle: editorSubtitle,
          content: editorContent,
          backgroundColor: editorBgColor,
          version: nextVer,
          lastEditedBy: 'Benjamin Danso'
        };
      }
      return b;
    }));
  };

  // Snapshot rollbacks
  const handleRollback = (ver: number) => {
    const historicalAuthor = versionHistory.find(h => h.version === ver)?.author || 'System';
    const restoredTitle = versionHistory.find(h => h.version === ver)?.title || 'IMMORTAL ELECTRONICS';

    setEditorTitle(restoredTitle);
    setBlocks(prev => prev.map(b => {
      if (b.id === selectedBlockId) {
        return {
          ...b,
          title: restoredTitle,
          version: ver,
          lastEditedBy: historicalAuthor
        };
      }
      return b;
    }));
  };

  // Blog creation states
  const [blogTitle, setBlogTitle] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('Chief Technician Isaac');
  const [blogContent, setBlogContent] = useState('');
  const [blogTags, setBlogTags] = useState('Battery health, Repair tips, Accra');
  const [seoScore, setSeoScore] = useState(45);
  const [isBlogPublishing, setIsBlogPublishing] = useState(false);

  // AI copywriting advisor
  const [isAiWriting, setIsAiWriting] = useState(false);

  // Dynamic SEO scorer
  const handleBlogContentChange = (text: string) => {
    setBlogContent(text);
    let score = 45;
    if (text.length > 100) score += 15;
    if (text.length > 300) score += 20;
    if (blogTitle.length > 20) score += 10;
    if (blogTags.split(',').length >= 3) score += 10;
    setSeoScore(Math.min(100, score));
  };

  // Simulated AI writer tool
  const handleTriggerAiWriter = (mode: 'outline' | 'polish') => {
    if (!blogTitle) return;
    setIsAiWriting(true);
    setTimeout(() => {
      if (mode === 'outline') {
        setBlogContent(`### Introduction to ${blogTitle}\nBrief outline of device failures commonly observed in Accra's tropical climates.\n\n### Core Technical Insight\nDiagnostic step-by-step guidelines including board-level micro-soldering evaluation parameters.\n\n### Preventative Maintenance Tips\n1. Protect from moisture\n2. Use original chargers\n3. Scheduled diagnostics check\n\n### Conclusion\nSummary of original replacement grade-A warranties available at Immortal Electronics.`);
      } else {
        setBlogContent(prev => prev + '\n\n[AI POLISHED COPY]: This critical motherboard circuitry must be insulated against relative humidity to ensure continuous signal throughput. Book authorized screen diagnostics today.');
      }
      setSeoScore(92);
      setIsAiWriting(false);
    }, 1500);
  };

  const handlePublishBlog = () => {
    if (!blogTitle || !blogContent) return;
    setIsBlogPublishing(true);
    setTimeout(() => {
      if (onAddBlog) {
        onAddBlog({
          id: `blog-new-${Date.now()}`,
          title: blogTitle,
          content: blogContent,
          author: blogAuthor,
          date: new Date().toISOString().split('T')[0],
          category: 'Repair Manuals',
          readTime: '5 min read',
          tags: blogTags.split(',').map(t => t.trim()),
          likes: 0,
          comments: []
        });
      }
      setIsBlogPublishing(false);
      // Reset
      setBlogTitle('');
      setBlogContent('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs header */}
      <div className="flex border-b border-gray-150 dark:border-gray-800">
        <button
          onClick={() => setActiveSubTab('cms')}
          className={`px-4 py-2 text-xs font-black uppercase font-mono tracking-wider border-b-2 transition ${
            activeSubTab === 'cms' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Website CMS Page Builder
        </button>
        <button
          onClick={() => setActiveSubTab('blog')}
          className={`px-4 py-2 text-xs font-black uppercase font-mono tracking-wider border-b-2 transition ${
            activeSubTab === 'blog' 
              ? 'border-amber-500 text-amber-500' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Blog Editorial & Content Studio
        </button>
      </div>

      {activeSubTab === 'cms' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section sidebar controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400">Layout Sections</span>
              <div className="space-y-2">
                {blocks.map(b => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBlock(b.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      selectedBlockId === b.id 
                        ? 'border-amber-500 bg-amber-500/5' 
                        : 'border-gray-150 dark:border-gray-850 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="font-extrabold capitalize">{b.type} Section</span>
                      <span className="font-mono text-[10px] text-gray-400">v{b.version}</span>
                    </div>
                    <h5 className="font-black text-gray-900 dark:text-white mt-1 text-xs truncate">{b.title}</h5>
                  </div>
                ))}
              </div>
            </div>

            {/* Version control list */}
            <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400 flex items-center gap-1">
                <Undo size={11} />
                <span>Version Snapshots</span>
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {versionHistory.map((v, i) => (
                  <div key={i} className="p-2.5 border border-gray-100 dark:border-gray-900 rounded-lg text-[11px] font-mono flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-gray-800 dark:text-gray-200">Revision v{v.version}</span>
                      <span className="text-[10px] text-gray-400">{v.author} • {v.date.split(' ')[0]}</span>
                    </div>
                    <button
                      onClick={() => handleRollback(v.version)}
                      className="px-2 py-1 bg-[#0066FF] text-white font-extrabold rounded text-[10px]"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit visual and Preview split */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400">Content Configuration</span>
              
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Headline Text</label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Sub-caption text</label>
                  <input
                    type="text"
                    value={editorSubtitle}
                    onChange={(e) => setEditorSubtitle(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Body content description</label>
                  <textarea
                    rows={4}
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Theme Background Hex</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={editorBgColor}
                      onChange={(e) => setEditorBgColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editorBgColor}
                      onChange={(e) => setEditorBgColor(e.target.value)}
                      className="flex-1 p-1 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDeployCmsBlock}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-black text-xs uppercase"
                >
                  Deploy Web Update
                </button>
              </div>
            </div>

            {/* Live mockup browser frame */}
            <div className="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-white flex flex-col h-[400px]">
              <div className="bg-gray-100 dark:bg-[#1E1E1E] p-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>
                <div className="bg-white dark:bg-black/25 flex-1 text-center rounded py-0.5 text-[9px] font-mono truncate">
                  immortalelectronics.com.gh
                </div>
              </div>

              {/* Layout builder render preview */}
              <div 
                className="flex-1 p-6 flex flex-col justify-center text-center space-y-3 select-none"
                style={{ backgroundColor: editorBgColor }}
              >
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest font-mono">[PREVIEW FRAME]</span>
                <h4 className="text-sm font-black text-white tracking-tight uppercase leading-snug">{editorTitle || 'Untitled Section'}</h4>
                {editorSubtitle && <p className="text-[10px] text-gray-300 font-medium max-w-xs mx-auto">{editorSubtitle}</p>}
                <p className="text-[9px] text-gray-400 max-w-xs mx-auto leading-relaxed">{editorContent}</p>
                {activeBlock.buttonText && (
                  <button className="mx-auto mt-2 px-4 py-1.5 bg-amber-500 text-black font-extrabold text-[10px] rounded-full shadow-md">
                    {activeBlock.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Blog Content studio writing workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Editorial Composition Panel</span>
            
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Article Title</label>
                <input
                  type="text"
                  placeholder="E.g., Troubleshooting Water-damaged Motherboards in Accra"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg font-bold text-sm"
                />
              </div>

              {/* AI Writing prompt box */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[9px] uppercase font-black font-mono text-blue-500 block">[AI COPYWRITER ADVISOR]</span>
                  <p className="text-[10px] text-gray-400">Let the AI engine outline or enrich your technical insights.</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleTriggerAiWriter('outline')}
                    disabled={isAiWriting || !blogTitle}
                    className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white font-extrabold rounded text-[10px]"
                  >
                    Generate Outline
                  </button>
                  <button
                    onClick={() => handleTriggerAiWriter('polish')}
                    disabled={isAiWriting || !blogTitle}
                    className="px-2.5 py-1 bg-gray-50 dark:bg-black/35 border border-gray-150 dark:border-gray-800 font-extrabold rounded text-[10px]"
                  >
                    Polish Copy
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Article Markdown Content</label>
                <textarea
                  rows={8}
                  placeholder="Compose your authorized editorial tips or diagnostic manuals..."
                  value={blogContent}
                  onChange={(e) => handleBlogContentChange(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Author Credit Signature</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-gray-400">Article tags (comma list)</label>
                  <input
                    type="text"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={handlePublishBlog}
                disabled={isBlogPublishing || !blogTitle || !blogContent}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-black text-xs uppercase disabled:opacity-50"
              >
                {isBlogPublishing ? 'Publishing Articles...' : 'Deploy Article to Editorial Board'}
              </button>
            </div>
          </div>

          {/* SEO Score gauges */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 text-center">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400 block">SEO Content Grader</span>
              
              <div className="relative w-28 h-28 mx-auto mt-2">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2a2a2a" strokeWidth="2.5" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke={seoScore > 80 ? '#10B981' : seoScore > 60 ? '#F59E0B' : '#EF4444'} 
                    strokeWidth="3.2" 
                    strokeDasharray={`${seoScore} ${100 - seoScore}`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="text-xl font-black text-gray-900 dark:text-white">{seoScore}/100</span>
                  <span className="text-[8px] text-gray-400 font-extrabold uppercase">Grade</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-left pt-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${blogTitle.length > 20 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="text-gray-400 font-mono">Keyword in Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${blogContent.length > 250 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="text-gray-400 font-mono">Word Count &gt; 250 words</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${blogTags.split(',').length >= 3 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="text-gray-400 font-mono">Proper category tags list</span>
                </div>
              </div>
            </div>

            {/* Live Blog Posts Index */}
            <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-black uppercase font-mono text-gray-400 block border-b border-gray-150 dark:border-gray-850 pb-1.5">Live Blog Articles ({blogs.length})</span>
              {blogs.length === 0 ? (
                <p className="text-xs text-gray-400 italic font-mono">No published articles in database.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {blogs.map((b) => (
                    <div key={b.id} className="p-3 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-850 rounded-xl flex items-center justify-between gap-3 group">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-mono bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded font-extrabold uppercase">{b.category || 'Tips'}</span>
                        <h6 className="font-extrabold text-xs text-gray-900 dark:text-white truncate mt-1" title={b.title}>{b.title}</h6>
                        <span className="text-[9px] text-gray-400 font-mono block mt-0.5">By {b.author} • {b.date}</span>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete the blog "${b.title}"?`)) {
                            if (onDeleteBlog) {
                              await onDeleteBlog(b.id);
                            }
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-black text-rose-500 rounded-lg border border-rose-500/10 transition-all opacity-80 hover:opacity-100 shrink-0"
                        title="Delete blog post"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
