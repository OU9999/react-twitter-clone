import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./Root";
import { app } from "./firebase";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

console.log(app);

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
