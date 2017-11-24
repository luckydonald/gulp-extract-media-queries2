var through = require('through2');
var rework = require('rework');
var split = require('rework-split-media');
var reworkMoveMedia = require('rework-move-media');
var stringify = require('css-stringify');
var cleanUpString = require('clean-up-string');
var dirname = require('path').dirname;
var pathjoin = require('path').join;
var basename = require('path').basename;

module.exports = function(filter) {
	return through.obj(function(file, enc, callback) {
		var stream = this;
    var fileName = basename(file.path, '.css')
		var reworkData = rework(file.contents.toString())
			.use(reworkMoveMedia());
		var stylesheets = split(reworkData);
		var stylesheetKeys = Object.keys(stylesheets);
		stylesheetKeys.forEach(function(key) {
      // replace 兼容 min-width:768px 之类冒号后边没有空格的写法
			var name = cleanUpString(key.replace(/:\s?/g, '-'));
      if (typeof filter === 'function' && !filter(fileName, name)) return

      var poop = file.clone({
        contents: false
      });
			var contents = stringify(stylesheets[key]);
			poop.contents = new Buffer(contents);

			if (name) {
        name = fileName + '-' + name
				var filepath = pathjoin(dirname(file.path), name + '.css');
				poop.path = filepath;
			} else {
				poop.path = pathjoin(dirname(file.path), fileName + '-lite.css');
			}
			stream.push(poop);
		});
		callback();
	});
};
