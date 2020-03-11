var FilesMindMap = {
	_currentContext: null,
	_file: {},
	_fileList: null,
	_lastTitle: '',
	init: function() {
		this.registerFileActions();
		this.hackFileIcon();
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

	hide: function() {
		$('#mmframe').remove();
		if ($('#isPublic').val() && $('#filesApp').val()){
			$('#controls').removeClass('hidden');
			$('#content').removeClass('full-height');
			$('footer').removeClass('hidden');
		}

		if (!$('#mimetype').val()) {
			FileList.setViewerMode(false);
		}

		// replace the controls with our own
		$('#app-content #controls').removeClass('hidden');

		document.title = this._lastTitle;

		if (!$('#mimetype').val()) {
			this._fileList.addAndFetchFileInfo(this._file.dir + '/' + this._file.name, '');
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
            'z-index:1041;" src="'+viewer+'" sandbox="allow-scripts allow-same-origin allow-popups allow-modals ' +
            'allow-top-navigation" allowfullscreen="true"/>');

		if (!$('#mimetype').val()) {
			FileList.setViewerMode(true);
		}

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
			$('#app-content').after($iframe);
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
			document.title = self._file.name + ' - ' + OC.theme.title;

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
		var putObject = {
			filecontents: data,
			path: path
		};

		if ($('#isPublic').val()){
			putObject.token = $('#sharingToken').val();
			url = OC.generateUrl('/apps/files_mindmap/share/save');
			if ($('#mimetype').val() === 'application/km') {
				putObject.path = '';
			}
		} else {
			url = OC.generateUrl('/apps/files_mindmap/ajax/savefile');
		}


		$.ajax({
			type: 'PUT',
			url: url,
			data: putObject
		}).done(function(){
			success(t('files_mindmap', 'File Saved'));
		}).fail(function(jqXHR){
			var message = t('files_mindmap', 'Save failed');
			try{
				message = JSON.parse(jqXHR.responseText).message;
			}catch(e){}
			fail(message);
		});
	},

	load: function(success, failure) {
		var filename = this._file.name;
		var dir = this._file.dir;
		var url = '';
		var sharingToken = '';
		if ($('#isPublic').val() && $('#mimetype').val() === 'application/km') {
			sharingToken = $('#sharingToken').val();
			url = OC.generateUrl('/apps/files_mindmap/public/{token}', {token: sharingToken});
		} else if ($('#isPublic').val()) {
			sharingToken = $('#sharingToken').val();
			url = OC.generateUrl('/apps/files_mindmap/public/{token}?dir={dir}&filename={filename}',
                { token: sharingToken, filename: filename, dir: dir});
			//url = this._currentContext.fileList.getDownloadUrl(filename, dir);
		} else {
			url = OC.generateUrl('/apps/files_mindmap/ajax/loadfile?filename={filename}&dir={dir}',
                {filename: filename, dir: dir});
		}
		$.get(url).done(function(data) {
			OCA.FilesMindMap._file.writeable = data.writeable;
			OCA.FilesMindMap._file.mime = data.mime;
			OCA.FilesMindMap._file.mtime = data.mtime;

			success(data.filecontents);
		}).fail(function(jqXHR) {
			failure(JSON.parse(jqXHR.responseText).message);
		});
	},

	/**
	 * @param fileActions
	 * @private
	 */
	registerFileActions: function() {
		var mimes = this.getSupportedMimetypes(),
			_self = this;

		$.each(mimes, function(key, value) {
			OCA.Files.fileActions.registerAction({
				name: 'Edit',
				mime: value,
				actionHandler: _.bind(_self._onEditorTrigger, _self),
				permissions: OC.PERMISSION_READ,
				icon: function () {
					return OC.imagePath('core', 'actions/edit');
				}
			});
			OCA.Files.fileActions.setDefault(value, 'Edit');
		});
	},

	hackFileIcon: function() {
		var changeMindmapIcons = function() {
			$("#filestable")
			.find("tr[data-type=file]")
			.each(function () {
				if (($(this).attr("data-mime") == "application/km") 
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
		this._file.dir = context.dir;
		this._fileList = context.fileList;
		var fullName = context.dir + '/' + fileName;
		if (context.dir === '/') {
			fullName = '/' + fileName;
		}
		this.show();
	},

	getSupportedMimetypes: function() {
		return [
			'application/km',
			'application/kmp',
			'application/xmind'
		];
	},
};

FilesMindMap.NewFileMenuPlugin = {

	attach: function(menu) {
		var fileList = menu.fileList;

		// only attach to main file list, public view is not supported yet
		if (fileList.id !== 'files') {
			return;
		}

		// register the new menu entry
		menu.addMenuEntry({
			id: 'mindmapfile',
			displayName: t('files_mindmap', 'New mind map file'),
			templateName: t('files_mindmap', 'New mind map.km'),
			iconClass: 'icon-mindmap',
			fileType: 'application/km',
			actionHandler: function(name) {
				var dir = fileList.getCurrentDirectory();
				fileList.createFile(name).then(function() {
					FilesMindMap._onEditorTrigger(
						name,
						{
							fileList: fileList,
							dir: dir
						}
					);
				});
			}
		});
	}
};


OCA.FilesMindMap = FilesMindMap;

OC.Plugins.register('OCA.Files.NewFileMenu', FilesMindMap.NewFileMenuPlugin);

$(document).ready(function(){
	OCA.FilesMindMap.init();
	if ($('#isPublic').val() && $('#mimetype').val() === 'application/km') {
		var sharingToken = $('#sharingToken').val();
		var downloadUrl = OC.generateUrl('/s/{token}/download', {token: sharingToken});
		var viewer = OCA.FilesMindMap;
		viewer.show(downloadUrl, false);
	}
});