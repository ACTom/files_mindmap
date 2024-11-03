export default {
	name: 'freemind',
	mimes: ['application/x-freemind'],
	encode: null,
	decode: function(data) {
		var self = this;
        return new Promise(function(resolve, reject) {
            try {
                var result = self.toKm(data);
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
	},
    markerMap: {
        'full-1': ['priority', 1],
        'full-2': ['priority', 2],
        'full-3': ['priority', 3],
        'full-4': ['priority', 4],
        'full-5': ['priority', 5],
        'full-6': ['priority', 6],
        'full-7': ['priority', 7],
        'full-8': ['priority', 8]
    },
    processTopic: function (topic, obj) {
        //处理文本
        obj.data = {
            text: topic.TEXT
        };
        var i;

        // 处理标签
        if (topic.icon) {
            var icons = topic.icon;
            var type;
            if (icons.length && icons.length > 0) {
                for (i in icons) {
                    type = this.markerMap[icons[i].BUILTIN];
                    if (type) obj.data[type[0]] = type[1];
                }
            } else {
                type = this.markerMap[icons.BUILTIN];
                if (type) obj.data[type[0]] = type[1];
            }
        }

        // 处理超链接
        if (topic.LINK) {
            obj.data.hyperlink = topic.LINK;
        }

        //处理子节点
        if (topic.node) {
            var tmp = topic.node;
            if (tmp.length && tmp.length > 0) { //多个子节点
                obj.children = [];

                for (i in tmp) {
                    obj.children.push({});
                    this.processTopic(tmp[i], obj.children[i]);
                }

            } else { //一个子节点
                obj.children = [{}];
                this.processTopic(tmp, obj.children[0]);
            }
        }
    },
    toKm: function (xml) {
        var json = FilesMindMap.Util.xml2json(xml);
        var result = {};
        this.processTopic(json.node, result);
        return result;
    }

}