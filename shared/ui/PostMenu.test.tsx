import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { PostMenu } from './PostMenu';

describe('PostMenu', () => {
  it('renders report and block actions', () => {
    const html = renderToStaticMarkup(
      <PostMenu
        postId="p1"
        authorPubKey="a1"
        onReport={() => {}}
        onBlock={() => {}}
        open
      />
    );
    expect(html).toContain('Report');
    expect(html).toContain('Block author');
  });
});
