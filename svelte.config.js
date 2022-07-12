import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    adapter: vercel(),
    version: {
      name: '0.0.6',
      pollInterval: 60 * 60 * 1000
    }
  }
};

export default config;
