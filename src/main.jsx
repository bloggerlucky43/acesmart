import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: "#6A1B9A",
        secondary: "#10B981",
        accent: "#CDDC39", //HOVER SATES,CORRECT ANSWERS,HIGHLIGHTS
        contrast: "#1C1c2e",
        danger: "#EF4444",
        energy: "#fff59d",
        off: "#FAFAFA",
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
