import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import BrandStory from "./BrandStory";

const theme = {
  fontClassName: bodyFont.variable,
  Header,
  Hero,
  BrandStory,
} satisfies ThemeModule;

export default theme;
