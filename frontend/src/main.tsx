import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";

import "./style.css";

import App from "./App";
import Add from "./pages/Add";
import Home from "./pages/Home";
import Clock from "./pages/Clock";
import Timer from "./pages/Timer";
import Setting from "./pages/Setting";
import Weather from "./pages/Weather";
import RouterErrorPage from "./pages/RouterErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

polyfillCountryFlagEmojis();

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
        children: [
          { index: true, element: <Clock /> },
          { path: "/weather", element: <Weather /> },
          { path: "/timer", element: <Timer /> },
        ],
      },
      { path: "/add", element: <Add /> },
      { path: "/settings", element: <Setting /> },
      { path: "*", element: <Navigate to="/" replace={true} /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
