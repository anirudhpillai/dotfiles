function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _osenv = require('osenv');

var _osenv2 = _interopRequireDefault(_osenv);

var _touch = require('touch');

var _touch2 = _interopRequireDefault(_touch);

var _libAdvancedOpenFile = require('../lib/advanced-open-file');

var _libConfig = require('../lib/config');

var _libModels = require('../lib/models');

_temp2['default'].track();

describe('Functional tests', function () {
    var workspaceElement = null;
    var activationPromise = null;
    var ui = null;
    var pathEditor = null;

    beforeEach(function () {
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);

        // Clear out any leftover panes.
        atom.workspace.getPanes().forEach(function (pane) {
            return pane.destroy();
        });

        activationPromise = atom.packages.activatePackage('advanced-open-file');
    });

    function getUI() {
        return workspaceElement.querySelector('.advanced-open-file');
    }

    function fixturePath() {
        for (var _len = arguments.length, parts = Array(_len), _key = 0; _key < _len; _key++) {
            parts[_key] = arguments[_key];
        }

        return _path2['default'].join.apply(_path2['default'], [__dirname, 'fixtures'].concat(parts));
    }

    function setPath(newPath) {
        pathEditor.setText(newPath);
    }

    function currentPath() {
        return pathEditor.getText();
    }

    function dispatch(command) {
        atom.commands.dispatch(ui[0], command);
    }

    function currentPathList() {
        return ui.find('.list-item:not(.hidden)').map(function (i, item) {
            return (0, _jquery2['default'])(item).text().trim();
        }).get();
    }

    function currentEditorPaths() {
        return atom.workspace.getTextEditors().map(function (editor) {
            return editor.getPath();
        });
    }

    function waitsForOpenPaths(count) {
        var timeout = arguments.length <= 1 || arguments[1] === undefined ? 2000 : arguments[1];

        waitsFor(function () {
            return currentEditorPaths().length >= count;
        }, count + ' paths to be opened', timeout);
    }

    function openModal() {
        atom.commands.dispatch(workspaceElement, 'advanced-open-file:toggle');
        waitsForPromise(function () {
            return activationPromise.then(function () {
                ui = (0, _jquery2['default'])(getUI());
                pathEditor = ui.find('.path-input')[0].getModel();
            });
        });
    }

    function resetConfig() {
        atom.config.unset('advanced-open-file.createFileInstantly');
        atom.config.unset('advanced-open-file.helmDirSwitch');
        atom.config.unset('advanced-open-file.defaultInputValue');
    }

    function fileExists(path) {
        try {
            _fs2['default'].statSync(path);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
        }

        return true;
    }

    function isDirectory(path) {
        try {
            return _fs2['default'].statSync(path).isDirectory();
        } catch (err) {}

        return false;
    }

    function clickFile(filename) {
        ui.find('.list-item[data-file-name$=\'' + filename + '\']').click();
    }

    function assertAutocompletesTo(inputPath, autocompletedPath) {
        setPath(inputPath);
        dispatch('advanced-open-file:autocomplete');
        expect(currentPath()).toEqual(autocompletedPath);
    }

    describe('Modal dialog', function () {
        beforeEach(resetConfig);

        it('appears when the toggle command is triggered', function () {
            openModal();
            runs(function () {
                expect(getUI()).not.toBeNull();
            });
        });

        it('disappears if the toggle command is triggered while it is visible', function () {
            openModal();
            runs(function () {
                atom.commands.dispatch(workspaceElement, 'advanced-open-file:toggle');
                expect(getUI()).toBeNull();
            });
        });

        it('disappears if the cancel command is triggered while it is visible', function () {
            openModal();
            runs(function () {
                dispatch('core:cancel');
                expect(getUI()).toBeNull();
            });
        });

        it('disappears if the user clicks outside of the modal', function () {
            openModal();
            runs(function () {
                ui.parent().click();
                expect(getUI()).toBeNull();
            });
        });
    });

    describe('Path listing', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('lists the directory contents if the path ends in a separator', function () {
            setPath(fixturePath() + _path2['default'].sep);

            // Also includes the parent directory and is sorted alphabetically
            // grouped by directories and files.
            expect(currentPathList()).toEqual(['..', 'examples', 'prefix_match.js', 'prefix_other_match.js', 'sample.js']);
        });

        it('lists matching files if the path doesn\'t end in a separator', function () {
            setPath(fixturePath('prefix'));

            // Also shouldn't include the parent.
            expect(currentPathList()).toEqual(['prefix_match.js', 'prefix_other_match.js']);
        });

        it('excludes files that don\'t have a prefix matching the fragment', function () {
            setPath(fixturePath('prefix_match'));
            expect(currentPathList()).toEqual(['prefix_match.js']);
        });

        it('considers relative paths to be relative to the project root', function () {
            atom.project.setPaths([fixturePath()]);
            setPath(_path2['default'].join('examples', 'subdir') + _path2['default'].sep);
            expect(currentPathList()).toEqual(['..', 'subsample.js']);
        });

        it('automatically updates when the path changes', function () {
            setPath(fixturePath('prefix'));
            expect(currentPathList()).toEqual(['prefix_match.js', 'prefix_other_match.js']);

            setPath(fixturePath('prefix_match'));
            expect(currentPathList()).toEqual(['prefix_match.js']);
        });

        it('matches files case-insensitively unless the fragment contains a\n            capital', function () {
            setPath(fixturePath('examples', 'caseSensitive', 'prefix_match'));
            expect(currentPathList()).toEqual(['prefix_match_lower.js', 'prefix_Match_upper.js']);

            setPath(fixturePath('examples', 'caseSensitive', 'prefix_Match'));
            expect(currentPathList()).toEqual(['prefix_Match_upper.js']);
        });

        it('shows a button next to folders that can be clicked to add them as\n            project folders', function () {
            atom.project.setPaths([]);
            setPath(fixturePath() + path.sep);

            var exampleListItem = ui.find('.list-item[data-file-name$=\'examples\']');
            var addProjectFolderButton = exampleListItem.find('.add-project-folder');
            expect(addProjectFolderButton.length).toEqual(1);

            addProjectFolderButton.click();
            expect(atom.project.getPaths()).toEqual([fixturePath('examples')]);

            // Do not open folder when clicking.
            expect(currentPath()).toEqual(fixturePath() + path.sep);

            // Remove button when clicked.
            addProjectFolderButton = ui.find('.list-item[data-file-name$=\'examples\'] .add-project-folder');
            expect(addProjectFolderButton.length).toEqual(0);
        });

        it('does not show the add-project-folder button for folders that are\n            already project folders', function () {
            atom.project.setPaths([fixturePath('examples')]);
            setPath(fixturePath() + path.sep);

            var exampleListItem = ui.find('.list-item[data-file-name$=\'examples\']');
            var addProjectFolderButton = exampleListItem.find('.add-project-folder');
            expect(addProjectFolderButton.length).toEqual(0);
        });

        it('expands tildes at the start to the user\'s home directory', function () {
            spyOn(_osenv2['default'], 'home').andReturn(fixturePath());
            setPath(_path2['default'].join('~', 'examples', 'subdir') + _path2['default'].sep);

            expect(currentPathList()).toEqual(['..', 'subsample.js']);
        });
    });

    describe('Path input', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('can autocomplete the current input', function () {
            assertAutocompletesTo(fixturePath('prefix_ma'), fixturePath('prefix_match.js'));
        });

        it('can autocomplete the shared parts between two matching paths', function () {
            assertAutocompletesTo(fixturePath('pre'), fixturePath('prefix_'));
        });

        it('inserts a trailing separator when autocompleting a directory', function () {
            assertAutocompletesTo(fixturePath('exam'), fixturePath('examples') + _path2['default'].sep);
        });

        it('beeps if autocomplete finds no matchs', function () {
            spyOn(atom, 'beep');
            setPath(fixturePath('does_not_exist'));

            dispatch('advanced-open-file:autocomplete');
            expect(currentPath()).toEqual(fixturePath('does_not_exist'));
            expect(atom.beep).toHaveBeenCalled();
        });

        it('beeps if autocomplete cannot autocomplete any more shared parts', function () {
            spyOn(atom, 'beep');
            setPath(fixturePath('prefix_'));

            dispatch('advanced-open-file:autocomplete');
            expect(currentPath()).toEqual(fixturePath('prefix_'));
            expect(atom.beep).toHaveBeenCalled();
        });

        it('is case-sensitive during autocomplete if the fragment has a capital\n            letter', function () {
            setPath(fixturePath('examples', 'caseSensitive', 'prefix_m'));
            dispatch('advanced-open-file:autocomplete');
            expect(currentPath()).toEqual(fixturePath('examples', 'caseSensitive', 'prefix_match_'));

            setPath(fixturePath('examples', 'caseSensitive', 'prefix_M'));
            dispatch('advanced-open-file:autocomplete');
            expect(currentPath()).toEqual(fixturePath('examples', 'caseSensitive', 'prefix_Match_upper.js'));
        });

        it('can autocomplete when the path listing contains two paths where\n            one path is the prefix of another', function () {
            // The example has `planning` and `planning_backend`. The bug arises
            // because the entire `planning` path is a prefix of the other.
            assertAutocompletesTo(fixturePath('examples', 'matchPrefix', 'plan'), fixturePath('examples', 'matchPrefix', 'planning'));
        });

        it('fixes the case of letters in the fragment if necessary', function () {
            assertAutocompletesTo(fixturePath('examples', 'caseSensitive', 'prefix_match_up'), fixturePath('examples', 'caseSensitive', 'prefix_Match_upper.js'));
        });

        it('can remove the current path component', function () {
            setPath(fixturePath('fragment'));
            dispatch('advanced-open-file:delete-path-component');

            // Leaves trailing slash, as well.
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
        });

        it('removes the parent directory when removing a path component with no\n            fragment', function () {
            setPath(fixturePath('subdir') + _path2['default'].sep);
            dispatch('advanced-open-file:delete-path-component');
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
        });

        it('can switch to the user\'s home directory using a shortcut', function () {
            atom.config.set('advanced-open-file.helmDirSwitch', true);
            setPath(fixturePath('subdir') + _path2['default'].sep + '~' + _path2['default'].sep);
            expect(currentPath()).toEqual(_osenv2['default'].home() + _path2['default'].sep);

            // Also test when the rest of the path is empty.
            setPath('~' + _path2['default'].sep);
            expect(currentPath()).toEqual(_osenv2['default'].home() + _path2['default'].sep);
        });

        it('can switch to the filesystem root using a shortcut', function () {
            // For cross-platformness, we cheat by using Path. Oh well.
            var fsRoot = new _libModels.Path(fixturePath('subdir')).root().full;

            atom.config.set('advanced-open-file.helmDirSwitch', true);
            setPath(fixturePath('subdir') + _path2['default'].sep + _path2['default'].sep);
            expect(currentPath()).toEqual(fsRoot);

            // When the rest of path is empty, some platforms (Windows mainly)
            // can't infer a drive letter, so we can't use fsRoot from above.
            // Instead, we'll use the root of the path we're testing.
            fsRoot = new _libModels.Path(_path2['default'].sep + _path2['default'].sep).root().full;

            // Also test when the rest of the path is empty.
            setPath(_path2['default'].sep + _path2['default'].sep);
            expect(currentPath()).toEqual(fsRoot);
        });

        it('can switch to the project root directory using a shortcut', function () {
            atom.config.set('advanced-open-file.helmDirSwitch', true);
            atom.project.setPaths([fixturePath('examples')]);
            setPath(fixturePath('subdir') + _path2['default'].sep + ':' + _path2['default'].sep);
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);

            // Also test when the rest of the path is empty.
            setPath(':' + _path2['default'].sep);
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
        });

        it('does not reset the cursor position while typing', function () {
            setPath(fixturePath('subdir'));

            // Set cursor to be between the d and i in subdir.
            var end = pathEditor.getCursorBufferPosition();
            pathEditor.setCursorBufferPosition([end.row, end.column - 2]);

            // Insert a new letter and check that the cursor is after it but
            // not at the end of the editor completely.
            pathEditor.insertText('a');
            var newEnd = pathEditor.getCursorBufferPosition();
            expect(newEnd.column).toEqual(end.column - 1);
        });
    });

    describe('Path input default value', function () {
        beforeEach(resetConfig);

        it('can be configured to be the current file\'s directory', function () {
            atom.config.set('advanced-open-file.defaultInputValue', _libConfig.DEFAULT_ACTIVE_FILE_DIR);
            waitsForPromise(function () {
                return atom.workspace.open(fixturePath('sample.js')).then(function () {
                    openModal();
                });
            });

            runs(function () {
                expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
            });
        });

        it('can be configured to be the current project root', function () {
            atom.config.set('advanced-open-file.defaultInputValue', _libConfig.DEFAULT_PROJECT_ROOT);
            atom.project.setPaths([fixturePath('examples')]);
            openModal();

            runs(function () {
                expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
            });
        });

        it('can be configured to be blank', function () {
            atom.config.set('advanced-open-file.defaultInputValue', _libConfig.DEFAULT_EMPTY);
            openModal();

            runs(function () {
                expect(currentPath()).toEqual('');
            });
        });
    });

    describe('Undo', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('can undo tab completion', function () {
            setPath(fixturePath('exam'));
            dispatch('advanced-open-file:autocomplete');
            expect(currentPath()).toEqual(fixturePath('examples') + path.sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath('exam'));
        });

        it('can undo deleting path components', function () {
            setPath(fixturePath('exam'));
            dispatch('advanced-open-file:delete-path-component');
            expect(currentPath()).toEqual(fixturePath() + path.sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath('exam'));
        });

        it('can undo clicking a folder', function () {
            setPath(fixturePath() + path.sep);
            clickFile('examples');
            expect(currentPath()).toEqual(fixturePath('examples') + path.sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath() + path.sep);
        });

        it('beeps when it cannot undo any farther', function () {
            spyOn(atom, 'beep');
            dispatch('advanced-open-file:undo');
            expect(atom.beep).toHaveBeenCalled();
        });
    });

    describe('Opening files', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('opens an existing file if the current path points to one', function () {
            var path = fixturePath('sample.js');
            setPath(path);
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([path]);
            });
        });

        it('replaces the path when attempting to open an existing directory', function () {
            setPath(fixturePath('examples'));
            dispatch('core:confirm');
            expect(currentPath()).toEqual(fixturePath('examples') + path.sep);
        });

        it('beeps when attempting to open a path ending in a separator (a\n            non-existant directory)', function () {
            spyOn(atom, 'beep');
            setPath(fixturePath('notthere') + _path2['default'].sep);
            dispatch('core:confirm');
            expect(atom.beep).toHaveBeenCalled();
        });

        it('creates the directory when opening a path ending a separator if\n            configured', function () {
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var path = _path2['default'].join(tempDir, 'newdir') + _path2['default'].sep;
            atom.config.set('advanced-open-file.createDirectories', true);
            setPath(path);
            expect(isDirectory(path)).toEqual(false);

            dispatch('core:confirm');
            expect(isDirectory(path)).toEqual(true);
        });

        it('opens a new file without saving it if opening a non-existant path', function () {
            var path = fixturePath('does.not.exist');
            setPath(path);
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([path]);
                expect(fileExists(path)).toEqual(false);
            });
        });

        it('creates a new file when configured to', function () {
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var path = _path2['default'].join(tempDir, 'newfile.js');
            atom.config.set('advanced-open-file.createFileInstantly', true);
            setPath(path);
            expect(fileExists(path)).toEqual(false);

            dispatch('core:confirm');
            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([path]);
                expect(fileExists(path)).toEqual(true);
            });
        });

        it('creates intermediate directories when necessary', function () {
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var newDir = _path2['default'].join(tempDir, 'newDir');
            var path = _path2['default'].join(newDir, 'newFile.js');
            setPath(path);
            expect(fileExists(newDir)).toEqual(false);

            dispatch('core:confirm');
            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([path]);
                expect(fileExists(newDir)).toEqual(true);
            });
        });

        it('can create files from relative paths', function () {
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var path = _path2['default'].join('newDir', 'newFile.js');
            var absolutePath = _path2['default'].join(tempDir, path);

            atom.project.setPaths([tempDir]);
            atom.config.set('advanced-open-file.createFileInstantly', true);

            setPath(path);
            expect(fileExists(absolutePath)).toEqual(false);

            dispatch('core:confirm');
            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([absolutePath]);
                expect(fileExists(absolutePath)).toEqual(true);
            });
        });

        it('can open files from tilde-prefixed paths', function () {
            spyOn(_osenv2['default'], 'home').andReturn(fixturePath());
            setPath(_path2['default'].join('~', 'examples', 'subdir', 'subsample.js'));

            dispatch('core:confirm');
            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('examples', 'subdir', 'subsample.js')]);
            });
        });

        it('can open files in new split panes', function () {
            atom.workspace.open(fixturePath('sample.js'));
            expect(atom.workspace.getPanes().length).toEqual(1);

            setPath(fixturePath('prefix_match.js'));
            dispatch('pane:split-left');

            waitsForOpenPaths(2);
            runs(function () {
                expect(new Set(currentEditorPaths())).toEqual(new Set([fixturePath('sample.js'), fixturePath('prefix_match.js')]));
                expect(atom.workspace.getPanes().length).toEqual(2);
            });
        });

        it('shows an error notification when creating a subdirectory throws an\n            error', function () {
            debugger;
            spyOn(atom.notifications, 'addError');
            spyOn(_mkdirp2['default'], 'sync').andCallFake(function () {
                throw new Error('OH NO');
            });
            setPath(fixturePath('examples', 'noPermission', 'subdir', 'file.txt'));
            dispatch('core:confirm');
            expect(atom.notifications.addError).toHaveBeenCalled();
        });

        it('shows an error notification when creating a file in a directory\n            throws an error', function () {
            spyOn(atom.notifications, 'addError');
            spyOn(_touch2['default'], 'sync').andCallFake(function () {
                throw new Error('OH NO');
            });
            atom.config.set('advanced-open-file.createFileInstantly', true);

            setPath(fixturePath('examples', 'noPermission', 'file.txt'));
            dispatch('core:confirm');
            expect(atom.notifications.addError).toHaveBeenCalled();
        });
    });

    describe('Keyboard navigation', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        /*
            For reference, expected listing in fixtures is:
            ..
            examples
            prefix_match.js
            prefix_other_match.js
            sample.js
        */

        function moveDown(times) {
            for (var k = 0; k < times; k++) {
                dispatch('advanced-open-file:move-cursor-down');
            }
        }

        function moveUp(times) {
            for (var k = 0; k < times; k++) {
                dispatch('advanced-open-file:move-cursor-up');
            }
        }

        it('allows moving a cursor to a file and confirming to select a path', function () {
            setPath(fixturePath() + _path2['default'].sep);
            moveDown(4);
            moveUp(1); // Test movement both down and up.
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('prefix_match.js')]);
            });
        });

        it('wraps the cursor at the edges', function () {
            setPath(fixturePath() + _path2['default'].sep);
            moveUp(2);
            moveDown(4);
            moveUp(5);
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('prefix_match.js')]);
            });
        });

        it('replaces the current path when selecting a directory', function () {
            setPath(fixturePath() + path.sep);
            moveDown(2);
            dispatch('core:confirm');
            expect(currentPath()).toEqual(fixturePath('examples') + path.sep);
        });

        it('moves to the parent directory when the .. element is selected', function () {
            setPath(fixturePath('examples') + path.sep);
            moveDown(1);
            dispatch('core:confirm');
            expect(currentPath()).toEqual(fixturePath() + path.sep);
        });

        it('can add folders as project directories using a keyboard command', function () {
            atom.project.setPaths([]);
            setPath(fixturePath() + path.sep);
            moveDown(2); // examples folder
            dispatch('application:add-project-folder');
            expect(atom.project.getPaths()).toEqual([fixturePath('examples')]);
        });

        it('beeps when trying to add the parent folder as a project directory', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([]);

            setPath(fixturePath() + path.sep);
            moveDown(1); // Parent folder
            dispatch('application:add-project-folder');

            expect(atom.beep).toHaveBeenCalled();
            expect(atom.project.getPaths()).toEqual([]);
        });

        it('beeps when trying to add a file as a project directory', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([]);

            setPath(fixturePath() + path.sep);
            moveDown(3); // prefix_match.js
            dispatch('application:add-project-folder');

            expect(atom.beep).toHaveBeenCalled();
            expect(atom.project.getPaths()).toEqual([]);
        });

        it('beeps when trying to add a folder as a project directory that is\n                already one', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([fixturePath('examples')]);

            setPath(fixturePath() + path.sep);
            moveDown(2); // examples folder
            dispatch('application:add-project-folder');

            expect(atom.beep).toHaveBeenCalled();
            expect(atom.project.getPaths()).toEqual([fixturePath('examples')]);
        });

        it('can select the first item in the list if none are selected using\n            special command', function () {
            setPath(fixturePath('prefix'));
            dispatch('advanced-open-file:confirm-selected-or-first');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('prefix_match.js')]);
            });
        });
    });

    describe('Mouse navigation', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('opens a path when it is clicked on', function () {
            setPath(fixturePath() + _path2['default'].sep);
            clickFile('sample.js');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('sample.js')]);
            });
        });

        it('replaces the current path when clicking a directory', function () {
            setPath(fixturePath() + path.sep);
            clickFile('examples');
            expect(currentPath()).toEqual(fixturePath('examples') + path.sep);
        });

        it('moves to the parent directory when the .. element is clicked', function () {
            setPath(fixturePath('examples') + path.sep);
            ui.find('.parent-directory').click();
            expect(currentPath()).toEqual(fixturePath() + path.sep);
        });
    });

    describe('Events', function () {
        beforeEach(resetConfig);
        beforeEach(openModal);

        it('allows subscription to events when paths are opened', function () {
            var handler = jasmine.createSpy('handler');
            var sub = (0, _libAdvancedOpenFile.provideEventService)().onDidOpenPath(handler);
            var path = fixturePath('sample.js');

            setPath(path);
            dispatch('core:confirm');
            expect(handler).toHaveBeenCalledWith(path);
            sub.dispose();
        });

        it('allows subscription to events when paths are created', function () {
            atom.config.set('advanced-open-file.createFileInstantly', true);
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var path = _path2['default'].join(tempDir, 'newfile.js');
            var handler = jasmine.createSpy('handler');
            var sub = (0, _libAdvancedOpenFile.provideEventService)().onDidCreatePath(handler);

            setPath(path);
            dispatch('core:confirm');
            expect(handler).toHaveBeenCalledWith(path);
            sub.dispose();
        });

        it('emits the create event when creating a directory', function () {
            atom.config.set('advanced-open-file.createDirectories', true);
            var tempDir = _fs2['default'].realpathSync(_temp2['default'].mkdirSync());
            var path = _path2['default'].join(tempDir, 'newdir') + _path2['default'].sep;
            var handler = jasmine.createSpy('handler');
            var sub = (0, _libAdvancedOpenFile.provideEventService)().onDidCreatePath(handler);

            setPath(path);
            dispatch('core:confirm');
            expect(handler).toHaveBeenCalledWith(new _libModels.Path(path).absolute);
            sub.dispose();
        });
    });

    // Only run Windows-specific tests when enabled.
    var windowsDescribe = process.env.AOF_WINDOWS_TESTS ? describe : xdescribe;
    windowsDescribe('Windows-specific tests', function () {
        // Just as a note, we're assuming C:\ exists and is the root
        // system drive. It is on AppVeyor, and that's good enough.

        it('can read the root directory without failing', function () {
            // This potentially fails because we stat in-use files like
            // pagefile.sys.
            expect(function () {
                setPath('C:\\');
            }).not.toThrow();
        });

        it('does not replace drive letters with the project root', function () {
            atom.project.setPaths([fixturePath()]);
            setPath('C:/');
            expect(currentPath()).toEqual('C:/');
        });
    });

    describe('Fuzzy filename matching', function () {
        beforeEach(resetConfig);
        beforeEach(function () {
            atom.config.set('advanced-open-file.fuzzyMatch', true);
        });
        beforeEach(openModal);

        it('lists files and folders as normal when no fragment is being matched', function () {
            setPath(fixturePath() + _path2['default'].sep);

            expect(currentPathList()).toEqual(['..', 'examples', 'prefix_match.js', 'prefix_other_match.js', 'sample.js']);
        });

        it('uses a fuzzy algorithm for matching files instead of prefix matching', function () {
            setPath(fixturePath('ix'));

            expect(currentPathList()).toEqual(['prefix_match.js', 'prefix_other_match.js']);
        });

        it('sorts matches by weight instead of by name', function () {
            setPath(fixturePath('examples', 'fuzzyWeight', 'heavy_'));

            expect(currentPathList()).toEqual(['more_heavy_heavy.js', 'less_heavy.js']);
        });

        it('chooses the first match for autocomplete when nothing is highlighted', function () {
            assertAutocompletesTo(fixturePath('ix'), fixturePath('prefix_match.js'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL3NwZWMvYWR2YW5jZWQtb3Blbi1maWxlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztrQkFDZSxJQUFJOzs7O29CQUNDLE1BQU07Ozs7b0JBQ1QsTUFBTTs7OztzQkFFVCxRQUFROzs7O3NCQUNILFFBQVE7Ozs7cUJBQ1QsT0FBTzs7OztxQkFDUCxPQUFPOzs7O21DQUVTLDJCQUEyQjs7eUJBS3RELGVBQWU7O3lCQUNILGVBQWU7O0FBYlQsa0JBQUssS0FBSyxFQUFFLENBQUM7O0FBZ0J0QyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUMvQixRQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM1QixRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDZCxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXRCLGNBQVUsQ0FBQyxZQUFNO0FBQ2Isd0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELGVBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FBR3RDLFlBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTttQkFBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQUEsQ0FBQyxDQUFDOztBQUU1RCx5QkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzNFLENBQUMsQ0FBQzs7QUFFSCxhQUFTLEtBQUssR0FBRztBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDaEU7O0FBRUQsYUFBUyxXQUFXLEdBQVc7MENBQVAsS0FBSztBQUFMLGlCQUFL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LENBQUMsQ0FBQyIsImZpbGUiOiIvaG9tZS9hbmlydWRoLy5hdG9tL3BhY2thZ2VzL2FkdmFuY2VkLW9wZW4tZmlsZS9zcGVjL2FkdmFuY2VkLW9wZW4tZmlsZS1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBzdGRQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7IHRlbXAudHJhY2soKTtcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJztcbmltcG9ydCBvc2VudiBmcm9tICdvc2Vudic7XG5pbXBvcnQgdG91Y2ggZnJvbSAndG91Y2gnO1xuXG5pbXBvcnQge3Byb3ZpZGVFdmVudFNlcnZpY2V9IGZyb20gJy4uL2xpYi9hZHZhbmNlZC1vcGVuLWZpbGUnO1xuaW1wb3J0IHtcbiAgICBERUZBVUxUX0FDVElWRV9GSUxFX0RJUixcbiAgICBERUZBVUxUX0VNUFRZLFxuICAgIERFRkFVTFRfUFJPSkVDVF9ST09UXG59IGZyb20gJy4uL2xpYi9jb25maWcnO1xuaW1wb3J0IHtQYXRofSBmcm9tICcuLi9saWIvbW9kZWxzJztcblxuXG5kZXNjcmliZSgnRnVuY3Rpb25hbCB0ZXN0cycsICgpID0+IHtcbiAgICBsZXQgd29ya3NwYWNlRWxlbWVudCA9IG51bGw7XG4gICAgbGV0IGFjdGl2YXRpb25Qcm9taXNlID0gbnVsbDtcbiAgICBsZXQgdWkgPSBudWxsO1xuICAgIGxldCBwYXRoRWRpdG9yID0gbnVsbDtcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcblxuICAgICAgICAvLyBDbGVhciBvdXQgYW55IGxlZnRvdmVyIHBhbmVzLlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpLmZvckVhY2goKHBhbmUpID0+IHBhbmUuZGVzdHJveSgpKTtcblxuICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZSA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhZHZhbmNlZC1vcGVuLWZpbGUnKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGdldFVJKCkge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYWR2YW5jZWQtb3Blbi1maWxlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZml4dHVyZVBhdGgoLi4ucGFydHMpIHtcbiAgICAgICAgcmV0dXJuIHN0ZFBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycsIC4uLnBhcnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRQYXRoKG5ld1BhdGgpIHtcbiAgICAgICAgcGF0aEVkaXRvci5zZXRUZXh0KG5ld1BhdGgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnRQYXRoKCkge1xuICAgICAgICByZXR1cm4gcGF0aEVkaXRvci5nZXRUZXh0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2goY29tbWFuZCkge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHVpWzBdLCBjb21tYW5kKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXJyZW50UGF0aExpc3QoKSB7XG4gICAgICAgIHJldHVybiB1aS5maW5kKCcubGlzdC1pdGVtOm5vdCguaGlkZGVuKScpXG4gICAgICAgICAgICAgICAgIC5tYXAoKGksIGl0ZW0pID0+ICQoaXRlbSkudGV4dCgpLnRyaW0oKSlcbiAgICAgICAgICAgICAgICAgLmdldCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnRFZGl0b3JQYXRocygpIHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkubWFwKChlZGl0b3IpID0+IGVkaXRvci5nZXRQYXRoKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhaXRzRm9yT3BlblBhdGhzKGNvdW50LCB0aW1lb3V0PTIwMDApIHtcbiAgICAgICAgd2FpdHNGb3IoXG4gICAgICAgICAgICAoKSA9PiBjdXJyZW50RWRpdG9yUGF0aHMoKS5sZW5ndGggPj0gY291bnQsXG4gICAgICAgICAgICBgJHtjb3VudH0gcGF0aHMgdG8gYmUgb3BlbmVkYCxcbiAgICAgICAgICAgIHRpbWVvdXRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcGVuTW9kYWwoKSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2FkdmFuY2VkLW9wZW4tZmlsZTp0b2dnbGUnKTtcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhY3RpdmF0aW9uUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB1aSA9ICQoZ2V0VUkoKSk7XG4gICAgICAgICAgICAgICAgcGF0aEVkaXRvciA9IHVpLmZpbmQoJy5wYXRoLWlucHV0JylbMF0uZ2V0TW9kZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldENvbmZpZygpIHtcbiAgICAgICAgYXRvbS5jb25maWcudW5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVGaWxlSW5zdGFudGx5Jyk7XG4gICAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuaGVsbURpclN3aXRjaCcpO1xuICAgICAgICBhdG9tLmNvbmZpZy51bnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmRlZmF1bHRJbnB1dFZhbHVlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlsZUV4aXN0cyhwYXRoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmcy5zdGF0U3luYyhwYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEaXJlY3RvcnkocGF0aCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGZzLnN0YXRTeW5jKHBhdGgpLmlzRGlyZWN0b3J5KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge31cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2tGaWxlKGZpbGVuYW1lKSB7XG4gICAgICAgIHVpLmZpbmQoYC5saXN0LWl0ZW1bZGF0YS1maWxlLW5hbWUkPScke2ZpbGVuYW1lfSddYCkuY2xpY2soKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3NlcnRBdXRvY29tcGxldGVzVG8oaW5wdXRQYXRoLCBhdXRvY29tcGxldGVkUGF0aCkge1xuICAgICAgICBzZXRQYXRoKGlucHV0UGF0aCk7XG4gICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGF1dG9jb21wbGV0ZWRQYXRoKTtcbiAgICB9XG5cbiAgICBkZXNjcmliZSgnTW9kYWwgZGlhbG9nJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcblxuICAgICAgICBpdCgnYXBwZWFycyB3aGVuIHRoZSB0b2dnbGUgY29tbWFuZCBpcyB0cmlnZ2VyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKVxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGdldFVJKCkpLm5vdC50b0JlTnVsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkaXNhcHBlYXJzIGlmIHRoZSB0b2dnbGUgY29tbWFuZCBpcyB0cmlnZ2VyZWQgd2hpbGUgaXQgaXMgdmlzaWJsZScsICgpID0+IHtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYWR2YW5jZWQtb3Blbi1maWxlOnRvZ2dsZScpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChnZXRVSSgpKS50b0JlTnVsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkaXNhcHBlYXJzIGlmIHRoZSBjYW5jZWwgY29tbWFuZCBpcyB0cmlnZ2VyZWQgd2hpbGUgaXQgaXMgdmlzaWJsZScsICgpID0+IHtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y2FuY2VsJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGdldFVJKCkpLnRvQmVOdWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2Rpc2FwcGVhcnMgaWYgdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIG1vZGFsJywgKCkgPT4ge1xuICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICB1aS5wYXJlbnQoKS5jbGljaygpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChnZXRVSSgpKS50b0JlTnVsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhdGggbGlzdGluZycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnbGlzdHMgdGhlIGRpcmVjdG9yeSBjb250ZW50cyBpZiB0aGUgcGF0aCBlbmRzIGluIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuXG4gICAgICAgICAgICAvLyBBbHNvIGluY2x1ZGVzIHRoZSBwYXJlbnQgZGlyZWN0b3J5IGFuZCBpcyBzb3J0ZWQgYWxwaGFiZXRpY2FsbHlcbiAgICAgICAgICAgIC8vIGdyb3VwZWQgYnkgZGlyZWN0b3JpZXMgYW5kIGZpbGVzLlxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAnLi4nLFxuICAgICAgICAgICAgICAgICdleGFtcGxlcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9vdGhlcl9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3NhbXBsZS5qcydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnbGlzdHMgbWF0Y2hpbmcgZmlsZXMgaWYgdGhlIHBhdGggZG9lc25cXCd0IGVuZCBpbiBhIHNlcGFyYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeCcpKTtcblxuICAgICAgICAgICAgLy8gQWxzbyBzaG91bGRuJ3QgaW5jbHVkZSB0aGUgcGFyZW50LlxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X290aGVyX21hdGNoLmpzJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdleGNsdWRlcyBmaWxlcyB0aGF0IGRvblxcJ3QgaGF2ZSBhIHByZWZpeCBtYXRjaGluZyB0aGUgZnJhZ21lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2gnKSk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoWydwcmVmaXhfbWF0Y2guanMnXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjb25zaWRlcnMgcmVsYXRpdmUgcGF0aHMgdG8gYmUgcmVsYXRpdmUgdG8gdGhlIHByb2plY3Qgcm9vdCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoKV0pO1xuICAgICAgICAgICAgc2V0UGF0aChzdGRQYXRoLmpvaW4oJ2V4YW1wbGVzJywgJ3N1YmRpcicpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFsnLi4nLCAnc3Vic2FtcGxlLmpzJ10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYXV0b21hdGljYWxseSB1cGRhdGVzIHdoZW4gdGhlIHBhdGggY2hhbmdlcycsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9vdGhlcl9tYXRjaC5qcydcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2gnKSk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoWydwcmVmaXhfbWF0Y2guanMnXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBtYXRjaGVzIGZpbGVzIGNhc2UtaW5zZW5zaXRpdmVseSB1bmxlc3MgdGhlIGZyYWdtZW50IGNvbnRhaW5zIGFcbiAgICAgICAgICAgIGNhcGl0YWxgLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9tYXRjaCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaF9sb3dlci5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9NYXRjaF91cHBlci5qcydcbiAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9NYXRjaCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbJ3ByZWZpeF9NYXRjaF91cHBlci5qcyddKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYHNob3dzIGEgYnV0dG9uIG5leHQgdG8gZm9sZGVycyB0aGF0IGNhbiBiZSBjbGlja2VkIHRvIGFkZCB0aGVtIGFzXG4gICAgICAgICAgICBwcm9qZWN0IGZvbGRlcnNgLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW10pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuXG4gICAgICAgICAgICBsZXQgZXhhbXBsZUxpc3RJdGVtID0gdWkuZmluZCgnLmxpc3QtaXRlbVtkYXRhLWZpbGUtbmFtZSQ9XFwnZXhhbXBsZXNcXCddJyk7XG4gICAgICAgICAgICBsZXQgYWRkUHJvamVjdEZvbGRlckJ1dHRvbiA9IGV4YW1wbGVMaXN0SXRlbS5maW5kKCcuYWRkLXByb2plY3QtZm9sZGVyJyk7XG4gICAgICAgICAgICBleHBlY3QoYWRkUHJvamVjdEZvbGRlckJ1dHRvbi5sZW5ndGgpLnRvRXF1YWwoMSk7XG5cbiAgICAgICAgICAgIGFkZFByb2plY3RGb2xkZXJCdXR0b24uY2xpY2soKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcblxuICAgICAgICAgICAgLy8gRG8gbm90IG9wZW4gZm9sZGVyIHdoZW4gY2xpY2tpbmcuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYnV0dG9uIHdoZW4gY2xpY2tlZC5cbiAgICAgICAgICAgIGFkZFByb2plY3RGb2xkZXJCdXR0b24gPSB1aS5maW5kKFxuICAgICAgICAgICAgICAgICcubGlzdC1pdGVtW2RhdGEtZmlsZS1uYW1lJD1cXCdleGFtcGxlc1xcJ10gLmFkZC1wcm9qZWN0LWZvbGRlcidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBleHBlY3QoYWRkUHJvamVjdEZvbGRlckJ1dHRvbi5sZW5ndGgpLnRvRXF1YWwoMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBkb2VzIG5vdCBzaG93IHRoZSBhZGQtcHJvamVjdC1mb2xkZXIgYnV0dG9uIGZvciBmb2xkZXJzIHRoYXQgYXJlXG4gICAgICAgICAgICBhbHJlYWR5IHByb2plY3QgZm9sZGVyc2AsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcblxuICAgICAgICAgICAgbGV0IGV4YW1wbGVMaXN0SXRlbSA9IHVpLmZpbmQoJy5saXN0LWl0ZW1bZGF0YS1maWxlLW5hbWUkPVxcJ2V4YW1wbGVzXFwnXScpO1xuICAgICAgICAgICAgbGV0IGFkZFByb2plY3RGb2xkZXJCdXR0b24gPSBleGFtcGxlTGlzdEl0ZW0uZmluZCgnLmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFkZFByb2plY3RGb2xkZXJCdXR0b24ubGVuZ3RoKS50b0VxdWFsKDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZXhwYW5kcyB0aWxkZXMgYXQgdGhlIHN0YXJ0IHRvIHRoZSB1c2VyXFwncyBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKG9zZW52LCAnaG9tZScpLmFuZFJldHVybihmaXh0dXJlUGF0aCgpKTtcbiAgICAgICAgICAgIHNldFBhdGgoc3RkUGF0aC5qb2luKCd+JywgJ2V4YW1wbGVzJywgJ3N1YmRpcicpICsgc3RkUGF0aC5zZXApO1xuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoWycuLicsICdzdWJzYW1wbGUuanMnXSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhdGggaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ2NhbiBhdXRvY29tcGxldGUgdGhlIGN1cnJlbnQgaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZWZpeF9tYScpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBhdXRvY29tcGxldGUgdGhlIHNoYXJlZCBwYXJ0cyBiZXR3ZWVuIHR3byBtYXRjaGluZyBwYXRocycsICgpID0+IHtcbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlJyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZWZpeF8nKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2luc2VydHMgYSB0cmFpbGluZyBzZXBhcmF0b3Igd2hlbiBhdXRvY29tcGxldGluZyBhIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbScpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdiZWVwcyBpZiBhdXRvY29tcGxldGUgZmluZHMgbm8gbWF0Y2hzJywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2RvZXNfbm90X2V4aXN0JykpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2RvZXNfbm90X2V4aXN0JykpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYmVlcHMgaWYgYXV0b2NvbXBsZXRlIGNhbm5vdCBhdXRvY29tcGxldGUgYW55IG1vcmUgc2hhcmVkIHBhcnRzJywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeF8nKSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgncHJlZml4XycpKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGlzIGNhc2Utc2Vuc2l0aXZlIGR1cmluZyBhdXRvY29tcGxldGUgaWYgdGhlIGZyYWdtZW50IGhhcyBhIGNhcGl0YWxcbiAgICAgICAgICAgIGxldHRlcmAsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X20nKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X21hdGNoXycpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9NJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9NYXRjaF91cHBlci5qcycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgY2FuIGF1dG9jb21wbGV0ZSB3aGVuIHRoZSBwYXRoIGxpc3RpbmcgY29udGFpbnMgdHdvIHBhdGhzIHdoZXJlXG4gICAgICAgICAgICBvbmUgcGF0aCBpcyB0aGUgcHJlZml4IG9mIGFub3RoZXJgLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBUaGUgZXhhbXBsZSBoYXMgYHBsYW5uaW5nYCBhbmQgYHBsYW5uaW5nX2JhY2tlbmRgLiBUaGUgYnVnIGFyaXNlc1xuICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGUgZW50aXJlIGBwbGFubmluZ2AgcGF0aCBpcyBhIHByZWZpeCBvZiB0aGUgb3RoZXIuXG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ21hdGNoUHJlZml4JywgJ3BsYW4nKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbWF0Y2hQcmVmaXgnLCAncGxhbm5pbmcnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2ZpeGVzIHRoZSBjYXNlIG9mIGxldHRlcnMgaW4gdGhlIGZyYWdtZW50IGlmIG5lY2Vzc2FyeScsICgpID0+IHtcbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfbWF0Y2hfdXAnKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfTWF0Y2hfdXBwZXIuanMnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiByZW1vdmUgdGhlIGN1cnJlbnQgcGF0aCBjb21wb25lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdmcmFnbWVudCcpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6ZGVsZXRlLXBhdGgtY29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIC8vIExlYXZlcyB0cmFpbGluZyBzbGFzaCwgYXMgd2VsbC5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGByZW1vdmVzIHRoZSBwYXJlbnQgZGlyZWN0b3J5IHdoZW4gcmVtb3ZpbmcgYSBwYXRoIGNvbXBvbmVudCB3aXRoIG5vXG4gICAgICAgICAgICBmcmFnbWVudGAsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTpkZWxldGUtcGF0aC1jb21wb25lbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gc3dpdGNoIHRvIHRoZSB1c2VyXFwncyBob21lIGRpcmVjdG9yeSB1c2luZyBhIHNob3J0Y3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuaGVsbURpclN3aXRjaCcsIHRydWUpO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCArICd+JyArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKG9zZW52LmhvbWUoKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgLy8gQWxzbyB0ZXN0IHdoZW4gdGhlIHJlc3Qgb2YgdGhlIHBhdGggaXMgZW1wdHkuXG4gICAgICAgICAgICBzZXRQYXRoKCd+JyArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKG9zZW52LmhvbWUoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBzd2l0Y2ggdG8gdGhlIGZpbGVzeXN0ZW0gcm9vdCB1c2luZyBhIHNob3J0Y3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gRm9yIGNyb3NzLXBsYXRmb3JtbmVzcywgd2UgY2hlYXQgYnkgdXNpbmcgUGF0aC4gT2ggd2VsbC5cbiAgICAgICAgICAgIGxldCBmc1Jvb3QgPSBuZXcgUGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykpLnJvb3QoKS5mdWxsO1xuXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5oZWxtRGlyU3dpdGNoJywgdHJ1ZSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSArIHN0ZFBhdGguc2VwICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZnNSb290KTtcblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgcmVzdCBvZiBwYXRoIGlzIGVtcHR5LCBzb21lIHBsYXRmb3JtcyAoV2luZG93cyBtYWlubHkpXG4gICAgICAgICAgICAvLyBjYW4ndCBpbmZlciBhIGRyaXZlIGxldHRlciwgc28gd2UgY2FuJ3QgdXNlIGZzUm9vdCBmcm9tIGFib3ZlLlxuICAgICAgICAgICAgLy8gSW5zdGVhZCwgd2UnbGwgdXNlIHRoZSByb290IG9mIHRoZSBwYXRoIHdlJ3JlIHRlc3RpbmcuXG4gICAgICAgICAgICBmc1Jvb3QgPSBuZXcgUGF0aChzdGRQYXRoLnNlcCArIHN0ZFBhdGguc2VwKS5yb290KCkuZnVsbDtcblxuICAgICAgICAgICAgLy8gQWxzbyB0ZXN0IHdoZW4gdGhlIHJlc3Qgb2YgdGhlIHBhdGggaXMgZW1wdHkuXG4gICAgICAgICAgICBzZXRQYXRoKHN0ZFBhdGguc2VwICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZnNSb290KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBzd2l0Y2ggdG8gdGhlIHByb2plY3Qgcm9vdCBkaXJlY3RvcnkgdXNpbmcgYSBzaG9ydGN1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmhlbG1EaXJTd2l0Y2gnLCB0cnVlKTtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpICsgc3RkUGF0aC5zZXAgKyAnOicgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgLy8gQWxzbyB0ZXN0IHdoZW4gdGhlIHJlc3Qgb2YgdGhlIHBhdGggaXMgZW1wdHkuXG4gICAgICAgICAgICBzZXRQYXRoKCc6JyArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZG9lcyBub3QgcmVzZXQgdGhlIGN1cnNvciBwb3NpdGlvbiB3aGlsZSB0eXBpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSk7XG5cbiAgICAgICAgICAgIC8vIFNldCBjdXJzb3IgdG8gYmUgYmV0d2VlbiB0aGUgZCBhbmQgaSBpbiBzdWJkaXIuXG4gICAgICAgICAgICBsZXQgZW5kID0gcGF0aEVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgICAgcGF0aEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZW5kLnJvdywgZW5kLmNvbHVtbiAtIDJdKVxuXG4gICAgICAgICAgICAvLyBJbnNlcnQgYSBuZXcgbGV0dGVyIGFuZCBjaGVjayB0aGF0IHRoZSBjdXJzb3IgaXMgYWZ0ZXIgaXQgYnV0XG4gICAgICAgICAgICAvLyBub3QgYXQgdGhlIGVuZCBvZiB0aGUgZWRpdG9yIGNvbXBsZXRlbHkuXG4gICAgICAgICAgICBwYXRoRWRpdG9yLmluc2VydFRleHQoJ2EnKTtcbiAgICAgICAgICAgIGxldCBuZXdFbmQgPSBwYXRoRWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICBleHBlY3QobmV3RW5kLmNvbHVtbikudG9FcXVhbChlbmQuY29sdW1uIC0gMSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1BhdGggaW5wdXQgZGVmYXVsdCB2YWx1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG5cbiAgICAgICAgaXQoJ2NhbiBiZSBjb25maWd1cmVkIHRvIGJlIHRoZSBjdXJyZW50IGZpbGVcXCdzIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChcbiAgICAgICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlLmRlZmF1bHRJbnB1dFZhbHVlJyxcbiAgICAgICAgICAgICAgICBERUZBVUxUX0FDVElWRV9GSUxFX0RJUlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9wZW4oZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIGJlIGNvbmZpZ3VyZWQgdG8gYmUgdGhlIGN1cnJlbnQgcHJvamVjdCByb290JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KFxuICAgICAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGUuZGVmYXVsdElucHV0VmFsdWUnLFxuICAgICAgICAgICAgICAgICBERUZBVUxUX1BST0pFQ1RfUk9PVFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIGJlIGNvbmZpZ3VyZWQgdG8gYmUgYmxhbmsnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5kZWZhdWx0SW5wdXRWYWx1ZScsIERFRkFVTFRfRU1QVFkpO1xuICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKCcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdVbmRvJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdjYW4gdW5kbyB0YWIgY29tcGxldGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW0nKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOnVuZG8nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHVuZG8gZGVsZXRpbmcgcGF0aCBjb21wb25lbnRzJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbScpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6ZGVsZXRlLXBhdGgtY29tcG9uZW50Jyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTp1bmRvJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbScpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiB1bmRvIGNsaWNraW5nIGEgZm9sZGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgY2xpY2tGaWxlKCdleGFtcGxlcycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOnVuZG8nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdiZWVwcyB3aGVuIGl0IGNhbm5vdCB1bmRvIGFueSBmYXJ0aGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6dW5kbycpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdPcGVuaW5nIGZpbGVzJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdvcGVucyBhbiBleGlzdGluZyBmaWxlIGlmIHRoZSBjdXJyZW50IHBhdGggcG9pbnRzIHRvIG9uZScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXRoID0gZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpO1xuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW3BhdGhdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncmVwbGFjZXMgdGhlIHBhdGggd2hlbiBhdHRlbXB0aW5nIHRvIG9wZW4gYW4gZXhpc3RpbmcgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGJlZXBzIHdoZW4gYXR0ZW1wdGluZyB0byBvcGVuIGEgcGF0aCBlbmRpbmcgaW4gYSBzZXBhcmF0b3IgKGFcbiAgICAgICAgICAgIG5vbi1leGlzdGFudCBkaXJlY3RvcnkpYCwgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ25vdHRoZXJlJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBjcmVhdGVzIHRoZSBkaXJlY3Rvcnkgd2hlbiBvcGVuaW5nIGEgcGF0aCBlbmRpbmcgYSBzZXBhcmF0b3IgaWZcbiAgICAgICAgICAgIGNvbmZpZ3VyZWRgLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsICduZXdkaXInKSArIHN0ZFBhdGguc2VwO1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRGlyZWN0b3JpZXMnLCB0cnVlKTtcbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBleHBlY3QoaXNEaXJlY3RvcnkocGF0aCkpLnRvRXF1YWwoZmFsc2UpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoaXNEaXJlY3RvcnkocGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdvcGVucyBhIG5ldyBmaWxlIHdpdGhvdXQgc2F2aW5nIGl0IGlmIG9wZW5pbmcgYSBub24tZXhpc3RhbnQgcGF0aCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXRoID0gZml4dHVyZVBhdGgoJ2RvZXMubm90LmV4aXN0Jyk7XG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbcGF0aF0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKHBhdGgpKS50b0VxdWFsKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY3JlYXRlcyBhIG5ldyBmaWxlIHdoZW4gY29uZmlndXJlZCB0bycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4odGVtcERpciwgJ25ld2ZpbGUuanMnKTtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknLCB0cnVlKTtcbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhwYXRoKSkudG9FcXVhbChmYWxzZSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtwYXRoXSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMocGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgaW50ZXJtZWRpYXRlIGRpcmVjdG9yaWVzIHdoZW4gbmVjZXNzYXJ5JywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgbmV3RGlyID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsICduZXdEaXInKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKG5ld0RpciwgJ25ld0ZpbGUuanMnKTtcbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhuZXdEaXIpKS50b0VxdWFsKGZhbHNlKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW3BhdGhdKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhuZXdEaXIpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gY3JlYXRlIGZpbGVzIGZyb20gcmVsYXRpdmUgcGF0aHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKCduZXdEaXInLCAnbmV3RmlsZS5qcycpO1xuICAgICAgICAgICAgbGV0IGFic29sdXRlUGF0aCA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCBwYXRoKTtcblxuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wRGlyXSk7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVGaWxlSW5zdGFudGx5JywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhhYnNvbHV0ZVBhdGgpKS50b0VxdWFsKGZhbHNlKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2Fic29sdXRlUGF0aF0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKGFic29sdXRlUGF0aCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBvcGVuIGZpbGVzIGZyb20gdGlsZGUtcHJlZml4ZWQgcGF0aHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihvc2VudiwgJ2hvbWUnKS5hbmRSZXR1cm4oZml4dHVyZVBhdGgoKSk7XG4gICAgICAgICAgICBzZXRQYXRoKHN0ZFBhdGguam9pbignficsICdleGFtcGxlcycsICdzdWJkaXInLCAnc3Vic2FtcGxlLmpzJykpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdzdWJkaXInLCAnc3Vic2FtcGxlLmpzJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIG9wZW4gZmlsZXMgaW4gbmV3IHNwbGl0IHBhbmVzJywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJykpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkubGVuZ3RoKS50b0VxdWFsKDEpO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgncGFuZTpzcGxpdC1sZWZ0Jyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDIpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5ldyBTZXQoY3VycmVudEVkaXRvclBhdGhzKCkpKS50b0VxdWFsKG5ldyBTZXQoW1xuICAgICAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJyksXG4gICAgICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKSxcbiAgICAgICAgICAgICAgICBdKSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBzaG93cyBhbiBlcnJvciBub3RpZmljYXRpb24gd2hlbiBjcmVhdGluZyBhIHN1YmRpcmVjdG9yeSB0aHJvd3MgYW5cbiAgICAgICAgICAgIGVycm9yYCwgKCkgPT4ge1xuICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICBzcHlPbihhdG9tLm5vdGlmaWNhdGlvbnMsICdhZGRFcnJvcicpO1xuICAgICAgICAgICAgc3B5T24obWtkaXJwLCAnc3luYycpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09IIE5PJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ25vUGVybWlzc2lvbicsICdzdWJkaXInLCAnZmlsZS50eHQnKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBzaG93cyBhbiBlcnJvciBub3RpZmljYXRpb24gd2hlbiBjcmVhdGluZyBhIGZpbGUgaW4gYSBkaXJlY3RvcnlcbiAgICAgICAgICAgIHRocm93cyBhbiBlcnJvcmAsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20ubm90aWZpY2F0aW9ucywgJ2FkZEVycm9yJyk7XG4gICAgICAgICAgICBzcHlPbih0b3VjaCwgJ3N5bmMnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPSCBOTycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVGaWxlSW5zdGFudGx5JywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ25vUGVybWlzc2lvbicsICdmaWxlLnR4dCcpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnS2V5Ym9hcmQgbmF2aWdhdGlvbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICAvKlxuICAgICAgICAgICAgRm9yIHJlZmVyZW5jZSwgZXhwZWN0ZWQgbGlzdGluZyBpbiBmaXh0dXJlcyBpczpcbiAgICAgICAgICAgIC4uXG4gICAgICAgICAgICBleGFtcGxlc1xuICAgICAgICAgICAgcHJlZml4X21hdGNoLmpzXG4gICAgICAgICAgICBwcmVmaXhfb3RoZXJfbWF0Y2guanNcbiAgICAgICAgICAgIHNhbXBsZS5qc1xuICAgICAgICAqL1xuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVEb3duKHRpbWVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRpbWVzOyBrKyspIHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLWRvd24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVVcCh0aW1lcykge1xuICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB0aW1lczsgaysrKSB7XG4gICAgICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTptb3ZlLWN1cnNvci11cCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaXQoJ2FsbG93cyBtb3ZpbmcgYSBjdXJzb3IgdG8gYSBmaWxlIGFuZCBjb25maXJtaW5nIHRvIHNlbGVjdCBhIHBhdGgnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93big0KTtcbiAgICAgICAgICAgIG1vdmVVcCgxKTsgLy8gVGVzdCBtb3ZlbWVudCBib3RoIGRvd24gYW5kIHVwLlxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3dyYXBzIHRoZSBjdXJzb3IgYXQgdGhlIGVkZ2VzJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZVVwKDIpO1xuICAgICAgICAgICAgbW92ZURvd24oNCk7XG4gICAgICAgICAgICBtb3ZlVXAoNSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJyldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncmVwbGFjZXMgdGhlIGN1cnJlbnQgcGF0aCB3aGVuIHNlbGVjdGluZyBhIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDIpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBwYXRoLnNlcClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ21vdmVzIHRvIHRoZSBwYXJlbnQgZGlyZWN0b3J5IHdoZW4gdGhlIC4uIGVsZW1lbnQgaXMgc2VsZWN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gYWRkIGZvbGRlcnMgYXMgcHJvamVjdCBkaXJlY3RvcmllcyB1c2luZyBhIGtleWJvYXJkIGNvbW1hbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW10pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMik7IC8vIGV4YW1wbGVzIGZvbGRlclxuICAgICAgICAgICAgZGlzcGF0Y2goJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYmVlcHMgd2hlbiB0cnlpbmcgdG8gYWRkIHRoZSBwYXJlbnQgZm9sZGVyIGFzIGEgcHJvamVjdCBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtdKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMSk7IC8vIFBhcmVudCBmb2xkZXJcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKTtcblxuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2JlZXBzIHdoZW4gdHJ5aW5nIHRvIGFkZCBhIGZpbGUgYXMgYSBwcm9qZWN0IGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW10pO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigzKTsgLy8gcHJlZml4X21hdGNoLmpzXG4gICAgICAgICAgICBkaXNwYXRjaCgnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyk7XG5cbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBiZWVwcyB3aGVuIHRyeWluZyB0byBhZGQgYSBmb2xkZXIgYXMgYSBwcm9qZWN0IGRpcmVjdG9yeSB0aGF0IGlzXG4gICAgICAgICAgICAgICAgYWxyZWFkeSBvbmVgLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigyKTsgLy8gZXhhbXBsZXMgZm9sZGVyXG4gICAgICAgICAgICBkaXNwYXRjaCgnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyk7XG5cbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGNhbiBzZWxlY3QgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGxpc3QgaWYgbm9uZSBhcmUgc2VsZWN0ZWQgdXNpbmdcbiAgICAgICAgICAgIHNwZWNpYWwgY29tbWFuZGAsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeCcpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6Y29uZmlybS1zZWxlY3RlZC1vci1maXJzdCcpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdNb3VzZSBuYXZpZ2F0aW9uJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdvcGVucyBhIHBhdGggd2hlbiBpdCBpcyBjbGlja2VkIG9uJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgY2xpY2tGaWxlKCdzYW1wbGUuanMnKVxuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlcGxhY2VzIHRoZSBjdXJyZW50IHBhdGggd2hlbiBjbGlja2luZyBhIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIGNsaWNrRmlsZSgnZXhhbXBsZXMnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgcGF0aC5zZXApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdtb3ZlcyB0byB0aGUgcGFyZW50IGRpcmVjdG9yeSB3aGVuIHRoZSAuLiBlbGVtZW50IGlzIGNsaWNrZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgdWkuZmluZCgnLnBhcmVudC1kaXJlY3RvcnknKS5jbGljaygpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdFdmVudHMnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ2FsbG93cyBzdWJzY3JpcHRpb24gdG8gZXZlbnRzIHdoZW4gcGF0aHMgYXJlIG9wZW5lZCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ2hhbmRsZXInKTtcbiAgICAgICAgICAgIGxldCBzdWIgPSBwcm92aWRlRXZlbnRTZXJ2aWNlKCkub25EaWRPcGVuUGF0aChoYW5kbGVyKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpO1xuXG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHBhdGgpO1xuICAgICAgICAgICAgc3ViLmRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2FsbG93cyBzdWJzY3JpcHRpb24gdG8gZXZlbnRzIHdoZW4gcGF0aHMgYXJlIGNyZWF0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVGaWxlSW5zdGFudGx5JywgdHJ1ZSk7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsICduZXdmaWxlLmpzJyk7XG4gICAgICAgICAgICBsZXQgaGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCdoYW5kbGVyJyk7XG4gICAgICAgICAgICBsZXQgc3ViID0gcHJvdmlkZUV2ZW50U2VydmljZSgpLm9uRGlkQ3JlYXRlUGF0aChoYW5kbGVyKTtcblxuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChoYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChwYXRoKTtcbiAgICAgICAgICAgIHN1Yi5kaXNwb3NlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdlbWl0cyB0aGUgY3JlYXRlIGV2ZW50IHdoZW4gY3JlYXRpbmcgYSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVEaXJlY3RvcmllcycsIHRydWUpO1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCAnbmV3ZGlyJykgKyBzdGRQYXRoLnNlcDtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ2hhbmRsZXInKTtcbiAgICAgICAgICAgIGxldCBzdWIgPSBwcm92aWRlRXZlbnRTZXJ2aWNlKCkub25EaWRDcmVhdGVQYXRoKGhhbmRsZXIpO1xuXG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKG5ldyBQYXRoKHBhdGgpLmFic29sdXRlKTtcbiAgICAgICAgICAgIHN1Yi5kaXNwb3NlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gT25seSBydW4gV2luZG93cy1zcGVjaWZpYyB0ZXN0cyB3aGVuIGVuYWJsZWQuXG4gICAgbGV0IHdpbmRvd3NEZXNjcmliZSA9IHByb2Nlc3MuZW52LkFPRl9XSU5ET1dTX1RFU1RTID8gZGVzY3JpYmUgOiB4ZGVzY3JpYmU7XG4gICAgd2luZG93c0Rlc2NyaWJlKCdXaW5kb3dzLXNwZWNpZmljIHRlc3RzJywgKCkgPT4ge1xuICAgICAgICAvLyBKdXN0IGFzIGEgbm90ZSwgd2UncmUgYXNzdW1pbmcgQzpcXCBleGlzdHMgYW5kIGlzIHRoZSByb290XG4gICAgICAgIC8vIHN5c3RlbSBkcml2ZS4gSXQgaXMgb24gQXBwVmV5b3IsIGFuZCB0aGF0J3MgZ29vZCBlbm91Z2guXG5cbiAgICAgICAgaXQoJ2NhbiByZWFkIHRoZSByb290IGRpcmVjdG9yeSB3aXRob3V0IGZhaWxpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBUaGlzIHBvdGVudGlhbGx5IGZhaWxzIGJlY2F1c2Ugd2Ugc3RhdCBpbi11c2UgZmlsZXMgbGlrZVxuICAgICAgICAgICAgLy8gcGFnZWZpbGUuc3lzLlxuICAgICAgICAgICAgZXhwZWN0KCgpID0+IHtzZXRQYXRoKCdDOlxcXFwnKX0pLm5vdC50b1Rocm93KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkb2VzIG5vdCByZXBsYWNlIGRyaXZlIGxldHRlcnMgd2l0aCB0aGUgcHJvamVjdCByb290JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgpXSk7XG4gICAgICAgICAgICBzZXRQYXRoKCdDOi8nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKCdDOi8nKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnRnV6enkgZmlsZW5hbWUgbWF0Y2hpbmcnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmZ1enp5TWF0Y2gnLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnbGlzdHMgZmlsZXMgYW5kIGZvbGRlcnMgYXMgbm9ybWFsIHdoZW4gbm8gZnJhZ21lbnQgaXMgYmVpbmcgbWF0Y2hlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAnLi4nLFxuICAgICAgICAgICAgICAgICdleGFtcGxlcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9vdGhlcl9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3NhbXBsZS5qcydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgndXNlcyBhIGZ1enp5IGFsZ29yaXRobSBmb3IgbWF0Y2hpbmcgZmlsZXMgaW5zdGVhZCBvZiBwcmVmaXggbWF0Y2hpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdpeCcpKTtcblxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X290aGVyX21hdGNoLmpzJyxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc29ydHMgbWF0Y2hlcyBieSB3ZWlnaHQgaW5zdGVhZCBvZiBieSBuYW1lJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnZnV6enlXZWlnaHQnLCAnaGVhdnlfJykpO1xuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICdtb3JlX2hlYXZ5X2hlYXZ5LmpzJyxcbiAgICAgICAgICAgICAgICAnbGVzc19oZWF2eS5qcycsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2Nob29zZXMgdGhlIGZpcnN0IG1hdGNoIGZvciBhdXRvY29tcGxldGUgd2hlbiBub3RoaW5nIGlzIGhpZ2hsaWdodGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdpeCcpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/spec/advanced-open-file-spec.js
