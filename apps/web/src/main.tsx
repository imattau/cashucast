import React from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App";

globalThis.Buffer = globalThis.Buffer || Buffer;

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<React.StrictMode><App /></React.StrictMode>);
