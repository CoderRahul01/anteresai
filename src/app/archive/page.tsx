'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
} from 'lucide-react';

interface GeneratedPost {
  format: string;
  body: string;
  hashtags: string[];
  editorsNote: string;
}

interface GenerationRecord {
  _id: string;
  timestamp: string;
  request: {
    rawThoughts?: string;
    newsSignals?: string[];
    domainContext?: string;
  };
  outputs: GeneratedPost[];
}

export default function ArchivePage() {
  const [generations, setGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const res = await fetch('/api/generations');
        const data = await res.json();
        if (data.success) {
          setGenerations(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch generations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenerations();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen text-slate-200 px-6 py-12 md:px-12 selection:bg-indigo-500/30">
      {/* HEADER */}
      <header
        className="max-w-5xl mx-auto mb-12 animate-slide-up"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Generator
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Generation Archive
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          {generations.length} generation batches stored in MongoDB
        </p>
      </header>

      {/* CONTENT */}
      <div
        className="max-w-4xl mx-auto animate-slide-up"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm">Loading archive...</p>
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
              <Sparkles className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg font-medium mb-2">
              No generations yet
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Head to the Generator to create your first batch.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Open Generator
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map((gen) => {
              const isExpanded = expandedId === gen._id;
              const inputSummary = [
                gen.request.rawThoughts,
                gen.request.domainContext,
              ]
                .filter(Boolean)
                .join(' · ')
                .substring(0, 120);

              return (
                <div
                  key={gen._id}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-xl transition-all hover:border-indigo-500/30"
                >
                  {/* Collapsed Header */}
                  <button
                    onClick={() => toggleExpand(gen._id)}
                    className="w-full p-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(gen.timestamp)}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 text-xs font-medium rounded-full">
                          {gen.outputs.length} posts
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 truncate">
                        {inputSummary || 'No input summary available'}
                      </p>
                    </div>
                    <div className="ml-4 text-slate-500">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 border-t border-white/[0.05]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {gen.outputs.map((post, idx) => {
                          const copyKey = `${gen._id}-${idx}`;
                          return (
                            <div
                              key={idx}
                              className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 flex flex-col"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20">
                                  {post.format}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(
                                      post.body +
                                        '\n\n' +
                                        post.hashtags.join(' '),
                                      copyKey
                                    )
                                  }
                                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copy"
                                >
                                  {copiedKey === copyKey ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap flex-grow mb-3">
                                {post.body}
                              </p>
                              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-700/50">
                                {post.hashtags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] text-indigo-400 font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
