/** @type {import('next').NextConfig} */
const nextConfig = {
  // @libsql/client has optional native bindings; keep it external from the bundler.
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
