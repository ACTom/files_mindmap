/**
 * Checks if the page is displayed in an iframe. If not redirect to /.
 **/
function redirectIfNotDisplayedInFrame () {
	try {
		if (window.frameElement) {
			return;
		}
	} catch (e) {}

	window.location.href = '/';
}
redirectIfNotDisplayedInFrame();

(function() {
	var t = function(msg) {
		return window.parent.t('files_mindmap', msg);
    };

	var lang = window.lang || 'en';

	var MindMap = {
		_changed: false,
		_saveTimer: null,
		_clearStatusMessageTimer: null,
		_loadStatus: false,
		init: function() {
			var self = this;
			angular.module('mindmap', ['kityminderEditor'])
			.config(function (configProvider) {
				configProvider.set('lang', lang);
			})
			.controller('MainController', function($scope) {
				$scope.initEditor = function(editor, minder) {
					window.editor = editor;
					window.minder = minder;

					self.initHotkey();
					self.bindEvent();
					self.loadData();
					self.startSaveTimer();
					minder.on('contentchange', function(e) { 
						self._changed = true;
					});
				};
			});

			angular.module('ui.colorpicker')
        		.config(function (localizeProvider) {
                		localizeProvider.setDefaultLang('en-us');
     			}) ;

		},
		initHotkey: function() {
			var self = this;
			$(document).keydown(function(e) {
				if((e.ctrlKey || e.metaKey) && e.which == 83){
					self.save();
					e.preventDefault();
					return false;
				}
			});
		},
		bindEvent: function() {
			var self = this;
			$('#export-png').click(function(){
				self.exportPNG();
			});
            $('#export-svg').click(function(){
                self.exportSVG();
            });
		},
		startSaveTimer: function() {
			var self = this;
			self.stopSaveTimer();
			self._saveTimer = setInterval(function(){
				self.save();
			}, 10000);
		},
		stopSaveTimer: function() {
			var self = this;
			if (self._saveTimer != null) {
				clearInterval(self._saveTimer);
			}
		},
		setStatusMessage: function(msg) {
			$('#status-message').html(msg);
			this.clearStatusMessage();
		},
		clearStatusMessage: function() {
			var self = this;
			if (self._clearStatusMessageTimer != null) {
				clearTimeout(self._clearStatusMessageTimer);
			}
			self._clearStatusMessageTimer = setTimeout(function(){
				$('#status-message').html('');
				self._clearStatusMessageTimer = null;
			}, 3000);
		},
		save: function() {
			var self = this;
			if (self._changed) {
				self.setStatusMessage(t('Saving...'));
				var data = JSON.stringify(minder.exportJson());
				window.parent.OCA.FilesMindMap.save(data, function(msg){
					self.setStatusMessage(msg);
					self._changed = false;
				}, function(msg){
					self.setStatusMessage(msg);
				});
			}
		},
		loadData: function() {
			var self = this;
			window.parent.OCA.FilesMindMap.load(function(data){
                var obj = {"root":
                            {"data":
                                {"id":"bopmq"+String(Math.floor(Math.random() * 9e15)).substr(0, 7),
                                 "created":(new Date()).getTime(),
                                 "text":t('Main Topic')
                                },
                                "children":[]
                            },
                            "template":"default",
                            "theme":"fresh-blue",
                            "version":"1.4.43"
                        };
                /* 新生成的空文件 */
                window.parent.OCA.FilesMindMap.minder = minder;
                if (data !== ' ') {
                    try {
                        obj = JSON.parse(data);
                    } catch (e){
                        alert(t('This file is not a valid mind map file and may cause file corruption if you continue editing.'));
                    }
                }
				minder.importJson(obj);
				if (data === ' ') {
					self._changed = true;
					self.save();
				}
				self._loadStatus = true;
				self._changed = false;
			}, function(msg){
				self._loadStatus = false;
				alert(t('Load file fail!') + msg);
				window.parent.OCA.FilesMindMap.hide();
			});
		},
		isDataSchema: function (url) {
			var i = 0,
				ii = url.length;
			while (i < ii && url[i].trim() === '') {
				i++;
			}
			return url.substr(i, 5).toLowerCase() === 'data:';
		},

        download: function(url, filename) {
			var obj = document.createElement('a');
			obj.href = url;
			obj.download = filename;
			obj.dataset.downloadurl = url;
			document.body.appendChild(obj);
			obj.click();
			document.body.removeChild(obj)
		},

        exportPNG: function () {
			var self = this;
            minder.exportData('png').then(function (data) {
            	self.download(data, 'export.png');
            });
        },

        exportSVG: function () {
            var self = this;
            minder.exportData('svg').then(function (data) {
                var url = 'data:image/svg+xml;base64,' + Base64.encode(data);
                self.download(url, 'export.svg');
            }, function (data){
                console.log('fail', data);
            });
        },

		getFileNameFromURL: function (url) {
			var defaultFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'mindfile.kmp';

			if (this.isDataSchema(url)) {
				console.warn('getFileNameFromURL: ' + 'ignoring "data:" URL for performance reasons.');
				return defaultFilename;
			}
			var reURI = /^(?:(?:[^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/;
			var reFilename = /[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i;
			var splitURI = reURI.exec(url);
			var suggestedFilename = reFilename.exec(splitURI[1]) || reFilename.exec(splitURI[2]) || reFilename.exec(splitURI[3]);
			if (suggestedFilename) {
				suggestedFilename = suggestedFilename[0];
				if (suggestedFilename.indexOf('%') !== -1) {
					try {
						suggestedFilename = reFilename.exec(decodeURIComponent(suggestedFilename))[0];
					} catch (ex) {}
				}
			}
			return suggestedFilename || defaultFilename;
		}
	};

	window.MindMap = MindMap;
})();

MindMap.init();
