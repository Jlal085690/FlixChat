import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document language and direction for Arabic
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";

createRoot(document.getElementById("root")!).render(<App />);
