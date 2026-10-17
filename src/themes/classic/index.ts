import "./tokens.css";
import type { ThemeModule } from "@/themes/types";
import DefaultHome from "@/app/(main)/_component/DefaultHome";
import DefaultProductCard from "@/components/ui/DefaultProductCard";
import Footer from "@/layouts/Footer";
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
  Home: DefaultHome,
  ProductCard: DefaultProductCard,
  Footer,
} satisfies ThemeModule;

export default theme;
