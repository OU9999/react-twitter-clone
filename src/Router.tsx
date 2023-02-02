import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Auth from "./screens/Auth";
import Home from "./screens/Home";

const router = createBrowserRouter(
  [
    {
      path: `/`,
      element: <Root />,
      children: [
        {
          path: "home",
          element: <Home />,
        },
        {
          path: "auth",
          element: <Auth />,
        },
      ],
    },
  ]
  //   {
  //     basename: process.env.PUBLIC_URL,
  //   }
);

export default router;
