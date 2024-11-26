export default {
	base64Encode: function(string) {
		return btoa(encodeURIComponent(string).replace(/%([0-9A-F]{2})/g, function(match, p1) {
			return String.fromCharCode(parseInt(p1, 16))
		}))
	},
	base64Decode: function(base64) {
		try {
			return decodeURIComponent(Array.prototype.map.call(atob(base64), function(c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
			}).join(''));
		} catch (e) {
			var binary = atob(base64);
			var array = new Uint8Array(binary.length);
			for	(var i = 0; i < binary.length; i++) {
				array[i] = binary.charCodeAt(i);
			}
			return new Blob([array]);
		}
	},
    jsVar: function (s) {
        return String(s || '').replace(/-/g,"_");
    },
    toArray: function (obj){
        if (!Array.isArray(obj)) {
            return [obj];
        }
        return obj;
    },
    parseNode: function (node) {
        if (!node) return null;
        var self = this;
        var txt = '', obj = null, att = null;

        if (node.childNodes) {
            if (node.childNodes.length > 0) {
                node.childNodes.forEach(function(cn) {
                    var cnt = cn.nodeType, cnn = self.jsVar(cn.localName || cn.nodeName);
                    var cnv = cn.text || cn.nodeValue || '';

                    /* comment */
                    if (cnt == 8) {
                        return; // ignore comment node
                    }
                    /* white-space */
                    else if (cnt == 3 || cnt == 4 || !cnn) {
                        if (cnv.match(/^\s+$/)) {
                            return;
                        }
                        txt += cnv.replace(/^\s+/, '').replace(/\s+$/, '');
                    } else {
                        obj = obj || {};
                        if (obj[cnn]) {
                            if (!obj[cnn].length) {
                                obj[cnn] = self.toArray(obj[cnn]);
                            }
                            obj[cnn] = self.toArray(obj[cnn]);

                            obj[cnn].push(self.parseNode(cn, true));
                        } else {
                            obj[cnn] = self.parseNode(cn);
                        }
                    }
                });
            }
        }
        if (node.attributes && node.tagName !='title') {
            if (node.attributes.length > 0) {
                att = {}; obj = obj || {};
                node.attributes.forEach = [].forEach.bind(node.attributes);
                node.attributes.forEach(function (at) {
                    var atn = self.jsVar(at.name), atv = at.value;
                    att[atn] = atv;
                    if (obj[atn]) {
                        obj[cnn] = this.toArray(obj[cnn]);
                        obj[atn][obj[atn].length] = atv;
                    }
                    else {
                        obj[atn] = atv;
                    }
                });
            }
        }
        if (obj) {
            obj = Object.assign({}, (txt != '' ? new String(txt) : {}), obj || {});
            txt = (obj.text) ? ([obj.text || '']).concat([txt]) : txt;
            if (txt) obj.text = txt;
            txt = '';
        }
        var out = obj || txt;
        return out;
    },
    parseXML: function (xml) {
        var root = (xml.nodeType == 9) ? xml.documentElement : xml;
        return this.parseNode(root, true);
    },
    xml2json: function (str) {
        var domParser = new DOMParser();
        var dom = domParser.parseFromString(str, 'application/xml');

        var json = this.parseXML(dom);
        return json;
    },
}