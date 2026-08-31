import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iyzipay dinamik `require()` ile kendi kaynak dosyalarını yüklüyor;
  // Turbopack/Webpack bunu statik olarak paketleyemiyor, o yüzden Node'a bırakıyoruz.
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
