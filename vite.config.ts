/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const gaPlugin = {
    name: 'inject-ga',
    transformIndexHtml(html: string) {
      const gaId = env.VITE_GA_ID
      if (!gaId) return html
      const snippet = `\n    <!-- Google tag (gtag.js) -->\n    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', '${gaId}');\n    </script>`
      return html.replace('</title>', `</title>${snippet}`)
    },
  }

  return {
    plugins: [tailwindcss(), svelte(), gaPlugin],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.ts'],
    },
  }
})
