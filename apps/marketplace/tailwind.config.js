const {createGlobPatternsForDependencies} = require('@nrwl/next/tailwind');

const purgeGlob = '/**/!(*.stories|*.spec).{ts,tsx}';

const tailwindConfig = {
  // ... tailwind stuff

  purge: [
    __dirname + purgeGlob,
    ...createGlobPatternsForDependencies('apps/marketplace', purgeGlob),
  ],

  darkMode: 'class',
  plugins: [require('nightwind')],
};

module.exports = tailwindConfig;
