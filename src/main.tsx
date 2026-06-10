import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;

function dispatchRenderEvent() {
  // Signals vite-plugin-prerender's PuppeteerRenderer that the page is ready
  document.dispatchEvent(new Event("render-event"));
}

// If the server pre-rendered content is present, hydrate. Otherwise do a normal client render.
if (container.hasChildNodes() && container.firstElementChild) {
  hydrateRoot(container, <App />, {
    onRecoverableError: () => {}, // silence hydration mismatch noise in prod
  });
  dispatchRenderEvent();
} else {
  const root = createRoot(container);
  root.render(<App />);
  // Fire after first paint
  requestAnimationFrame(dispatchRenderEvent);
}
