import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/themes/**/*.{ts,tsx}",
  ],
  theme: {
    // Numbering chuẩn hóa toàn bộ: số càng to càng đậm; nấc của DEFAULT ghi cạnh từng nhóm.
    colors: {
      // Override toàn bộ theme.colors xóa cả bộ keyword mặc định — phải khai báo lại
      transparent: "transparent",
      black: "#000000",
      // primary/dark/white(50-600)/terracotta/page: giá trị nằm ở src/themes/*/tokens.css
      // (classic = Pine, chốt tại tasks/phase1/audit/ui-palette.html); DEFAULT = 600
      primary: {
        DEFAULT: "rgb(var(--color-primary-600) / <alpha-value>)",
        50: "rgb(var(--color-primary-50) / <alpha-value>)",
        100: "rgb(var(--color-primary-100) / <alpha-value>)",
        200: "rgb(var(--color-primary-200) / <alpha-value>)",
        300: "rgb(var(--color-primary-300) / <alpha-value>)",
        400: "rgb(var(--color-primary-400) / <alpha-value>)",
        500: "rgb(var(--color-primary-500) / <alpha-value>)",
        600: "rgb(var(--color-primary-600) / <alpha-value>)",
        700: "rgb(var(--color-primary-700) / <alpha-value>)",
        800: "rgb(var(--color-primary-800) / <alpha-value>)",
        900: "rgb(var(--color-primary-900) / <alpha-value>)",
      },
      // DEFAULT = 800; overlay là scrim có alpha, không thuộc thang đậm/nhạt
      dark: {
        DEFAULT: "rgb(var(--color-dark-800) / <alpha-value>)",
        50: "rgb(var(--color-dark-50) / <alpha-value>)",
        100: "rgb(var(--color-dark-100) / <alpha-value>)",
        200: "rgb(var(--color-dark-200) / <alpha-value>)",
        300: "rgb(var(--color-dark-300) / <alpha-value>)",
        400: "rgb(var(--color-dark-400) / <alpha-value>)",
        500: "rgb(var(--color-dark-500) / <alpha-value>)",
        600: "rgb(var(--color-dark-600) / <alpha-value>)",
        700: "rgb(var(--color-dark-700) / <alpha-value>)",
        800: "rgb(var(--color-dark-800) / <alpha-value>)",
        900: "rgb(var(--color-dark-900) / <alpha-value>)",
        overlay: "#00000080",
      },
      // Thang xám sáng cho nền/viền; DEFAULT = #FFF đứng ngoài thang
      white: {
        DEFAULT: "#FFFFFF",
        50: "rgb(var(--color-white-50) / <alpha-value>)",
        100: "rgb(var(--color-white-100) / <alpha-value>)",
        200: "rgb(var(--color-white-200) / <alpha-value>)",
        300: "rgb(var(--color-white-300) / <alpha-value>)",
        400: "rgb(var(--color-white-400) / <alpha-value>)",
        500: "rgb(var(--color-white-500) / <alpha-value>)",
        600: "rgb(var(--color-white-600) / <alpha-value>)",
      },
      // DEFAULT = 500
      yellow: {
        DEFAULT: "#F9A825",
        50: "#FEFAF1",
        100: "#FDE047",
        200: "#FACC15",
        300: "#F5CF05",
        400: "#EAB308",
        500: "#F9A825",
        600: "#CA8A04",
        700: "#A16207",
        800: "#854D0E",
        900: "#713F12",
      },
      // Terracotta — accent sale (badge % + giá đang giảm), chốt tại mockup card-look vòng 4
      terracotta: "rgb(var(--color-terracotta) / <alpha-value>)",
      // Nền trang (body) — classic trắng, theme khác có thể ngả màu
      page: "rgb(var(--color-page) / <alpha-value>)",
      // DEFAULT = 600
      red: {
        DEFAULT: "#FC2B2B",
        50: "#FDECEC",
        100: "#FECACA",
        200: "#FCA5A5",
        300: "#F87171",
        400: "#FA6338",
        500: "#EB5757",
        600: "#FC2B2B",
        700: "#CF5763",
        800: "#DC2626",
        900: "#E01020",
      },
      // DEFAULT = 400
      blue: {
        DEFAULT: "#0089ED",
        50: "#F2F9FE",
        100: "#BFDBFE",
        200: "#93C5FD",
        300: "#60A5FA",
        400: "#0089ED",
        500: "#3B82F6",
        600: "#2563EB",
        700: "#1D4ED8",
        800: "#33496C",
        900: "#1E3A8A",
      },
      // DEFAULT đứng ngoài thang (xám ngả lam kế thừa)
      gray: {
        DEFAULT: "#939CAB",
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
      },
      // DEFAULT = 700
      green: {
        DEFAULT: "#15803D",
        50: "#F3FBF5",
        100: "#DCFCE7",
        200: "#D1FAE5",
        300: "#BBF7D0",
        400: "#86EFAC",
        500: "#4ADE80",
        600: "#22C55E",
        700: "#15803D",
        800: "#166534",
        900: "#14532D",
      },
    },
    // Override toàn bộ: none/full cố định, còn lại đọc token theme; btn/btn-lg chỉ cho Button
    borderRadius: {
      none: "0px",
      sm: "var(--radius-sm)",
      DEFAULT: "var(--radius-default)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
      "2xl": "var(--radius-2xl)",
      "3xl": "var(--radius-3xl)",
      full: "9999px",
      btn: "var(--radius-btn)",
      "btn-lg": "var(--radius-btn-lg)",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        // Shadow card cụm auth — neutral tỏa rộng theo bản tham khảo user chốt
        "auth-card": "var(--shadow-auth-card)",
        // Elevation card sản phẩm (thay border) — chốt tại mockup card-look V2
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      fill: {
        hover: {
          blue: "#4299e1",
          red: "#f56565",
        },
      },
      keyframes: {
        fadeInDown: {
          "0%": {
            top: "50%",
            opacity: "0",
          },
          "100%": {
            top: "100%",
            opacity: "1",
          },
        },
        fadeInUp: {
          "0%": {
            bottom: "50%",
            opacity: "0",
          },
          "100%": {
            bottom: "100%",
            opacity: "1",
          },
        },
        changeColor: {
          "0%": {
            backgroundSize: "0 100%",
            backgroundColor: "#B9B9B9",
          },
          "100%": {
            backgroundSize: "100% 100%",
            backgroundColor: "#B4916C",
          },
        },
      },
    },
  },
  variants: {
    fill: ["hover"],
  },
  plugins: [],
};

export default config;
