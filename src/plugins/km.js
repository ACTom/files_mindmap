export default {
	name: 'km',
	mimes: ['application/km'],
	encode: function(data) {
        return new Promise(function(resolve, reject) {
			resolve(data);
        });
	},
	decode: function(data) {
		return new Promise(function(resolve, reject) {
			try {
				resolve(JSON.parse(data));
			} catch (e) {
				resolve(data);
			}
        });
	}
};