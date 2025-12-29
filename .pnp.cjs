/**
 * Dummy Yarn Plug'n'Play manifest.
 * This file exists to prevent parent directory .pnp.cjs files from interfering with the build.
 * It signals to tools like esbuild that this project does not use PnP.
 */
module.exports = {
  findPnpApi: () => null,
  VERSIONS: { std: 3 },
};
