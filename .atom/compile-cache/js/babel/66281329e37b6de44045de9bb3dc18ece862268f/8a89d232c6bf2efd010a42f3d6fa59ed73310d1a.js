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
            'advanced-open-file:move-cursor-down': this.moveCursorDown.bind(this),
            'advanced-open-file:move-cursor-up': this.moveCursorUp.bind(this),
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

        this.view.onDidClickFile(this.clickFile.bind(this));
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
        key: 'clickFile',
        value: function clickFile(fileName) {
            this.selectPath(new _models.Path(fileName));
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

            if (newPath.isDirectory()) {
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
            if (path.exists()) {
                if (path.isFile()) {
                    atom.workspace.open(path.absolute);
                    emitter.emit('did-open-path', path.absolute);
                    this.detach();
                } else {
                    atom.beep();
                }
            } else if (path.fragment) {
                try {
                    path.createDirectories();
                    if (config.get('createFileInstantly')) {
                        path.createFile();
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
                    path.createDirectories();
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
        value: function addProjectFolder(fileName) {
            var folderPath = new _models.Path(fileName);
            if (folderPath.isDirectory() && !folderPath.isProjectDirectory()) {
                atom.project.addPath(folderPath.absolute);
                atom.notifications.addSuccess('Added project folder', {
                    detail: 'Added "' + folderPath.full + '" as a project folder.',
                    icon: 'file-directory'
                });
                this.view.refreshPathListItem(folderPath);
            } else {
                atom.beep();
            }
        }
    }, {
        key: 'addSelectedProjectFolder',
        value: function addSelectedProjectFolder(event) {
            event.stopPropagation();

            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null && !selectedPath.equals(this.currentPath.parent())) {
                this.addProjectFolder(selectedPath.full);
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
            var matchingPaths = this.currentPath.matchingPaths();
            if (matchingPaths.length === 0) {
                atom.beep();
            } else if (matchingPaths.length === 1 || config.get('fuzzyMatch')) {
                var newPath = matchingPaths[0];
                if (newPath.isDirectory()) {
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

            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null) {
                this.selectPath(selectedPath, split);
            } else {
                this.selectPath(this.currentPath, split);
            }
        }
    }, {
        key: 'confirmSelectedOrFirst',
        value: function confirmSelectedOrFirst() {
            var selectedPath = this.view.selectedPath();
            if (selectedPath !== null) {
                this.selectPath(selectedPath);
            } else {
                var firstPath = this.view.firstPath();
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
        key: 'moveCursorDown',
        value: function moveCursorDown() {
            var index = this.view.cursorIndex;
            if (index === null || index === this.view.pathListLength() - 1) {
                index = 0;
            } else {
                index++;
            }

            this.view.setCursorIndex(index);
        }
    }, {
        key: 'moveCursorUp',
        value: function moveCursorUp() {
            var index = this.view.cursorIndex;
            if (index === null || index === 0) {
                index = this.view.pathListLength() - 1;
            } else {
                index--;
            }

            this.view.setCursorIndex(index);
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
        }
    }]);

    return AdvancedOpenFileController;
})();

exports.AdvancedOpenFileController = AdvancedOpenFileController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUVvQixNQUFNOzs7O29CQUVRLE1BQU07O3dCQUVsQixXQUFXOztxQkFDZixPQUFPOzs7O3NCQUVELFVBQVU7O0lBQXRCLE1BQU07O3NCQUNDLFVBQVU7O3FCQUNBLFNBQVM7O29CQUNMLFFBQVE7Ozs7OztBQUtsQyxJQUFJLE9BQU8sR0FBRyx1QkFBYSxDQUFDOzs7O0lBR3RCLDBCQUEwQjtBQUN4QixhQURGLDBCQUEwQixHQUNyQjs4QkFETCwwQkFBMEI7O0FBRS9CLFlBQUksQ0FBQyxJQUFJLEdBQUcsdUJBQTBCLENBQUM7QUFDdkMsWUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7O0FBRWxCLFlBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxXQUFXLEdBQUcsK0JBQXlCLENBQUM7O0FBRTdDLFlBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3JELHVDQUEyQixFQUFJLElBQUksQ0FBQyxNQUFNLE1BQVgsSUFBSSxDQUFPO1NBQzdDLENBQUMsQ0FBQyxDQUFDO0FBQ0osWUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUU7QUFDMUQsMEJBQWMsRUFBSSxJQUFJLENBQUMsT0FBTyxNQUFaLElBQUksQ0FBUTtBQUM5Qix5QkFBYSxFQUFJLElBQUksQ0FBQyxNQUFNLE1BQVgsSUFBSSxDQUFPO0FBQzVCLDRDQUFnQyxFQUFJLElBQUksQ0FBQyx3QkFBd0IsTUFBN0IsSUFBSSxDQUF5QjtBQUNqRSw2Q0FB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cUJBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUMxQyxNQUFNO0FBQ0gscUJBQUssRUFBRSxDQUFDO2FBQ1g7O0FBRUQsZ0JBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25DOzs7ZUFFSyxrQkFBRztBQUNMLGdCQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JCLHVCQUFPO2FBQ1Y7O0FBRUQsZ0JBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLGdCQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzdDOzs7ZUFFSyxrQkFBRztBQUNMLGdCQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO0FBQ3JCLHVCQUFPO2FBQ1Y7O0FBRUQsZ0JBQUksV0FBVyxHQUFHLGFBQUssT0FBTyxFQUFFLENBQUM7QUFDakMsZ0JBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixnQkFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFLLE9BQU8sRUFBRSxFQUFFLEVBQUMsV0FBVyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDdEQsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzdDOzs7V0EzU1EsMEJBQTBCIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi9jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQgc3RkUGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IG9zZW52IGZyb20gJ29zZW52JztcblxuaW1wb3J0ICogYXMgY29uZmlnIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UGF0aH0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHtnZXRQcm9qZWN0UGF0aH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgQWR2YW5jZWRPcGVuRmlsZVZpZXcgZnJvbSAnLi92aWV3JztcblxuXG4vLyBFbWl0dGVyIGZvciBvdXRzaWRlIHBhY2thZ2VzIHRvIHN1YnNjcmliZSB0by4gU3Vic2NyaXB0aW9uIGZ1bmN0aW9uc1xuLy8gYXJlIGV4cG9uc2VkIGluIC4vYWR2YW5jZWQtb3Blbi1maWxlXG5leHBvcnQgbGV0IGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG5cbmV4cG9ydCBjbGFzcyBBZHZhbmNlZE9wZW5GaWxlQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBBZHZhbmNlZE9wZW5GaWxlVmlldygpO1xuICAgICAgICB0aGlzLnBhbmVsID0gbnVsbDtcblxuICAgICAgICB0aGlzLmN1cnJlbnRQYXRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoSGlzdG9yeSA9IFtdO1xuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOnRvZ2dsZSc6IDo6dGhpcy50b2dnbGVcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnLmFkdmFuY2VkLW9wZW4tZmlsZScsIHtcbiAgICAgICAgICAgICdjb3JlOmNvbmZpcm0nOiA6OnRoaXMuY29uZmlybSxcbiAgICAgICAgICAgICdjb3JlOmNhbmNlbCc6IDo6dGhpcy5kZXRhY2gsXG4gICAgICAgICAgICAnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJzogOjp0aGlzLmFkZFNlbGVjdGVkUHJvamVjdEZvbGRlcixcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJzogOjp0aGlzLmF1dG9jb21wbGV0ZSxcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6dW5kbyc6IDo6dGhpcy51bmRvLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTptb3ZlLWN1cnNvci1kb3duJzogOjp0aGlzLm1vdmVDdXJzb3JEb3duLFxuICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZTptb3ZlLWN1cnNvci11cCc6IDo6dGhpcy5tb3ZlQ3Vyc29yVXAsXG4gICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlOmNvbmZpcm0tc2VsZWN0ZWQtb3ItZmlyc3QnOiA6OnRoaXMuY29uZmlybVNlbGVjdGVkT3JGaXJzdCxcbiAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGU6ZGVsZXRlLXBhdGgtY29tcG9uZW50JzogOjp0aGlzLmRlbGV0ZVBhdGhDb21wb25lbnQsXG5cbiAgICAgICAgICAgICdwYW5lOnNwbGl0LWxlZnQnOiB0aGlzLnNwbGl0Q29uZmlybSgocGFuZSkgPT4gcGFuZS5zcGxpdExlZnQoKSksXG4gICAgICAgICAgICAncGFuZTpzcGxpdC1yaWdodCc6IHRoaXMuc3BsaXRDb25maXJtKChwYW5lKSA9PiBwYW5lLnNwbGl0UmlnaHQoKSksXG4gICAgICAgICAgICAncGFuZTpzcGxpdC11cCc6IHRoaXMuc3BsaXRDb25maXJtKChwYW5lKSA9PiBwYW5lLnNwbGl0VXAoKSksXG4gICAgICAgICAgICAncGFuZTpzcGxpdC1kb3duJzogdGhpcy5zcGxpdENvbmZpcm0oKHBhbmUpID0+IHBhbmUuc3BsaXREb3duKCkpLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy52aWV3Lm9uRGlkQ2xpY2tGaWxlKDo6dGhpcy5jbGlja0ZpbGUpO1xuICAgICAgICB0aGlzLnZpZXcub25EaWRDbGlja0FkZFByb2plY3RGb2xkZXIoOjp0aGlzLmFkZFByb2plY3RGb2xkZXIpO1xuICAgICAgICB0aGlzLnZpZXcub25EaWRDbGlja091dHNpZGUoOjp0aGlzLmRldGFjaCk7XG4gICAgICAgIHRoaXMudmlldy5vbkRpZFBhdGhDaGFuZ2UoOjp0aGlzLnBhdGhDaGFuZ2UpO1xuICAgIH1cblxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGNsaWNrRmlsZShmaWxlTmFtZSkge1xuICAgICAgICB0aGlzLnNlbGVjdFBhdGgobmV3IFBhdGgoZmlsZU5hbWUpKTtcbiAgICB9XG5cbiAgICBwYXRoQ2hhbmdlKG5ld1BhdGgpICB7XG4gICAgICAgIHRoaXMuY3VycmVudFBhdGggPSBuZXdQYXRoO1xuXG4gICAgICAgIGxldCByZXBsYWNlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gU2luY2UgdGhlIHVzZXIgdHlwZWQgdGhpcywgYXBwbHkgZmFzdC1kaXItc3dpdGNoXG4gICAgICAgIC8vIHNob3J0Y3V0cy5cbiAgICAgICAgaWYgKGNvbmZpZy5nZXQoJ2hlbG1EaXJTd2l0Y2gnKSkge1xuICAgICAgICAgICAgaWYgKG5ld1BhdGguaGFzU2hvcnRjdXQoJycpKSB7ICAvLyBFbXB0eSBzaG9ydGN1dCA9PSAnLy8nXG4gICAgICAgICAgICAgICAgbmV3UGF0aCA9IG5ld1BhdGgucm9vdCgpO1xuICAgICAgICAgICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdQYXRoLmhhc1Nob3J0Y3V0KCd+JykpIHtcbiAgICAgICAgICAgICAgICBuZXdQYXRoID0gbmV3IFBhdGgob3NlbnYuaG9tZSgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuZXdQYXRoLmhhc1Nob3J0Y3V0KCc6JykpIHtcbiAgICAgICAgICAgICAgICBsZXQgcHJvamVjdFBhdGggPSBnZXRQcm9qZWN0UGF0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0UGF0aCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQYXRoID0gbmV3IFBhdGgocHJvamVjdFBhdGggKyBuZXdQYXRoLnNlcCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlJ3JlIHJlcGxhY2luZyB0aGUgcGF0aCwgc2F2ZSBpdCBpbiB0aGUgaGlzdG9yeSBhbmQgc2V0IHRoZSBwYXRoLlxuICAgICAgICAvLyBJZiB3ZSBhcmVuJ3QsIHRoZSB1c2VyIGlzIGp1c3QgdHlwaW5nIGFuZCB3ZSBkb24ndCBuZWVkIHRoZSBoaXN0b3J5XG4gICAgICAgIC8vIGFuZCB3YW50IHRvIGF2b2lkIHNldHRpbmcgdGhlIHBhdGggd2hpY2ggcmVzZXRzIHRoZSBjdXJzb3IuXG4gICAgICAgIGlmIChyZXBsYWNlKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgobmV3UGF0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RQYXRoKG5ld1BhdGgsIHNwbGl0PWZhbHNlKSB7XG4gICAgICAgIGlmIChuZXdQYXRoLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIGlmIChzcGxpdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGguYXNEaXJlY3RvcnkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc3BsaXQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLnNwbGl0T3BlblBhdGgobmV3UGF0aCwgc3BsaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vcGVuUGF0aChuZXdQYXRoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVBhdGgobmV3UGF0aCwge3NhdmVIaXN0b3J5PXRydWV9PXt9KSB7XG4gICAgICAgIGlmIChzYXZlSGlzdG9yeSkge1xuICAgICAgICAgICAgdGhpcy5wYXRoSGlzdG9yeS5wdXNoKHRoaXMuY3VycmVudFBhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IG5ld1BhdGg7XG4gICAgICAgIHRoaXMudmlldy5zZXRQYXRoKG5ld1BhdGgpO1xuICAgIH1cblxuICAgIHNwbGl0T3BlblBhdGgocGF0aCwgc3BsaXQpIHtcbiAgICAgICAgc3BsaXQoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpKTtcbiAgICAgICAgdGhpcy5vcGVuUGF0aChwYXRoKTtcbiAgICB9XG5cbiAgICBvcGVuUGF0aChwYXRoKSB7XG4gICAgICAgIGlmIChwYXRoLmV4aXN0cygpKSB7XG4gICAgICAgICAgICBpZiAocGF0aC5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KCdkaWQtb3Blbi1wYXRoJywgcGF0aC5hYnNvbHV0ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXRhY2goKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aC5mcmFnbWVudCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXRoLmNyZWF0ZURpcmVjdG9yaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5nZXQoJ2NyZWF0ZUZpbGVJbnN0YW50bHknKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXRoLmNyZWF0ZUZpbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KCdkaWQtY3JlYXRlLXBhdGgnLCBwYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoJ2RpZC1vcGVuLXBhdGgnLCBwYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignQ291bGQgbm90IG9wZW4gZmlsZScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdhbGVydCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY29uZmlnLmdldCgnY3JlYXRlRGlyZWN0b3JpZXMnKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXRoLmNyZWF0ZURpcmVjdG9yaWVzKCk7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0RpcmVjdG9yeSBjcmVhdGVkJywge1xuICAgICAgICAgICAgICAgICAgICBkZXRhaWw6IGBDcmVhdGVkIGRpcmVjdG9yeSBcIiR7cGF0aC5mdWxsfVwiLmAsXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdmaWxlLWRpcmVjdG9yeScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KCdkaWQtY3JlYXRlLXBhdGgnLCBwYXRoLmFic29sdXRlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdDb3VsZCBub3QgY3JlYXRlIGRpcmVjdG9yeScsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICAgICAgICAgIGljb246ICdmaWxlLWRpcmVjdG9yeScsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRlbGV0ZVBhdGhDb21wb25lbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoLmlzUm9vdCgpKSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aCh0aGlzLmN1cnJlbnRQYXRoLnBhcmVudCgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZFByb2plY3RGb2xkZXIoZmlsZU5hbWUpIHtcbiAgICAgICAgbGV0IGZvbGRlclBhdGggPSBuZXcgUGF0aChmaWxlTmFtZSk7XG4gICAgICAgIGlmIChmb2xkZXJQYXRoLmlzRGlyZWN0b3J5KCkgJiYgIWZvbGRlclBhdGguaXNQcm9qZWN0RGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5hZGRQYXRoKGZvbGRlclBhdGguYWJzb2x1dGUpO1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MoJ0FkZGVkIHByb2plY3QgZm9sZGVyJywge1xuICAgICAgICAgICAgICAgIGRldGFpbDogYEFkZGVkIFwiJHtmb2xkZXJQYXRoLmZ1bGx9XCIgYXMgYSBwcm9qZWN0IGZvbGRlci5gLFxuICAgICAgICAgICAgICAgIGljb246ICdmaWxlLWRpcmVjdG9yeScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudmlldy5yZWZyZXNoUGF0aExpc3RJdGVtKGZvbGRlclBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRTZWxlY3RlZFByb2plY3RGb2xkZXIoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgbGV0IHNlbGVjdGVkUGF0aCA9IHRoaXMudmlldy5zZWxlY3RlZFBhdGgoKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkUGF0aCAhPT0gbnVsbCAmJiAhc2VsZWN0ZWRQYXRoLmVxdWFscyh0aGlzLmN1cnJlbnRQYXRoLnBhcmVudCgpKSkge1xuICAgICAgICAgICAgdGhpcy5hZGRQcm9qZWN0Rm9sZGVyKHNlbGVjdGVkUGF0aC5mdWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXV0b2NvbXBsZXRlIHRoZSBjdXJyZW50IGlucHV0IHRvIHRoZSBsb25nZXN0IGNvbW1vbiBwcmVmaXggYW1vbmdcbiAgICAgKiBwYXRocyBtYXRjaGluZyB0aGUgY3VycmVudCBpbnB1dC4gSWYgbm8gY2hhbmdlIGlzIG1hZGUgdG8gdGhlXG4gICAgICogY3VycmVudCBwYXRoLCBiZWVwLlxuICAgICAqL1xuICAgIGF1dG9jb21wbGV0ZSgpIHtcbiAgICAgICAgbGV0IG1hdGNoaW5nUGF0aHMgPSB0aGlzLmN1cnJlbnRQYXRoLm1hdGNoaW5nUGF0aHMoKTtcbiAgICAgICAgaWYgKG1hdGNoaW5nUGF0aHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaGluZ1BhdGhzLmxlbmd0aCA9PT0gMSB8fCBjb25maWcuZ2V0KCdmdXp6eU1hdGNoJykpIHtcbiAgICAgICAgICAgIGxldCBuZXdQYXRoID0gbWF0Y2hpbmdQYXRoc1swXTtcbiAgICAgICAgICAgIGlmIChuZXdQYXRoLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgobmV3UGF0aC5hc0RpcmVjdG9yeSgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQYXRoKG5ld1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG5ld1BhdGggPSBQYXRoLmNvbW1vblByZWZpeChtYXRjaGluZ1BhdGhzKTtcbiAgICAgICAgICAgIGlmIChuZXdQYXRoLmVxdWFscyh0aGlzLmN1cnJlbnRQYXRoKSkge1xuICAgICAgICAgICAgICAgIGF0b20uYmVlcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgobmV3UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b2dnbGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNwbGl0Q29uZmlybShzcGxpdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maXJtLmJpbmQodGhpcywgdW5kZWZpbmVkLCBzcGxpdCk7XG4gICAgfVxuXG4gICAgY29uZmlybShldmVudCwgc3BsaXQ9ZmFsc2UpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkUGF0aCA9IHRoaXMudmlldy5zZWxlY3RlZFBhdGgoKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKHNlbGVjdGVkUGF0aCwgc3BsaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKHRoaXMuY3VycmVudFBhdGgsIHNwbGl0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbmZpcm1TZWxlY3RlZE9yRmlyc3QoKSB7XG4gICAgICAgIGxldCBzZWxlY3RlZFBhdGggPSB0aGlzLnZpZXcuc2VsZWN0ZWRQYXRoKCk7XG4gICAgICAgIGlmIChzZWxlY3RlZFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0UGF0aChzZWxlY3RlZFBhdGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGZpcnN0UGF0aCA9IHRoaXMudmlldy5maXJzdFBhdGgoKTtcbiAgICAgICAgICAgIGlmIChmaXJzdFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdFBhdGgoZmlyc3RQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQYXRoKHRoaXMuY3VycmVudFBhdGgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1bmRvKCkge1xuICAgICAgICBpZiAodGhpcy5wYXRoSGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVBhdGgodGhpcy5wYXRoSGlzdG9yeS5wb3AoKSwge3NhdmVIaXN0b3J5OiBmYWxzZX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGluaXRpYWxQYXRoID0gUGF0aC5pbml0aWFsKCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY3VycmVudFBhdGguZXF1YWxzKGluaXRpYWxQYXRoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGF0aChpbml0aWFsUGF0aCwge3NhdmVIaXN0b3J5OiBmYWxzZX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdG9tLmJlZXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdmVDdXJzb3JEb3duKCkge1xuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnZpZXcuY3Vyc29ySW5kZXg7XG4gICAgICAgIGlmIChpbmRleCA9PT0gbnVsbCB8fCBpbmRleCA9PT0gdGhpcy52aWV3LnBhdGhMaXN0TGVuZ3RoKCkgLSAxKSB7XG4gICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy52aWV3LnNldEN1cnNvckluZGV4KGluZGV4KTtcbiAgICB9XG5cbiAgICBtb3ZlQ3Vyc29yVXAoKSB7XG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMudmlldy5jdXJzb3JJbmRleDtcbiAgICAgICAgaWYgKGluZGV4ID09PSBudWxsIHx8IGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICBpbmRleCA9IHRoaXMudmlldy5wYXRoTGlzdExlbmd0aCgpIC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZXcuc2V0Q3Vyc29ySW5kZXgoaW5kZXgpO1xuICAgIH1cblxuICAgIGRldGFjaCgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFuZWwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gICAgfVxuXG4gICAgYXR0YWNoKCkge1xuICAgICAgICBpZiAodGhpcy5wYW5lbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGluaXRpYWxQYXRoID0gUGF0aC5pbml0aWFsKCk7XG4gICAgICAgIHRoaXMucGF0aEhpc3RvcnkgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGF0aCA9IGluaXRpYWxQYXRoO1xuICAgICAgICB0aGlzLnVwZGF0ZVBhdGgoUGF0aC5pbml0aWFsKCksIHtzYXZlSGlzdG9yeTogZmFsc2V9KTtcbiAgICAgICAgdGhpcy5wYW5lbCA9IHRoaXMudmlldy5jcmVhdGVNb2RhbFBhbmVsKCk7XG4gICAgfVxufVxuIl19
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/controller.js
