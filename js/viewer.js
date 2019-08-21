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
			$('#export-pdf').click(function(){
				self.exportPDF();
			});
			$('#export-markdown').click(function(){
				self.exportMarkdown();
			});
			$('#export-text').click(function(){
				self.exportText();
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
			}, function (data){
				console.error('export png fail', data);
			});
		},

		exportSVG: function () {
			var self = this;
			minder.exportData('svg').then(function (data) {
				var url = 'data:image/svg+xml;base64,' + Base64.encode(data);
				self.download(url, 'export.svg');
			}, function (data){
				console.error('export svg fail', data);
			});
		},

		exportMarkdown: function () {
			var self = this;
			minder.exportData('markdown').then(function (data) {
				var url = 'data:text/markdown;base64,' + Base64.encode(data);
				self.download(url, 'export.md');
			}, function (data){
				console.error('export markdown fail', data);
			});
		},

		exportText: function () {
			var self = this;
			minder.exportData('text').then(function (data) {
				var url = 'data:text/plain;base64,' + Base64.encode(data);
				self.download(url, 'export.txt');
			}, function (data){
				console.error('export text fail', data);
			});
		},

		exportPDF: function () {
			var self = this;
			minder.exportData('png').then(function (data) {
				var pdf = new jsPDF('p', 'mm', 'a4', false);
				//pdf.addImage(data, 'png', 100, 200, 280, 210, undefined, 'none');
				pdf.addImage(data, 'PNG', 5, 10, 200, 0, undefined, 'SLOW');
				self.download(pdf.output('datauristring'), 'export.pdf');
			}, function (data){
				console.error('export png fail', data);
			});
		}
	};

	window.MindMap = MindMap;
})();

MindMap.init();
