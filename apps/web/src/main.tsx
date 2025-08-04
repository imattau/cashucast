/*
 * Licensed under GPL-3.0-or-later
 * React component for main.
 */
import React from "react";
import "../index.css";
import { createRoot } from "react-dom/client";

async function bootstrap() {
  // Polyfill Node's `process` globally when running in the browser.
  if (!(globalThis as any).process) {
    (globalThis as any).process = {
      env: {},
      browser: true,
      nextTick: (cb: (...args: any[]) => void) => setTimeout(cb, 0),
      exit: () => {},
    };
  }

  // Polyfill Node's `Buffer` globally when running in the browser. Vite
  // externalizes built-in modules, so we dynamically load the `buffer`
  // package's implementation instead.
  if (!globalThis.Buffer) {
    const { Buffer } = await import("buffer/");
    (globalThis as any).Buffer = Buffer;
  }

  const container = document.getElementById("root")!;
  const root = createRoot(container);
  const { default: App } = await import("./App");
  root.render(<React.StrictMode><App /></React.StrictMode>);
}

bootstrap();
