import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import BrandStory from "./BrandStory";
import { Logo } from "@/components/icons";

const theme = {
  fontClassName: bodyFont.variable,
  Header,
  Hero,
  BrandStory,
  Wordmark: Logo,
} satisfies ThemeModule;

export default theme;
