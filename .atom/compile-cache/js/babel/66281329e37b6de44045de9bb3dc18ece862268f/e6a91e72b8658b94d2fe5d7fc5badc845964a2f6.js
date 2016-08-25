Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _eventKit = require('event-kit');

var _osenv = require('osenv');

var _osenv2 = _interopRequireDefault(_osenv);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _fileService = require('./file-service');

var _fileService2 = _interopRequireDefault(_fileService);

var _models = require('./models');

var _utils = require('./utils');

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

// Emitter for outside packages to subscribe to. Subscription functions
// are exponsed in ./advanced-open-file
var emitter = new _eventKit.Emitter();

exports.emitter = emitter;

var AdvancedOpenFileController = (function () {
    function AdvancedOpenFileController() {
        var _context;

        _classCallCheck(this, AdvancedOpenFileController);

        this.view = new _view2['default']();
        this.panel = null;

        this.currentPath = null;
        this.pathHistory = [];
        this.disposables = new _atom.CompositeDisposable();

        this.disposables.add(atom.commands.add('atom-workspace', {
            'advanced-open-file:toggle': this.toggle.bind(this)
        }));
        this.disposables.add(atom.commands.add('.advanced-open-file', {
            'core:confirm': this.confirm.bind(this),
            'core:cancel': this.detach.bind(this),
            'application:add-project-folder': this.addSelectedProjectFolder.bind(this),
            'advanced-open-file:autocomplete': this.autocomplete.bind(this),
            'advanced-open-file:undo': this.undo.bind(this),
            'advanced-open-file:move-cursor-down': (_context = this.view).moveCursorDown.bind(_context),
            'advanced-open-file:move-cursor-up': (_context = this.view).moveCursorUp.bind(_context),
            'advanced-open-file:confirm-selected-or-first': this.confirmSelectedOrFirst.bind(this),
            'advanced-open-file:delete-path-component': this.deletePathComponent.bind(this),

            'pane:split-left': this.splitConfirm(function (pane) {
                return pane.splitLeft();
            }),
            'pane:split-right': this.splitConfirm(function (pane) {
                return pane.splitRight();
            }),
            'pane:split-up': this.splitConfirm(function (pane) {
                return pane.splitUp();
            }),
            'pane:split-down': this.splitConfirm(function (pane) {
                return pane.splitDown();
            })
        }));

        this.view.onDidClickPath(this.clickPath.bind(this));
        this.view.onDidClickAddProjectFolder(this.addProjectFolder.bind(this));
        this.view.onDidClickOutside(this.detach.bind(this));
        this.view.onDidPathChange(this.pathChange.bind(this));
    }

    _createClass(AdvancedOpenFileController, [{
        key: 'destroy',
        value: function destroy() {
            this.disposables.dispose();
        }
    }, {
        key: 'clickPath',
        value: function clickPath(clickedPath) {
            this.selectPath(clickedPath);
        }
    }, {
        key: 'pathChange',
        value: function pathChange(newPath) {
            this.currentPath = newPath;

            var replace = false;

            // Since the user typed this, apply fast-dir-switch
            // shortcuts.
            if (config.get('helmDirSwitch')) {
                if (newPath.hasShortcut('')) {
                    // Empty shortcut == '//'
                    newPath = newPath.root();
                    replace = true;
                } else if (newPath.hasShortcut('~')) {
                    newPath = new _models.Path(_osenv2['default'].home() + _path2['default'].sep);
                    replace = true;
                } else if (newPath.hasShortcut(':')) {
                    var projectPath = (0, _utils.getProjectPath)();
                    if (projectPath) {
                        newPath = new _models.Path(projectPath + newPath.sep);
                        replace = true;
                    }
                }
            }

            // If we're replacing the path, save it in the history and set the path.
            // If we aren't, the user is just typing and we don't need the history
            // and want to avoid setting the path which resets the cursor.
            if (replace) {
                this.updatePath(newPath);
            }
        }
    }, {
        key: 'selectPath',
        value: function selectPath(newPath) {
            var split = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (_fileService2['default'].isDirectory(newPath)) {
                if (split !== false) {
                    atom.beep();
                } else {
                    this.updatePath(newPath.asDirectory());
                }
            } else if (split !== false) {
                this.splitOpenPath(newPath, split);
            } else {
                this.openPath(newPath);
            }
        }
    }, {
        key: 'updatePath',
        value: function updatePath(newPath) {
            var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var _ref$saveHistory = _ref.saveHistory;
            var saveHistory = _ref$saveHistory === undefined ? true : _ref$saveHistory;

            if (saveHistory) {
                this.pathHistory.push(this.currentPath);
            }

            this.currentPath = newPath;
            this.view.setPath(newPath);
        }
    }, {
        key: 'splitOpenPath',
        value: function splitOpenPath(path, split) {
            split(atom.workspace.getActivePane());
            this.openPath(path);
        }
    }, {
        key: 'openPath',
        value: function openPath(path) {
            if (_fileService2['default'].exists(path)) {
                if (_fileService2['default'].isFile(path)) {
                    atom.workspace.open(path.absolute);
                    emitter.emit('did-open-path', path.absolute);
                    this.detach();
                } else {
                    atom.beep();
                }
            } else if (path.fragment) {
                try {
                    _fileService2['default'].createDirectories(path);
                    if (config.get('createFileInstantly')) {
                        _fileService2['default'].createFile(path);
                        emitter.emit('did-create-path', path.absolute);
                    }
                    atom.workspace.open(path.absolute);
                    emitter.emit('did-open-path', path.absolute);
                } catch (err) {
                    atom.notifications.addError('Could not open file', {
                        detail: err,
                        icon: 'alert'
                    });
                } finally {
                    this.detach();
                }
            } else if (config.get('createDirectories')) {
                try {
                    _fileService2['default'].createDirectories(path);
                    atom.notifications.addSuccess('Directory created', {
                        detail: 'Created directory "' + path.full + '".',
                        icon: 'file-directory'
                    });
                    emitter.emit('did-create-path', path.absolute);
                    this.detach();
                } catch (err) {
                    atom.notifications.addError('Could not create directory', {
                        detail: err,
                        icon: 'file-directory'
                    });
                } finally {
                    this.detach();
                }
            } else {
                atom.beep();
            }
        }
    }, {
        key: 'deletePathComponent',
        value: function deletePathComponent() {
            if (this.currentPath.isRoot()) {
                atom.beep();
            } else {
                this.updatePath(this.currentPath.parent());
            }
        }
    }, {
        key: 'addProjectFolder',
        value: function addProjectFolder(folderPath) {
            if (_fileService2['default'].isDirectory(folderPath) && !folderPath.isProjectDirectory()) {
                atom.project.addPath(folderPath.absolute);
                atom.notifications.addSuccess('Added project folder', {
                    detail: 'Added "' + folderPath.full + '" as a project folder.',
                    icon: 'file-directory'
                });
            } else {
                atom.beep();
            }
        }
    }, {
        key: 'addSelectedProjectFolder',
        value: function addSelectedProjectFolder(event) {
            event.stopPropagation();

            var selectedPath = this.view.selectedPath;
            if (selectedPath !== null && !selectedPath.equals(this.currentPath.parent())) {
                this.addProjectFolder(selectedPath);
            } else {
                atom.beep();
            }
        }

        /**
         * Autocomplete the current input to the longest common prefix among
         * paths matching the current input. If no change is made to the
         * current path, beep.
         */
    }, {
        key: 'autocomplete',
        value: function autocomplete() {
            var matchingPaths = _fileService2['default'].getMatchingPaths(this.currentPath);
            if (matchingPaths.length === 0) {
                atom.beep();
            } else if (matchingPaths.length === 1 || config.get('fuzzyMatch')) {
                var newPath = matchingPaths[0];
                if (_fileService2['default'].isDirectory(newPath)) {
                    this.updatePath(newPath.asDirectory());
                } else {
                    this.updatePath(newPath);
                }
            } else {
                var newPath = _models.Path.commonPrefix(matchingPaths);
                if (newPath.equals(this.currentPath)) {
                    atom.beep();
                } else {
                    this.updatePath(newPath);
                }
            }
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (this.panel) {
                this.detach();
            } else {
                this.attach();
            }
        }
    }, {
        key: 'splitConfirm',
        value: function splitConfirm(split) {
            return this.confirm.bind(this, undefined, split);
        }
    }, {
        key: 'confirm',
        value: function confirm(event) {
            var split = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var selectedPath = this.view.selectedPath;
            if (selectedPath !== null) {
                this.selectPath(selectedPath, split);
            } else {
                this.selectPath(this.currentPath, split);
            }
        }
    }, {
        key: 'confirmSelectedOrFirst',
        value: function confirmSelectedOrFirst() {
            var selectedPath = this.view.selectedPath;
            if (selectedPath !== null) {
                this.selectPath(selectedPath);
            } else {
                var firstPath = this.view.firstPath;
                if (firstPath !== null) {
                    this.selectPath(firstPath);
                } else {
                    this.selectPath(this.currentPath);
                }
            }
        }
    }, {
        key: 'undo',
        value: function undo() {
            if (this.pathHistory.length > 0) {
                this.updatePath(this.pathHistory.pop(), { saveHistory: false });
            } else {
                var initialPath = _models.Path.initial();
                if (!this.currentPath.equals(initialPath)) {
                    this.updatePath(initialPath, { saveHistory: false });
                } else {
                    atom.beep();
                }
            }
        }
    }, {
        key: 'detach',
        value: function detach() {
            if (this.panel === null) {
                return;
            }

            this.panel.destroy();
            this.panel = null;
            atom.workspace.getActivePane().activate();
        }
    }, {
        key: 'attach',
        value: function attach() {
            if (this.panel !== null) {
                return;
            }

            var initialPath = _models.Path.initial();
            this.pathHistory = [];
            this.currentPath = initialPath;
            this.updatePath(_models.Path.initial(), { saveHistory: false });
            this.panel = this.view.createModalPanel();
            _fileService2['default'].clearCache();
        }
    }]);

    return AdvancedOpenFileController;
})();

exports.AdvancedOpenFileController = AdvancedOpenFileController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUNvQixNQUFNOzs7O29CQUVRLE1BQU07O3dCQUVsQixXQUFXOztxQkFDZixPQUFPOzs7O3NCQUVELFVBQVU7O0lBQXRCLE1BQU07OzJCQUNNLGdCQUFnQjs7OztzQkFDckIsVUFBVTs7cUJBQ0EsU0FBUzs7b0JBQ0wsUUFBUTs7Ozs7O0FBS2xDLElBQUksT0FBTyxHQUFHLHVCQUFhLENBQUM7Ozs7SUFHdEIsMEJBQTBCO0FBQ3hCLGFBREYsMEJBQTBCLEdBQ3JCOzs7OEJBREwsMEJBQTBCOztBQUUvQixZQUFJLENBQUMsSUFBSSxHQUFHLHVCQUEwQixDQUFDO0FBQ3ZDLFlBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDOztBQUVsQixZQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixZQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixZQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDOztBQUU3QyxZQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyRCx1Q0FBMkIsRUFBSSxJQUFJLENBQUMsTUFBTSxNQUFYLElBQUksQ0FBTztTQUM3QyxDQUFDLENBQUMsQ0FBQztBQUNKLFlBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFO0FBQzFELDBCQUFjLEVBQUksSUFBSSxDQUFDLE9BQU8sTUFBWixJQUFJLENBQVE7QUFDOUIseUJBQWEsRUFBSSxJQUFJLENBQUMsTUFBTSxNQUFYLElBQUksQ0FBTztBQUM1Qiw0Q0FBZ0MsRUFBSSxJQUFJLENBQUMsd0JBQXdCLE1BQTdCLElB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QyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztBQUN0RCxnQkFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDMUMscUNBQVksVUFBVSxFQUFFLENBQUM7U0FDNUI7OztXQXBSUSwwQkFBMEIiLCJmaWxlIjoiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvbGliL2NvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5pbXBvcnQgc3RkUGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IG9zZW52IGZyb20gJ29zZW52JztcblxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBmaWxlU2VydmljZSBmcm9tICcuL2ZpbGUtc2VydmljZSc7XG5pbXBvcnQge1BhdGh9IGZyb20gJy4vbW9kZWxzJztcbmltcG9ydCB7Z2V0UHJvamVjdFBhdGh9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEFkdmFuY2VkT3BlbkZpbGVWaWV3IGZyb20gJy4vdmlldyc7XG5cblxuLy8gRW1pdHRlciBmb3Igb3V0c2lkZSBwYWNrYWdlcyB0byBzdWJzY3JpYmUgdG8uIFN1YnNjcmlwdGlvbiBmdW5jdGlvbnNcbi8vIGFyZSBleHBvbnNlZCBpbiAuL2FkdmFuY2VkLW9wZW4tZmlsZVxuZXhwb3J0IGxldCBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuXG5leHBvcnQgY2xhc3MgQWR2YW5jZWRPcGVuRmlsZUNvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgQWR2YW5jZWRPcGVuRmlsZVZpZXcoKTtcbiAgICAgICAgdGhpcy5wYW5lbCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IG51bGw7XG4gICAgICAgIHRoaXMucGF0aEhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTp0b2dnbGUnOiA6OnRoaXMudG9nZ2xlXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJy5hZHZhbmNlZC1vcGVuLWZpbGUnLCB7XG4gICAgICAgICAgICAnY29yZTpjb25maXJtJzogOjp0aGlzLmNvbmZpcm0sXG4gICAgICAgICAgICAnY29yZTpjYW5jZWwnOiA6OnRoaXMuZGV0YWNoLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcic6IDo6dGhpcy5hZGRTZWxlY3RlZFByb2plY3RGb2xkZXIsXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZSc6IDo6dGhpcy5hdXRvY29tcGxldGUsXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOnVuZG8nOiA6OnRoaXMudW5kbyxcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6bW92ZS1jdXJzb3ItZG93bic6IDo6dGhpcy52aWV3Lm1vdmVDdXJzb3JEb3duLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTptb3ZlLWN1cnNvci11cCc6IDo6dGhpcy52aWV3Lm1vdmVDdXJzb3JVcCxcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6Y29uZmlybS1zZWxlY3RlZC1vci1maXJzdCc6IDo6dGhpcy5jb25maXJtU2VsZWN0ZWRPckZpcnN0LFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTpkZWxldGUtcGF0aC1jb21wb25lbnQnOiA6OnRoaXMuZGVsZXRlUGF0aENvbXBvbmVudCxcblxuICAgICAgICAgICAgJ3BhbmU6c3BsaXQtbGVmdCc6IHRoaXMuc3BsaXRDb25maXJtKChwYW5lKSA9PiBwYW5lLnNwbGl0TGVmdCgpKSxcbiAgICAgICAgICAgICdwYW5lOnNwbGl0LXJpZ2h0JzogdGhpcy5zcGxpdENvbmZpcm0oKHBhbmUpID0+IHBhbmUuc3BsaXRSaWdodCgpKSxcbiAgICAgICAgICAgICdwYW5lOnNwbGl0LXVwJzogdGhpcy5zcGxpdENvbmZpcm0oKHBhbmUpID0+IHBhbmUuc3BsaXRVcCgpKSxcbiAgICAgICAgICAgICdwYW5lOnNwbGl0LWRvd24nOiB0aGlzLnNwbGl0Q29uZmlybSgocGFuZSkgPT4gcGFuZS5zcGxpdERvd24oKSksXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnZpZXcub25EaWRDbGlja1BhdGgoOjp0aGlzLmNsaWNrUGF0aCk7XG4gICAgICAgIHRoaXMudmlldy5vbkRpZENsaWNrQWRkUHJvamVjdEZvbGRlcig6OnRoaXMuYWRkUHJvamVjdEZvbGRlcik7XG4gICAgICAgIHRoaXMudmlldy5vbkRpZENsaWNrT3V0c2lkZSg6OnRoaXMuZGV0YWNoKTtcbiAgICAgICAgdGhpcy52aWV3Lm9uRGlkUGF0aENoYW5nZSg6OnRoaXMucGF0aENoYW5nZSk7XG4gICAgfVxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgY2xpY2tQYXRoKGNsaWNrZWRQYXRoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0UGF0aChjbGlja2VkUGF0aCk7XG4gICAgfVxuXG4gICAgcGF0aENoYW5nZShuZXdQYXRoKSAge1xuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gbmV3UGF0aDtcblxuICAgICAgICBsZXQgcmVwbGFjZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSB1c2VyIHR5cGVkIHRoaXMsIGFwcGx5IGZhc3QtZGlyLXN3aXRjaFxuICAgICAgICAvLyBzaG9ydGN1dHMuXG4gICAgICAgIGlmIChjb25maWcuZ2V0KCdoZWxtRGlyU3dpdGNoJykpIHtcbiAgICAgICAgICAgIGlmIChuZXdQYXRoLmhhc1Nob3J0Y3V0KCcnKSkgeyAgLy8gRW1wdHkgc2hvcnRjdXQgPT0gJy8vJ1xuICAgICAgICAgICAgICAgIG5ld1BhdGggPSBuZXdQYXRoLnJvb3QoKTtcbiAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3UGF0aC5oYXNTaG9ydGN1dCgnficpKSB7XG4gICAgICAgICAgICAgICAgbmV3UGF0aCA9IG5ldyBQYXRoKG9zZW52LmhvbWUoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3UGF0aC5oYXNTaG9ydGN1dCgnOicpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHByb2plY3RQYXRoID0gZ2V0UHJvamVjdFBhdGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UGF0aCA9IG5ldyBQYXRoKHByb2plY3RQYXRoICsgbmV3UGF0aC5zZXApO1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSdyZSByZXBsYWNpbmcgdGhlIHBhdGgsIHNhdmUgaXQgaW4gdGhlIGhpc3RvcnkgYW5kIHNldCB0aGUgcGF0aC5cbiAgICAgICAgLy8gSWYgd2UgYXJlbid0LCB0aGUgdXNlciBpcyBqdXN0IHR5cGluZyBhbmQgd2UgZG9uJ3QgbmVlZCB0aGUgaGlzdG9yeVxuICAgICAgICAvLyBhbmQgd2FudCB0byBhdm9pZCBzZXR0aW5nIHRoZSBwYXRoIHdoaWNoIHJlc2V0cyB0aGUgY3Vyc29yLlxuICAgICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0UGF0aChuZXdQYXRoLCBzcGxpdD1mYWxzZSkge1xuICAgICAgICBpZiAoZmlsZVNlcnZpY2UuaXNEaXJlY3RvcnkobmV3UGF0aCkpIHtcbiAgICAgICAgICAgIGlmIChzcGxpdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGguYXNEaXJlY3RvcnkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc3BsaXQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLnNwbGl0T3BlblBhdGgobmV3UGF0aCwgc3BsaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcGVuUGF0aChuZXdQYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBhdGgobmV3UGF0aCwge3NhdmVIaXN0b3J5PXRydWV9PXt9KSB7XG4gICAgICAgIGlmIChzYXZlSGlzdG9yeSkge1xuICAgICAgICAgICAgdGhpcy5wYXRoSGlzdG9yeS5wdXNoKHRoaXMuY3VycmVudFBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IG5ld1BhdGg7XG4gICAgICAgIHRoaXMudmlldy5zZXRQYXRoKG5ld1BhdGgpO1xuICAgIH1cblxuICAgIHNwbGl0T3BlblBhdGgocGF0aCwgc3BsaXQpIHtcbiAgICAgICAgc3BsaXQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKTtcbiAgICAgICAgdGhpcy5vcGVuUGF0aChwYXRoKTtcbiAgICB9XG5cbiAgICBvcGVuUGF0aChwYXRoKSB7XG4gICAgICAgIGlmIChmaWxlU2VydmljZS5leGlzdHMocGF0aCkpIHtcbiAgICAgICAgICAgIGlmIChmaWxlU2VydmljZS5pc0ZpbGUocGF0aCkpIHtcbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4tcGF0aCcsIHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBhdGguZnJhZ21lbnQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZmlsZVNlcnZpY2UuY3JlYXRlRGlyZWN0b3JpZXMocGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5nZXQoJ2NyZWF0ZUZpbGVJbnN0YW50bHknKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxlU2VydmljZS5jcmVhdGVGaWxlKHBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoJ2RpZC1jcmVhdGUtcGF0aCcsIHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4tcGF0aCcsIHBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb3VsZCBub3Qgb3BlbiBmaWxlJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ2FsZXJ0JyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjb25maWcuZ2V0KCdjcmVhdGVEaXJlY3RvcmllcycpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZpbGVTZXJ2aWNlLmNyZWF0ZURpcmVjdG9yaWVzKHBhdGgpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdEaXJlY3RvcnkgY3JlYXRlZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBgQ3JlYXRlZCBkaXJlY3RvcnkgXCIke3BhdGguZnVsbH1cIi5gLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCgnZGlkLWNyZWF0ZS1wYXRoJywgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IGNyZWF0ZSBkaXJlY3RvcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIGRldGFpbDogZXJyLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkZWxldGVQYXRoQ29tcG9uZW50KCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50UGF0aC5pc1Jvb3QoKSkge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgodGhpcy5jdXJyZW50UGF0aC5wYXJlbnQoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRQcm9qZWN0Rm9sZGVyKGZvbGRlclBhdGgpIHtcbiAgICAgICAgaWYgKGZpbGVTZXJ2aWNlLmlzRGlyZWN0b3J5KGZvbGRlclBhdGgpICYmICFmb2xkZXJQYXRoLmlzUHJvamVjdERpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3QuYWRkUGF0aChmb2xkZXJQYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdBZGRlZCBwcm9qZWN0IGZvbGRlcicsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGBBZGRlZCBcIiR7Zm9sZGVyUGF0aC5mdWxsfVwiIGFzIGEgcHJvamVjdCBmb2xkZXIuYCxcbiAgICAgICAgICAgICAgICBpY29uOiAnZmlsZS1kaXJlY3RvcnknLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFNlbGVjdGVkUHJvamVjdEZvbGRlcihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBsZXQgc2VsZWN0ZWRQYXRoID0gdGhpcy52aWV3LnNlbGVjdGVkUGF0aDtcbiAgICAgICAgaWYgKHNlbGVjdGVkUGF0aCAhPT0gbnVsbCAmJiAhc2VsZWN0ZWRQYXRoLmVxdWFscyh0aGlzLmN1cnJlbnRQYXRoLnBhcmVudCgpKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRQcm9qZWN0Rm9sZGVyKHNlbGVjdGVkUGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF1dG9jb21wbGV0ZSB0aGUgY3VycmVudCBpbnB1dCB0byB0aGUgbG9uZ2VzdCBjb21tb24gcHJlZml4IGFtb25nXG4gICAgICogcGF0aHMgbWF0Y2hpbmcgdGhlIGN1cnJlbnQgaW5wdXQuIElmIG5vIGNoYW5nZSBpcyBtYWRlIHRvIHRoZVxuICAgICAqIGN1cnJlbnQgcGF0aCwgYmVlcC5cbiAgICAgKi9cbiAgICBhdXRvY29tcGxldGUoKSB7XG4gICAgICAgIGxldCBtYXRjaGluZ1BhdGhzID0gZmlsZVNlcnZpY2UuZ2V0TWF0Y2hpbmdQYXRocyh0aGlzLmN1cnJlbnRQYXRoKTtcbiAgICAgICAgaWYgKG1hdGNoaW5nUGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaGluZ1BhdGhzLmxlbmd0aCA9PT0gMSB8fCBjb25maWcuZ2V0KCdmdXp6eU1hdGNoJykpIHtcbiAgICAgICAgICAgIGxldCBuZXdQYXRoID0gbWF0Y2hpbmdQYXRoc1swXTtcbiAgICAgICAgICAgIGlmIChmaWxlU2VydmljZS5pc0RpcmVjdG9yeShuZXdQYXRoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aChuZXdQYXRoLmFzRGlyZWN0b3J5KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgobmV3UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgbmV3UGF0aCA9IFBhdGguY29tbW9uUHJlZml4KG1hdGNoaW5nUGF0aHMpO1xuICAgICAgICAgICAgaWYgKG5ld1BhdGguZXF1YWxzKHRoaXMuY3VycmVudFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aChuZXdQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWwpIHtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3BsaXRDb25maXJtKHNwbGl0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpcm0uYmluZCh0aGlzLCB1bmRlZmluZWQsIHNwbGl0KTtcbiAgICB9XG5cbiAgICBjb25maXJtKGV2ZW50LCBzcGxpdD1mYWxzZSkge1xuICAgICAgICBsZXQgc2VsZWN0ZWRQYXRoID0gdGhpcy52aWV3LnNlbGVjdGVkUGF0aDtcbiAgICAgICAgaWYgKHNlbGVjdGVkUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKHNlbGVjdGVkUGF0aCwgc3BsaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKHRoaXMuY3VycmVudFBhdGgsIHNwbGl0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbmZpcm1TZWxlY3RlZE9yRmlyc3QoKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZFBhdGggPSB0aGlzLnZpZXcuc2VsZWN0ZWRQYXRoO1xuICAgICAgICBpZiAoc2VsZWN0ZWRQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdFBhdGgoc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaXJzdFBhdGggPSB0aGlzLnZpZXcuZmlyc3RQYXRoO1xuICAgICAgICAgICAgaWYgKGZpcnN0UGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0UGF0aChmaXJzdFBhdGgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhdGgodGhpcy5jdXJyZW50UGF0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVuZG8oKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdGhIaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aCh0aGlzLnBhdGhIaXN0b3J5LnBvcCgpLCB7c2F2ZUhpc3Rvcnk6IGZhbHNlfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgaW5pdGlhbFBhdGggPSBQYXRoLmluaXRpYWwoKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5jdXJyZW50UGF0aC5lcXVhbHMoaW5pdGlhbFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKGluaXRpYWxQYXRoLCB7c2F2ZUhpc3Rvcnk6IGZhbHNlfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWNoKCkge1xuICAgICAgICBpZiAodGhpcy5wYW5lbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgICB9XG5cbiAgICBhdHRhY2goKSB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5pdGlhbFBhdGggPSBQYXRoLmluaXRpYWwoKTtcbiAgICAgICAgdGhpcy5wYXRoSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gaW5pdGlhbFBhdGg7XG4gICAgICAgIHRoaXMudXBkYXRlUGF0aChQYXRoLmluaXRpYWwoKSwge3NhdmVIaXN0b3J5OiBmYWxzZX0pO1xuICAgICAgICB0aGlzLnBhbmVsID0gdGhpcy52aWV3LmNyZWF0ZU1vZGFsUGFuZWwoKTtcbiAgICAgICAgZmlsZVNlcnZpY2UuY2xlYXJDYWNoZSgpO1xuICAgIH1cbn1cbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/controller.js
