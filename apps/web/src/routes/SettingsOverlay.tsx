/*
 * Licensed under GPL-3.0-or-later
 * React component for SettingsOverlay.
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { SettingsStorage } from './SettingsStorage';
import { SettingsNetwork } from './SettingsNetwork';
import { SettingsAppearance } from './SettingsAppearance';

export default function SettingsOverlay() {
  const [tab, setTab] = React.useState<'storage' | 'network' | 'appearance'>('storage');

  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o) window.history.back(); }}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed inset-0 flex flex-col bg-white dark:bg-surface">
        <header className="flex items-center justify-between border-b p-4">
          <h1 className="text-xl font-semibold">Settings</h1>
          <Dialog.Close aria-label="Close" className="text-xl">×</Dialog.Close>
        </header>
        <nav className="flex border-b">
          <button
            className={`flex-1 p-2 ${tab === 'storage' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setTab('storage')}
          >
            Storage
          </button>
          <button
            className={`flex-1 p-2 ${tab === 'network' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setTab('network')}
          >
            Network
          </button>
          <button
            className={`flex-1 p-2 ${tab === 'appearance' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setTab('appearance')}
          >
            Appearance
          </button>
        </nav>
        <div className="flex-1 overflow-y-auto">
          {tab === 'storage' && <SettingsStorage />}
          {tab === 'network' && <SettingsNetwork />}
          {tab === 'appearance' && <SettingsAppearance />}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
