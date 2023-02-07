import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Auth from "./screens/Auth";
import Home from "./screens/Home";
import Profile from "./screens/Profile";

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
        {
          path: "profile",
          element: <Profile />,
        },
      ],
    },
  ]
  //   {
  //     basename: process.env.PUBLIC_URL,
  //   }
);

export default router;
