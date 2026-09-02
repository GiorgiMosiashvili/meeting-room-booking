import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Enables the SWC transform for styled-components (SSR, minification,
    // stable class names). Pairs with the StyleSheetManager registry in
    // src/lib/registry.tsx.
    styledComponents: true,
  },
};

export default nextConfig;
