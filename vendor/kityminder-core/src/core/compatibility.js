define(function(require, exports, module) {
    var utils = require('./utils');

    function compatibility(json) {

        var version = json.version || (json.root ? '1.4.0' : '1.1.3');

        switch (version) {
            case '1.1.3':
                c_113_120(json);
                /* falls through */
            case '1.2.0':
            case '1.2.1':
                c_120_130(json);
                /* falls through */
            case '1.3.0':
            case '1.3.1':
            case '1.3.2':
            case '1.3.3':
            case '1.3.4':
            case '1.3.5':
                /* falls through */
                c_130_140(json);
        }
        return json;
    }

    function traverse(node, fn) {
        fn(node);
        if (node.children) node.children.forEach(function(child) {
            traverse(child, fn);
        });
    }

    /* 脑图数据升级 */
    function c_120_130(json) {
        traverse(json, function(node) {
            var data = node.data;
            delete data.layout_bottom_offset;
            delete data.layout_default_offset;
            delete data.layout_filetree_offset;
        });
    }

    /**
     * 脑图数据升级
     * v1.1.3 => v1.2.0
     * */
    function c_113_120(json) {
        // 原本的布局风格
        var ocs = json.data.currentstyle;
        delete json.data.currentstyle;

        // 为 1.2 选择模板，同时保留老版本文件的皮肤
        if (ocs == 'bottom') {
            json.template = 'structure';
            json.theme = 'snow';
        } else if (ocs == 'default') {
            json.template = 'default';
            json.theme = 'classic';
        }

        traverse(json, function(node) {
            var data = node.data;

            // 升级优先级、进度图标
            if ('PriorityIcon' in data) {
                data.priority = data.PriorityIcon;
                delete data.PriorityIcon;
            }
            if ('ProgressIcon' in data) {
                data.progress = 1 + ((data.ProgressIcon - 1) << 1);
                delete data.ProgressIcon;
            }

            // 删除过时属性
            delete data.point;
            delete data.layout;
        });
    }

    function c_130_140(json) {
        json.root = {
            data: json.data,
            children: json.children
        };
        delete json.data;
        delete json.children;
    }

    return compatibility;
});