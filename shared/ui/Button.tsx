/*
 * Licensed under GPL-3.0-or-later
 * React component for Button.
 */
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  const base =
    'rounded-lg px-4 py-3 bg-primary text-white hover:bg-primary disabled:opacity-50 min-tap';
  return <button className={`${base} ${className}`.trim()} {...props} />;
};

