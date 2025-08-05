/*
 * Licensed under GPL-3.0-or-later
 * React component for CommentsDrawer.
 */
import React from 'react';
import Drawer from '@mui/material/Drawer';
import { createRPCClient } from '../rpc';

interface CommentsDrawerProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Minimal comments drawer used by TimelineCard. Uses MUI Drawer per Material 3
 * navigation drawer guidance.
 * https://m3.material.io/components/navigation-drawer/overview
 * MUI Drawer docs: https://mui.com/material-ui/react-drawer/
 * Stores comments locally and exposes an input for new comments.
 */
export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  postId,
  open,
  onOpenChange,
}) => {
  const [comments, setComments] = React.useState<string[]>([]);
  const [text, setText] = React.useState('');
  const rpcRef = React.useRef<ReturnType<typeof createRPCClient> | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(
      new URL('../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' }
    );
    rpcRef.current = createRPCClient(worker);
    return () => worker.terminate();
  }, []);

  React.useEffect(() => {
    const rpc = rpcRef.current;
    if (!rpc || !open) return;
    rpc('queryComments', postId)
      .then((c) => setComments((c as string[]) || []))
      .catch(() => setComments([]));
  }, [postId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    // optimistic append
    setComments((prev) => [...prev, trimmed]);
    setText('');
    try {
      await rpcRef.current?.('publishComment', { postId, text: trimmed });
    } catch (_) {
      // remove optimistic comment on failure
      setComments((prev) => prev.slice(0, -1));
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={() => onOpenChange(false)}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        className:
          'flex h-[70vh] flex-col rounded-t-md bg-surface dark:bg-surface-dark md:h-screen',
      }}
      BackdropProps={{
        className: 'bg-on-surface/50 dark:bg-on-surface-dark/50',
      }}
    >
      <h2 className="p-4 text-lg font-semibold">Comments</h2>
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
          className="rounded bg-purple-600 px-4 py-1 min-tap"
        >
          Send
        </button>
      </form>
    </Drawer>
  );
};

export default CommentsDrawer;
