import { useState } from 'react';

export default function Onboarding() {
  const [name, setName] = useState('Matt');
  const [avatar, setAvatar] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Onboarding</h1>
      <p className="mb-6 text-sm text-white/80">Set up your profile to start using CashuCast</p>

      <div className="w-full max-w-md bg-white/5 p-6 rounded-xl flex flex-col gap-4 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your display name"
          className="w-full px-4 py-2 rounded bg-black/80 border border-white/20 text-white"
        />

        <button
          className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded"
          onClick={() => {
            // simulate avatar set
            setAvatar('/assets/avatar-default.jpg');
          }}
        >
          Use Avatar
        </button>

        {avatar && (
          <img
            src={avatar}
            alt="Avatar"
            className="w-32 h-32 object-cover rounded-full border-4 border-white"
          />
        )}
      </div>
    </div>
  );
}
