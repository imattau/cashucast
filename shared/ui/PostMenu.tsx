/*
 * Licensed under GPL-3.0-or-later
 * React component for PostMenu.
 *
 * Material 3 menu spec: https://m3.material.io/components/menus/overview
 * MUI Menu docs: https://mui.com/material-ui/react-menu/
 */
import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [reportOpen, setReportOpen] = React.useState(false);
  const isOpen = forcedOpen ?? Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReport = (reason: string) => {
    onReport(postId, reason);
    setReportOpen(false);
    handleMenuClose();
  };

  const handleBlock = () => {
    onBlock(authorPubKey);
    handleMenuClose();
  };

  return (
    <div className="relative inline-block text-left">
      <button
        aria-label="Open post menu"
        onClick={handleMenuOpen}
        className="p-2 min-tap"
      >
        ⋮
      </button>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleMenuClose}
        anchorReference={forcedOpen ? 'none' : 'anchorEl'}
      >
        <MenuItem
          onClick={() => {
            setReportOpen(true);
            handleMenuClose();
          }}
        >
          Report
        </MenuItem>
        <MenuItem onClick={handleBlock}>Block author</MenuItem>
      </Menu>
      <BottomSheet open={reportOpen} onOpenChange={setReportOpen}>
        <div className="p-4 space-y-2">
          {reasons.map((r) => (
            <button
              key={r}
              className="block w-full rounded p-2 text-left hover:bg-surface dark:hover:bg-surface-dark min-h-11"
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

