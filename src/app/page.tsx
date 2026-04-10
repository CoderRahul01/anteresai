'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles,
  ArrowRight,
  Loader2,
  Terminal,
  Newspaper,
  BookOpen,
  Copy,
  CheckCircle2,
  Linkedin,
  ExternalLink
} from 'lucide-react';

export default function AnteresDashboard() {
  const [rawThoughts, setRawThoughts] = useState('');
  const [newsSignals, setNewsSignals] = useState('');
  const [domainContext, setDomainContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinName, setLinkedinName] = useState<string | null>(null);
  const [postingIndex, setPostingIndex] = useState<number | null>(null);
  const [postedIndexes, setPostedIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const checkLinkedIn = async () => {
      try {
        const res = await fetch('/api/linkedin/post');
        const data = await res.json();
        setLinkedinConnected(data.connected);
        setLinkedinName(data.name);
      } catch { /* silently fail */ }
    };
    checkLinkedIn();

    // Check URL params for LinkedIn connection status
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin') === 'connected') {
      setLinkedinConnected(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleLinkedInPost = async (text: string, hashtags: string[], index: number) => {
    setPostingIndex(index);
    try {
      const fullText = text + '\n\n' + hashtags.join(' ');
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      });
      const data = await res.json();
      if (data.success) {
        setPostedIndexes(prev => new Set(prev).add(index));
      } else {
        alert('LinkedIn post failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to post to LinkedIn');
    } finally {
      setPostingIndex(null);
    }
  };

  const handleGenerate = async () => {
    if (!rawThoughts && !newsSignals && !domainContext) return;
    
    setIsGenerating(true);
    setResults(null);
    
    // Convert comma/newline separated news signals to array
    const signalsArray = newsSignals.split(/[\n,]/).map(s => s.trim()).filter(Boolean);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawThoughts,
          newsSignals: signalsArray,
          domainContext
        })
      });

      const data = await response.json();
      if (data.data) {
        setResults(data.data);
      } else {
        alert("Generation failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="min-h-screen text-slate-200 px-6 py-12 md:px-12 selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="max-w-5xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Anteres AI</h1>
            </div>
            <p className="text-slate-400 text-sm">System Identity: Solo Founder Edition</p>
          </div>
          <div className="flex items-center gap-3">
            {linkedinConnected ? (
              <span className="flex items-center gap-2 px-3 py-2 bg-blue-600/15 border border-blue-500/30 rounded-lg text-xs text-blue-300">
                <Linkedin className="w-3.5 h-3.5" />
                {linkedinName || 'Connected'}
              </span>
            ) : (
              <a
                href="/api/linkedin/auth"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors text-white"
              >
                <Linkedin className="w-4 h-4" />
                Connect LinkedIn
              </a>
            )}
            <Link
              href="/archive"
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-sm font-medium transition-all text-slate-300 hover:text-white"
            >
              View Archive →
            </Link>
          </div>
        </div>
      </header>

      {/* DASHBOARD OR RESULTS VIEW */}
      {!results ? (
        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            {/* Subtle glow effect inside the glass container */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="space-y-8 relative z-10">
              {/* Field 1 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-indigo-300 uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Raw Thoughts
                </label>
                <textarea 
                  value={rawThoughts}
                  onChange={(e) => setRawThoughts(e.target.value)}
                  placeholder="What's the untethered idea right now? What bothered you today?"
                  className="w-full h-32 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Field 2 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-indigo-300 uppercase tracking-wider">
                  <Newspaper className="w-4 h-4" />
                  News Signals
                </label>
                <textarea 
                  value={newsSignals}
                  onChange={(e) => setNewsSignals(e.target.value)}
                  placeholder="Paste links or headlines (comma separated)"
                  className="w-full h-20 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Field 3 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-indigo-300 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  Domain Context
                </label>
                <input 
                  type="text"
                  value={domainContext}
                  onChange={(e) => setDomainContext(e.target.value)}
                  placeholder="e.g. AI automation, Indian SMBs, building in public"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>

              {/* Action */}
              <div className="pt-4">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || (!rawThoughts && !newsSignals && !domainContext)}
                  className="w-full group relative flex justify-center items-center gap-3 bg-white text-slate-950 px-6 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Igniting Generator...
                    </>
                  ) : (
                    <>
                      Generate Master Batch
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-slate-500 flex justify-center items-center gap-4">
            <span>Secure Database: MongoDB Active</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>Linked to Google Sheets Auto-Sync</span>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">The Generation Deck</h2>
              <p className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                5 Unique Formats • Database Synced
              </p>
            </div>
            <button 
              onClick={() => setResults(null)}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-sm font-medium transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((post, index) => (
              <div 
                key={index} 
                className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col backdrop-blur-md hover:border-indigo-500/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/20 shadow-inner">
                    {post.format}
                  </span>
                  <div className="flex items-center gap-1">
                    {linkedinConnected && (
                      <button
                        onClick={() => handleLinkedInPost(post.body, post.hashtags, index)}
                        disabled={postingIndex === index || postedIndexes.has(index)}
                        className="p-2 hover:bg-blue-900/30 rounded-md text-blue-400 hover:text-blue-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={postedIndexes.has(index) ? 'Posted to LinkedIn' : 'Post to LinkedIn'}
                      >
                        {postingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : postedIndexes.has(index) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Linkedin className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button 
                      onClick={() => handleCopy(post.body + '\n\n' + post.hashtags.join(' '), index)}
                      className="p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow whitespace-pre-wrap text-slate-300 text-sm leading-relaxed mb-6">
                  {post.body}
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-700/50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.hashtags.map((tag: string) => (
                      <span key={tag} className="text-xs text-indigo-400 font-medium hover:text-indigo-300 cursor-pointer transition-colors">{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 italic flex items-start gap-2 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="leading-snug">Editor's Note: {post.editorsNote}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
