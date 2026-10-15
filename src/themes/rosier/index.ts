import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont, displayFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import BrandStory from "./BrandStory";

const theme = {
  fontClassName: `${bodyFont.variable} ${displayFont.variable}`,
  Header,
  Hero,
  BrandStory,
} satisfies ThemeModule;

export default theme;
