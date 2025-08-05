/*
 * Licensed under GPL-3.0-or-later
 * React component for main.
 */
import React from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

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

  // Some third-party libraries expect `document.currentScript` to be
  // defined. In modern bundlers like Vite this property can be `null`,
  // which causes those libraries to throw when they try to access
  // `currentScript.src`. Provide an empty placeholder to keep them
  // happy.
  if (!(document as any).currentScript) {
    const script = document.createElement("script");
    script.src = "";
    Object.defineProperty(document, "currentScript", { value: script });
  }

  const container = document.getElementById("root")!;
  const root = createRoot(container);
  const { default: App } = await import("./App");
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );
}

bootstrap();
