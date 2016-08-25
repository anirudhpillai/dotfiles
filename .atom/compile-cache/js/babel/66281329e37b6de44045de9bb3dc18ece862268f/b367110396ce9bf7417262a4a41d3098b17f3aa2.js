Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _models = require('./models');

var _utils = require('./utils');

exports['default'] = {
    statCache: {},
    readdirCache: {},
    matchingPathCache: {},
    clearCache: function clearCache() {
        this.statCache = {};
        this.readdirCache = {};
        this.matchingPathCache = {};
    },

    stat: function stat(path) {
        try {
            if (!(path.absolute in this.statCache)) {
                this.statCache[path.absolute] = _fs2['default'].statSync(path.absolute);
            }

            return this.statCache[path.absolute];
        } catch (err) {
            this.statCache[path.absolute] = null;
            return null;
        }
    },

    isDirectory: function isDirectory(path) {
        var stat = this.stat(path);
        return stat ? stat.isDirectory() : null;
    },

    isFile: function isFile(path) {
        var stat = this.stat(path);
        return stat ? !stat.isDirectory() : null;
    },

    exists: function exists(path) {
        return this.stat(path) !== null;
    },

    /**
     * Create an empty file at the given path if it doesn't already exist.
     */
    createFile: function createFile(path) {
        _touch2['default'].sync(path.absolute);
    },

    /**
     * Create directories for the file the path points to, or do nothing
     * if they already exist.
     */
    createDirectories: function createDirectories(path) {
        try {
            _mkdirp2['default'].sync((0, _utils.absolutify)(path.directory));
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
    },

    getMatchingPaths: function getMatchingPaths(path) {
        var _this = this;

        if (path.absolute in this.matchingPathCache) {
            return this.matchingPathCache[path.absolute];
        }

        var absoluteDir = (0, _utils.absolutify)(path.directory);
        var filenames = null;

        if (absoluteDir in this.readdirCache) {
            filenames = this.readdirCache[absoluteDir];
        } else {
            try {
                filenames = _fs2['default'].readdirSync(absoluteDir);
            } catch (err) {
                filenames = [];
            }
            this.readdirCache[absoluteDir] = filenames;
        }

        if (path.fragment) {
            if (config.get('fuzzyMatch')) {
                filenames = _fuzzaldrinPlus2['default'].filter(filenames, path.fragment);
            } else {
                (function () {
                    var caseSensitive = path.hasCaseSensitiveFragment();
                    filenames = filenames.filter(function (fn) {
                        return _this.matchFragment(path.fragment, fn, caseSensitive);
                    });
                })();
            }
        }

        var matchingPaths = filenames.map(function (fn) {
            return new _models.Path(path.directory + fn);
        });
        this.matchingPathCache[path.absolute] = matchingPaths;
        return matchingPaths;
    },

    /**
     * Return whether the filename matches the given path fragment.
     */
    matchFragment: function matchFragment(fragment, filename) {
        var caseSensitive = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        if (!caseSensitive) {
            fragment = fragment.toLowerCase();
            filename = filename.toLowerCase();
        }

        return filename.startsWith(fragment);
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9maWxlLXNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztrQkFDZSxJQUFJOzs7OzhCQUVJLGlCQUFpQjs7OztzQkFDckIsUUFBUTs7OztxQkFDVCxPQUFPOzs7O3NCQUVELFVBQVU7O0lBQXRCLE1BQU07O3NCQUNDLFVBQVU7O3FCQUNKLFNBQVM7O3FCQUduQjtBQUNYLGFBQVMsRUFBRSxFQUFFO0FBQ2IsZ0JBQVksRUFBRSxFQUFFO0FBQ2hCLHFCQUFpQixFQUFFLEVBQUU7QUFDckIsY0FBVSxFQUFBLHNCQUFHO0FBQ1QsWUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsWUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsWUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztLQUMvQjs7QUFFRCxRQUFJLEVBQUEsY0FBQyxJQUFJLEVBQUU7QUFDUCxZQUFJO0FBQ0EsZ0JBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUEsQUFBQyxFQUFFO0FBQ3BDLG9CQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlEOztBQUVELG1CQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3hDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDVixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLG1CQUFPLElBQUksQ0FBQztTQUNmO0tBQ0o7O0FBRUQsZUFBVyxFQUFBLHFCQUFDLElBQUksRUFBRTtBQUNkLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFB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LEVBQUUsQ0FBQztBQUNsQyxvQkFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNyQzs7QUFFRCxlQUFPLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDeEM7Q0FDSiIsImZpbGUiOiIvaG9tZS9hbmlydWRoLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvZmlsZS1zZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuaW1wb3J0IGZ1enphbGRyaW4gZnJvbSAnZnV6emFsZHJpbi1wbHVzJztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCB0b3VjaCBmcm9tICd0b3VjaCc7XG5cbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1BhdGh9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7YWJzb2x1dGlmeX0gZnJvbSAnLi91dGlscyc7XG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHN0YXRDYWNoZToge30sXG4gICAgcmVhZGRpckNhY2hlOiB7fSxcbiAgICBtYXRjaGluZ1BhdGhDYWNoZToge30sXG4gICAgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0Q2FjaGUgPSB7fTtcbiAgICAgICAgdGhpcy5yZWFkZGlyQ2FjaGUgPSB7fTtcbiAgICAgICAgdGhpcy5tYXRjaGluZ1BhdGhDYWNoZSA9IHt9O1xuICAgIH0sXG5cbiAgICBzdGF0KHBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICghKHBhdGguYWJzb2x1dGUgaW4gdGhpcy5zdGF0Q2FjaGUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0Q2FjaGVbcGF0aC5hYnNvbHV0ZV0gPSBmcy5zdGF0U3luYyhwYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdENhY2hlW3BhdGguYWJzb2x1dGVdO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdENhY2hlW3BhdGguYWJzb2x1dGVdID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGlzRGlyZWN0b3J5KHBhdGgpIHtcbiAgICAgICAgbGV0IHN0YXQgPSB0aGlzLnN0YXQocGF0aCk7XG4gICAgICAgIHJldHVybiBzdGF0ID8gc3RhdC5pc0RpcmVjdG9yeSgpIDogbnVsbDtcbiAgICB9LFxuXG4gICAgaXNGaWxlKHBhdGgpIHtcbiAgICAgICAgbGV0IHN0YXQgPSB0aGlzLnN0YXQocGF0aCk7XG4gICAgICAgIHJldHVybiBzdGF0ID8gIXN0YXQuaXNEaXJlY3RvcnkoKSA6IG51bGw7XG4gICAgfSxcblxuICAgIGV4aXN0cyhwYXRoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXQocGF0aCkgIT09IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBlbXB0eSBmaWxlIGF0IHRoZSBnaXZlbiBwYXRoIGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBleGlzdC5cbiAgICAgKi9cbiAgICBjcmVhdGVGaWxlKHBhdGgpIHtcbiAgICAgICAgdG91Y2guc3luYyhwYXRoLmFic29sdXRlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGRpcmVjdG9yaWVzIGZvciB0aGUgZmlsZSB0aGUgcGF0aCBwb2ludHMgdG8sIG9yIGRvIG5vdGhpbmdcbiAgICAgKiBpZiB0aGV5IGFscmVhZHkgZXhpc3QuXG4gICAgICovXG4gICAgY3JlYXRlRGlyZWN0b3JpZXMocGF0aCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWtkaXJwLnN5bmMoYWJzb2x1dGlmeShwYXRoLmRpcmVjdG9yeSkpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0TWF0Y2hpbmdQYXRocyhwYXRoKSB7XG4gICAgICAgIGlmIChwYXRoLmFic29sdXRlIGluIHRoaXMubWF0Y2hpbmdQYXRoQ2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hdGNoaW5nUGF0aENhY2hlW3BhdGguYWJzb2x1dGVdO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGFic29sdXRlRGlyID0gYWJzb2x1dGlmeShwYXRoLmRpcmVjdG9yeSk7XG4gICAgICAgIGxldCBmaWxlbmFtZXMgPSBudWxsO1xuXG4gICAgICAgIGlmIChhYnNvbHV0ZURpciBpbiB0aGlzLnJlYWRkaXJDYWNoZSkge1xuICAgICAgICAgICAgZmlsZW5hbWVzID0gdGhpcy5yZWFkZGlyQ2FjaGVbYWJzb2x1dGVEaXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZXMgPSBmcy5yZWFkZGlyU3luYyhhYnNvbHV0ZURpcik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZXMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVhZGRpckNhY2hlW2Fic29sdXRlRGlyXSA9IGZpbGVuYW1lcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoLmZyYWdtZW50KSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLmdldCgnZnV6enlNYXRjaCcpKSB7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWVzID0gZnV6emFsZHJpbi5maWx0ZXIoZmlsZW5hbWVzLCBwYXRoLmZyYWdtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNhc2VTZW5zaXRpdmUgPSBwYXRoLmhhc0Nhc2VTZW5zaXRpdmVGcmFnbWVudCgpO1xuICAgICAgICAgICAgICAgIGZpbGVuYW1lcyA9IGZpbGVuYW1lcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgIChmbikgPT4gdGhpcy5tYXRjaEZyYWdtZW50KHBhdGguZnJhZ21lbnQsIGZuLCBjYXNlU2Vuc2l0aXZlKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbWF0Y2hpbmdQYXRocyA9IGZpbGVuYW1lcy5tYXAoKGZuKSA9PiBuZXcgUGF0aChwYXRoLmRpcmVjdG9yeSArIGZuKSk7XG4gICAgICAgIHRoaXMubWF0Y2hpbmdQYXRoQ2FjaGVbcGF0aC5hYnNvbHV0ZV0gPSBtYXRjaGluZ1BhdGhzO1xuICAgICAgICByZXR1cm4gbWF0Y2hpbmdQYXRocztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHdoZXRoZXIgdGhlIGZpbGVuYW1lIG1hdGNoZXMgdGhlIGdpdmVuIHBhdGggZnJhZ21lbnQuXG4gICAgICovXG4gICAgbWF0Y2hGcmFnbWVudChmcmFnbWVudCwgZmlsZW5hbWUsIGNhc2VTZW5zaXRpdmU9ZmFsc2UpIHtcbiAgICAgICAgaWYgKCFjYXNlU2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmlsZW5hbWUuc3RhcnRzV2l0aChmcmFnbWVudCk7XG4gICAgfVxufTtcbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/file-service.js
