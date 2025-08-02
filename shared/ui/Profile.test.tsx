import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { Profile } from './Profile';

const baseProps = {
  creatorId: 'id',
  name: 'Alice',
  clips: [],
};

describe('Profile', () => {
  it('renders blocked banner when blocked', () => {
    const html = renderToStaticMarkup(<Profile {...baseProps} blocked />);
    expect(html).toContain('You have blocked this user');
  });

  it('does not render banner when not blocked', () => {
    const html = renderToStaticMarkup(<Profile {...baseProps} />);
    expect(html).not.toContain('You have blocked this user');
  });
});
