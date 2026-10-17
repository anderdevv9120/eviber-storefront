import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import ProductCard from "./card";
import { bodyFont } from "./fonts";
import Header from "./Header";
import Hero from "./Hero";
import Home from "./Home";
import Footer from "./Footer";
import BrandStory from "./BrandStory";
import Wordmark from "./Wordmark";

const theme = {
  fontClassName: bodyFont.variable,
  Header,
  Hero,
  BrandStory,
  Wordmark,
  Home,
  ProductCard,
  Footer,
} satisfies ThemeModule;

export default theme;
