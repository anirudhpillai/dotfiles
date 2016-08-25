Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.cachedProperty = cachedProperty;
exports.getProjectPath = getProjectPath;
exports.preferredSeparatorFor = preferredSeparatorFor;
exports.defineImmutable = defineImmutable;
exports.absolutify = absolutify;
exports.closest = closest;
exports.padding = padding;
exports.splitByTest = splitByTest;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _osenv = require('osenv');

var _osenv2 = _interopRequireDefault(_osenv);

/**
 * Generates the return value for the wrapper property on first access
 * and caches it on the object. All future calls return the cached value
 * instead of re-calculating it.
 */

function cachedProperty(target, key, descriptor) {
    var getter = descriptor.get;
    var cached_key = Symbol(key + '_cached');

    descriptor.get = function () {
        if (this[cached_key] === undefined) {
            Object.defineProperty(this, cached_key, {
                value: getter.call(this),
                writable: false,
                enumerable: false
            });
        }
        return this[cached_key];
    };

    return descriptor;
}

/**
 * Get the path to the current project directory. For now this just uses
 * the first directory in the list. Return null if there are no project
 * directories.
 *
 * TODO: Support more than just the first.
 */

function getProjectPath() {
    var projectPaths = atom.project.getPaths();
    if (projectPaths.length > 0) {
        return projectPaths[0];
    } else {
        return null;
    }
}

/**
 * Get the preferred path separator for the given string based on the
 * first path separator detected.
 */

function preferredSeparatorFor(path) {
    var forwardIndex = path.indexOf('/');
    var backIndex = path.indexOf('\\');

    if (backIndex === -1 && forwardIndex === -1) {
        return _path2['default'].sep;
    } else if (forwardIndex === -1) {
        return '\\';
    } else if (backIndex === -1) {
        return '/';
    } else if (forwardIndex < backIndex) {
        return '/';
    } else {
        return '\\';
    }
}

/**
 * Define an immutable property on an object.
 */

function defineImmutable(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        writable: false,
        enumerable: true
    });
}

/**
 * Turn the given path into an absolute path if necessary. Paths are
 * considered relative to the project root.
 */

function absolutify(path) {
    // If we start with a tilde, just replace it with the home dir.
    var sep = preferredSeparatorFor(path);
    if (path.startsWith('~' + sep)) {
        return _osenv2['default'].home() + sep + path.slice(2);
    }

    // If the path doesn't start with a separator, it's relative to the
    // project root.
    if (!path.startsWith(sep)) {
        var relativeBases = [];
        var projectPath = getProjectPath();
        if (projectPath) {
            relativeBases.push(projectPath);
        }

        return _path2['default'].resolve.apply(_path2['default'], relativeBases.concat([path]));
    }

    // Otherwise it was absolute already.
    return path;
}

/**
 * Starts at the current DOM element and moves upward in the DOM tree
 * until an element matching the given selector is found.
 *
 * Intended to be bound to DOM elements like so:
 * domNode::closest('selector');
 */

function closest(selector) {
    if (this.matches && this.matches(selector)) {
        return this;
    } else if (this.parentNode) {
        var _context;

        return (_context = this.parentNode, closest).call(_context, selector);
    } else {
        return null;
    }
}

/**
 * DOM helper that fetchings the padding on a side of an element. Used
 * like so:
 * domNode::padding('bottom')
 */

function padding(side) {
    return Number.parseFloat(getComputedStyle(this)['padding-' + side]);
}

/**
 * Split the given items into two arrays based on whether they pass the
 * given test function.
 */

function splitByTest(items, test) {
    var pass = [];
    var fail = [];

    for (var item of items) {
        if (test(item)) {
            pass.push(item);
        } else {
            fail.push(item);
        }
    }

    return [pass, fail];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O29CQUVvQixNQUFNOzs7O3FCQUVSLE9BQU87Ozs7Ozs7Ozs7QUFRbEIsU0FBUyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUU7QUFDcEQsUUFBSSxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztBQUM1QixRQUFJLFVBQVUsR0FBRyxNQUFNLENBQUksR0FBRyxhQUFVLENBQUM7O0FBRXpDLGNBQVUsQ0FBQyxHQUFHLEdBQUcsWUFBVztBQUN4QixZQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDaEMsa0JBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtBQUNwQyxxQkFBSyxFQUFFLEFBQU0sTUFBTSxNQUFaLElBQUksQ0FBVTtBQUNyQix3QkFBUSxFQUFFLEtBQUs7QUFDZiwwQkFBVSxFQUFFLEtBQUs7YUFDcEIsQ0FBQyxDQUFDO1NBQ047QUFDRCxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUMzQixDQUFDOztBQUVGLFdBQU8sVUFBVSxDQUFDO0NBQ3JCOzs7Ozs7Ozs7O0FBVU0sU0FBUyxjQUFjLEdBQUc7QUFDN0IsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUMzQyxRQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLGVBQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFCLE1BQU07QUFDSCxlQUFPLElBQUksQ0FBQztLQUNmO0NBQ0o7Ozs7Ozs7QUFPTSxTQUFTLHFCQUFxQixDQUFDLElBQUksRUFBRTtBQUN4QyxRQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFD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YWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL3V0aWxzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQgc3RkUGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IG9zZW52IGZyb20gJ29zZW52JztcblxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgcmV0dXJuIHZhbHVlIGZvciB0aGUgd3JhcHBlciBwcm9wZXJ0eSBvbiBmaXJzdCBhY2Nlc3NcbiAqIGFuZCBjYWNoZXMgaXQgb24gdGhlIG9iamVjdC4gQWxsIGZ1dHVyZSBjYWxscyByZXR1cm4gdGhlIGNhY2hlZCB2YWx1ZVxuICogaW5zdGVhZCBvZiByZS1jYWxjdWxhdGluZyBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhY2hlZFByb3BlcnR5KHRhcmdldCwga2V5LCBkZXNjcmlwdG9yKSB7XG4gICAgbGV0IGdldHRlciA9IGRlc2NyaXB0b3IuZ2V0O1xuICAgIGxldCBjYWNoZWRfa2V5ID0gU3ltYm9sKGAke2tleX1fY2FjaGVkYCk7XG5cbiAgICBkZXNjcmlwdG9yLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpc1tjYWNoZWRfa2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgY2FjaGVkX2tleSwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzOjpnZXR0ZXIoKSxcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1tjYWNoZWRfa2V5XTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlc2NyaXB0b3I7XG59XG5cblxuLyoqXG4gKiBHZXQgdGhlIHBhdGggdG8gdGhlIGN1cnJlbnQgcHJvamVjdCBkaXJlY3RvcnkuIEZvciBub3cgdGhpcyBqdXN0IHVzZXNcbiAqIHRoZSBmaXJzdCBkaXJlY3RvcnkgaW4gdGhlIGxpc3QuIFJldHVybiBudWxsIGlmIHRoZXJlIGFyZSBubyBwcm9qZWN0XG4gKiBkaXJlY3Rvcmllcy5cbiAqXG4gKiBUT0RPOiBTdXBwb3J0IG1vcmUgdGhhbiBqdXN0IHRoZSBmaXJzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3RQYXRoKCkge1xuICAgIGxldCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcbiAgICBpZiAocHJvamVjdFBhdGhzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHByb2plY3RQYXRoc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBHZXQgdGhlIHByZWZlcnJlZCBwYXRoIHNlcGFyYXRvciBmb3IgdGhlIGdpdmVuIHN0cmluZyBiYXNlZCBvbiB0aGVcbiAqIGZpcnN0IHBhdGggc2VwYXJhdG9yIGRldGVjdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJlZmVycmVkU2VwYXJhdG9yRm9yKHBhdGgpIHtcbiAgICBsZXQgZm9yd2FyZEluZGV4ID0gcGF0aC5pbmRleE9mKCcvJyk7XG4gICAgbGV0IGJhY2tJbmRleCA9IHBhdGguaW5kZXhPZignXFxcXCcpO1xuXG4gICAgaWYgKGJhY2tJbmRleCA9PT0gLTEgJiYgZm9yd2FyZEluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gc3RkUGF0aC5zZXA7XG4gICAgfSBlbHNlIGlmIChmb3J3YXJkSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiAnXFxcXCc7XG4gICAgfSBlbHNlIGlmIChiYWNrSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHJldHVybiAnLyc7XG4gICAgfSBlbHNlIGlmIChmb3J3YXJkSW5kZXggPCBiYWNrSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ1xcXFwnO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIERlZmluZSBhbiBpbW11dGFibGUgcHJvcGVydHkgb24gYW4gb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lSW1tdXRhYmxlKG9iaiwgbmFtZSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIH0pO1xufVxuXG5cbi8qKlxuICogVHVybiB0aGUgZ2l2ZW4gcGF0aCBpbnRvIGFuIGFic29sdXRlIHBhdGggaWYgbmVjZXNzYXJ5LiBQYXRocyBhcmVcbiAqIGNvbnNpZGVyZWQgcmVsYXRpdmUgdG8gdGhlIHByb2plY3Qgcm9vdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFic29sdXRpZnkocGF0aCkge1xuICAgIC8vIElmIHdlIHN0YXJ0IHdpdGggYSB0aWxkZSwganVzdCByZXBsYWNlIGl0IHdpdGggdGhlIGhvbWUgZGlyLlxuICAgIGxldCBzZXAgPSBwcmVmZXJyZWRTZXBhcmF0b3JGb3IocGF0aCk7XG4gICAgaWYgKHBhdGguc3RhcnRzV2l0aCgnficgKyBzZXApKSB7XG4gICAgICAgIHJldHVybiBvc2Vudi5ob21lKCkgKyBzZXAgKyBwYXRoLnNsaWNlKDIpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBwYXRoIGRvZXNuJ3Qgc3RhcnQgd2l0aCBhIHNlcGFyYXRvciwgaXQncyByZWxhdGl2ZSB0byB0aGVcbiAgICAvLyBwcm9qZWN0IHJvb3QuXG4gICAgaWYgKCFwYXRoLnN0YXJ0c1dpdGgoc2VwKSkge1xuICAgICAgICBsZXQgcmVsYXRpdmVCYXNlcyA9IFtdO1xuICAgICAgICBsZXQgcHJvamVjdFBhdGggPSBnZXRQcm9qZWN0UGF0aCgpO1xuICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICAgIHJlbGF0aXZlQmFzZXMucHVzaChwcm9qZWN0UGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3RkUGF0aC5yZXNvbHZlKC4uLnJlbGF0aXZlQmFzZXMsIHBhdGgpO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBpdCB3YXMgYWJzb2x1dGUgYWxyZWFkeS5cbiAgICByZXR1cm4gcGF0aDtcbn1cblxuXG4vKipcbiAqIFN0YXJ0cyBhdCB0aGUgY3VycmVudCBET00gZWxlbWVudCBhbmQgbW92ZXMgdXB3YXJkIGluIHRoZSBET00gdHJlZVxuICogdW50aWwgYW4gZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IgaXMgZm91bmQuXG4gKlxuICogSW50ZW5kZWQgdG8gYmUgYm91bmQgdG8gRE9NIGVsZW1lbnRzIGxpa2Ugc286XG4gKiBkb21Ob2RlOjpjbG9zZXN0KCdzZWxlY3RvcicpO1xuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VzdChzZWxlY3Rvcikge1xuICAgIGlmICh0aGlzLm1hdGNoZXMgJiYgdGhpcy5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFyZW50Tm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnROb2RlOjpjbG9zZXN0KHNlbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBET00gaGVscGVyIHRoYXQgZmV0Y2hpbmdzIHRoZSBwYWRkaW5nIG9uIGEgc2lkZSBvZiBhbiBlbGVtZW50LiBVc2VkXG4gKiBsaWtlIHNvOlxuICogZG9tTm9kZTo6cGFkZGluZygnYm90dG9tJylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhZGRpbmcoc2lkZSkge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXMpW2BwYWRkaW5nLSR7c2lkZX1gXSk7XG59XG5cblxuLyoqXG4gKiBTcGxpdCB0aGUgZ2l2ZW4gaXRlbXMgaW50byB0d28gYXJyYXlzIGJhc2VkIG9uIHdoZXRoZXIgdGhleSBwYXNzIHRoZVxuICogZ2l2ZW4gdGVzdCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0QnlUZXN0KGl0ZW1zLCB0ZXN0KSB7XG4gICAgbGV0IHBhc3MgPSBbXTtcbiAgICBsZXQgZmFpbCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICBpZiAodGVzdChpdGVtKSkge1xuICAgICAgICAgICAgcGFzcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbC5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbn1cbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/utils.js
