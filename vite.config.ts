import { join } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { createAppConfig } from '@nextcloud/vite-config'

// replaced by vite
declare const __dirname: string

export default createAppConfig({
	mindmap: join(__dirname, 'src', 'mindmap.js'),
}, {
	inlineCSS: { relativeCSSInjection: true },
	config: {
		experimental: {
			renderBuiltUrl(filename) {
				return {
					// already contains the "js/" prefix as it is our output file configuration
					runtime: `OC.filePath('files_mindmap', '', '${filename}')`,
				}
			},
		},
		plugins: [
			viteStaticCopy({
				targets: [
					{
						src: 'src/viewer.js',
						dest: 'js'
					}
				]
			})
		]
	},
})
