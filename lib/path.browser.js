// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
function splitPath(filename) {
	return splitPathRe.exec(filename).slice(1);
};

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
	// if the path tries to go above the root, `up` ends up > 0
	var up = 0;
	for (var i = parts.length - 1; i >= 0; i--) {
		var last = parts[i];
		if (last === '.') {
			parts.splice(i, 1);
		} else if (last === '..') {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}

	// if the path is allowed to go above the root, restore leading ..s
	if (allowAboveRoot) {
		for (; up--; up) {
			parts.unshift('..');
		}
	}

	return parts;
}

var urlRe = /^(?:[^:\/]+:)?\/\/[^\/]*(\/[^?#]*|)(?:\?[^#]*)?(?:#.*)?$/;

exports.sep = '/';

exports.getPath = function (url) {
	var result = urlRe.exec(url);
	return result && result[1];
};

exports.cwd = function () {
	var path = exports.getPath(window.location);
	if (path.slice(-1) === '/') return path;
	return exports.dirname(path);
};

exports.isAbsolute = function (path) {
	return path.charAt(0) === '/';
};

exports.resolve = function() {
	var resolvedPath = '';
	var resolvedAbsolute = false;

	for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		var path = (i >= 0) ? arguments[i] : exports.cwd();

		// Skip empty and invalid entries
		if (typeof path !== 'string') {
			throw new TypeError('Arguments to path.resolve must be strings');
		} else if (!path) {
			continue;
		}

		resolvedPath = path + '/' + resolvedPath;
		resolvedAbsolute = exports.isAbsolute(path);
	}

	// At this point the path should be resolved to a full absolute path, but
	// handle relative paths to be safe (might happen when process.cwd() fails)

	// Normalize the path
	resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
		return !!p;
	}), !resolvedAbsolute).join('/');

	return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

exports.normalize = function (path) {
	var isAbsolute = exports.isAbsolute(path);
	var trailingSlash = path.slice(-1) === '/';

	// Normalize the path
	path = normalizeArray(path.split('/').filter(function(p) {
		return !!p;
	}), !isAbsolute).join('/');

	if (!path && !isAbsolute) {
		path = '.';
	}
	if (path && trailingSlash) {
		path += '/';
	}

	return (isAbsolute ? '/' : '') + path;
};

exports.join = function() {
	var paths = Array.prototype.slice.call(arguments, 0);
	return exports.normalize(paths.filter(function(p, index) {
		if (typeof p !== 'string') {
			throw new TypeError('Arguments to path.join must be strings');
		}
		return p;
	}).join('/'));
};

exports.relative = function(from, to) {
	from = exports.resolve(from).substr(1);
	to = exports.resolve(to).substr(1);

	function trim(arr) {
		var start = 0;
		for (; start < arr.length; start++) {
			if (arr[start] !== '') break;
		}

		var end = arr.length - 1;
		for (; end >= 0; end--) {
			if (arr[end] !== '') break;
		}

		if (start > end) return [];
		return arr.slice(start, end - start + 1);
	}

	var fromParts = trim(from.split('/'));
	var toParts = trim(to.split('/'));

	var length = Math.min(fromParts.length, toParts.length);
	var samePartsLength = length;
	for (var i = 0; i < length; i++) {
		if (fromParts[i] !== toParts[i]) {
			samePartsLength = i;
			break;
		}
	}

	var outputParts = [];
	for (var i = samePartsLength; i < fromParts.length; i++) {
		outputParts.push('..');
	}

	outputParts = outputParts.concat(toParts.slice(samePartsLength));

	return outputParts.join('/');
};

exports.dirname = function(path) {
	var result = splitPath(path),
			root = result[0],
			dir = result[1];

	if (!root && !dir) {
		// No dirname whatsoever
		return '.';
	}

	if (dir) {
		// It has a dirname, strip trailing slash
		dir = dir.substr(0, dir.length - 1);
	}

	return root + dir;
};

exports.basename = function(path, ext) {
	var f = splitPath(path)[2];

	if (ext && f.substr(-1 * ext.length) === ext) {
		f = f.substr(0, f.length - ext.length);
	}
	return f;
};

exports.extname = function(path) {
	return splitPath(path)[3];
};