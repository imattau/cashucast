/*
 * Licensed under GPL-3.0-or-later
 * React component for CaptionTextarea.
 */
import React from 'react';
import TextField from '@mui/material/TextField';

// Material 3 text field spec: https://m3.material.io/components/text-fields/overview
// MUI TextField docs: https://mui.com/material-ui/react-text-field/

/**
 * CaptionTextarea is a simple text field for adding captions to a clip.
 */
export interface CaptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const CaptionTextarea: React.FC<CaptionTextareaProps> = ({ value, onChange }) => (
  <TextField
    id="caption"
    name="caption"
    label="Caption"
    placeholder="Add a caption"
    multiline
    fullWidth
    value={value}
    onChange={(e) => onChange(e.target.value)}
    helperText="Write a caption for your clip"
  />
);

