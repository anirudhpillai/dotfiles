Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.PathListItemLabel = PathListItemLabel;
exports.AddProjectFolderButton = AddProjectFolderButton;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _eventKit = require('event-kit');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _vendorReactInfinite = require('../vendor/react-infinite');

var _vendorReactInfinite2 = _interopRequireDefault(_vendorReactInfinite);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _fileService = require('./file-service');

var _fileService2 = _interopRequireDefault(_fileService);

var _models = require('./models');

var _utils = require('./utils');

/**
 * Interface used by the controller to interact with the UI. Internally uses
 * React to render the UI and store the UI state.
 */

var AdvancedOpenFileView = (function () {
    function AdvancedOpenFileView() {
        var _this = this;

        _classCallCheck(this, AdvancedOpenFileView);

        this.emitter = new _eventKit.Emitter();

        this.contentContainer = document.createElement('div');
        this.content = _reactDom2['default'].render(_react2['default'].createElement(AdvancedOpenFileContent, { emitter: this.emitter }), this.contentContainer);

        // Keep focus on the text input.
        this.contentContainer.addEventListener('click', function (ev) {
            _this.content.focusPathInput();
        });
    }

    _createClass(AdvancedOpenFileView, [{
        key: 'onDidClickPath',
        value: function onDidClickPath(callback) {
            this.emitter.on('did-click-path', callback);
        }
    }, {
        key: 'onDidClickAddProjectFolder',
        value: function onDidClickAddProjectFolder(callback) {
            this.emitter.on('did-click-add-project-folder', callback);
        }
    }, {
        key: 'onDidClickOutside',
        value: function onDidClickOutside(callback) {
            this.emitter.on('did-click-outside', callback);
        }
    }, {
        key: 'onDidPathChange',
        value: function onDidPathChange(callback) {
            this.emitter.on('did-path-change', callback);
        }
    }, {
        key: 'setPath',
        value: function setPath(path) {
            this.content.setState({ path: path, selectedIndex: null });
        }
    }, {
        key: 'moveCursorDown',
        value: function moveCursorDown() {
            var _this2 = this;

            this.content.setState(function (state, props) {
                var index = state.selectedIndex;
                if (index === null || index === _this2.content.matchingPaths.length - 1) {
                    index = 0;
                } else {
                    index++;
                }

                return { selectedIndex: index };
            });
        }
    }, {
        key: 'moveCursorUp',
        value: function moveCursorUp() {
            var _this3 = this;

            this.content.setState(function (state, props) {
                var index = state.selectedIndex;
                if (index === null || index === 0) {
                    index = _this3.content.matchingPaths.length - 1;
                } else {
                    index--;
                }

                return { selectedIndex: index };
            });
        }
    }, {
        key: 'createModalPanel',
        value: function createModalPanel() {
            var _this4 = this;

            var visible = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            var panel = atom.workspace.addModalPanel({
                item: this.contentContainer,
                visible: visible
            });

            // Bind the outside click handler and destroy it when the panel is
            // destroyed.
            var outsideClickHandler = function outsideClickHandler(ev) {
                var _context;

                if ((_context = ev.target, _utils.closest).call(_context, '.advanced-open-file') === null) {
                    _this4.emitter.emit('did-click-outside');
                }
            };

            document.documentElement.addEventListener('click', outsideClickHandler);
            panel.onDidDestroy(function () {
                document.documentElement.removeEventListener('click', outsideClickHandler);
            });

            var modal = this.contentContainer.parentNode;
            modal.style.maxHeight = document.body.clientHeight - modal.offsetTop + 'px';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';

            this.content.focusPathInput();
            this.content.movePathInputToEndOfLine();

            return panel;
        }
    }, {
        key: 'selectedPath',
        get: function get() {
            var _content$state = this.content.state;
            var path = _content$state.path;
            var selectedIndex = _content$state.selectedIndex;

            if (selectedIndex === null) {
                return null;
            } else {
                return this.content.matchingPaths[selectedIndex];
            }
        }
    }, {
        key: 'firstPath',
        get: function get() {
            var matchingPaths = this.content.matchingPaths;
            if (matchingPaths.length > 0) {
                return matchingPaths[0];
            } else {
                return null;
            }
        }
    }]);

    return AdvancedOpenFileView;
})();

exports['default'] = AdvancedOpenFileView;

var AdvancedOpenFileContent = (function (_Component) {
    _inherits(AdvancedOpenFileContent, _Component);

    function AdvancedOpenFileContent(props) {
        _classCallCheck(this, AdvancedOpenFileContent);

        _get(Object.getPrototypeOf(AdvancedOpenFileContent.prototype), 'constructor', this).call(this, props);

        this.itemHeight = null;
        this.maxListHeight = null;
        this.state = {
            path: _models.Path.initial(),
            selectedIndex: null
        };

        // Cache matching paths in an attribute.
        this.matchingPaths = _fileService2['default'].getMatchingPaths(this.state.path);
    }

    _createClass(AdvancedOpenFileContent, [{
        key: 'componentWillUpdate',
        value: function componentWillUpdate(props, state) {
            this.updateMatchingPaths(state.path);
        }
    }, {
        key: 'updateMatchingPaths',
        value: function updateMatchingPaths(path) {
            var matchingPaths = _fileService2['default'].getMatchingPaths(path).slice();

            if (!config.get('fuzzyMatch')) {
                matchingPaths = matchingPaths.sort(_models.Path.compare);

                var _splitByTest = (0, _utils.splitByTest)(matchingPaths, function (p) {
                    return _fileService2['default'].isDirectory(p);
                });

                var _splitByTest2 = _slicedToArray(_splitByTest, 2);

                var directories = _splitByTest2[0];
                var files = _splitByTest2[1];

                matchingPaths = directories.concat(files);
            }

            var hideParent = !path.full || path.fragment && matchingPaths.length > 0 || path.isRoot();
            if (!hideParent) {
                var _parent = path.parent();
                _parent.displayAsParent = true;
                matchingPaths.unshift(_parent);
            }

            this.matchingPaths = matchingPaths;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.itemHeight > 0 && this.maxListHeight > 0) {
                return;
            } else {
                this.calculateListHeights();
            }
        }
    }, {
        key: 'calculateListHeights',
        value: function calculateListHeights() {
            var el = _reactDom2['default'].findDOMNode(this);
            var panel = _utils.closest.call(el, '.modal');
            var list = el.querySelector('.list-group');
            var listItem = el.querySelector('.list-item');
            if (panel && list && listItem) {
                // The maximum list height is from where it starts to the bottom of
                // the screen, _minus_ the padding from the modal panel around it.
                var panelBottomPadding = panel.getBoundingClientRect().bottom - list.getBoundingClientRect().bottom + _utils.padding.call(panel, 'bottom');
                this.maxListHeight = document.body.clientHeight - list.offsetTop - panelBottomPadding;
                this.itemHeight = listItem.offsetHeight;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state;
            var path = _state.path;
            var selectedIndex = _state.selectedIndex;

            return _react2['default'].createElement(
                'div',
                { className: 'advanced-open-file' },
                _react2['default'].createElement(
                    'p',
                    { className: 'info-message icon icon-file-add' },
                    'Enter the path for the file to open or create.'
                ),
                _react2['default'].createElement(PathInput, {
                    ref: 'pathInput',
                    path: path,
                    onChange: this.handlePathInputChange.bind(this)
                }),
                _react2['default'].createElement(MatchingPathList, {
                    ref: 'pathList',
                    path: path,
                    selectedIndex: selectedIndex,
                    matchingPaths: this.matchingPaths,
                    itemHeight: this.itemHeight,
                    maxListHeight: this.maxListHeight,
                    onClickPath: this.handleClickPath.bind(this),
                    onClickAddProjectFolder: this.handleClickAddProjectFolder.bind(this)
                })
            );
        }
    }, {
        key: 'handlePathInputChange',
        value: function handlePathInputChange(newText) {
            var newPath = new _models.Path(newText);
            this.setState({ path: newPath, selectedIndex: null });
            this.props.emitter.emit('did-path-change', newPath);
        }
    }, {
        key: 'handleClickPath',
        value: function handleClickPath(path) {
            this.props.emitter.emit('did-click-path', path);
        }
    }, {
        key: 'handleClickAddProjectFolder',
        value: function handleClickAddProjectFolder(path) {
            this.props.emitter.emit('did-click-add-project-folder', path);
        }
    }, {
        key: 'focusPathInput',
        value: function focusPathInput() {
            this.refs.pathInput.focus();
        }
    }, {
        key: 'movePathInputToEndOfLine',
        value: function movePathInputToEndOfLine() {
            this.refs.pathInput.moveToEndOfLine();
        }
    }]);

    return AdvancedOpenFileContent;
})(_react.Component);

exports.AdvancedOpenFileContent = AdvancedOpenFileContent;

var PathInput = (function (_Component2) {
    _inherits(PathInput, _Component2);

    function PathInput(props) {
        _classCallCheck(this, PathInput);

        _get(Object.getPrototypeOf(PathInput.prototype), 'constructor', this).call(this, props);

        // Used to disable the onChange callback when reacting to prop
        // changes, which aren't user-initiated and shouldn't trigger it.
        this.disableOnChange = false;
    }

    _createClass(PathInput, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.textEditor = this.refs.textEditor.getModel();
            this.textEditor.onDidChange(this.handleChange.bind(this));
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.disableOnChange = true;

            // Preserve cursor position adding the difference between the old and
            // new text to the current position and moving it there.
            var oldLength = this.textEditor.getText().length;
            var oldCoords = this.textEditor.getCursorBufferPosition();
            var newLength = this.props.path.full.length;
            var newColumn = Math.max(0, oldCoords.column + (newLength - oldLength));

            this.textEditor.setText(this.props.path.full);
            this.textEditor.setCursorBufferPosition([oldCoords.row, newColumn]);

            this.disableOnChange = false;
        }
    }, {
        key: 'render',
        value: function render() {
            var path = this.props.path;

            // We use class instead of className due to
            // https://github.com/facebook/react/issues/4933
            return _react2['default'].createElement(
                'div',
                { className: 'path-input-container' },
                _react2['default'].createElement('atom-text-editor', {
                    ref: 'textEditor',
                    'class': 'path-input',
                    'placeholder-text': '/path/to/file.txt',
                    mini: true
                })
            );
        }
    }, {
        key: 'handleChange',
        value: function handleChange() {
            if (!this.disableOnChange) {
                this.props.onChange(this.textEditor.getText());
            }
        }
    }, {
        key: 'focus',
        value: function focus() {
            this.refs.textEditor.focus();
        }
    }, {
        key: 'moveToEndOfLine',
        value: function moveToEndOfLine() {
            this.textEditor.moveToEndOfLine();
        }
    }]);

    return PathInput;
})(_react.Component);

exports.PathInput = PathInput;

var MatchingPathList = (function (_Component3) {
    _inherits(MatchingPathList, _Component3);

    function MatchingPathList() {
        _classCallCheck(this, MatchingPathList);

        _get(Object.getPrototypeOf(MatchingPathList.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MatchingPathList, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            // Remove existing highlights
            var listGroup = _reactDom2['default'].findDOMNode(this.refs.listGroup);
            var items = Array.from(listGroup.querySelectorAll('.selected'));
            for (var item of items) {
                item.classList.remove('selected');
            }

            // Highlight the selected list item.
            var _props = this.props;
            var selectedIndex = _props.selectedIndex;
            var matchingPaths = _props.matchingPaths;

            if (selectedIndex !== null) {
                var selectedPath = matchingPaths[selectedIndex];
                var listItem = listGroup.querySelector('[data-file-name="' + selectedPath.full + '"]');
                if (listItem) {
                    listItem.classList.add('selected');
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var path = _props2.path;
            var matchingPaths = _props2.matchingPaths;
            var onClickPath = _props2.onClickPath;
            var onClickAddProjectFolder = _props2.onClickAddProjectFolder;
            var itemHeight = _props2.itemHeight;
            var maxListHeight = _props2.maxListHeight;

            var listItems = matchingPaths.map(function (path) {
                return _react2['default'].createElement(PathListItem, {
                    key: path.full,
                    path: path,
                    onClick: onClickPath,
                    onClickAddProjectFolder: onClickAddProjectFolder
                });
            });

            // Wrap the list in an Infinite container if we have the heights needed.
            if (itemHeight > 0 && maxListHeight > 0) {
                var containerHeight = Math.min(itemHeight * listItems.length, maxListHeight);
                listItems = _react2['default'].createElement(
                    _vendorReactInfinite2['default'],
                    { containerHeight: containerHeight, elementHeight: itemHeight },
                    listItems
                );
            }

            return _react2['default'].createElement(
                'div',
                { className: 'list-group', ref: 'listGroup' },
                listItems
            );
        }
    }]);

    return MatchingPathList;
})(_react.Component);

exports.MatchingPathList = MatchingPathList;

var PathListItem = (function (_Component4) {
    _inherits(PathListItem, _Component4);

    function PathListItem() {
        _classCallCheck(this, PathListItem);

        _get(Object.getPrototypeOf(PathListItem.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(PathListItem, [{
        key: 'render',
        value: function render() {
            var _props3 = this.props;
            var path = _props3.path;
            var onClickAddProjectFolder = _props3.onClickAddProjectFolder;

            var className = (0, _classnames2['default'])('list-item', {
                directory: _fileService2['default'].isDirectory(path),
                parent: path.displayAsParent
            });

            return _react2['default'].createElement(
                'div',
                { className: className, onClick: this.handleClick.bind(this), 'data-file-name': path.full },
                _react2['default'].createElement(PathListItemLabel, { path: path }),
                _react2['default'].createElement(AddProjectFolderButton, {
                    path: path,
                    onClick: this.handleClickAddProjectFolder.bind(this)
                })
            );
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            this.props.onClick(this.props.path);
        }
    }, {
        key: 'handleClickAddProjectFolder',
        value: function handleClickAddProjectFolder(event) {
            event.stopPropagation();
            this.props.onClickAddProjectFolder(this.props.path);

            // Currently the path's status as a project folder isn't a prop or
            // state, so React doesn't know to re-render due to this.
            this.forceUpdate();
        }
    }]);

    return PathListItem;
})(_react.Component);

exports.PathListItem = PathListItem;

function PathListItemLabel(_ref) {
    var path = _ref.path;

    var icon = _fileService2['default'].isDirectory(path) ? 'icon-file-directory' : 'icon-file-text';
    var className = (0, _classnames2['default'])('filename', 'icon', icon);

    return _react2['default'].createElement(
        'span',
        { className: className, 'data-name': path.fragment },
        path.displayAsParent ? '..' : path.fragment
    );
}

function AddProjectFolderButton(_ref2) {
    var path = _ref2.path;
    var onClick = _ref2.onClick;

    if (!_fileService2['default'].isDirectory(path) || path.isProjectDirectory() || path.displayAsParent) {
        return null;
    }

    return _react2['default'].createElement('span', {
        className: 'add-project-folder icon icon-plus',
        title: 'Open as project folder',
        onClick: onClick
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi92aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQUN1QixZQUFZOzs7O3dCQUNiLFdBQVc7O3FCQUNGLE9BQU87Ozs7d0JBQ2pCLFdBQVc7Ozs7bUNBQ1gsMEJBQTBCOzs7O3NCQUV2QixVQUFVOztJQUF0QixNQUFNOzsyQkFDTSxnQkFBZ0I7Ozs7c0JBQ3JCLFVBQVU7O3FCQUMrQixTQUFTOzs7Ozs7O0lBT2hELG9CQUFvQjtBQUMxQixhQURNLG9CQUFvQixHQUN2Qjs7OzhCQURHLG9CQUFvQjs7QUFFakMsWUFBSSxDQUFDLE9BQU8sR0FBRyx1QkFBYSxDQUFDOztBQUU3QixZQUFJLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0RCxZQUFJLENBQUMsT0FBTyxHQUFHLHNCQUFTLE1BQU0sQ0FDMUIsaUNBQUMsdUJBQXVCLElBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEFBQUMsR0FBRyxFQUNsRCxJQUFJLENBQUMsZ0JBQWdCLENBQ3hCLENBQUM7OztBQUdGLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBQSxFQUFFLEVBQUk7QUFDbEQsa0JBQUssT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ2pDLENBQUMsQ0FBQztLQUNOOztpQkFkZ0Isb0JBQW9COztlQWtDdkIsd0JBQUMsUUFBUSxFQUFFO0FBQ3JCLGdCQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUMvQzs7O2VBRXlCLG9DQUFDLFFBQVEsRUFBRTtBQUNqQyxnQkFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDN0Q7OztlQUVnQiwyQkFB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QUFMLElBQU0sQ0FBTCxJQUFJOztBQUNuQyxRQUFJLElBQUksR0FBRyx5QkFBWSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcscUJBQXFCLEdBQUcsZ0JBQWdCLENBQUM7QUFDcEYsUUFBSSxTQUFTLEdBQUcsNkJBQVcsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFckQsV0FDSTs7VUFBTSxTQUFTLEVBQUUsU0FBUyxBQUFDLEVBQUMsYUFBVyxJQUFJLENBQUMsUUFBUSxBQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRO0tBQ3pDLENBQ1Y7Q0FDSjs7QUFHTSxTQUFTLHNCQUFzQixDQUFDLEtBQWUsRUFBRTtRQUFoQixJQUFJLEdBQUwsS0FBZSxDQUFkLElBQUk7UUFBRSxPQUFPLEdBQWQsS0FBZSxDQUFSLE9BQU87O0FBQ2pELFFBQUksQ0FBQyx5QkFBWSxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNyRixlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELFdBQ0k7QUFDSSxpQkFBUyxFQUFDLG1DQUFtQztBQUM3QyxhQUFLLEVBQUMsd0JBQXdCO0FBQzlCLGVBQU8sRUFBRSxPQUFPLEFBQUM7TUFDbkIsQ0FDSjtDQUNMIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL2xpYi92aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEluZmluaXRlIGZyb20gJy4uL3ZlbmRvci9yZWFjdC1pbmZpbml0ZSc7XG5cbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgZmlsZVNlcnZpY2UgZnJvbSAnLi9maWxlLXNlcnZpY2UnO1xuaW1wb3J0IHtQYXRofSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge2NhY2hlZFByb3BlcnR5LCBjbG9zZXN0LCBwYWRkaW5nLCBzcGxpdEJ5VGVzdH0gZnJvbSAnLi91dGlscyc7XG5cblxuLyoqXG4gKiBJbnRlcmZhY2UgdXNlZCBieSB0aGUgY29udHJvbGxlciB0byBpbnRlcmFjdCB3aXRoIHRoZSBVSS4gSW50ZXJuYWxseSB1c2VzXG4gKiBSZWFjdCB0byByZW5kZXIgdGhlIFVJIGFuZCBzdG9yZSB0aGUgVUkgc3RhdGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkdmFuY2VkT3BlbkZpbGVWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgICAgICAgPEFkdmFuY2VkT3BlbkZpbGVDb250ZW50IGVtaXR0ZXI9e3RoaXMuZW1pdHRlcn0gLz4sXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXJcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBLZWVwIGZvY3VzIG9uIHRoZSB0ZXh0IGlucHV0LlxuICAgICAgICB0aGlzLmNvbnRlbnRDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldiA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQuZm9jdXNQYXRoSW5wdXQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IHNlbGVjdGVkUGF0aCgpIHtcbiAgICAgICAgbGV0IHtwYXRoLCBzZWxlY3RlZEluZGV4fSA9IHRoaXMuY29udGVudC5zdGF0ZTtcbiAgICAgICAgaWYgKHNlbGVjdGVkSW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudC5tYXRjaGluZ1BhdGhzW3NlbGVjdGVkSW5kZXhdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGZpcnN0UGF0aCgpIHtcbiAgICAgICAgbGV0IG1hdGNoaW5nUGF0aHMgPSB0aGlzLmNvbnRlbnQubWF0Y2hpbmdQYXRocztcbiAgICAgICAgaWYgKG1hdGNoaW5nUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoaW5nUGF0aHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uRGlkQ2xpY2tQYXRoKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5vbignZGlkLWNsaWNrLXBhdGgnLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgb25EaWRDbGlja0FkZFByb2plY3RGb2xkZXIoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2xpY2stYWRkLXByb2plY3QtZm9sZGVyJywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIG9uRGlkQ2xpY2tPdXRzaWRlKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5vbignZGlkLWNsaWNrLW91dHNpZGUnLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgb25EaWRQYXRoQ2hhbmdlKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5vbignZGlkLXBhdGgtY2hhbmdlJywgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHNldFBhdGgocGF0aCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0U3RhdGUoe3BhdGg6IHBhdGgsIHNlbGVjdGVkSW5kZXg6IG51bGx9KTtcbiAgICB9XG5cbiAgICBtb3ZlQ3Vyc29yRG93bigpIHtcbiAgICAgICAgdGhpcy5jb250ZW50LnNldFN0YXRlKChzdGF0ZSwgcHJvcHMpID0+IHtcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHN0YXRlLnNlbGVjdGVkSW5kZXg7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IG51bGwgfHwgaW5kZXggPT09IHRoaXMuY29udGVudC5tYXRjaGluZ1BhdGhzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7c2VsZWN0ZWRJbmRleDogaW5kZXh9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3ZlQ3Vyc29yVXAoKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRTdGF0ZSgoc3RhdGUsIHByb3BzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBzdGF0ZS5zZWxlY3RlZEluZGV4O1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBudWxsIHx8IGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSB0aGlzLmNvbnRlbnQubWF0Y2hpbmdQYXRocy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge3NlbGVjdGVkSW5kZXg6IGluZGV4fTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3JlYXRlTW9kYWxQYW5lbCh2aXNpYmxlPXRydWUpIHtcbiAgICAgICAgbGV0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICAgICAgICBpdGVtOiB0aGlzLmNvbnRlbnRDb250YWluZXIsXG4gICAgICAgICAgICB2aXNpYmxlOiB2aXNpYmxlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEJpbmQgdGhlIG91dHNpZGUgY2xpY2sgaGFuZGxlciBhbmQgZGVzdHJveSBpdCB3aGVuIHRoZSBwYW5lbCBpc1xuICAgICAgICAvLyBkZXN0cm95ZWQuXG4gICAgICAgIGxldCBvdXRzaWRlQ2xpY2tIYW5kbGVyID0gZXYgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LnRhcmdldDo6Y2xvc2VzdCgnLmFkdmFuY2VkLW9wZW4tZmlsZScpID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jbGljay1vdXRzaWRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb3V0c2lkZUNsaWNrSGFuZGxlcik7XG4gICAgICAgIHBhbmVsLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvdXRzaWRlQ2xpY2tIYW5kbGVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IG1vZGFsID0gdGhpcy5jb250ZW50Q29udGFpbmVyLnBhcmVudE5vZGU7XG4gICAgICAgIG1vZGFsLnN0eWxlLm1heEhlaWdodCA9IGAke2RvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC0gbW9kYWwub2Zmc2V0VG9wfXB4YDtcbiAgICAgICAgbW9kYWwuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgbW9kYWwuc3R5bGUuZmxleERpcmVjdGlvbiA9ICdjb2x1bW4nO1xuXG4gICAgICAgIHRoaXMuY29udGVudC5mb2N1c1BhdGhJbnB1dCgpO1xuICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVBhdGhJbnB1dFRvRW5kT2ZMaW5lKCk7XG5cbiAgICAgICAgcmV0dXJuIHBhbmVsO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgQWR2YW5jZWRPcGVuRmlsZUNvbnRlbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLml0ZW1IZWlnaHQgPSBudWxsO1xuICAgICAgICB0aGlzLm1heExpc3RIZWlnaHQgPSBudWxsO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGF0aDogUGF0aC5pbml0aWFsKCksXG4gICAgICAgICAgICBzZWxlY3RlZEluZGV4OiBudWxsLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENhY2hlIG1hdGNoaW5nIHBhdGhzIGluIGFuIGF0dHJpYnV0ZS5cbiAgICAgICAgdGhpcy5tYXRjaGluZ1BhdGhzID0gZmlsZVNlcnZpY2UuZ2V0TWF0Y2hpbmdQYXRocyh0aGlzLnN0YXRlLnBhdGgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTWF0Y2hpbmdQYXRocyhzdGF0ZS5wYXRoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVNYXRjaGluZ1BhdGhzKHBhdGgpIHtcbiAgICAgICAgbGV0IG1hdGNoaW5nUGF0aHMgPSBmaWxlU2VydmljZS5nZXRNYXRjaGluZ1BhdGhzKHBhdGgpLnNsaWNlKCk7XG5cbiAgICAgICAgaWYgKCFjb25maWcuZ2V0KCdmdXp6eU1hdGNoJykpIHtcbiAgICAgICAgICAgIG1hdGNoaW5nUGF0aHMgPSBtYXRjaGluZ1BhdGhzLnNvcnQoUGF0aC5jb21wYXJlKTtcbiAgICAgICAgICAgIGxldCBbZGlyZWN0b3JpZXMsIGZpbGVzXSA9IHNwbGl0QnlUZXN0KFxuICAgICAgICAgICAgICAgIG1hdGNoaW5nUGF0aHMsXG4gICAgICAgICAgICAgICAgcCA9PiBmaWxlU2VydmljZS5pc0RpcmVjdG9yeShwKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1hdGNoaW5nUGF0aHMgPSBkaXJlY3Rvcmllcy5jb25jYXQoZmlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhpZGVQYXJlbnQgPSAoXG4gICAgICAgICAgICAhcGF0aC5mdWxsXG4gICAgICAgICAgICB8fCAocGF0aC5mcmFnbWVudCAmJiBtYXRjaGluZ1BhdGhzLmxlbmd0aCA+IDApXG4gICAgICAgICAgICB8fCBwYXRoLmlzUm9vdCgpXG4gICAgICAgICk7XG4gICAgICAgIGlmICghaGlkZVBhcmVudCkge1xuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHBhdGgucGFyZW50KCk7XG4gICAgICAgICAgICBwYXJlbnQuZGlzcGxheUFzUGFyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIG1hdGNoaW5nUGF0aHMudW5zaGlmdChwYXJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXRjaGluZ1BhdGhzID0gbWF0Y2hpbmdQYXRocztcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1IZWlnaHQgPiAwICYmIHRoaXMubWF4TGlzdEhlaWdodCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlTGlzdEhlaWdodHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZUxpc3RIZWlnaHRzKCkge1xuICAgICAgICBsZXQgZWwgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICAgICAgbGV0IHBhbmVsID0gZWw6OmNsb3Nlc3QoJy5tb2RhbCcpO1xuICAgICAgICBsZXQgbGlzdCA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5saXN0LWdyb3VwJyk7XG4gICAgICAgIGxldCBsaXN0SXRlbSA9IGVsLnF1ZXJ5U2VsZWN0b3IoJy5saXN0LWl0ZW0nKTtcbiAgICAgICAgaWYgKHBhbmVsICYmIGxpc3QgJiYgbGlzdEl0ZW0pIHtcbiAgICAgICAgICAgIC8vIFRoZSBtYXhpbXVtIGxpc3QgaGVpZ2h0IGlzIGZyb20gd2hlcmUgaXQgc3RhcnRzIHRvIHRoZSBib3R0b20gb2ZcbiAgICAgICAgICAgIC8vIHRoZSBzY3JlZW4sIF9taW51c18gdGhlIHBhZGRpbmcgZnJvbSB0aGUgbW9kYWwgcGFuZWwgYXJvdW5kIGl0LlxuICAgICAgICAgICAgbGV0IHBhbmVsQm90dG9tUGFkZGluZyA9IChcbiAgICAgICAgICAgICAgICBwYW5lbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5ib3R0b21cbiAgICAgICAgICAgICAgICAtIGxpc3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tXG4gICAgICAgICAgICAgICAgKyBwYW5lbDo6cGFkZGluZygnYm90dG9tJylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLm1heExpc3RIZWlnaHQgPSAoXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQgLSBsaXN0Lm9mZnNldFRvcCAtIHBhbmVsQm90dG9tUGFkZGluZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuaXRlbUhlaWdodCA9IGxpc3RJdGVtLm9mZnNldEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHtwYXRoLCBzZWxlY3RlZEluZGV4fSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWR2YW5jZWQtb3Blbi1maWxlXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiaW5mby1tZXNzYWdlIGljb24gaWNvbi1maWxlLWFkZFwiPlxuICAgICAgICAgICAgICAgICAgICBFbnRlciB0aGUgcGF0aCBmb3IgdGhlIGZpbGUgdG8gb3BlbiBvciBjcmVhdGUuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxQYXRoSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgcmVmPVwicGF0aElucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgcGF0aD17cGF0aH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9ezo6dGhpcy5oYW5kbGVQYXRoSW5wdXRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8TWF0Y2hpbmdQYXRoTGlzdFxuICAgICAgICAgICAgICAgICAgICByZWY9XCJwYXRoTGlzdFwiXG4gICAgICAgICAgICAgICAgICAgIHBhdGg9e3BhdGh9XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSW5kZXg9e3NlbGVjdGVkSW5kZXh9XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoaW5nUGF0aHM9e3RoaXMubWF0Y2hpbmdQYXRoc31cbiAgICAgICAgICAgICAgICAgICAgaXRlbUhlaWdodD17dGhpcy5pdGVtSGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICBtYXhMaXN0SGVpZ2h0PXt0aGlzLm1heExpc3RIZWlnaHR9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2tQYXRoPXs6OnRoaXMuaGFuZGxlQ2xpY2tQYXRofVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrQWRkUHJvamVjdEZvbGRlcj17Ojp0aGlzLmhhbmRsZUNsaWNrQWRkUHJvamVjdEZvbGRlcn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaGFuZGxlUGF0aElucHV0Q2hhbmdlKG5ld1RleHQpIHtcbiAgICAgICAgbGV0IG5ld1BhdGggPSBuZXcgUGF0aChuZXdUZXh0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGF0aDogbmV3UGF0aCwgc2VsZWN0ZWRJbmRleDogbnVsbH0pO1xuICAgICAgICB0aGlzLnByb3BzLmVtaXR0ZXIuZW1pdCgnZGlkLXBhdGgtY2hhbmdlJywgbmV3UGF0aCk7XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2tQYXRoKHBhdGgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5lbWl0dGVyLmVtaXQoJ2RpZC1jbGljay1wYXRoJywgcGF0aCk7XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2tBZGRQcm9qZWN0Rm9sZGVyKHBhdGgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5lbWl0dGVyLmVtaXQoJ2RpZC1jbGljay1hZGQtcHJvamVjdC1mb2xkZXInLCBwYXRoKTtcbiAgICB9XG5cbiAgICBmb2N1c1BhdGhJbnB1dCgpIHtcbiAgICAgICAgdGhpcy5yZWZzLnBhdGhJbnB1dC5mb2N1cygpO1xuICAgIH1cblxuICAgIG1vdmVQYXRoSW5wdXRUb0VuZE9mTGluZSgpIHtcbiAgICAgICAgdGhpcy5yZWZzLnBhdGhJbnB1dC5tb3ZlVG9FbmRPZkxpbmUoKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFBhdGhJbnB1dCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIFVzZWQgdG8gZGlzYWJsZSB0aGUgb25DaGFuZ2UgY2FsbGJhY2sgd2hlbiByZWFjdGluZyB0byBwcm9wXG4gICAgICAgIC8vIGNoYW5nZXMsIHdoaWNoIGFyZW4ndCB1c2VyLWluaXRpYXRlZCBhbmQgc2hvdWxkbid0IHRyaWdnZXIgaXQuXG4gICAgICAgIHRoaXMuZGlzYWJsZU9uQ2hhbmdlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMudGV4dEVkaXRvciA9IHRoaXMucmVmcy50ZXh0RWRpdG9yLmdldE1vZGVsKCk7XG4gICAgICAgIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZSg6OnRoaXMuaGFuZGxlQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZU9uQ2hhbmdlID0gdHJ1ZTtcblxuICAgICAgICAvLyBQcmVzZXJ2ZSBjdXJzb3IgcG9zaXRpb24gYWRkaW5nIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG9sZCBhbmRcbiAgICAgICAgLy8gbmV3IHRleHQgdG8gdGhlIGN1cnJlbnQgcG9zaXRpb24gYW5kIG1vdmluZyBpdCB0aGVyZS5cbiAgICAgICAgbGV0IG9sZExlbmd0aCA9IHRoaXMudGV4dEVkaXRvci5nZXRUZXh0KCkubGVuZ3RoO1xuICAgICAgICBsZXQgb2xkQ29vcmRzID0gdGhpcy50ZXh0RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgIGxldCBuZXdMZW5ndGggPSB0aGlzLnByb3BzLnBhdGguZnVsbC5sZW5ndGg7XG4gICAgICAgIGxldCBuZXdDb2x1bW4gPSBNYXRoLm1heCgwLCBvbGRDb29yZHMuY29sdW1uICsgKG5ld0xlbmd0aCAtIG9sZExlbmd0aCkpXG5cbiAgICAgICAgdGhpcy50ZXh0RWRpdG9yLnNldFRleHQodGhpcy5wcm9wcy5wYXRoLmZ1bGwpO1xuICAgICAgICB0aGlzLnRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW29sZENvb3Jkcy5yb3csIG5ld0NvbHVtbl0pO1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZU9uQ2hhbmdlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQge3BhdGh9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICAvLyBXZSB1c2UgY2xhc3MgaW5zdGVhZCBvZiBjbGFzc05hbWUgZHVlIHRvXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9pc3N1ZXMvNDkzM1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYXRoLWlucHV0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxhdG9tLXRleHQtZWRpdG9yXG4gICAgICAgICAgICAgICAgICAgIHJlZj1cInRleHRFZGl0b3JcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cInBhdGgtaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlci10ZXh0PVwiL3BhdGgvdG8vZmlsZS50eHRcIlxuICAgICAgICAgICAgICAgICAgICBtaW5pXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGhhbmRsZUNoYW5nZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVPbkNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnRleHRFZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLnJlZnMudGV4dEVkaXRvci5mb2N1cygpO1xuICAgIH1cblxuICAgIG1vdmVUb0VuZE9mTGluZSgpIHtcbiAgICAgICAgdGhpcy50ZXh0RWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgTWF0Y2hpbmdQYXRoTGlzdCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvLyBSZW1vdmUgZXhpc3RpbmcgaGlnaGxpZ2h0c1xuICAgICAgICBsZXQgbGlzdEdyb3VwID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcy5yZWZzLmxpc3RHcm91cCk7XG4gICAgICAgIGxldCBpdGVtcyA9IEFycmF5LmZyb20obGlzdEdyb3VwLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWxlY3RlZCcpKTtcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiBpdGVtcykge1xuICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3RlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBzZWxlY3RlZCBsaXN0IGl0ZW0uXG4gICAgICAgIGxldCB7c2VsZWN0ZWRJbmRleCwgbWF0Y2hpbmdQYXRoc30gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoc2VsZWN0ZWRJbmRleCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkUGF0aCA9IG1hdGNoaW5nUGF0aHNbc2VsZWN0ZWRJbmRleF07XG4gICAgICAgICAgICBsZXQgbGlzdEl0ZW0gPSBsaXN0R3JvdXAucXVlcnlTZWxlY3RvcihgW2RhdGEtZmlsZS1uYW1lPVwiJHtzZWxlY3RlZFBhdGguZnVsbH1cIl1gKTtcbiAgICAgICAgICAgIGlmIChsaXN0SXRlbSkge1xuICAgICAgICAgICAgICAgIGxpc3RJdGVtLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCB7XG4gICAgICAgICAgICBwYXRoLFxuICAgICAgICAgICAgbWF0Y2hpbmdQYXRocyxcbiAgICAgICAgICAgIG9uQ2xpY2tQYXRoLFxuICAgICAgICAgICAgb25DbGlja0FkZFByb2plY3RGb2xkZXIsXG4gICAgICAgICAgICBpdGVtSGVpZ2h0LFxuICAgICAgICAgICAgbWF4TGlzdEhlaWdodFxuICAgICAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBsZXQgbGlzdEl0ZW1zID0gbWF0Y2hpbmdQYXRocy5tYXAocGF0aCA9PiAoXG4gICAgICAgICAgICA8UGF0aExpc3RJdGVtXG4gICAgICAgICAgICAgICAga2V5PXtwYXRoLmZ1bGx9XG4gICAgICAgICAgICAgICAgcGF0aD17cGF0aH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrUGF0aH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrQWRkUHJvamVjdEZvbGRlcj17b25DbGlja0FkZFByb2plY3RGb2xkZXJ9XG4gICAgICAgICAgICAvPlxuICAgICAgICApKTtcblxuICAgICAgICAvLyBXcmFwIHRoZSBsaXN0IGluIGFuIEluZmluaXRlIGNvbnRhaW5lciBpZiB3ZSBoYXZlIHRoZSBoZWlnaHRzIG5lZWRlZC5cbiAgICAgICAgaWYgKGl0ZW1IZWlnaHQgPiAwICYmIG1heExpc3RIZWlnaHQgPiAwKSB7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5taW4oaXRlbUhlaWdodCAqIGxpc3RJdGVtcy5sZW5ndGgsIG1heExpc3RIZWlnaHQpO1xuICAgICAgICAgICAgbGlzdEl0ZW1zID0gKFxuICAgICAgICAgICAgICAgIDxJbmZpbml0ZSBjb250YWluZXJIZWlnaHQ9e2NvbnRhaW5lckhlaWdodH0gZWxlbWVudEhlaWdodD17aXRlbUhlaWdodH0+XG4gICAgICAgICAgICAgICAgICAgIHtsaXN0SXRlbXN9XG4gICAgICAgICAgICAgICAgPC9JbmZpbml0ZT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsaXN0LWdyb3VwXCIgcmVmPVwibGlzdEdyb3VwXCI+XG4gICAgICAgICAgICAgICAge2xpc3RJdGVtc31cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUGF0aExpc3RJdGVtIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCB7cGF0aCwgb25DbGlja0FkZFByb2plY3RGb2xkZXJ9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoJ2xpc3QtaXRlbScsIHtcbiAgICAgICAgICAgIGRpcmVjdG9yeTogZmlsZVNlcnZpY2UuaXNEaXJlY3RvcnkocGF0aCksXG4gICAgICAgICAgICBwYXJlbnQ6IHBhdGguZGlzcGxheUFzUGFyZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfSBvbkNsaWNrPXs6OnRoaXMuaGFuZGxlQ2xpY2t9IGRhdGEtZmlsZS1uYW1lPXtwYXRoLmZ1bGx9PlxuICAgICAgICAgICAgICAgIDxQYXRoTGlzdEl0ZW1MYWJlbCBwYXRoPXtwYXRofSAvPlxuICAgICAgICAgICAgICAgIDxBZGRQcm9qZWN0Rm9sZGVyQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHBhdGg9e3BhdGh9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9ezo6dGhpcy5oYW5kbGVDbGlja0FkZFByb2plY3RGb2xkZXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5wYXRoKTtcbiAgICB9XG5cbiAgICBoYW5kbGVDbGlja0FkZFByb2plY3RGb2xkZXIoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGlja0FkZFByb2plY3RGb2xkZXIodGhpcy5wcm9wcy5wYXRoKTtcblxuICAgICAgICAvLyBDdXJyZW50bHkgdGhlIHBhdGgncyBzdGF0dXMgYXMgYSBwcm9qZWN0IGZvbGRlciBpc24ndCBhIHByb3Agb3JcbiAgICAgICAgLy8gc3RhdGUsIHNvIFJlYWN0IGRvZXNuJ3Qga25vdyB0byByZS1yZW5kZXIgZHVlIHRvIHRoaXMuXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIFBhdGhMaXN0SXRlbUxhYmVsKHtwYXRofSkge1xuICAgIGxldCBpY29uID0gZmlsZVNlcnZpY2UuaXNEaXJlY3RvcnkocGF0aCkgPyAnaWNvbi1maWxlLWRpcmVjdG9yeScgOiAnaWNvbi1maWxlLXRleHQnO1xuICAgIGxldCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKCdmaWxlbmFtZScsICdpY29uJywgaWNvbik7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZX0gZGF0YS1uYW1lPXtwYXRoLmZyYWdtZW50fT5cbiAgICAgICAgICAgIHtwYXRoLmRpc3BsYXlBc1BhcmVudCA/ICcuLicgOiBwYXRoLmZyYWdtZW50fVxuICAgICAgICA8L3NwYW4+XG4gICAgKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRQcm9qZWN0Rm9sZGVyQnV0dG9uKHtwYXRoLCBvbkNsaWNrfSkge1xuICAgIGlmICghZmlsZVNlcnZpY2UuaXNEaXJlY3RvcnkocGF0aCkgfHwgcGF0aC5pc1Byb2plY3REaXJlY3RvcnkoKSB8fCBwYXRoLmRpc3BsYXlBc1BhcmVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8c3BhblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWRkLXByb2plY3QtZm9sZGVyIGljb24gaWNvbi1wbHVzXCJcbiAgICAgICAgICAgIHRpdGxlPVwiT3BlbiBhcyBwcm9qZWN0IGZvbGRlclwiXG4gICAgICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgICAgICAvPlxuICAgICk7XG59XG4iXX0=
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/lib/view.js
