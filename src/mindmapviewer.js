import MindMap from './views/MindMap.vue'

const supportedMimes = OCA.FilesMindMap.getSupportedMimetypes();

if (OCA.Viewer) {
	OCA.Viewer.registerHandler({
		id: 'mindmap',
		group: null,
		mimes: supportedMimes,
		component: MindMap,
		theme: 'default',
		canCompare: true,
	});
}