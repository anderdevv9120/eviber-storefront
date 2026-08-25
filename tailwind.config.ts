import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Numbering chuẩn hóa toàn bộ: số càng to càng đậm; nấc của DEFAULT ghi cạnh từng nhóm.
    colors: {
      // Override toàn bộ theme.colors xóa cả bộ keyword mặc định — phải khai báo lại
      transparent: "transparent",
      black: "#000000",
      // Pine — chốt tại tasks/phase1/audit/ui-palette.html; DEFAULT = 600
      primary: {
        DEFAULT: "#0E7C66",
        50: "#F0FAF7",
        100: "#D7F0E8",
        200: "#AEE0D3",
        300: "#79CBB6",
        400: "#45B197",
        500: "#1F997E",
        600: "#0E7C66",
        700: "#0B6353",
        800: "#0C4F44",
        900: "#0B3F37",
      },
      // DEFAULT = 800; overlay là scrim có alpha, không thuộc thang đậm/nhạt
      dark: {
        DEFAULT: "#242424",
        50: "#D3CDC7",
        100: "#CCCCCC",
        200: "#B9B9B9",
        300: "#939CAB",
        400: "#808080",
        500: "#626262",
        600: "#444444",
        700: "#383838",
        800: "#242424",
        900: "#222222",
        overlay: "#00000080",
      },
      // Thang xám sáng cho nền/viền; DEFAULT = #FFF đứng ngoài thang
      white: {
        DEFAULT: "#FFFFFF",
        50: "#F9F9F9",
        100: "#F5F5F5",
        200: "#F2F2F2",
        300: "#EBEBEB",
        400: "#E8E7E7",
        500: "#E7E7E7",
        600: "#D9D9D9",
      },
      // DEFAULT = 500
      yellow: {
        DEFAULT: "#F9A825",
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
      terracotta: "#C4472B",
      // DEFAULT = 600
      red: {
        DEFAULT: "#FC2B2B",
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
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        // Shadow card cụm auth — neutral tỏa rộng theo bản tham khảo user chốt
        "auth-card":
          "0 24px 60px -12px rgba(36, 36, 36, 0.14), 0 4px 14px rgba(36, 36, 36, 0.05)",
        // Elevation card sản phẩm (thay border) — chốt tại mockup card-look V2
        card: "0 1px 2px rgba(36, 36, 36, 0.04), 0 10px 28px -14px rgba(36, 36, 36, 0.12)",
        "card-hover":
          "0 2px 4px rgba(36, 36, 36, 0.06), 0 18px 44px -16px rgba(36, 36, 36, 0.18)",
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
