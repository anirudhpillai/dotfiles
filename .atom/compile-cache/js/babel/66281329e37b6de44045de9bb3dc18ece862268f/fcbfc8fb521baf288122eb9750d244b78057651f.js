Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.provideEventService = provideEventService;
/** @babel */

var _controller = require('./controller');

// Instance of the controller, constructed on activation.
var controller = null;

var _config = require('./config');

Object.defineProperty(exports, 'config', {
    enumerable: true,
    get: function get() {
        return _config.config;
    }
});

function activate(state) {
    controller = new _controller.AdvancedOpenFileController();
}

function deactivate() {
    controller.detach();
    controller.destroy();
    controller = null;
}

/**
 * Provide a service object allowing other packages to subscribe to our
 * events.
 */

function provideEventService() {
    return {
        onDidOpenPath: function onDidOpenPath(callback) {
            return _controller.emitter.on('did-open-path', callback);
        },

        onDidCreatePath: function onDidCreatePath(callback) {
            return _controller.emitter.on('did-create-path', callback);
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9hZHZhbmNlZC1vcGVuLWZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MEJBQ2tELGNBQWM7OztBQUloRSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7O3NCQUVBLFVBQVU7Ozs7O3VCQUF2QixNQUFNOzs7O0FBRVAsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQzVCLGNBQVUsR0FBRyw0Q0FBZ0MsQ0FBQztDQUNqRDs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUN6QixjQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7Q0FDckI7Ozs7Ozs7QUFNTSxTQUFTLG1CQUFtQixHQUFHO0FBQ2xDLFdBQU87QUFDSCxxQkFBYSxFQUFBLHVCQUFDLFFBQVEsRUFBRTtBQUNwQixtQkFBTyxvQkFBUSxFQUFFLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2hEOztBQUVELHVCQUFlLEVBQUEseUJBQUMsUUFBUSxFQUFFO0FBQ3RCLG1CQUFPLG9CQUFRLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNsRDtLQUNKLENBQUM7Q0FDTCIsImZpbGUiOiIvaG9tZS9hbmlydWRoLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9saWIvYWR2YW5jZWQtb3Blbi1maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IHtBZHZhbmNlZE9wZW5GaWxlQ29udHJvbGxlciwgZW1pdHRlcn0gZnJvbSAnLi9jb250cm9sbGVyJztcblxuXG4vLyBJbnN0YW5jZSBvZiB0aGUgY29udHJvbGxlciwgY29uc3RydWN0ZWQgb24gYWN0aXZhdGlvbi5cbmxldCBjb250cm9sbGVyID0gbnVsbFxuXG5leHBvcnQge2NvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGUpIHtcbiAgICBjb250cm9sbGVyID0gbmV3IEFkdmFuY2VkT3BlbkZpbGVDb250cm9sbGVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICAgIGNvbnRyb2xsZXIuZGV0YWNoKCk7XG4gICAgY29udHJvbGxlci5kZXN0cm95KCk7XG4gICAgY29udHJvbGxlciA9IG51bGw7XG59XG5cbi8qKlxuICogUHJvdmlkZSBhIHNlcnZpY2Ugb2JqZWN0IGFsbG93aW5nIG90aGVyIHBhY2thZ2VzIHRvIHN1YnNjcmliZSB0byBvdXJcbiAqIGV2ZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVFdmVudFNlcnZpY2UoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25EaWRPcGVuUGF0aChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGVtaXR0ZXIub24oJ2RpZC1vcGVuLXBhdGgnLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25EaWRDcmVhdGVQYXRoKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1pdHRlci5vbignZGlkLWNyZWF0ZS1wYXRoJywgY2FsbGJhY2spO1xuICAgICAgICB9LFxuICAgIH07XG59XG4iXX0=
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/advanced-open-file.js
