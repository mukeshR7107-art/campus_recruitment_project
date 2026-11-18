import { useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export default function ResumeLink({ value, children, className = '' }: { value: string; children: ReactNode; className?: string }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function prepare() {
    setLoading(true); setError('');
    try {
      const parsed = new URL(value);
      if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Invalid resume link.');
      const storageOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
      const prefix = '/storage/v1/object/public/resumes/';
      if (parsed.origin === storageOrigin && parsed.pathname.startsWith(prefix)) {
        const { data, error } = await supabase.storage.from('resumes').createSignedUrl(decodeURIComponent(parsed.pathname.slice(prefix.length)), 60);
        if (error || !data) throw new Error('Unable to access this resume. Check your access or try again.');
        setUrl(data.signedUrl);
      } else setUrl(parsed.href);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to open resume.'); }
    finally { setLoading(false); }
  }
  return <span>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className={className} onClick={() => window.setTimeout(() => setUrl(''), 1000)}>Open document ↗</a> : <button type="button" className={className} disabled={loading} onClick={() => void prepare()}>{loading ? 'Preparing…' : children}</button>}{error && <span role="alert" className="block text-xs text-rose-700">{error}</span>}</span>;
}
