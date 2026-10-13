import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont, displayFont } from "./fonts";
// Tạm dùng Header/Hero của classic (thay ở Task 8-9)
import Header from "../classic/Header";
import Hero from "../classic/Hero";

const theme = {
  fontClassName: `${bodyFont.variable} ${displayFont.variable}`,
  Header,
  Hero,
} satisfies ThemeModule;

export default theme;
