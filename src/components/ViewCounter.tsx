
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ViewCounterProps {
  slug: string;
}

export default function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const incrementView = async () => {
      try {
        // Increment view count using RPC function
        const { error } = await supabase.rpc('increment_view_count', { page_slug: slug });
        if (error) console.error('Error incrementing view count:', error);

        // Fetch current view count
        const { data, error: fetchError } = await supabase
          .from('page_views')
          .select('view_count')
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;
        setViews(data?.view_count || 0);

      } catch (err) {
        console.error('Error fetching view count:', err);
      }
    };

    incrementView();
  }, [slug]);

  if (views === null) return null; // Or a loading skeleton

  return (
    <div className="view-counter" title={`${views} views`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span className="view-count">{views}</span>

      <style>{`
        .view-counter {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
            color: var(--color-text-secondary);
            background: var(--color-bg-secondary);
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid var(--color-border);
            opacity: 0;
            animation: fadeIn 0.5s ease-out forwards;
            animation-delay: 0.2s;
        }
        .eye-icon {
            opacity: 0.7;
        }
        .view-count {
            font-variant-numeric: tabular-nums;
            font-weight: 500;
        }
      `}</style>
    </div>
  );
}
