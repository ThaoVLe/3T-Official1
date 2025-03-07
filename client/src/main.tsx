import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/embla.css"; // Carousel styling
import "./styles/video-thumbnail.css"; // Video thumbnail styling

createRoot(document.getElementById("root")!).render(<App />);