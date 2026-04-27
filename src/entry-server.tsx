import { renderToString } from "react-dom/server";
import App from "./App.tsx";

export const render = (url: string): string => {
  return renderToString(<App location={url} />);
};
