import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import { bodyFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import Home from "./Home";
import ProductCard from "./card";
import Footer from "./Footer";
import BrandStory from "./BrandStory";
import Wordmark from "./Wordmark";

const theme = {
  fontClassName: bodyFont.variable,
  Header,
  Hero,
  Home,
  ProductCard,
  Footer,
  BrandStory,
  Wordmark,
} satisfies ThemeModule;

export default theme;
