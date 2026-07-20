/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, ThumbsUp, MessageSquare, Tag, Calendar, User, ArrowUpRight } from 'lucide-react';
import { BlogPost } from '../types';
import { handleImageError } from '../utils/imageFallback';

interface BlogSystemProps {
  blogs: BlogPost[];
  onComment: (blogId: string, author: string, text: string) => Promise<BlogPost>;
  onLike: (blogId: string) => Promise<BlogPost>;
}

export default function BlogSystem({ blogs, onComment, onLike }: BlogSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);

  // Comment inputs
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const categories = ['All', 'Tech News', 'Phone Reviews', 'Repair Tips', 'Buying Guides'];
  
  // Extract all unique tags
  const allTags = ['All', ...Array.from(new Set(blogs.flatMap(b => b.tags || [])))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesCat = selectedCategory === 'All' || blog.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || (blog.tags && blog.tags.includes(selectedTag));
    return matchesCat && matchesTag;
  });

  const handleLikeClick = async (blogId: string) => {
    try {
      const updated = await onLike(blogId);
      if (activeBlog && activeBlog.id === blogId) {
        setActiveBlog(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, blogId: string) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const updated = await onComment(blogId, commentAuthor, commentText);
      setActiveBlog(updated);
      setCommentText('');
      setCommentAuthor('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Blog Detail View Overlay */}
      {activeBlog ? (
        <div className="bg-white dark:bg-[#0B0B0B] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
          <button
            onClick={() => setActiveBlog(null)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold font-mono"
          >
            ← Back to Articles
          </button>

          <div className="space-y-4">
            <span className="bg-[#0066FF]/10 text-[#0066FF] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase">
              {activeBlog.category}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">{activeBlog.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
              <span className="flex items-center"><User className="w-4 h-4 mr-1 text-[#0066FF]" /> By {activeBlog.author}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-amber-500" /> {activeBlog.date}</span>
              <span>• {activeBlog.readTime}</span>
            </div>
          </div>

          <img
            src={activeBlog.image}
            alt={activeBlog.title}
            className="w-full h-80 object-cover rounded-2xl filter brightness-90 border border-gray-100 dark:border-gray-800"
            onError={handleImageError}
          />

          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
            {activeBlog.content}
          </div>

          {/* Likes & Interaction Panel */}
          <div className="flex items-center space-x-6 border-y border-gray-100 dark:border-gray-800 py-4 mt-8">
            <button
              onClick={() => handleLikeClick(activeBlog.id)}
              className="flex items-center space-x-2 text-xs font-semibold bg-[#0066FF]/10 hover:bg-[#0066FF]/20 text-[#0066FF] px-4 py-2 rounded-xl transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Like ({activeBlog.likes})</span>
            </button>
            <span className="text-xs text-gray-400 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{activeBlog.comments ? activeBlog.comments.length : 0} Comments</span>
            </span>
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <h4 className="text-lg font-bold border-b border-gray-100 dark:border-gray-800 pb-2">Discussion Panel</h4>
            
            <div className="space-y-3">
              {activeBlog.comments && activeBlog.comments.length > 0 ? (
                activeBlog.comments.map((comment, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{comment.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 font-mono italic">No comments yet. Be the first to join the conversation!</p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={(e) => handleCommentSubmit(e, activeBlog.id)} className="space-y-3 pt-2">
              <h5 className="text-xs font-mono uppercase tracking-wider text-gray-400">Add Your Comment</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Write your technical feedback or general question here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-[#0066FF] hover:bg-[#0055DD] text-white text-xs font-bold rounded-lg transition-colors"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Feed View */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#0066FF]/10 text-[#0066FF] mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Immortal Tech Portal & Guides</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
              Stay updated with expert reviews, tropical battery optimization techniques, and buying insights designed specifically for the Ghanaian gadgets market.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between border-y border-gray-200 dark:border-gray-800 py-4">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#0066FF] text-white font-bold'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 md:pb-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 shrink-0">Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors shrink-0 ${
                    selectedTag === tag
                      ? 'bg-amber-400 text-gray-900 font-bold'
                      : 'bg-gray-50 dark:bg-black/10 text-gray-400 border border-gray-100 dark:border-gray-900'
                  }`}
                >
                  #{tag.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  onClick={() => setActiveBlog(blog)}
                  className="group rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div className="relative pt-[56.25%] overflow-hidden bg-gray-50 dark:bg-black/40">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                      loading="lazy"
                      onError={handleImageError}
                    />
                    <span className="absolute top-3 left-3 bg-[#0B0B0B]/80 backdrop-blur-md text-white text-[9px] font-mono px-2 py-0.5 rounded border border-gray-800">
                      {blog.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-[10px] text-gray-400 font-mono mb-2">
                        <span>{blog.date}</span>
                        <span className="mx-2">•</span>
                        <span>{blog.readTime}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors leading-snug">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                        {blog.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                      <div className="flex space-x-1">
                        {(blog.tags || []).slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[9px] font-mono text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#0066FF] flex items-center group-hover:underline">
                        <span>Read</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 font-mono border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              No articles matching selected filters. Select "All" to restore.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
