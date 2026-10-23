import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CookiesProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
