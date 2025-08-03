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
        results.map((post) => (
          <TimelineCard
            key={post.id}
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            text={post.text}
            magnet={post.magnet}
            nsfw={post.nsfw}
            postId={post.id}
            authorPubKey={post.author.pubkey}
            reports={post.reports?.length ?? 0}
            boosters={post.boosters}
          />
        ))
      )}
    </div>
  );
}

