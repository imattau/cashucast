/*
 * Licensed under GPL-3.0-or-later
 * React component for CommentsDrawer.
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface CommentsDrawerProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Minimal comments drawer used by TimelineCard. Currently stores comments
 * locally and exposes an input for new comments.
 */
export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  postId,
  open,
  onOpenChange,
}) => {
  const [comments, setComments] = React.useState<string[]>([]);
  const [text, setText] = React.useState('');

  // TODO: load comments from worker-ssb for the given postId

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setComments((prev) => [...prev, text]);
    setText('');
    // TODO: publish comment via worker-ssb
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-md bg-white md:top-0 md:max-h-none md:h-screen">
          <Dialog.Title className="p-4 text-lg font-semibold">
            Comments
          </Dialog.Title>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {comments.map((c, i) => (
              <p key={i} className="text-sm">
                {c}
              </p>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t p-4">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <input
              id="comment"
              name="comment"
              className="flex-1 rounded border px-2 py-1"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-purple-600 px-4 py-1 text-white"
            >
              Send
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommentsDrawer;
