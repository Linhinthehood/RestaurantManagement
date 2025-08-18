import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DndProvider>
    </Provider>
  </StrictMode>
);
