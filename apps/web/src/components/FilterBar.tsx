import React, { useEffect, useState } from 'react';
import TagInput from './TagInput';
import { useFilters } from '../../../shared/store/filters';

export default function FilterBar() {
  const tags = useFilters((s) => s.tags);
  const toggleTag = useFilters((s) => s.toggleTag);
  const [input, setInput] = useState<string[]>([]);

  useEffect(() => {
    if (input.length > 0) {
      input.forEach((t) => toggleTag(t));
      setInput([]);
    }
  }, [input, toggleTag]);

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      {tags.map((t) => (
        <span
          key={t}
          className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm"
        >
          #{t}
          <button
            className="ml-1 text-gray-600 hover:text-gray-900"
            onClick={() => toggleTag(t)}
          >
            ×
          </button>
        </span>
      ))}
      <div className="min-w-[8rem]">
        <TagInput value={input} setValue={setInput} />
      </div>
    </div>
  );
}

