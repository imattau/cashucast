/*
 * Licensed under GPL-3.0-or-later
 * React component for Stepper.
 */
import React from 'react';
import { MintSelect } from './MintSelect';
import { InstallBanner } from './InstallBanner';

const ONBOARD_KEY = 'onboardingCompleted';

/** Overlay-based onboarding stepper for first-time users. */
export const Stepper: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const [open, setOpen] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARD_KEY) !== 'true';
  });
  const [username, setUsername] = React.useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('username') ?? '';
  });

  const complete = () => {
    setStep(3);
  };

  React.useEffect(() => {
    if (step === 3) {
      setOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARD_KEY, 'true');
      }
    }
  }, [step]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded bg-white p-4">
        {step === 0 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Choose a username</h2>
            <label htmlFor="stepper-username" className="sr-only">
              Username
            </label>
            <input
              id="stepper-username"
              name="username"
              className="mb-4 w-full rounded border p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
            />
            <button
              disabled={!username}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('username', username);
                }
                setStep(1);
              }}
              className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        {step === 1 && <MintSelect onNext={() => setStep(2)} />}
        {step === 2 && <InstallBanner onFinish={complete} />}
      </div>
    </div>
  );
};
