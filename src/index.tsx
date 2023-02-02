import React from "react";
import ReactDOM from "react-dom/client";
import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { RecoilRoot } from "recoil";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const GlobalStyle = createGlobalStyle`
  ${reset}
  body {  
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: white;
  }
  *{
    box-sizing: border-box;
  }
  a{
    text-decoration: none;
    color:inherit;
  }
`;

root.render(
  <React.StrictMode>
    <RecoilRoot>
      <GlobalStyle />
      <RouterProvider router={router} />
    </RecoilRoot>
  </React.StrictMode>
);
