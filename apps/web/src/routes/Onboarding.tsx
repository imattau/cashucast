/*
 * Licensed under GPL-3.0-or-later
 * React component for Onboarding.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Dropzone from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { createRPCClient } from '../../shared/rpc';
import { useProfile } from '../../shared/store/profile';
import { createProfile } from '../../shared/types/profile';
import { getSSB } from '../../../../packages/worker-ssb/src/instance';
import { touch } from '../../../../packages/worker-ssb/src/blobCache';
import { z } from 'zod';
import { UserPlus, Upload, DownloadCloud } from 'lucide-react';
import { Avatar } from '../../shared/ui/Avatar';
import { Toast } from '../../shared/ui/Toast';
import 'react-easy-crop/react-easy-crop.css';

// schemas for validating imported backups
const ProfileBackupSchema = z.object({
  ssbPk: z.string(),
  ssbSk: z.string(),
  username: z.string(),
  avatarBlob: z.string().optional(),
});

const WalletBackupSchema = z.object({
  cashuMnemonic: z.string(),
});

// persist step and mode across unmounts triggered by parent rerenders
const stepRef = { current: 1 };
const modeRef = { current: null as 'new' | 'import' | null };

function OnboardingContent() {
  const [step, setStepState] = useState(stepRef.current);
  const [mode, setModeState] = useState<'new' | 'import' | null>(modeRef.current);
  const containerRef = useRef<HTMLDivElement>(null);

  // wrappers to keep refs updated alongside state
  const setStep = (n: number) => {
    stepRef.current = n;
    setStepState(n);
  };
  const setMode = (m: 'new' | 'import' | null) => {
    modeRef.current = m;
    setModeState(m);
  };

  useEffect(() => {
    const first = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
  }, [step]);

  const setProfile = useProfile((s) => s.setProfile);
  const importProfile = useProfile((s) => s.importProfile);
  const profile = useProfile((s) => s.profile);

  // new account states
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ pk: string; sk: string } | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [avatarHash, setAvatarHash] = useState<string | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateKeysAndMnemonic = useCallback(async () => {
    setGenerating(true);
    const ssbWorker = new Worker(
      new URL('../../../../packages/worker-ssb/index.ts', import.meta.url),
      { type: 'module' },
    );
    const cashuWorker = new Worker(
      new URL('../../../../packages/worker-cashu/index.ts', import.meta.url),
      { type: 'module' },
    );
    const ssbCall = createRPCClient(ssbWorker);
    const cashuCall = createRPCClient(cashuWorker);
    const k: any = await ssbCall('initKeys');
    if (k) setKeys(k);
    const m: any = await cashuCall('initWallet');
    setMnemonic(m);
    ssbWorker.terminate();
    cashuWorker.terminate();
    setGenerating(false);
  }, []);

  const onCropComplete = useCallback((_, areaPixels: any) => {
    setCroppedArea(areaPixels);
  }, []);

  const saveAvatar = useCallback(async (): Promise<string | null> => {
    if (!avatarFile || !avatarSrc || !croppedArea) return null;
    const img = document.createElement('img');
    img.src = avatarSrc;
    await new Promise((res) => (img.onload = res));
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(
      img,
      croppedArea.x,
      croppedArea.y,
      croppedArea.width,
      croppedArea.height,
      0,
      0,
      256,
      256,
    );
    return await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(null);
        const ssb = getSSB();
        const writer = ssb.blobs.add();
        const data = new Uint8Array(await blob.arrayBuffer());
        writer.write(data);
        writer.end((_: any, hash: string) => {
          touch(hash, data.byteLength);
          setAvatarHash(hash);
          resolve(URL.createObjectURL(blob));
        });
      }, 'image/jpeg');
    });
  }, [avatarFile, avatarSrc, croppedArea]);

  // import states
  const [profileBackup, setProfileBackup] = useState<
    z.infer<typeof ProfileBackupSchema> | null
  >(null);
  const [walletBackup, setWalletBackup] = useState<
    z.infer<typeof WalletBackupSchema> | null
  >(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const validateUsername = (name: string): string | null => {
    if (name.length < 3 || name.length > 30)
      return 'Username must be between 3 and 30 characters.';
    if (!/^[A-Za-z0-9_]+$/.test(name))
      return 'Username can only contain letters, numbers, and underscores.';
    return null;
  };

  const [toast, setToast] = useState(false);

  const stepTitle =
    step === 1
      ? 'Choose how to get started'
      : step === 2 && mode === 'new'
      ? 'Create your profile'
      : step === 2 && mode === 'import'
      ? 'Import your profile'
      : step === 3
      ? 'Confirm profile details'
      : '';

  const confirm = async () => {
    const err = validateUsername(username);
    if (err) {
      setUsernameError(err);
      setStep(2);
      return;
    }
    if (mode === 'new' && keys && mnemonic) {
      const p = await createProfile({
        ssbPk: keys.pk,
        ssbSk: keys.sk,
        cashuMnemonic: mnemonic,
        username,
        avatarBlob: avatarHash,
      });
      setProfile(p);
    } else if (mode === 'import' && profile) {
      setProfile(profile);
    }
    setToast(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
      className="relative space-y-4 sm:space-y-6 md:space-y-8"
    >
      {step > 1 && (
        <button
          className="absolute top-4 left-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          onClick={() => setStep(step - 1)}
        >
          ← Back
        </button>
      )}
      <div aria-live="polite" className="sr-only">
        {stepTitle}
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="text-gray-500 dark:text-gray-400">
          Step {step} of 3
        </span>
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setMode(null);
            }}
            className="hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Choose how to get started</h2>
          <p className="text-gray-700">
            Create a new profile or import one you already have.
          </p>
          <button
            type="button"
            onClick={() => {
              setMode('new');
              setStep(2);
            }}
            className="
            w-full flex items-center gap-3
            bg-primary text-white
            dark:bg-primary
            px-5 py-4
            rounded-lg
            transition-colors
            hover:bg-primary/90
          "
          >
            <UserPlus size={24} />
            <div className="text-left">
              <p className="font-semibold">New Account</p>
              <p className="text-sm text-white/80">Start from scratch</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('import');
              setStep(2);
            }}
            className="
            w-full flex items-center gap-3
            bg-primary text-white
            dark:bg-primary
            px-5 py-4
            rounded-lg
            transition-colors
            hover:bg-primary/90
          "
          >
            <DownloadCloud size={24} />
            <div className="text-left">
              <p className="font-semibold">Import Existing</p>
              <p className="text-sm text-white/80">Bring your backup</p>
            </div>
          </button>
        </div>
      )}
      {step === 2 && mode === 'new' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile Details</h2>
          {generating && <p className="text-sm text-gray-500">Loading...</p>}
          <label htmlFor="username" className="block text-sm font-medium">
            Username
            <input
              id="username"
              name="username"
              autoComplete="username"
              className="mt-1 block w-full rounded border px-4 py-3 min-h-[44px] font-normal text-black placeholder:text-black"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError(validateUsername(e.target.value));
              }}
              onBlur={(e) => setUsernameError(validateUsername(e.target.value))}
            />
          </label>
          {usernameError && (
            <p className="text-sm text-red-500">{usernameError}</p>
          )}
          {!avatarSrc && (
            <Dropzone
              onDrop={(files) => {
                const f = files[0];
                if (f) {
                  setAvatarFile(f);
                  const url = URL.createObjectURL(f);
                  setAvatarPreview(null);
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setCroppedArea(null);
                  setAvatarSrc(url);
                }
              }}
            >
              {({ getRootProps, getInputProps, open }) => (
                <div
                  {...getRootProps({
                    tabIndex: 0,
                    onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        open();
                      }
                    },
                  })}
                  className="relative w-32 h-32 border-2 border-dashed flex items-center justify-center cursor-pointer"
                  aria-describedby="avatar-upload-caption"
                >
                <label htmlFor="avatar-upload" className="sr-only">
                  Avatar
                  <input
                    {...getInputProps({
                      id: 'avatar-upload',
                      name: 'avatar',
                      accept: 'image/*',
                      autoComplete: 'off',
                      'aria-describedby': 'avatar-upload-caption',
                    })}
                    className="text-black placeholder:text-black"
                  />
                </label>
                <Avatar
                  name="Placeholder"
                  size={128}
                  className="border z-0"
                />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 text-gray-500"
                  >
                    <Upload className="h-6 w-6 mb-1" />
                    <span className="text-xs text-center px-1">
                      Click or drop image to upload
                    </span>
                  </div>
                  <span id="avatar-upload-caption" className="sr-only">
                    Drop avatar image
                  </span>
                </div>
              )}
            </Dropzone>
            )}
          {avatarSrc && !avatarPreview && (
            <div className="flex flex-col items-center">
              {/* Explicit sizing ensures Cropper renders correctly */}
              <div className="relative w-64 h-64 bg-gray-200 mb-4">
                <Cropper
                  image={avatarSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <button
                className="rounded bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
                onClick={async () => {
                  const preview = await saveAvatar();
                  if (!preview) return;
                  setAvatarPreview(preview);
                  const err = validateUsername(username);
                  if (err) {
                    setUsernameError(err);
                    setStep(2);
                  } else {
                    setStep(3);
                  }
                }}
              >
                Use Avatar
              </button>
            </div>
          )}
          {avatarPreview && (
            <div className="flex flex-col items-center">
              <img
                src={avatarPreview}
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 mt-2"
              />
            </div>
          )}
          <div className="flex justify-between">
            <button
              className="rounded bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="rounded bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
              onClick={async () => {
                const err = validateUsername(username);
                if (err) {
                  setUsernameError(err);
                  return;
                }
                await generateKeysAndMnemonic();
                setStep(3);
              }}
              disabled={generating}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {step === 2 && mode === 'import' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Import Backups</h2>
          <h3 className="text-lg font-medium">Profile Backup</h3>
          <Dropzone
            onDrop={async (files) => {
              const f = files[0];
              if (!f) return;
              setProfileLoading(true);
              try {
                const txt = await f.text();
                const parsed = ProfileBackupSchema.parse(JSON.parse(txt));
                setProfileBackup(parsed);
                setProfileError(null);
              } catch {
                setProfileBackup(null);
                setProfileError('Invalid profile backup');
              } finally {
                setProfileLoading(false);
              }
            }}
          >
            {({ getRootProps, getInputProps, open }) => (
              <div
                {...getRootProps({
                  tabIndex: 0,
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      open();
                    }
                  },
                })}
                className="border-2 border-dashed cursor-pointer text-center px-4 py-3 min-w-[44px] min-h-[44px]"
                aria-describedby="profile-upload-caption"
              >
                <label htmlFor="profile-upload" className="sr-only">
                  Profile backup JSON
                  <input
                    {...getInputProps({
                      id: 'profile-upload',
                      name: 'profile',
                      accept: 'application/json',
                      autoComplete: 'off',
                      'aria-describedby': 'profile-upload-caption',
                    })}
                    className="text-black placeholder:text-black"
                  />
                </label>
                <p id="profile-upload-caption">Drop profile backup JSON</p>
                {profileLoading && (
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                )}
                {profileBackup && !profileError && !profileLoading && (
                  <p className="mt-2 text-sm text-green-600">Profile backup loaded</p>
                )}
                {profileError && (
                  <p className="mt-2 text-sm text-red-500">{profileError}</p>
                )}
              </div>
            )}
          </Dropzone>
          <h3 className="text-lg font-medium">Wallet Backup</h3>
          <Dropzone
            onDrop={async (files) => {
              const f = files[0];
              if (!f) return;
              setWalletLoading(true);
              try {
                const txt = await f.text();
                const parsed = WalletBackupSchema.parse(JSON.parse(txt));
                setWalletBackup(parsed);
                setWalletError(null);
              } catch {
                setWalletBackup(null);
                setWalletError('Invalid wallet backup');
              } finally {
                setWalletLoading(false);
              }
            }}
          >
            {({ getRootProps, getInputProps, open }) => (
              <div
                {...getRootProps({
                  tabIndex: 0,
                  onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      open();
                    }
                  },
                })}
                className="border-2 border-dashed cursor-pointer text-center px-4 py-3 min-w-[44px] min-h-[44px]"
                aria-describedby="wallet-upload-caption"
              >
                <label htmlFor="wallet-upload" className="sr-only">
                  Wallet backup JSON
                  <input
                    {...getInputProps({
                      id: 'wallet-upload',
                      name: 'wallet',
                      accept: 'application/json',
                      autoComplete: 'off',
                      'aria-describedby': 'wallet-upload-caption',
                    })}
                    className="text-black placeholder:text-black"
                  />
                </label>
                <p id="wallet-upload-caption">Drop wallet backup JSON</p>
                {walletLoading && (
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                )}
                {walletBackup && !walletError && !walletLoading && (
                  <p className="mt-2 text-sm text-green-600">Wallet backup loaded</p>
                )}
                {walletError && (
                  <p className="mt-2 text-sm text-red-500">{walletError}</p>
                )}
              </div>
            )}
          </Dropzone>
          <div className="flex justify-between">
          <button
            className="rounded bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
            onClick={() => setStep(1)}
            disabled={profileLoading || walletLoading}
          >
            Back
          </button>
          <button
            className="rounded bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
            onClick={() => {
              if (mode !== 'import' || (!profileBackup && !walletBackup)) return;
              const profileData: any = { ...profileBackup };
              if (walletBackup) profileData.cashuMnemonic = walletBackup.cashuMnemonic;
              importProfile(profileData);
              setStep(3);
            }}
            disabled={
              !((profileBackup || walletBackup) && !profileError && !walletError) ||
              profileLoading ||
              walletLoading
            }
          >
            Next
          </button>
        </div>
      </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
              />
            ) : (
              <div className="w-[128px] h-[128px] rounded-full border">
                <Avatar
                  name={(mode === 'new' ? username : profile?.username) ?? ''}
                  size={128}
                />
              </div>
            )}
            <span>{mode === 'new' ? username : profile?.username}</span>
          </div>
          <div className="flex justify-between">
            <button
              className="rounded bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              className="rounded bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 min-w-[44px] min-h-[44px]"
              onClick={confirm}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message="Welcome to CashuCast!"
          duration={1000}
          onHide={() => setToast(false)}
        />
      )}
    </div>
  );
}

export default function Onboarding() {
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
          <Dialog.Title className="sr-only">Onboarding</Dialog.Title>
          <Dialog.Description className="sr-only">
            Set up your profile to start using CashuCast
          </Dialog.Description>
          <div className="w-full max-w-md max-h-[90vh] overflow-auto bg-white rounded-xl p-6">
            <OnboardingContent />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// helper for tests to reset persistent onboarding progress
export function resetOnboardingState() {
  stepRef.current = 1;
  modeRef.current = null;
}
