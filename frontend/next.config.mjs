/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode double-mounts client effects in dev, which destroys + recreates
  // the Photo Sphere Viewer instance mid-texture-load and leaves the panorama
  // perpetually "loading". The viewer cleanup is correct, but PSV's WebGL
  // texture loader doesn't survive the second teardown reliably. Disabling
  // strict mode is the practical fix; see also the same-URL guard in
  // TourViewer.tsx.
  reactStrictMode: false,
};

export default nextConfig;
