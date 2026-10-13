import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont, displayFont } from "./fonts";
import Header from "./Header";
// Tạm dùng Hero của classic (thay ở Task 9)
import Hero from "../classic/Hero";

const theme = {
  fontClassName: `${bodyFont.variable} ${displayFont.variable}`,
  Header,
  Hero,
} satisfies ThemeModule;

export default theme;
