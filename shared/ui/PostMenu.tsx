/*
 * Licensed under GPL-3.0-or-later
 * React component for PostMenu.
 */
import React from 'react';
import { BottomSheet } from './BottomSheet';

interface PostMenuProps {
  postId: string;
  authorPubKey: string;
  onReport: (postId: string, reason: string) => void;
  onBlock: (pubKey: string) => void;
  /** For tests: render menu open */
  open?: boolean;
}

const reasons = ['Nudity', 'Violence', 'Spam', 'Other'];

export const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  authorPubKey,
  onReport,
  onBlock,
  open: forcedOpen,
}) => {
  const [open, setOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const isOpen = forcedOpen ?? open;

  const handleReport = (reason: string) => {
    onReport(postId, reason);
    setReportOpen(false);
    setOpen(false);
  };

  const handleBlock = () => {
    onBlock(authorPubKey);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        aria-label="Open post menu"
        onClick={() => setOpen((o) => !o)}
        className="p-2"
      >
        ⋮
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div className="py-1">
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-subtleBg"
              onClick={() => setReportOpen(true)}
            >
              Report
            </button>
            <button
              className="block w-full px-4 py-2 text-left text-sm hover:bg-subtleBg"
              onClick={handleBlock}
            >
              Block author
            </button>
          </div>
        </div>
      )}
      <BottomSheet open={reportOpen} onOpenChange={setReportOpen}>
        <div className="p-4 space-y-2">
          {reasons.map((r) => (
            <button
              key={r}
              className="block w-full rounded p-2 text-left hover:bg-subtleBg"
              onClick={() => handleReport(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

