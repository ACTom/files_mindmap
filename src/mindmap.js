import { basename, extname } from 'path'
import SvgPencil from '@mdi/svg/svg/pencil.svg?raw'

import {
	DefaultType,
	FileAction,
	addNewFileMenuEntry,
	registerFileAction,
	davGetClient,
	davResultToNode,
	File,
	Permission,
	davGetDefaultPropfind
} from '@nextcloud/files'
import { emit } from '@nextcloud/event-bus'
import axios from '@nextcloud/axios'
import { getCurrentUser } from '@nextcloud/auth'


import util from './util'
import km from './plugins/km'
import freemind from './plugins/freemind'
import xmind from './plugins/xmind'

var FilesMindMap = {
	_currentContext: null,
	_file: {},
	_lastTitle: '',
	_extensions: [],
	init: function() {
		this.registerExtension([km, freemind, xmind]);
	},

	registerExtension: function(objs) {
		var self = this;
		if (!Array.isArray(objs)) {
			objs = [objs];
		}
		objs.forEach(function(obj){
			self._extensions.push(obj);
		});
	},

	getExtensionByMime: function(mime) {
		for (var i = 0; i < this._extensions.length; i++) {
			var obj = this._extensions[i];
			if (obj.mimes.indexOf(mime) >= 0) {
				return obj;
			}
		}
		return null;
	},

	isSupportedMime: function(mime) {
		return this.getExtensionByMime(mime) !== null ? true : false;
	},

	showMessage: function(msg, delay, t) {
		var self = this;
		delay = delay || 3000;
		var id = OC.Notification.show(msg, t);
		setTimeout(function(){
			self.hideMessage(id);
		}, delay);
		return id;
	},

	hideMessage: function(id, t) {
		OC.Notification.hide(id, t);
	},

	hide: async function() {
		$('#mmframe').remove();
		if ($('#isPublic').val() && $('#filesApp').val()){
			$('#controls').removeClass('hidden');
			$('#content').removeClass('full-height');
			$('footer').removeClass('hidden');
		}

		// replace the controls with our own
		$('#app-content #controls').removeClass('hidden');

		document.title = this._lastTitle;

		if (!$('#mimetype').val()) {
			const client = davGetClient()
			const response = await client.stat(this._file.root + '/' + this._file.name, { details: true, data: davGetDefaultPropfind() })
			emit('files:node:updated', davResultToNode(response.data))
		} else {
			//TODO
		}
	},

	/**
	 * @param downloadUrl
	 * @param isFileList
	 */
	show: function() {
		var self = this;
		var $iframe;
		var shown = true;
		var viewer = OC.generateUrl('/apps/files_mindmap/');
		$iframe = $('<iframe id="mmframe" style="width:100%;height:100%;display:block;position:absolute;top:0;' +
            'z-index:1041;" src="'+viewer+'" allowfullscreen="true"/>');

		if ($('#isPublic').val()) {
			// force the preview to adjust its height
			$('#preview').append($iframe).css({height: '100%'});
			$('body').css({height: '100%'});
			$('#content').addClass('full-height');
			$('footer').addClass('hidden');
			$('#imgframe').addClass('hidden');
			$('.directLink').addClass('hidden');
			$('.directDownload').addClass('hidden');
			$('#controls').addClass('hidden');
		} else {
			$('#app-content-vue').after($iframe);
		}

		$("#pageWidthOption").attr("selected","selected");
		// replace the controls with our own
		$('#app-content #controls').addClass('hidden');

		$('#mmframe').load(function(){
			var iframe = $('#mmframe').contents();

			OC.Apps.hideAppSidebar();

			iframe.save = function() {
				window.alert('save');
			};

			self._lastTitle = document.title;

			var filename = self._file.name ? self._file.name : $('#filename').val();
			document.title = filename + ' - ' + OC.theme.title;

			// iframe.find('#close-button').click(function() {
			// 	self.hide();
			// });

			// Go back on ESC
			$(document).keyup(function(e) {
				if (shown && e.keyCode === 27) {
					shown = false;
					self.hide();
				}
			});
		});

		if(!$('html').hasClass('ie8')) {
			history.pushState({}, '', '#mindmap');
		}

		if(!$('html').hasClass('ie8')) {
			$(window).one('popstate', function () {
				self.hide();
			});
		}
	},

	save: function(data, success, fail) {
		var url = '';
		var path = this._file.dir + '/' + this._file.name;
		if (this._file.dir === '/') {
			path = '/' + this._file.name;
		}

		/* 当encode方法没实现的时候无法保存 */
		var plugin = this.getExtensionByMime(this._file.mime);
		if (plugin.encode === null) {
			fail(t('files_mindmap', 'Does not support saving {extension} files.', {extension: plugin.name}));
			return;
		}

		plugin.encode(data).then(function(data2) {
			var putObject = {
				filecontents: data2,
				path: path,
				mtime: OCA.FilesMindMap._file.mtime // send modification time of currently loaded file
			};

			if ($('#isPublic').val()){
				putObject.token = $('#sharingToken').val();
				url = OC.generateUrl('/apps/files_mindmap/share/save');
				if (OCA.FilesMindMap.isSupportedMime($('#mimetype').val())) {
					putObject.path = '';
				}
			} else {
				url = OC.generateUrl('/apps/files_mindmap/ajax/savefile');
			}


			$.ajax({
				type: 'PUT',
				url: url,
				data: putObject
			}).done(function(data){
				// update modification time
				try {
					OCA.FilesMindMap._file.mtime = data.mtime;
				} catch(e) {}
				success(t('files_mindmap', 'File Saved'));
			}).fail(function(jqXHR){
				var message = t('files_mindmap', 'Save failed');
				try{
					message = JSON.parse(jqXHR.responseText).message;
				}catch(e){}
				fail(message);
			});
		});
	},

	load: function(success, failure) {
		var self = this;
		var filename = this._file.name;
		var dir = this._file.dir;
		var url = '';
		var sharingToken = '';
		var mimetype = $('#mimetype').val();
		if ($('#isPublic').val() && this.isSupportedMime(mimetype)) {
			sharingToken = $('#sharingToken').val();
			url = OC.generateUrl('/apps/files_mindmap/public/{token}', {token: sharingToken});
		} else if ($('#isPublic').val()) {
			sharingToken = $('#sharingToken').val();
			url = OC.generateUrl('/apps/files_mindmap/public/{token}?dir={dir}&filename={filename}',
                { token: sharingToken, filename: filename, dir: dir});
		} else {
			url = OC.generateUrl('/apps/files_mindmap/ajax/loadfile?filename={filename}&dir={dir}',
                {filename: filename, dir: dir});
		}
		$.get(url).done(function(data) {
			data.filecontents = util.base64Decode(data.filecontents);
			var plugin = self.getExtensionByMime(data.mime);
			if (!plugin || plugin.decode === null) {
				fail(t('files_mindmap', 'Unsupported file type: {mimetype}', {mimetype: data.mime}));
			}

			plugin.decode(data.filecontents).then(function(kmdata){
				data.filecontents = typeof kmdata === 'object' ? JSON.stringify(kmdata) : kmdata;
				data.supportedWrite = true;
				if (plugin.encode === null) {
					data.writeable = false;
					data.supportedWrite = false;
				}

				OCA.FilesMindMap._file.writeable = data.writeable;
				OCA.FilesMindMap._file.supportedWrite = data.supportedWrite;
				OCA.FilesMindMap._file.mime = data.mime;
				OCA.FilesMindMap._file.mtime = data.mtime;

				success(data.filecontents);
			}, function(e){
				failure(e);
			})
		}).fail(function(jqXHR) {
			failure(JSON.parse(jqXHR.responseText).message);
		});
	},

	/**
	 * @private
	 */
	registerFileActions: function () {
		var mimes = this.getSupportedMimetypes(),
			_self = this;

		registerFileAction(new FileAction({
			id: 'file_mindmap',
			displayName() {
				return t('files_mindmap', 'Edit')
			},
			iconSvgInline: () => SvgPencil,

			enabled(nodes) {
				return nodes.length === 1 && mimes.includes(nodes[0].mime) && (nodes[0].permissions & OC.PERMISSION_READ) !== 0
			},

			async exec(node, view) {
				try {
					OCA.Viewer.openWith('mindmap', { path: node.path })
					//_self._onEditorTrigger(node.basename, { dir: node.dirname, root: node.root })
					return true
				} catch (error) {
					_self.showMessage(error)
					return false
				}
			},

			default: DefaultType.HIDDEN,
		}))
	},

	registerNewFileMenuPlugin: function() {
		addNewFileMenuEntry({
			id: 'mindmapfile',
			displayName: t('files_mindmap', 'New mind map file'),
			iconClass: 'icon-mindmap',
			enabled(context) {
				// only attach to main file list, public view is not supported yet
				return (context.permissions & Permission.CREATE) !== 0;
			},
			async handler(context, content) {
				const contentNames = content.map((node) => node.basename)
				const fileName = getUniqueName(t('files', "New mindmap.km"), contentNames)
				const source = context.encodedSource + '/' + encodeURIComponent(fileName)
	
				const response = await axios({
					method: 'PUT',
					url: source,
					headers: {
						Overwrite: 'F',
					},
					data: ' ',
				})
	
				const fileid = parseInt(response.headers['oc-fileid'])
				const file = new File({
					source: context.source + '/' + fileName,
					id: fileid,
					mtime: new Date(),
					mime: 'application/km',
					owner: getCurrentUser()?.uid || null,
					permissions: Permission.ALL,
					root: context?.root || '/files/' + getCurrentUser()?.uid,
				})
	
				FilesMindMap.showMessage(t('files_mindmap', 'Created "{name}"', { name: fileName }))
	
				emit('files:node:created', file)
	
				FilesMindMap._onEditorTrigger(
					fileName,
					{
						dir: context.path,
						root: context.root,
					}
				)
			},
		});
	},

	hackFileIcon: function() {
		var changeMindmapIcons = function() {
			$("#filestable")
			.find("tr[data-type=file]")
			.each(function () {
				if (($(this).attr("data-mime") == "application/km" || $(this).attr("data-mime") == "application/x-freemind")
					&& ($(this).find("div.thumbnail").length > 0)) {
						if ($(this).find("div.thumbnail").hasClass("icon-mindmap") == false) {
							$(this).find("div.thumbnail").addClass("icon icon-mindmap");
						}
					}
			});
		}

		if ($('#filesApp').val()) {
			$('#app-content-files')
			.add('#app-content-extstoragemounts')
			.on('changeDirectory', function (e) {
				changeMindmapIcons();
			})
			.on('fileActionsReady', function (e) {
				changeMindmapIcons();
			});
        }
	},

	_onEditorTrigger: function(fileName, context) {
		this._currentContext = context;
		this._file.name = fileName;
		this._file.root = context.root;
		this._file.dir = context.dir;
		var fullName = context.dir + '/' + fileName;
		if (context.dir === '/') {
			fullName = '/' + fileName;
		}
		this._file.fullName = fullName;
		this.show();
	},

	getSupportedMimetypes: function() {
		var result = [];
		this._extensions.forEach(function(obj){
			result = result.concat(obj.mimes);
		});
		console.debug('Mindmap Mimetypes:', result);
		return result;
	},
};

// TODO: move to @nextcloud/files
function getUniqueName(name, names) {
	let newName = name
	let i = 1
	while (names.includes(newName)) {
		const ext = extname(name)
		newName = `${basename(name, ext)} (${i++})${ext}`
	}
	return newName
}

OCA.FilesMindMap = FilesMindMap;


console.debug('files_mindmaps start.');

// register mime types
FilesMindMap.init();

console.debug('files_mindmaps registerNewFileMenuPlugin.');
// Declare the plugin and its attachments
OCA.FilesMindMap.registerNewFileMenuPlugin();
console.debug('files_mindmaps registerFileActions.');
OCA.FilesMindMap.registerFileActions();

// if (OCA.Viewer) {
// 	console.debug('Mindmap registerHandler start');
// 	OCA.Viewer.registerHandler({
// 		id: 'mindmap',
// 		group: null,
// 		mimes: OCA.FilesMindMap.getSupportedMimetypes(),
// 		component: MindMap,
// 		theme: 'default',
// 		canCompare: true,
// 	});
// 	console.debug('Mindmap registerHandler end');
// }

if ($('#isPublic').val() && OCA.FilesMindMap.isSupportedMime($('#mimetype').val())) {
	var sharingToken = $('#sharingToken').val();
	var downloadUrl = OC.generateUrl('/s/{token}/download', {token: sharingToken});
	var viewer = OCA.FilesMindMap;
	viewer.show(downloadUrl, false);
}
console.log('files_mindmaps loaded.');
