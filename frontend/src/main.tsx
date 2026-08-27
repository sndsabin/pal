import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";

import "./style.css";

import App from "./App";
import Add from "./pages/Add";
import Home from "./pages/Home";
import Setting from "./pages/Setting";
import RouterErrorPage from "./pages/RouterErrrorPage";
import ErrorBoundary from "./components/ErrorBoundary";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterErrorPage />,
    children: [
      { index: true, element: <Home /> },
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
