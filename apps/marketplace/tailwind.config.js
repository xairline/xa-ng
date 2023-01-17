/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
};
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
