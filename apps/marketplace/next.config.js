//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {withNx} = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

module.exports = withNx(nextConfig);
module.exports = {
  async rewrites() {
    return [
      {
        source: '/apis/:slug*',
        destination: 'http://localhost:8080/apis/:slug*',
      },
    ];
  },
};