import React from "react";
import "../index.css";
import { createRoot } from "react-dom/client";

async function bootstrap() {
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
