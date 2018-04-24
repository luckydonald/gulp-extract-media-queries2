var through = require('through2');
var rework = require('rework');
var split = require('rework-split-media');
var reworkMoveMedia = require('rework-move-media');
var stringify = require('css-stringify');
var cleanUpString = require('clean-up-string');
var dirname = require('path').dirname;
var pathjoin = require('path').join;
var basename = require('path').basename;

module.exports = function(filter, naming, lite_suffix = "") {
	return through.obj(function(file, enc, callback) {
		var stream = this;
		var fileName = basename(file.path, '.css')
		var reworkData = rework(file.contents.toString())
			.use(reworkMoveMedia());
		var stylesheets = split(reworkData);
		var stylesheetKeys = Object.keys(stylesheets);
		stylesheetKeys.forEach(function(key) {
			var poop = file.clone({
				contents: false
			});
			// filter
			if (typeof filter === 'function' && !filter(fileName, name)) return
			// custom naming function
			var name = typeof naming === 'function' ? naming(key) : cleanUpString(key);
			// generate html
			console.log('<link href="css/'+name+'" rel="stylesheet" media="'+key+'">');
			// add media queries as comment to the css itself
			var comments = Buffer.from("/*! " + key + " !*/", "utf8");
			var contents = new Buffer(stringify(stylesheets[key]));
			poop.contents = Buffer.concat([comments,contents])
			// determine output name/path
			if (name) {
				name = fileName + '-' + name
			} else {
				name = fileName + lite_suffix
			}
			poop.path = pathjoin(dirname(file.path), name + '.css');
			stream.push(poop);
		});
		callback();
	});
};
