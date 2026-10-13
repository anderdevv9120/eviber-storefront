import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";

const theme = {
  fontClassName: bodyFont.variable,
  Header,
  Hero,
} satisfies ThemeModule;

export default theme;
