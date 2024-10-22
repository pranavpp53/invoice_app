import React from "react";
import ReactDOM from "react-dom/client";
import "./style/style.css";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { RouterProvider } from "react-router-dom";
import router from "./route.jsx";
import { appName, appLogo } from "./assets/appConfig.js";

document.title = appName;

// Dynamically set the favicon
const setFavicon = (iconUrl) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.href = iconUrl;
};

setFavicon(appLogo);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
