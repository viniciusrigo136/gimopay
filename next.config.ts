import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components + prefetch parcial (padrão do Next 16); a página é toda estática.
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
