import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Dropzone from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { createRPCClient } from '../../shared/rpc';
import { useProfile } from '../../shared/store/profile';
import { createProfile } from '../../shared/types/profile';
import { getSSB } from '../../../../packages/worker-ssb/src/instance';
import { touch } from '../../../../packages/worker-ssb/src/blobCache';

function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'new' | 'import' | null>(null);

  const setProfile = useProfile((s) => s.setProfile);
  const importProfile = useProfile((s) => s.importProfile);
  const profile = useProfile((s) => s.profile);

  // new account states
  const [username, setUsername] = useState('');
  const [keys, setKeys] = useState<{ pk: string; sk: string } | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<any>(null);
  const [avatarHash, setAvatarHash] = useState<string | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2 && mode === 'new' && !keys && !mnemonic) {
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
      (async () => {
        const k: any = await ssbCall('initKeys');
        if (k) setKeys(k);
        const m: any = await cashuCall('initWallet');
        setMnemonic(m);
      })();
      return () => {
        ssbWorker.terminate();
        cashuWorker.terminate();
      };
    }
  }, [step, mode, keys, mnemonic]);

  const onCropComplete = useCallback((_, areaPixels: any) => {
    setCroppedArea(areaPixels);
  }, []);

  const saveAvatar = useCallback(async () => {
    if (!avatarSrc || !croppedArea) return;
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
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const ssb = getSSB();
      const writer = ssb.blobs.add();
      const data = new Uint8Array(await blob.arrayBuffer());
      writer.write(data);
      writer.end((_: any, hash: string) => {
        touch(hash, data.byteLength);
        setAvatarHash(hash);
        setAvatarPreview(URL.createObjectURL(blob));
      });
    }, 'image/jpeg');
  }, [avatarSrc, croppedArea]);

  // import states
  const [profileJson, setProfileJson] = useState<any>(null);
  const [walletJson, setWalletJson] = useState<any>(null);

  useEffect(() => {
    if (mode === 'import' && profileJson && walletJson) {
      importProfile({ ...profileJson, cashuMnemonic: walletJson.cashuMnemonic });
      setStep(3);
    }
  }, [mode, profileJson, walletJson, importProfile]);

  const [toast, setToast] = useState(false);

  const confirm = async () => {
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
    <div className="space-y-4">
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <button
            className="bg-blue-500 text-white py-2 rounded"
            onClick={() => {
              setMode('new');
              setStep(2);
            }}
          >
            New Account
          </button>
          <button
            className="bg-green-500 text-white py-2 rounded"
            onClick={() => {
              setMode('import');
              setStep(2);
            }}
          >
            Import Backup
          </button>
        </div>
      )}
      {step === 2 && mode === 'new' && (
        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {!avatarSrc && (
            <Dropzone
              onDrop={(files) => {
                const f = files[0];
                if (f) setAvatarSrc(URL.createObjectURL(f));
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="w-32 h-32 border-2 border-dashed flex items-center justify-center cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <span>Avatar</span>
                </div>
              )}
            </Dropzone>
          )}
          {avatarSrc && (
            <div className="space-y-2">
              <div className="relative w-64 h-64 bg-gray-200">
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={saveAvatar}
              >
                Use Avatar
              </button>
              {avatarPreview && (
                <img src={avatarPreview} className="w-16 h-16 rounded-full" />
              )}
            </div>
          )}
        </div>
      )}
      {step === 2 && mode === 'import' && (
        <div className="space-y-4">
          <Dropzone
            onDrop={async (files) => {
              const f = files[0];
              if (!f) return;
              try {
                const txt = await f.text();
                setProfileJson(JSON.parse(txt));
              } catch {}
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="p-4 border-2 border-dashed cursor-pointer text-center"
              >
                <input {...getInputProps()} />
                <p>Drop profile backup JSON</p>
              </div>
            )}
          </Dropzone>
          <Dropzone
            onDrop={async (files) => {
              const f = files[0];
              if (!f) return;
              try {
                const txt = await f.text();
                setWalletJson(JSON.parse(txt));
              } catch {}
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="p-4 border-2 border-dashed cursor-pointer text-center"
              >
                <input {...getInputProps()} />
                <p>Drop wallet backup JSON</p>
              </div>
            )}
          </Dropzone>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {avatarPreview && (
              <img src={avatarPreview} className="w-16 h-16 rounded-full" />
            )}
            <span>{mode === 'new' ? username : profile?.username}</span>
          </div>
          <button
            className="bg-blue-500 text-white py-2 rounded"
            onClick={confirm}
          >
            Confirm
          </button>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded">
          Welcome to CashuCast!
        </div>
      )}
    </div>
  );
}

export default function Onboarding() {
  return (
    <Dialog.Root open>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded p-4 w-full max-w-md">
          <OnboardingContent />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function OnboardingDialog() {
  const profile = useProfile((s) => s.profile);
  const [open, setOpen] = useState(!profile);
  useEffect(() => setOpen(!profile), [profile]);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded p-4 w-full max-w-md">
          <OnboardingContent />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
