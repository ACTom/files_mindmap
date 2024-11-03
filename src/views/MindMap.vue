<template>
	<iframe ref="iframe"
	:src="iframeSrc"
	@load="onIFrameLoaded" ></iframe>
</template>

<script>
//import { showError } from '@nextcloud/dialogs'
import { getLanguage } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'

console.debug('MindMap Vue Loading');

export default {
	name: 'MindMap',

    computed: {
		iframeSrc() {
			return generateUrl('/apps/files_mindmap/?file={file}', {
				file: this.source ?? this.davPath,
			})
		},

		file() {
			// fileList and fileid are provided by the Mime mixin of the Viewer.
			console.debug('MindMap Vue file()', file);
			return this.fileList.find((file) => file.fileid === this.fileid)
		},

		isEditable() {
			console.log('Mindmap isEditable ', this.file.permissions);
			return this.file?.permissions?.indexOf('W') >= 0
		},
	},

    async mounted() {
		document.addEventListener('webviewerloaded', this.handleWebviewerloaded)

		if (isPublicPage() && isPdf()) {
			// Force style for public shares of a single PDF file, as there are
			// no CSS selectors that could be used only for that case.
			this.$refs.iframe.style.height = '100%'
			this.$refs.iframe.style.position = 'absolute'
			this.$refs.iframe.style.marginTop = 'unset'
		}

		this.doneLoading()
		this.$nextTick(function() {
			this.$el.focus()
		})
	},

    beforeDestroy() {
		document.removeEventListener('webviewerloaded', this.handleWebviewerloaded)
	},

	methods: {
		onIFrameLoaded() {
            console.log('File:', this.file);

			if (this.isEditable) {
				this.$nextTick(() => {
					this.getDownloadElement().removeAttribute('hidden')
					this.getEditorModeButtonsElement().removeAttribute('hidden')
				})
			}
		},

		getIframeDocument() {
			// $refs are not reactive, so a method is used instead of a computed
			// property for clarity.
			return this.$refs.iframe.contentDocument
		},

		getDownloadElement() {
			return this.getIframeDocument().getElementById('download')
		},

		getEditorModeButtonsElement() {
			return this.getIframeDocument().getElementById('editorModeButtons')
		},

		handleWebviewerloaded() {
			//const PDFViewerApplicationOptions = this.$refs.iframe.contentWindow.PDFViewerApplicationOptions

			const language = getLanguage()

		},

		handleSave() {
			const downloadElement = this.getDownloadElement()
			downloadElement.setAttribute('disabled', 'disabled')
			downloadElement.classList.add('icon-loading-small')

			logger.info('PDF Document with annotation is being saved')

			this.PDFViewerApplication.pdfDocument.saveDocument().then((data) => {
				return uploadPdfFile(this.file.filename, data)
			}).then(() => {
				logger.info('File uploaded successfully')
			}).catch(error => {
				logger.error('Error uploading file:', error)

				//showError(t('files_pdfviewer', 'File upload failed.'))

				// Enable button again only if the upload failed; if it was
				// successful it will be enabled again when a new annotation is
				// added.
				downloadElement.removeAttribute('disabled')
			}).finally(() => {
				downloadElement.classList.remove('icon-loading-small')
			})
		},
	},
}
</script>

<style lang="scss" scoped>
iframe {
	width: 100%;
	height: calc(100vh - var(--header-height));
	margin-top: var(--header-height);
	position: absolute;
}
</style>