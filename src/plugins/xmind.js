import JSZip from 'jszip'
import util from '../util'

export default {
	name: 'xmind',
	mimes: ['application/vnd.xmind.workbook'],
	encode: null,
	decode: function(data) {
		return this.readDocument(data);
	},
	markerMap : {
        'priority-1': ['priority', 1],
        'priority-2': ['priority', 2],
        'priority-3': ['priority', 3],
        'priority-4': ['priority', 4],
        'priority-5': ['priority', 5],
        'priority-6': ['priority', 6],
        'priority-7': ['priority', 7],
        'priority-8': ['priority', 8],

        'task-start': ['progress', 1],
        'task-oct': ['progress', 2],
        'task-quarter': ['progress', 3],
        'task-3oct': ['progress', 4],
        'task-half': ['progress', 5],
        'task-5oct': ['progress', 6],
        'task-3quar': ['progress', 7],
        'task-7oct': ['progress', 8],
        'task-done': ['progress', 9]
    },
    processTopic: function (topic, obj) {

        //处理文本
        obj.data = {
            text: topic.title
        };

        // 处理标签
        if (topic.marker_refs && topic.marker_refs.marker_ref) {
            var markers = topic.marker_refs.marker_ref;
            var type;
            if (markers.length && markers.length > 0) {
                for (var i in markers) {
                    type = this.markerMap[markers[i].marker_id];
                    if (type) obj.data[type[0]] = type[1];
                }
            } else {
                type = this.markerMap[markers.marker_id];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic['xlink:href']) {
            obj.data.hyperlink = topic['xlink:href'];
        }
        //处理子节点
        var topics = topic.children && topic.children.topics;
        var subTopics = topics && (topics.topic || topics[0] && topics[0].topic);
        if (subTopics) {
            var tmp = subTopics;
            if (tmp.length && tmp.length > 0) { //多个子节点
                obj.children = [];

                for (var ii in tmp) {
                    obj.children.push({});
                    this.processTopic(tmp[ii], obj.children[ii]);
                }

            } else { //一个子节点
                obj.children = [{}];
                this.processTopic(tmp, obj.children[0]);
            }
        }
    },
    toKm: function (xml) {
        var json = util.xml2json(xml);
        var result = {};
        var sheet = json.sheet;
        var topic = Array.isArray(sheet) ? sheet[0].topic : sheet.topic;
        this.processTopic(topic, result);
        return result;
    },
    readDocument: function (file) {
        var self = this;
        return new Promise(function(resolve, reject) {
            JSZip.loadAsync(file).then(function(zip){
                var contentFile = zip.file('content.xml');
                if (contentFile != null) {
                    contentFile.async('text').then(function(text){
                        try {
                            var json = self.toKm(text);
                            resolve(json);
                        } catch (e) {
                            reject(e);
                        }
                    });
                } else {
                    reject(new Error('Content document missing'));
                }
            }, function(e) {
                reject(e);
            });
        });
    }
}