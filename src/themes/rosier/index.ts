import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import DefaultHome from "@/app/(main)/_component/DefaultHome";
import ProductCard from "./card";
import Footer from "@/layouts/Footer";
import { bodyFont, displayFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import BrandStory from "./BrandStory";
import Wordmark from "./Wordmark";

const theme = {
  fontClassName: `${bodyFont.variable} ${displayFont.variable}`,
  Header,
  Hero,
  BrandStory,
  Wordmark,
  Home: DefaultHome,
  ProductCard,
  Footer,
} satisfies ThemeModule;

export default theme;
