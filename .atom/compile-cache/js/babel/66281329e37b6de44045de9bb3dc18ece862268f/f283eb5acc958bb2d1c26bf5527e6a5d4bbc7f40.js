Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _utils = require('./utils');

/**
 * Wrapper for dealing with filesystem paths.
 */

var Path = (function () {
    function Path() {
        var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        _classCallCheck(this, Path);

        // The last path segment is the "fragment". Paths that end in a
        // separator have a blank fragment.
        var sep = (0, _utils.preferredSeparatorFor)(path);
        var parts = path.split(sep);
        var fragment = parts[parts.length - 1];
        var directory = path.substring(0, path.length - fragment.length);

        // Set non-writable properties.
        (0, _utils.defineImmutable)(this, 'directory', directory);
        (0, _utils.defineImmutable)(this, 'fragment', fragment);
        (0, _utils.defineImmutable)(this, 'full', path);
        (0, _utils.defineImmutable)(this, 'absolute', (0, _utils.absolutify)(path));
        (0, _utils.defineImmutable)(this, 'sep', sep);
    }

    _createClass(Path, [{
        key: 'isProjectDirectory',
        value: function isProjectDirectory() {
            return atom.project.getPaths().indexOf(this.absolute) !== -1;
        }
    }, {
        key: 'isRoot',
        value: function isRoot() {
            return _path2['default'].dirname(this.absolute) === this.absolute;
        }
    }, {
        key: 'hasCaseSensitiveFragment',
        value: function hasCaseSensitiveFragment() {
            return this.fragment !== '' && this.fragment !== this.fragment.toLowerCase();
        }
    }, {
        key: 'asDirectory',
        value: function asDirectory() {
            return new Path(this.full + (this.fragment ? this.sep : ''));
        }
    }, {
        key: 'parent',
        value: function parent() {
            if (this.isRoot()) {
                return this;
            } else if (this.fragment) {
                return new Path(this.directory);
            } else {
                var newFull = _path2['default'].dirname(this.directory);

                // Only append a separator if necessary.
                if (!newFull.endsWith(this.sep)) {
                    newFull += this.sep;
                }

                return new Path(newFull);
            }
        }

        /**
         * Return path for the root directory for the drive this path is on.
         */
    }, {
        key: 'root',
        value: function root() {
            var last = null;
            var current = this.absolute;
            while (current !== last) {
                last = current;
                current = _path2['default'].dirname(current);
            }

            return new Path(current);
        }

        /**
         * Check if the last path fragment in this path is equal to the given
         * shortcut string, and the path ends in a separator.
         *
         * For example, ':/' and '/foo/bar/:/' have the ':' shortcut, but
         * '/foo/bar:/' and '/blah/:' do not.
         */
    }, {
        key: 'hasShortcut',
        value: function hasShortcut(shortcut) {
            shortcut = shortcut + this.sep;
            return !this.fragment && (this.directory.endsWith(this.sep + shortcut) || this.directory === shortcut);
        }
    }, {
        key: 'equals',
        value: function equals(otherPath) {
            return this.full === otherPath.full;
        }

        /**
         * Return the path to show initially in the path input.
         */
    }], [{
        key: 'initial',
        value: function initial() {
            switch (config.get('defaultInputValue')) {
                case config.DEFAULT_ACTIVE_FILE_DIR:
                    var editor = atom.workspace.getActiveTextEditor();
                    if (editor && editor.getPath()) {
                        return new Path(_path2['default'].dirname(editor.getPath()) + _path2['default'].sep);
                    }
                // No break so that we fall back to project root.
                case config.DEFAULT_PROJECT_ROOT:
                    var projectPath = (0, _utils.getProjectPath)();
                    if (projectPath) {
                        return new Path(projectPath + _path2['default'].sep);
                    }
            }

            return new Path('');
        }

        /**
         * Compare two paths lexicographically.
         */
    }, {
        key: 'compare',
        value: function compare(path1, path2) {
            return path1.full.localeCompare(path2.full);
        }

        /**
         * Return a new path instance with the common prefix of all the
         * given paths.
         */
    }, {
        key: 'commonPrefix',
        value: function commonPrefix(paths) {
            var caseSensitive = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (paths.length < 2) {
                throw new Error('Cannot find common prefix for lists shorter than two elements.');
            }

            paths = paths.map(function (path) {
                return path.full;
            }).sort();
            var first = paths[0];
            var last = paths[paths.length - 1];

            var prefix = '';
            var prefixMaxLength = Math.min(first.length, last.length);
            for (var k = 0; k < prefixMaxLength; k++) {
                if (first[k] === last[k]) {
                    prefix += first[k];
                } else if (!caseSensitive && first[k].toLowerCase() === last[k].toLowerCase()) {
                    prefix += first[k].toLowerCase();
                } else {
                    break;
                }
            }

            return new Path(prefix);
        }
    }]);

    return Path;
})();

exports.Path = Path;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9tb2RlbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7a0JBQ2UsSUFBSTs7OztvQkFDQyxNQUFNOzs7OzhCQUVILGlCQUFpQjs7OztzQkFDckIsUUFBUTs7OztxQkFDVCxPQUFPOzs7O3NCQUVELFVBQVU7O0lBQXRCLE1BQU07O3FCQU9YLFNBQVM7Ozs7OztJQU1ILElBQUk7QUFDRixhQURGLElBQUksR0FDUTtZQUFULElBQUkseURBQUMsRUFBRTs7OEJBRFYsSUFBSTs7OztBQUlULFlBQUksR0FBRyxHQUFHLGtDQUFzQixJQUFJLENBQUMsQ0FBQztBQUN0QyxZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLFlBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7QUFHakUsb0NBQWdCLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDOUMsb0NBQWdCLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDNUMsb0NBQWdCLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsb0NBQWdCLElBQUksRUFBRSxVQUFVLEVBQUUsdUJBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRCxvQ0FBZ0IsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNyQzs7aUJBZlEsSUFBSTs7ZUFpQkssOEJBQUc7QUFDakIsbUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFP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QyxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQzNFLDBCQUFNLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUNwQyxNQUFNO0FBQ0gsMEJBQU07aUJBQ1Q7YUFDSjs7QUFFRCxtQkFBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzQjs7O1dBM0lRLElBQUkiLCJmaWxlIjoiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL21vZGVscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgc3RkUGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IGZ1enphbGRyaW4gZnJvbSAnZnV6emFsZHJpbi1wbHVzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCB0b3VjaCBmcm9tICd0b3VjaCc7XG5cbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1xuICAgIGFic29sdXRpZnksXG4gICAgY2FjaGVkUHJvcGVydHksXG4gICAgZGVmaW5lSW1tdXRhYmxlLFxuICAgIGdldFByb2plY3RQYXRoLFxuICAgIHByZWZlcnJlZFNlcGFyYXRvckZvclxufSBmcm9tICcuL3V0aWxzJztcblxuXG4vKipcbiAqIFdyYXBwZXIgZm9yIGRlYWxpbmcgd2l0aCBmaWxlc3lzdGVtIHBhdGhzLlxuICovXG5leHBvcnQgY2xhc3MgUGF0aCB7XG4gICAgY29uc3RydWN0b3IocGF0aD0nJykge1xuICAgICAgICAvLyBUaGUgbGFzdCBwYXRoIHNlZ21lbnQgaXMgdGhlIFwiZnJhZ21lbnRcIi4gUGF0aHMgdGhhdCBlbmQgaW4gYVxuICAgICAgICAvLyBzZXBhcmF0b3IgaGF2ZSBhIGJsYW5rIGZyYWdtZW50LlxuICAgICAgICBsZXQgc2VwID0gcHJlZmVycmVkU2VwYXJhdG9yRm9yKHBhdGgpO1xuICAgICAgICBsZXQgcGFydHMgPSBwYXRoLnNwbGl0KHNlcCk7XG4gICAgICAgIGxldCBmcmFnbWVudCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBsZXQgZGlyZWN0b3J5ID0gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sZW5ndGggLSBmcmFnbWVudC5sZW5ndGgpO1xuXG4gICAgICAgIC8vIFNldCBub24td3JpdGFibGUgcHJvcGVydGllcy5cbiAgICAgICAgZGVmaW5lSW1tdXRhYmxlKHRoaXMsICdkaXJlY3RvcnknLCBkaXJlY3RvcnkpO1xuICAgICAgICBkZWZpbmVJbW11dGFibGUodGhpcywgJ2ZyYWdtZW50JywgZnJhZ21lbnQpO1xuICAgICAgICBkZWZpbmVJbW11dGFibGUodGhpcywgJ2Z1bGwnLCBwYXRoKTtcbiAgICAgICAgZGVmaW5lSW1tdXRhYmxlKHRoaXMsICdhYnNvbHV0ZScsIGFic29sdXRpZnkocGF0aCkpO1xuICAgICAgICBkZWZpbmVJbW11dGFibGUodGhpcywgJ3NlcCcsIHNlcCk7XG4gICAgfVxuXG4gICAgaXNQcm9qZWN0RGlyZWN0b3J5KCkge1xuICAgICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuaW5kZXhPZih0aGlzLmFic29sdXRlKSAhPT0gLTE7XG4gICAgfVxuXG4gICAgaXNSb290KCkge1xuICAgICAgICByZXR1cm4gc3RkUGF0aC5kaXJuYW1lKHRoaXMuYWJzb2x1dGUpID09PSB0aGlzLmFic29sdXRlO1xuICAgIH1cblxuICAgIGhhc0Nhc2VTZW5zaXRpdmVGcmFnbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJhZ21lbnQgIT09ICcnICYmIHRoaXMuZnJhZ21lbnQgIT09IHRoaXMuZnJhZ21lbnQudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICBhc0RpcmVjdG9yeSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHRoaXMuZnVsbCArICh0aGlzLmZyYWdtZW50ID8gdGhpcy5zZXAgOiAnJykpO1xuICAgIH1cblxuICAgIHBhcmVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSb290KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGF0aCh0aGlzLmRpcmVjdG9yeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbmV3RnVsbCA9IHN0ZFBhdGguZGlybmFtZSh0aGlzLmRpcmVjdG9yeSk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgYXBwZW5kIGEgc2VwYXJhdG9yIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgICAgIGlmICghbmV3RnVsbC5lbmRzV2l0aCh0aGlzLnNlcCkpIHtcbiAgICAgICAgICAgICAgICBuZXdGdWxsICs9IHRoaXMuc2VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBhdGgobmV3RnVsbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gcGF0aCBmb3IgdGhlIHJvb3QgZGlyZWN0b3J5IGZvciB0aGUgZHJpdmUgdGhpcyBwYXRoIGlzIG9uLlxuICAgICAqL1xuICAgIHJvb3QoKSB7XG4gICAgICAgIGxldCBsYXN0ID0gbnVsbDtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmFic29sdXRlO1xuICAgICAgICB3aGlsZSAoY3VycmVudCAhPT0gbGFzdCkge1xuICAgICAgICAgICAgbGFzdCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBjdXJyZW50ID0gc3RkUGF0aC5kaXJuYW1lKGN1cnJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoKGN1cnJlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBsYXN0IHBhdGggZnJhZ21lbnQgaW4gdGhpcyBwYXRoIGlzIGVxdWFsIHRvIHRoZSBnaXZlblxuICAgICAqIHNob3J0Y3V0IHN0cmluZywgYW5kIHRoZSBwYXRoIGVuZHMgaW4gYSBzZXBhcmF0b3IuXG4gICAgICpcbiAgICAgKiBGb3IgZXhhbXBsZSwgJzovJyBhbmQgJy9mb28vYmFyLzovJyBoYXZlIHRoZSAnOicgc2hvcnRjdXQsIGJ1dFxuICAgICAqICcvZm9vL2JhcjovJyBhbmQgJy9ibGFoLzonIGRvIG5vdC5cbiAgICAgKi9cbiAgICBoYXNTaG9ydGN1dChzaG9ydGN1dCkge1xuICAgICAgICBzaG9ydGN1dCA9IHNob3J0Y3V0ICsgdGhpcy5zZXA7XG4gICAgICAgIHJldHVybiAhdGhpcy5mcmFnbWVudCAmJiAoXG4gICAgICAgICAgICB0aGlzLmRpcmVjdG9yeS5lbmRzV2l0aCh0aGlzLnNlcCArIHNob3J0Y3V0KVxuICAgICAgICAgICAgfHwgdGhpcy5kaXJlY3RvcnkgPT09IHNob3J0Y3V0XG4gICAgICAgIClcbiAgICB9XG5cbiAgICBlcXVhbHMob3RoZXJQYXRoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZ1bGwgPT09IG90aGVyUGF0aC5mdWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgcGF0aCB0byBzaG93IGluaXRpYWxseSBpbiB0aGUgcGF0aCBpbnB1dC5cbiAgICAgKi9cbiAgICBzdGF0aWMgaW5pdGlhbCgpIHtcbiAgICAgICAgc3dpdGNoIChjb25maWcuZ2V0KCdkZWZhdWx0SW5wdXRWYWx1ZScpKSB7XG4gICAgICAgICAgICBjYXNlIGNvbmZpZy5ERUZBVUxUX0FDVElWRV9GSUxFX0RJUjpcbiAgICAgICAgICAgICAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgICAgICAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBhdGgoc3RkUGF0aC5kaXJuYW1lKGVkaXRvci5nZXRQYXRoKCkpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBObyBicmVhayBzbyB0aGF0IHdlIGZhbGwgYmFjayB0byBwcm9qZWN0IHJvb3QuXG4gICAgICAgICAgICBjYXNlIGNvbmZpZy5ERUZBVUxUX1BST0pFQ1RfUk9PVDpcbiAgICAgICAgICAgICAgICBsZXQgcHJvamVjdFBhdGggPSBnZXRQcm9qZWN0UGF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBhdGgocHJvamVjdFBhdGggKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoKCcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlIHR3byBwYXRocyBsZXhpY29ncmFwaGljYWxseS5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29tcGFyZShwYXRoMSwgcGF0aDIpIHtcbiAgICAgICAgcmV0dXJuIHBhdGgxLmZ1bGwubG9jYWxlQ29tcGFyZShwYXRoMi5mdWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYSBuZXcgcGF0aCBpbnN0YW5jZSB3aXRoIHRoZSBjb21tb24gcHJlZml4IG9mIGFsbCB0aGVcbiAgICAgKiBnaXZlbiBwYXRocy5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29tbW9uUHJlZml4KHBhdGhzLCBjYXNlU2Vuc2l0aXZlPWZhbHNlKSB7XG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgJ0Nhbm5vdCBmaW5kIGNvbW1vbiBwcmVmaXggZm9yIGxpc3RzIHNob3J0ZXIgdGhhbiB0d28gZWxlbWVudHMuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhdGhzID0gcGF0aHMubWFwKChwYXRoKSA9PiBwYXRoLmZ1bGwpLnNvcnQoKTtcbiAgICAgICAgbGV0IGZpcnN0ID0gcGF0aHNbMF07XG4gICAgICAgIGxldCBsYXN0ID0gcGF0aHNbcGF0aHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgbGV0IHByZWZpeCA9ICcnO1xuICAgICAgICBsZXQgcHJlZml4TWF4TGVuZ3RoID0gTWF0aC5taW4oZmlyc3QubGVuZ3RoLCBsYXN0Lmxlbmd0aCk7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcHJlZml4TWF4TGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGlmIChmaXJzdFtrXSA9PT0gbGFzdFtrXSkge1xuICAgICAgICAgICAgICAgIHByZWZpeCArPSBmaXJzdFtrXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNhc2VTZW5zaXRpdmUgJiYgZmlyc3Rba10udG9Mb3dlckNhc2UoKSA9PT0gbGFzdFtrXS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4ICs9IGZpcnN0W2tdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoKHByZWZpeCk7XG4gICAgfVxufVxuIl19
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/models.js
