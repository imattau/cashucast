/*
 * Licensed under GPL-3.0-or-later
 * Test suite for onboarding.
 */
/// <reference types="cypress" />

describe('Onboarding new account flow', () => {
  it('creates a profile and lands on timeline', () => {
    cy.visit('/');

    cy.window().then((win) => {
      class MockWorker {
        onmessage: ((e: any) => void) | null = null;
        postMessage(msg: any) {
          const { method, id } = msg;
          if (method === 'initKeys') {
            this.onmessage?.({ data: { result: { pk: 'pk', sk: 'sk' }, id } });
          } else if (method === 'initWallet') {
            this.onmessage?.({ data: { result: 'mnemonic', id } });
          }
        }
        addEventListener(type: string, cb: any) {
          if (type === 'message') this.onmessage = cb;
        }
        removeEventListener() {}
        terminate() {}
      }
      // @ts-ignore
      win.Worker = MockWorker;
    });

    cy.contains('New Account').click();
    cy.get('input[placeholder="Username"]').type('alice');

    cy.contains('Confirm').click();
    cy.url().should('match', /\/$/);
  });
});
