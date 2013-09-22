var f = path.cwd() + '/browser.js';

test("basename()", function () {
	assert.equal(path.basename(f), 'browser.js');
	assert.equal(path.basename(f, '.js'), 'browser');
	assert.equal(path.basename(''), '');
	assert.equal(path.basename('/dir/basename.ext'), 'basename.ext');
	assert.equal(path.basename('/basename.ext'), 'basename.ext');
	assert.equal(path.basename('basename.ext'), 'basename.ext');
	assert.equal(path.basename('basename.ext/'), 'basename.ext');
	assert.equal(path.basename('basename.ext//'), 'basename.ext');

	assert.equal(path.basename('\\dir\\basename.ext'), '\\dir\\basename.ext');
	assert.equal(path.basename('\\basename.ext'), '\\basename.ext');
	assert.equal(path.basename('basename.ext'), 'basename.ext');
	assert.equal(path.basename('basename.ext\\'), 'basename.ext\\');
	assert.equal(path.basename('basename.ext\\\\'), 'basename.ext\\\\');

	var controlCharFilename = 'Icon' + String.fromCharCode(13);
	assert.equal(path.basename('/a/b/' + controlCharFilename), controlCharFilename);
});

test("extname()", function () {
	assert.equal(path.extname(f), '.js');
	assert.equal(path.extname(''), '');
	assert.equal(path.extname('/path/to/file'), '');
	assert.equal(path.extname('/path/to/file.ext'), '.ext');
	assert.equal(path.extname('/path.to/file.ext'), '.ext');
	assert.equal(path.extname('/path.to/file'), '');
	assert.equal(path.extname('/path.to/.file'), '');
	assert.equal(path.extname('/path.to/.file.ext'), '.ext');
	assert.equal(path.extname('/path/to/f.ext'), '.ext');
	assert.equal(path.extname('/path/to/..ext'), '.ext');
	assert.equal(path.extname('file'), '');
	assert.equal(path.extname('file.ext'), '.ext');
	assert.equal(path.extname('.file'), '');
	assert.equal(path.extname('.file.ext'), '.ext');
	assert.equal(path.extname('/file'), '');
	assert.equal(path.extname('/file.ext'), '.ext');
	assert.equal(path.extname('/.file'), '');
	assert.equal(path.extname('/.file.ext'), '.ext');
	assert.equal(path.extname('.path/file.ext'), '.ext');
	assert.equal(path.extname('file.ext.ext'), '.ext');
	assert.equal(path.extname('file.'), '.');
	assert.equal(path.extname('.'), '');
	assert.equal(path.extname('./'), '');
	assert.equal(path.extname('.file.ext'), '.ext');
	assert.equal(path.extname('.file'), '');
	assert.equal(path.extname('.file.'), '.');
	assert.equal(path.extname('.file..'), '.');
	assert.equal(path.extname('..'), '');
	assert.equal(path.extname('../'), '');
	assert.equal(path.extname('..file.ext'), '.ext');
	assert.equal(path.extname('..file'), '.file');
	assert.equal(path.extname('..file.'), '.');
	assert.equal(path.extname('..file..'), '.');
	assert.equal(path.extname('...'), '.');
	assert.equal(path.extname('...ext'), '.ext');
	assert.equal(path.extname('....'), '.');
	assert.equal(path.extname('file.ext/'), '.ext');
	assert.equal(path.extname('file.ext//'), '.ext');
	assert.equal(path.extname('file/'), '');
	assert.equal(path.extname('file//'), '');
	assert.equal(path.extname('file./'), '.');
	assert.equal(path.extname('file.//'), '.');

	assert.equal(path.extname('.\\'), '');
	assert.equal(path.extname('..\\'), '.\\');
	assert.equal(path.extname('file.ext\\'), '.ext\\');
	assert.equal(path.extname('file.ext\\\\'), '.ext\\\\');
	assert.equal(path.extname('file\\'), '');
	assert.equal(path.extname('file\\\\'), '');
	assert.equal(path.extname('file.\\'), '.\\');
	assert.equal(path.extname('file.\\\\'), '.\\\\');
});

test("join()", function () {
	var failures = [];
	var joinTests =
		// arguments                     result
		[[['.', 'x/b', '..', '/b/c.js'], 'x/b/c.js'],
		 [['/.', 'x/b', '..', '/b/c.js'], '/x/b/c.js'],
		 [['/foo', '../../../bar'], '/bar'],
		 [['foo', '../../../bar'], '../../bar'],
		 [['foo/', '../../../bar'], '../../bar'],
		 [['foo/x', '../../../bar'], '../bar'],
		 [['foo/x', './bar'], 'foo/x/bar'],
		 [['foo/x/', './bar'], 'foo/x/bar'],
		 [['foo/x/', '.', 'bar'], 'foo/x/bar'],
		 [['./'], './'],
		 [['.', './'], './'],
		 [['.', '.', '.'], '.'],
		 [['.', './', '.'], '.'],
		 [['.', '/./', '.'], '.'],
		 [['.', '/////./', '.'], '.'],
		 [['.'], '.'],
		 [['', '.'], '.'],
		 [['', 'foo'], 'foo'],
		 [['foo', '/bar'], 'foo/bar'],
		 [['', '/foo'], '/foo'],
		 [['', '', '/foo'], '/foo'],
		 [['', '', 'foo'], 'foo'],
		 [['foo', ''], 'foo'],
		 [['foo/', ''], 'foo/'],
		 [['foo', '', '/bar'], 'foo/bar'],
		 [['./', '..', '/foo'], '../foo'],
		 [['./', '..', '..', '/foo'], '../../foo'],
		 [['.', '..', '..', '/foo'], '../../foo'],
		 [['', '..', '..', '/foo'], '../../foo'],
		 [['/'], '/'],
		 [['/', '.'], '/'],
		 [['/', '..'], '/'],
		 [['/', '..', '..'], '/'],
		 [[''], '.'],
		 [['', ''], '.'],
		 [[' /foo'], ' /foo'],
		 [[' ', 'foo'], ' /foo'],
		 [[' ', '.'], ' '],
		 [[' ', '/'], ' /'],
		 [[' ', ''], ' '],
		 [['/', 'foo'], '/foo'],
		 [['/', '/foo'], '/foo'],
		 [['/', '//foo'], '/foo'],
		 [['/', '', '/foo'], '/foo'],
		 [['', '/', 'foo'], '/foo'],
		 [['', '/', '/foo'], '/foo']
		];

	// Run the join tests.
	joinTests.forEach(function(test) {
	  var actual = path.join.apply(path, test[0]);
	  var expected = test[1];
	  var message = 'path.join(' + test[0].map(JSON.stringify).join(',') + ')' +
	                '\n  expect=' + JSON.stringify(expected) +
	                '\n  actual=' + JSON.stringify(actual);
	  if (actual !== expected) failures.push('\n' + message);
	  // assert.equal(actual, expected, message);
	});
	assert.equal(failures.length, 0, failures.join(''));
	var joinThrowTests = [true, false, 7, null, {}, undefined, [], NaN];
	joinThrowTests.forEach(function(test) {
	  assert.throws(function() {
	    path.join(test);
	  }, TypeError);
	  assert.throws(function() {
	    path.resolve(test);
	  }, TypeError);
	});
});

test("normalize()", function () {
	assert.equal(path.normalize('./fixtures///b/../b/c.js'), 'fixtures/b/c.js');
	assert.equal(path.normalize('/foo/../../../bar'), '/bar');
	assert.equal(path.normalize('a//b//../b'), 'a/b');
	assert.equal(path.normalize('a//b//./c'), 'a/b/c');
	assert.equal(path.normalize('a//b//.'), 'a/b');
});

test("resolve()", function () {
	var resolveTests =
		// arguments                                    result
		[[['/var/lib', '../', 'file/'], '/var/file'],
		[['/var/lib', '/../', 'file/'], '/file'],
		[['a/b/c/', '../../..'], path.cwd()],
		[['.'], path.cwd()],
		[['/some/dir', '.', '/absolute/'], '/absolute']];

	var failures = [];
	resolveTests.forEach(function(test) {
		var actual = path.resolve.apply(path, test[0]);
		var expected = test[1];
		var message = 'path.resolve(' + test[0].map(JSON.stringify).join(',') + ')' +
		            '\n  expect=' + JSON.stringify(expected) +
		            '\n  actual=' + JSON.stringify(actual);
		if (actual !== expected) failures.push('\n' + message);
		// assert.equal(actual, expected, message);
	});
	assert.equal(failures.length, 0, failures.join(''));
});

test("isAbsolute()", function () {
	assert.equal(path.isAbsolute('/home/foo'), true);
	assert.equal(path.isAbsolute('/home/foo/..'), true);
	assert.equal(path.isAbsolute('bar/'), false);
	assert.equal(path.isAbsolute('./baz'), false);
});

test("relative()", function () {
	 var relativeTests =
		// arguments                    result
		[['/var/lib', '/var', '..'],
		 ['/var/lib', '/bin', '../../bin'],
		 ['/var/lib', '/var/lib', ''],
		 ['/var/lib', '/var/apache', '../apache'],
		 ['/var/', '/var/lib', 'lib'],
		 ['/', '/var/lib', 'var/lib']];

	var failures = [];
	relativeTests.forEach(function(test) {
		var actual = path.relative(test[0], test[1]);
		var expected = test[2];
		var message = 'path.relative(' +
		            test.slice(0, 2).map(JSON.stringify).join(',') +
		            ')' +
		            '\n  expect=' + JSON.stringify(expected) +
		            '\n  actual=' + JSON.stringify(actual);
		if (actual !== expected) failures.push('\n' + message);
	});
	assert.equal(failures.length, 0, failures.join(''));
});

test("sep", function () {
	assert.equal(path.sep, '/');
})