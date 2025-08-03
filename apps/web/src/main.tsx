import React from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";

// Ensure Node-style Buffer is available before loading the rest of the app.
globalThis.Buffer = globalThis.Buffer || Buffer;

const container = document.getElementById("root")!;
const root = createRoot(container);

// Dynamically import the application only after Buffer has been polyfilled.
import("./App").then(({ default: App }) => {
  root.render(<React.StrictMode><App /></React.StrictMode>);
});
