/*
 * Licensed under GPL-3.0-or-later
 * React component for SearchResults.
 */
import React from 'react';
import { TimelineCard } from '../components/TimelineCard';
import { useSearch } from '../../shared/store/search';

export default function SearchResults() {
  const results = useSearch((s) => s.results);
  return (
    <div className="p-4 space-y-4">
      {results.length === 0 ? (
        <div>No matches.</div>
      ) : (
        results.map((post) => {
          const timelinePost = {
            id: post.id,
            authorAvatar: post.author.avatarUrl,
            authorName: post.author.name,
            description: post.text,
            magnet: post.magnet,
            nsfw: post.nsfw,
            authorPubKey: post.author.pubkey,
            reports: post.reports?.length ?? 0,
            zaps: (post as any).zaps ?? 0,
            comments: (post as any).comments ?? 0,
            boosters: post.boosters ?? [],
          };
          return <TimelineCard key={post.id} post={timelinePost} />;
        })
      )}
    </div>
  );
}

