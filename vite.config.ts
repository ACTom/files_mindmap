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
					runtime: `OC.filePath('files_mindmap2', '', '${filename}')`,
				}
			},
		},
		plugins: [
			viteStaticCopy({
				targets: [
					{
						src: 'src/viewer.js',
						dest: 'js'
					},
                    {
						src: 'node_modules/bootstrap/dist/js/bootstrap.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/jquery/dist/jquery.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/jspdf/dist/jspdf.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/codemirror/lib/codemirror.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/xml/xml.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/javascript/javascript.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/css/css.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/htmlmixed/htmlmixed.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/markdown/markdown.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/mode/gfm/gfm.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/codemirror/addon/mode/overlay.js',
						dest: 'js/codemirror'
				    },
                    {
						src: 'node_modules/angular/angular.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/angular-ui-codemirror/src/ui-codemirror.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/kityminder-core/dist/kityminder.core.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/hotbox-uex/hotbox.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/marked/marked.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/js-base64/base64.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/colorpicker-uex/dist/color-picker.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/kity/dist/kity.min.js',
						dest: 'js'
				    },
                    {
						src: 'node_modules/dist/kityminder.editor.min.js',
						dest: 'js'
				    }
				]
			})
		]
	},
})
