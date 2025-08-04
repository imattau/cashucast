/*
 * Licensed under GPL-3.0-or-later
 * React component for Stepper.
 */
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MintSelect } from './MintSelect';
import { InstallBanner } from './InstallBanner';

const ONBOARD_KEY = 'onboardingCompleted';
const TOTAL_STEPS = 3;

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
    setStep(TOTAL_STEPS);
  };

  React.useEffect(() => {
    if (step === TOTAL_STEPS) {
      setOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ONBOARD_KEY, 'true');
      }
    }
  }, [step]);

  if (!open || step >= TOTAL_STEPS) return null;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-on-surface/50 dark:bg-on-surface-dark/50" />
        <Dialog.Content
          aria-modal="true"
          className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded bg-surface-100 dark:bg-surface-800 text-on-surface dark:text-on-surface-dark p-4 sm:p-6 md:p-8 mx-4 sm:mx-0 focus:outline-none"
        >
          <div
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            className="mb-4 text-sm text-gray-500"
          >
            Step {step + 1} of {TOTAL_STEPS}
          </div>
          {step === 0 && (
            <div>
              <h2 className="mb-2 text-lg font-semibold">Choose a username</h2>
              <label htmlFor="stepper-username" className="sr-only">
                Username
              </label>
              <input
                id="stepper-username"
                name="username"
                className="mb-4 w-full rounded border px-4 py-3 min-h-[44px]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                autoFocus
              />
              <button
                disabled={!username}
                aria-disabled={!username}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('username', username);
                  }
                  setStep(1);
                }}
                className="rounded bg-primary hover:bg-primary px-4 py-3 min-tap disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {step === 1 && <MintSelect onNext={() => setStep(2)} />}
          {step === 2 && <InstallBanner onFinish={complete} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
