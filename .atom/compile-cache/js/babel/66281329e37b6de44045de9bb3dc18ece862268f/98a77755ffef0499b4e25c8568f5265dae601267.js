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

        it('allows moving a cursor to the top and confirming to select a path', function () {
            setPath(fixturePath() + _path2['default'].sep);
            moveDown(3);
            dispatch('advanced-open-file:move-cursor-top');
            moveDown(2);
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('prefix_match.js')]);
            });
        });

        it('allows moving a cursor to the bottom and confirming to select a path', function () {
            setPath(fixturePath() + _path2['default'].sep);
            moveDown(2);
            dispatch('advanced-open-file:move-cursor-bottom');
            dispatch('core:confirm');

            waitsForOpenPaths(1);
            runs(function () {
                expect(currentEditorPaths()).toEqual([fixturePath('sample.js')]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL3NwZWMvYWR2YW5jZWQtb3Blbi1maWxlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztrQkFDZSxJQUFJOzs7O29CQUNDLE1BQU07Ozs7b0JBQ1QsTUFBTTs7OztzQkFFVCxRQUFROzs7O3NCQUNILFFBQVE7Ozs7cUJBQ1QsT0FBTzs7OztxQkFDUCxPQUFPOzs7O21DQUVTLDJCQUEyQjs7eUJBS3RELGVBQWU7O3lCQUNILGVBQWU7O0FBYlQsa0JBQUssS0FBSyxFQUFFLENBQUM7O0FBZ0J0QyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUMvQixRQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM1QixRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDZCxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXRCLGNBQVUsQ0FBQyxZQUFNO0FBQ2Isd0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELGVBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FBR3RDLFlBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTttQkFBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQUEsQ0FBQyxDQUFDOztBQUU1RCx5QkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzNFLENBQUMsQ0FBQzs7QUFFSCxhQUFTLEtBQUssR0FBRztBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDaEU7O0FBRUQsYUFBUyxXQUFXLEdBQVc7MENBQVAsS0FBSztBQUFMLGlCQUFL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LFVBQUUsQ0FBQyxxRUFBcUUsRUFBRSxZQUFNO0FBQzVFLG1CQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsa0JBQVEsR0FBRyxDQUFDLENBQUM7O0FBRXJDLGtCQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUIsSUFBSSxFQUNKLFVBQVUsRUFDVixpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLFdBQVcsQ0FDZCxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7O0FBRUgsVUFBRSxDQUFDLHNFQUFzRSxFQUFFLFlBQU07QUFDN0UsbUJBQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFM0Isa0JBQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QixpQkFBaUIsRUFDakIsdUJBQXVCLENBQzFCLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQzs7QUFFSCxVQUFFLENBQUMsNENBQTRDLEVBQUUsWUFBTTtBQUNuRCxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7O0FBRTFELGtCQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUIscUJBQXFCLEVBQ3JCLGVBQWUsQ0FDbEIsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDOztBQUVILFVBQUUsQ0FBQyxzRUFBc0UsRUFBRSxZQUFNO0FBQzdFLGlDQUFxQixDQUNqQixXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ2pCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUNqQyxDQUFDO1NBQ0wsQ0FBQyxDQUFDO0tBQ04sQ0FBQyxDQUFDO0NBQ04sQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL3NwZWMvYWR2YW5jZWQtb3Blbi1maWxlLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHN0ZFBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJzsgdGVtcC50cmFjaygpO1xuXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IG9zZW52IGZyb20gJ29zZW52JztcbmltcG9ydCB0b3VjaCBmcm9tICd0b3VjaCc7XG5cbmltcG9ydCB7cHJvdmlkZUV2ZW50U2VydmljZX0gZnJvbSAnLi4vbGliL2FkdmFuY2VkLW9wZW4tZmlsZSc7XG5pbXBvcnQge1xuICAgIERFRkFVTFRfQUNUSVZFX0ZJTEVfRElSLFxuICAgIERFRkFVTFRfRU1QVFksXG4gICAgREVGQVVMVF9QUk9KRUNUX1JPT1Rcbn0gZnJvbSAnLi4vbGliL2NvbmZpZyc7XG5pbXBvcnQge1BhdGh9IGZyb20gJy4uL2xpYi9tb2RlbHMnO1xuXG5cbmRlc2NyaWJlKCdGdW5jdGlvbmFsIHRlc3RzJywgKCkgPT4ge1xuICAgIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gbnVsbDtcbiAgICBsZXQgYWN0aXZhdGlvblByb21pc2UgPSBudWxsO1xuICAgIGxldCB1aSA9IG51bGw7XG4gICAgbGV0IHBhdGhFZGl0b3IgPSBudWxsO1xuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpO1xuXG4gICAgICAgIC8vIENsZWFyIG91dCBhbnkgbGVmdG92ZXIgcGFuZXMuXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkuZm9yRWFjaCgocGFuZSkgPT4gcGFuZS5kZXN0cm95KCkpO1xuXG4gICAgICAgIGFjdGl2YXRpb25Qcm9taXNlID0gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2FkdmFuY2VkLW9wZW4tZmlsZScpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0VUkoKSB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hZHZhbmNlZC1vcGVuLWZpbGUnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaXh0dXJlUGF0aCguLi5wYXJ0cykge1xuICAgICAgICByZXR1cm4gc3RkUGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgLi4ucGFydHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFBhdGgobmV3UGF0aCkge1xuICAgICAgICBwYXRoRWRpdG9yLnNldFRleHQobmV3UGF0aCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVudFBhdGgoKSB7XG4gICAgICAgIHJldHVybiBwYXRoRWRpdG9yLmdldFRleHQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXNwYXRjaChjb21tYW5kKSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godWlbMF0sIGNvbW1hbmQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnRQYXRoTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIHVpLmZpbmQoJy5saXN0LWl0ZW06bm90KC5oaWRkZW4pJylcbiAgICAgICAgICAgICAgICAgLm1hcCgoaSwgaXRlbSkgPT4gJChpdGVtKS50ZXh0KCkudHJpbSgpKVxuICAgICAgICAgICAgICAgICAuZ2V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVudEVkaXRvclBhdGhzKCkge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5tYXAoKGVkaXRvcikgPT4gZWRpdG9yLmdldFBhdGgoKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2FpdHNGb3JPcGVuUGF0aHMoY291bnQsIHRpbWVvdXQ9MjAwMCkge1xuICAgICAgICB3YWl0c0ZvcihcbiAgICAgICAgICAgICgpID0+IGN1cnJlbnRFZGl0b3JQYXRocygpLmxlbmd0aCA+PSBjb3VudCxcbiAgICAgICAgICAgIGAke2NvdW50fSBwYXRocyB0byBiZSBvcGVuZWRgLFxuICAgICAgICAgICAgdGltZW91dFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9wZW5Nb2RhbCgpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYWR2YW5jZWQtb3Blbi1maWxlOnRvZ2dsZScpO1xuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFjdGl2YXRpb25Qcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVpID0gJChnZXRVSSgpKTtcbiAgICAgICAgICAgICAgICBwYXRoRWRpdG9yID0gdWkuZmluZCgnLnBhdGgtaW5wdXQnKVswXS5nZXRNb2RlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Q29uZmlnKCkge1xuICAgICAgICBhdG9tLmNvbmZpZy51bnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknKTtcbiAgICAgICAgYXRvbS5jb25maWcudW5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5oZWxtRGlyU3dpdGNoJyk7XG4gICAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuZGVmYXVsdElucHV0VmFsdWUnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaWxlRXhpc3RzKHBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnN0YXRTeW5jKHBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RpcmVjdG9yeShwYXRoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZnMuc3RhdFN5bmMocGF0aCkuaXNEaXJlY3RvcnkoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGlja0ZpbGUoZmlsZW5hbWUpIHtcbiAgICAgICAgdWkuZmluZChgLmxpc3QtaXRlbVtkYXRhLWZpbGUtbmFtZSQ9JyR7ZmlsZW5hbWV9J11gKS5jbGljaygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhpbnB1dFBhdGgsIGF1dG9jb21wbGV0ZWRQYXRoKSB7XG4gICAgICAgIHNldFBhdGgoaW5wdXRQYXRoKTtcbiAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoYXV0b2NvbXBsZXRlZFBhdGgpO1xuICAgIH1cblxuICAgIGRlc2NyaWJlKCdNb2RhbCBkaWFsb2cnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuXG4gICAgICAgIGl0KCdhcHBlYXJzIHdoZW4gdGhlIHRvZ2dsZSBjb21tYW5kIGlzIHRyaWdnZXJlZCcsICgpID0+IHtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoZ2V0VUkoKSkubm90LnRvQmVOdWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2Rpc2FwcGVhcnMgaWYgdGhlIHRvZ2dsZSBjb21tYW5kIGlzIHRyaWdnZXJlZCB3aGlsZSBpdCBpcyB2aXNpYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdhZHZhbmNlZC1vcGVuLWZpbGU6dG9nZ2xlJyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGdldFVJKCkpLnRvQmVOdWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2Rpc2FwcGVhcnMgaWYgdGhlIGNhbmNlbCBjb21tYW5kIGlzIHRyaWdnZXJlZCB3aGlsZSBpdCBpcyB2aXNpYmxlJywgKCkgPT4ge1xuICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjYW5jZWwnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZ2V0VUkoKSkudG9CZU51bGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZGlzYXBwZWFycyBpZiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiB0aGUgbW9kYWwnLCAoKSA9PiB7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHVpLnBhcmVudCgpLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGdldFVJKCkpLnRvQmVOdWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGF0aCBsaXN0aW5nJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdsaXN0cyB0aGUgZGlyZWN0b3J5IGNvbnRlbnRzIGlmIHRoZSBwYXRoIGVuZHMgaW4gYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIC8vIEFsc28gaW5jbHVkZXMgdGhlIHBhcmVudCBkaXJlY3RvcnkgYW5kIGlzIHNvcnRlZCBhbHBoYWJldGljYWxseVxuICAgICAgICAgICAgLy8gZ3JvdXBlZCBieSBkaXJlY3RvcmllcyBhbmQgZmlsZXMuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICcuLicsXG4gICAgICAgICAgICAgICAgJ2V4YW1wbGVzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X290aGVyX21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAnc2FtcGxlLmpzJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdsaXN0cyBtYXRjaGluZyBmaWxlcyBpZiB0aGUgcGF0aCBkb2VzblxcJ3QgZW5kIGluIGEgc2VwYXJhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4JykpO1xuXG4gICAgICAgICAgICAvLyBBbHNvIHNob3VsZG4ndCBpbmNsdWRlIHRoZSBwYXJlbnQuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfb3RoZXJfbWF0Y2guanMnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2V4Y2x1ZGVzIGZpbGVzIHRoYXQgZG9uXFwndCBoYXZlIGEgcHJlZml4IG1hdGNoaW5nIHRoZSBmcmFnbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbJ3ByZWZpeF9tYXRjaC5qcyddKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NvbnNpZGVycyByZWxhdGl2ZSBwYXRocyB0byBiZSByZWxhdGl2ZSB0byB0aGUgcHJvamVjdCByb290JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgpXSk7XG4gICAgICAgICAgICBzZXRQYXRoKHN0ZFBhdGguam9pbignZXhhbXBsZXMnLCAnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoWycuLicsICdzdWJzYW1wbGUuanMnXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgd2hlbiB0aGUgcGF0aCBjaGFuZ2VzJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4JykpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X290aGVyX21hdGNoLmpzJ1xuICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbJ3ByZWZpeF9tYXRjaC5qcyddKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYG1hdGNoZXMgZmlsZXMgY2FzZS1pbnNlbnNpdGl2ZWx5IHVubGVzcyB0aGUgZnJhZ21lbnQgY29udGFpbnMgYVxuICAgICAgICAgICAgY2FwaXRhbGAsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X21hdGNoJykpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoX2xvd2VyLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X01hdGNoX3VwcGVyLmpzJ1xuICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X01hdGNoJykpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFsncHJlZml4X01hdGNoX3VwcGVyLmpzJ10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgc2hvd3MgYSBidXR0b24gbmV4dCB0byBmb2xkZXJzIHRoYXQgY2FuIGJlIGNsaWNrZWQgdG8gYWRkIHRoZW0gYXNcbiAgICAgICAgICAgIHByb2plY3QgZm9sZGVyc2AsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbXSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIGxldCBleGFtcGxlTGlzdEl0ZW0gPSB1aS5maW5kKCcubGlzdC1pdGVtW2RhdGEtZmlsZS1uYW1lJD1cXCdleGFtcGxlc1xcJ10nKTtcbiAgICAgICAgICAgIGxldCBhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uID0gZXhhbXBsZUxpc3RJdGVtLmZpbmQoJy5hZGQtcHJvamVjdC1mb2xkZXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uLmxlbmd0aCkudG9FcXVhbCgxKTtcblxuICAgICAgICAgICAgYWRkUHJvamVjdEZvbGRlckJ1dHRvbi5jbGljaygpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuXG4gICAgICAgICAgICAvLyBEbyBub3Qgb3BlbiBmb2xkZXIgd2hlbiBjbGlja2luZy5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBidXR0b24gd2hlbiBjbGlja2VkLlxuICAgICAgICAgICAgYWRkUHJvamVjdEZvbGRlckJ1dHRvbiA9IHVpLmZpbmQoXG4gICAgICAgICAgICAgICAgJy5saXN0LWl0ZW1bZGF0YS1maWxlLW5hbWUkPVxcJ2V4YW1wbGVzXFwnXSAuYWRkLXByb2plY3QtZm9sZGVyJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGV4cGVjdChhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uLmxlbmd0aCkudG9FcXVhbCgwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGRvZXMgbm90IHNob3cgdGhlIGFkZC1wcm9qZWN0LWZvbGRlciBidXR0b24gZm9yIGZvbGRlcnMgdGhhdCBhcmVcbiAgICAgICAgICAgIGFscmVhZHkgcHJvamVjdCBmb2xkZXJzYCwgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuXG4gICAgICAgICAgICBsZXQgZXhhbXBsZUxpc3RJdGVtID0gdWkuZmluZCgnLmxpc3QtaXRlbVtkYXRhLWZpbGUtbmFtZSQ9XFwnZXhhbXBsZXNcXCddJyk7XG4gICAgICAgICAgICBsZXQgYWRkUHJvamVjdEZvbGRlckJ1dHRvbiA9IGV4YW1wbGVMaXN0SXRlbS5maW5kKCcuYWRkLXByb2plY3QtZm9sZGVyJyk7XG4gICAgICAgICAgICBleHBlY3QoYWRkUHJvamVjdEZvbGRlckJ1dHRvbi5sZW5ndGgpLnRvRXF1YWwoMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdleHBhbmRzIHRpbGRlcyBhdCB0aGUgc3RhcnQgdG8gdGhlIHVzZXJcXCdzIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24ob3NlbnYsICdob21lJykuYW5kUmV0dXJuKGZpeHR1cmVQYXRoKCkpO1xuICAgICAgICAgICAgc2V0UGF0aChzdGRQYXRoLmpvaW4oJ34nLCAnZXhhbXBsZXMnLCAnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbJy4uJywgJ3N1YnNhbXBsZS5qcyddKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGF0aCBpbnB1dCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnY2FuIGF1dG9jb21wbGV0ZSB0aGUgY3VycmVudCBpbnB1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlZml4X21hJyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIGF1dG9jb21wbGV0ZSB0aGUgc2hhcmVkIHBhcnRzIGJldHdlZW4gdHdvIG1hdGNoaW5nIHBhdGhzJywgKCkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmUnKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlZml4XycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnaW5zZXJ0cyBhIHRyYWlsaW5nIHNlcGFyYXRvciB3aGVuIGF1dG9jb21wbGV0aW5nIGEgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtJyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2JlZXBzIGlmIGF1dG9jb21wbGV0ZSBmaW5kcyBubyBtYXRjaHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZG9lc19ub3RfZXhpc3QnKSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZG9lc19ub3RfZXhpc3QnKSk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdiZWVwcyBpZiBhdXRvY29tcGxldGUgY2Fubm90IGF1dG9jb21wbGV0ZSBhbnkgbW9yZSBzaGFyZWQgcGFydHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4XycpKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdwcmVmaXhfJykpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgaXMgY2FzZS1zZW5zaXRpdmUgZHVyaW5nIGF1dG9jb21wbGV0ZSBpZiB0aGUgZnJhZ21lbnQgaGFzIGEgY2FwaXRhbFxuICAgICAgICAgICAgbGV0dGVyYCwgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfbScpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfbWF0Y2hfJylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X00nKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X01hdGNoX3VwcGVyLmpzJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBjYW4gYXV0b2NvbXBsZXRlIHdoZW4gdGhlIHBhdGggbGlzdGluZyBjb250YWlucyB0d28gcGF0aHMgd2hlcmVcbiAgICAgICAgICAgIG9uZSBwYXRoIGlzIHRoZSBwcmVmaXggb2YgYW5vdGhlcmAsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRoZSBleGFtcGxlIGhhcyBgcGxhbm5pbmdgIGFuZCBgcGxhbm5pbmdfYmFja2VuZGAuIFRoZSBidWcgYXJpc2VzXG4gICAgICAgICAgICAvLyBiZWNhdXNlIHRoZSBlbnRpcmUgYHBsYW5uaW5nYCBwYXRoIGlzIGEgcHJlZml4IG9mIHRoZSBvdGhlci5cbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbWF0Y2hQcmVmaXgnLCAncGxhbicpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdtYXRjaFByZWZpeCcsICdwbGFubmluZycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZml4ZXMgdGhlIGNhc2Ugb2YgbGV0dGVycyBpbiB0aGUgZnJhZ21lbnQgaWYgbmVjZXNzYXJ5JywgKCkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9tYXRjaF91cCcpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9NYXRjaF91cHBlci5qcycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHJlbW92ZSB0aGUgY3VycmVudCBwYXRoIGNvbXBvbmVudCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2ZyYWdtZW50JykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTpkZWxldGUtcGF0aC1jb21wb25lbnQnKTtcblxuICAgICAgICAgICAgLy8gTGVhdmVzIHRyYWlsaW5nIHNsYXNoLCBhcyB3ZWxsLlxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYHJlbW92ZXMgdGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlbiByZW1vdmluZyBhIHBhdGggY29tcG9uZW50IHdpdGggbm9cbiAgICAgICAgICAgIGZyYWdtZW50YCwgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmRlbGV0ZS1wYXRoLWNvbXBvbmVudCcpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBzd2l0Y2ggdG8gdGhlIHVzZXJcXCdzIGhvbWUgZGlyZWN0b3J5IHVzaW5nIGEgc2hvcnRjdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5oZWxtRGlyU3dpdGNoJywgdHJ1ZSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSArIHN0ZFBhdGguc2VwICsgJ34nICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwob3NlbnYuaG9tZSgpICsgc3RkUGF0aC5zZXApO1xuXG4gICAgICAgICAgICAvLyBBbHNvIHRlc3Qgd2hlbiB0aGUgcmVzdCBvZiB0aGUgcGF0aCBpcyBlbXB0eS5cbiAgICAgICAgICAgIHNldFBhdGgoJ34nICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwob3NlbnYuaG9tZSgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHN3aXRjaCB0byB0aGUgZmlsZXN5c3RlbSByb290IHVzaW5nIGEgc2hvcnRjdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBGb3IgY3Jvc3MtcGxhdGZvcm1uZXNzLCB3ZSBjaGVhdCBieSB1c2luZyBQYXRoLiBPaCB3ZWxsLlxuICAgICAgICAgICAgbGV0IGZzUm9vdCA9IG5ldyBQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSkucm9vdCgpLmZ1bGw7XG5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmhlbG1EaXJTd2l0Y2gnLCB0cnVlKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpICsgc3RkUGF0aC5zZXAgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmc1Jvb3QpO1xuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSByZXN0IG9mIHBhdGggaXMgZW1wdHksIHNvbWUgcGxhdGZvcm1zIChXaW5kb3dzIG1haW5seSlcbiAgICAgICAgICAgIC8vIGNhbid0IGluZmVyIGEgZHJpdmUgbGV0dGVyLCBzbyB3ZSBjYW4ndCB1c2UgZnNSb290IGZyb20gYWJvdmUuXG4gICAgICAgICAgICAvLyBJbnN0ZWFkLCB3ZSdsbCB1c2UgdGhlIHJvb3Qgb2YgdGhlIHBhdGggd2UncmUgdGVzdGluZy5cbiAgICAgICAgICAgIGZzUm9vdCA9IG5ldyBQYXRoKHN0ZFBhdGguc2VwICsgc3RkUGF0aC5zZXApLnJvb3QoKS5mdWxsO1xuXG4gICAgICAgICAgICAvLyBBbHNvIHRlc3Qgd2hlbiB0aGUgcmVzdCBvZiB0aGUgcGF0aCBpcyBlbXB0eS5cbiAgICAgICAgICAgIHNldFBhdGgoc3RkUGF0aC5zZXAgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmc1Jvb3QpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHN3aXRjaCB0byB0aGUgcHJvamVjdCByb290IGRpcmVjdG9yeSB1c2luZyBhIHNob3J0Y3V0JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuaGVsbURpclN3aXRjaCcsIHRydWUpO1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCArICc6JyArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXApO1xuXG4gICAgICAgICAgICAvLyBBbHNvIHRlc3Qgd2hlbiB0aGUgcmVzdCBvZiB0aGUgcGF0aCBpcyBlbXB0eS5cbiAgICAgICAgICAgIHNldFBhdGgoJzonICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkb2VzIG5vdCByZXNldCB0aGUgY3Vyc29yIHBvc2l0aW9uIHdoaWxlIHR5cGluZycsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpKTtcblxuICAgICAgICAgICAgLy8gU2V0IGN1cnNvciB0byBiZSBiZXR3ZWVuIHRoZSBkIGFuZCBpIGluIHN1YmRpci5cbiAgICAgICAgICAgIGxldCBlbmQgPSBwYXRoRWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgICAgICBwYXRoRWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtlbmQucm93LCBlbmQuY29sdW1uIC0gMl0pXG5cbiAgICAgICAgICAgIC8vIEluc2VydCBhIG5ldyBsZXR0ZXIgYW5kIGNoZWNrIHRoYXQgdGhlIGN1cnNvciBpcyBhZnRlciBpdCBidXRcbiAgICAgICAgICAgIC8vIG5vdCBhdCB0aGUgZW5kIG9mIHRoZSBlZGl0b3IgY29tcGxldGVseS5cbiAgICAgICAgICAgIHBhdGhFZGl0b3IuaW5zZXJ0VGV4dCgnYScpO1xuICAgICAgICAgICAgbGV0IG5ld0VuZCA9IHBhdGhFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGV4cGVjdChuZXdFbmQuY29sdW1uKS50b0VxdWFsKGVuZC5jb2x1bW4gLSAxKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnUGF0aCBpbnB1dCBkZWZhdWx0IHZhbHVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcblxuICAgICAgICBpdCgnY2FuIGJlIGNvbmZpZ3VyZWQgdG8gYmUgdGhlIGN1cnJlbnQgZmlsZVxcJ3MgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KFxuICAgICAgICAgICAgICAgICdhZHZhbmNlZC1vcGVuLWZpbGUuZGVmYXVsdElucHV0VmFsdWUnLFxuICAgICAgICAgICAgICAgIERFRkFVTFRfQUNUSVZFX0ZJTEVfRElSXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJykpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVuTW9kYWwoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gYmUgY29uZmlndXJlZCB0byBiZSB0aGUgY3VycmVudCBwcm9qZWN0IHJvb3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoXG4gICAgICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZS5kZWZhdWx0SW5wdXRWYWx1ZScsXG4gICAgICAgICAgICAgICAgIERFRkFVTFRfUFJPSkVDVF9ST09UXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuICAgICAgICAgICAgb3Blbk1vZGFsKCk7XG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gYmUgY29uZmlndXJlZCB0byBiZSBibGFuaycsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmRlZmF1bHRJbnB1dFZhbHVlJywgREVGQVVMVF9FTVBUWSk7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKTtcblxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ1VuZG8nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ2NhbiB1bmRvIHRhYiBjb21wbGV0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbScpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6dW5kbycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW0nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gdW5kbyBkZWxldGluZyBwYXRoIGNvbXBvbmVudHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTpkZWxldGUtcGF0aC1jb21wb25lbnQnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOnVuZG8nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtJykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHVuZG8gY2xpY2tpbmcgYSBmb2xkZXInLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBjbGlja0ZpbGUoJ2V4YW1wbGVzJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6dW5kbycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2JlZXBzIHdoZW4gaXQgY2Fubm90IHVuZG8gYW55IGZhcnRoZXInLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTp1bmRvJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ09wZW5pbmcgZmlsZXMnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ29wZW5zIGFuIGV4aXN0aW5nIGZpbGUgaWYgdGhlIGN1cnJlbnQgcGF0aCBwb2ludHMgdG8gb25lJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhdGggPSBmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJyk7XG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbcGF0aF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdyZXBsYWNlcyB0aGUgcGF0aCB3aGVuIGF0dGVtcHRpbmcgdG8gb3BlbiBhbiBleGlzdGluZyBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgcGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgYmVlcHMgd2hlbiBhdHRlbXB0aW5nIHRvIG9wZW4gYSBwYXRoIGVuZGluZyBpbiBhIHNlcGFyYXRvciAoYVxuICAgICAgICAgICAgbm9uLWV4aXN0YW50IGRpcmVjdG9yeSlgLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnbm90dGhlcmUnKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGNyZWF0ZXMgdGhlIGRpcmVjdG9yeSB3aGVuIG9wZW5pbmcgYSBwYXRoIGVuZGluZyBhIHNlcGFyYXRvciBpZlxuICAgICAgICAgICAgY29uZmlndXJlZGAsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4odGVtcERpciwgJ25ld2RpcicpICsgc3RkUGF0aC5zZXA7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVEaXJlY3RvcmllcycsIHRydWUpO1xuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGV4cGVjdChpc0RpcmVjdG9yeShwYXRoKSkudG9FcXVhbChmYWxzZSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChpc0RpcmVjdG9yeShwYXRoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ29wZW5zIGEgbmV3IGZpbGUgd2l0aG91dCBzYXZpbmcgaXQgaWYgb3BlbmluZyBhIG5vbi1leGlzdGFudCBwYXRoJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHBhdGggPSBmaXh0dXJlUGF0aCgnZG9lcy5ub3QuZXhpc3QnKTtcbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtwYXRoXSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMocGF0aCkpLnRvRXF1YWwoZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjcmVhdGVzIGEgbmV3IGZpbGUgd2hlbiBjb25maWd1cmVkIHRvJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCAnbmV3ZmlsZS5qcycpO1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRmlsZUluc3RhbnRseScsIHRydWUpO1xuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKHBhdGgpKS50b0VxdWFsKGZhbHNlKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW3BhdGhdKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhwYXRoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY3JlYXRlcyBpbnRlcm1lZGlhdGUgZGlyZWN0b3JpZXMgd2hlbiBuZWNlc3NhcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBuZXdEaXIgPSBzdGRQYXRoLmpvaW4odGVtcERpciwgJ25ld0RpcicpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4obmV3RGlyLCAnbmV3RmlsZS5qcycpO1xuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKG5ld0RpcikpLnRvRXF1YWwoZmFsc2UpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbcGF0aF0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKG5ld0RpcikpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBjcmVhdGUgZmlsZXMgZnJvbSByZWxhdGl2ZSBwYXRocycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4oJ25ld0RpcicsICduZXdGaWxlLmpzJyk7XG4gICAgICAgICAgICBsZXQgYWJzb2x1dGVQYXRoID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsIHBhdGgpO1xuXG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW3RlbXBEaXJdKTtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknLCB0cnVlKTtcblxuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKGFic29sdXRlUGF0aCkpLnRvRXF1YWwoZmFsc2UpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbYWJzb2x1dGVQYXRoXSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMoYWJzb2x1dGVQYXRoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIG9wZW4gZmlsZXMgZnJvbSB0aWxkZS1wcmVmaXhlZCBwYXRocycsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKG9zZW52LCAnaG9tZScpLmFuZFJldHVybihmaXh0dXJlUGF0aCgpKTtcbiAgICAgICAgICAgIHNldFBhdGgoc3RkUGF0aC5qb2luKCd+JywgJ2V4YW1wbGVzJywgJ3N1YmRpcicsICdzdWJzYW1wbGUuanMnKSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ3N1YmRpcicsICdzdWJzYW1wbGUuanMnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gb3BlbiBmaWxlcyBpbiBuZXcgc3BsaXQgcGFuZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKSk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5sZW5ndGgpLnRvRXF1YWwoMSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdwYW5lOnNwbGl0LWxlZnQnKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMik7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QobmV3IFNldChjdXJyZW50RWRpdG9yUGF0aHMoKSkpLnRvRXF1YWwobmV3IFNldChbXG4gICAgICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKSxcbiAgICAgICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpLFxuICAgICAgICAgICAgICAgIF0pKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5sZW5ndGgpLnRvRXF1YWwoMik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYHNob3dzIGFuIGVycm9yIG5vdGlmaWNhdGlvbiB3aGVuIGNyZWF0aW5nIGEgc3ViZGlyZWN0b3J5IHRocm93cyBhblxuICAgICAgICAgICAgZXJyb3JgLCAoKSA9PiB7XG4gICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgIHNweU9uKGF0b20ubm90aWZpY2F0aW9ucywgJ2FkZEVycm9yJyk7XG4gICAgICAgICAgICBzcHlPbihta2RpcnAsICdzeW5jJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT0ggTk8nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbm9QZXJtaXNzaW9uJywgJ3N1YmRpcicsICdmaWxlLnR4dCcpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYHNob3dzIGFuIGVycm9yIG5vdGlmaWNhdGlvbiB3aGVuIGNyZWF0aW5nIGEgZmlsZSBpbiBhIGRpcmVjdG9yeVxuICAgICAgICAgICAgdGhyb3dzIGFuIGVycm9yYCwgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbS5ub3RpZmljYXRpb25zLCAnYWRkRXJyb3InKTtcbiAgICAgICAgICAgIHNweU9uKHRvdWNoLCAnc3luYycpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09IIE5PJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknLCB0cnVlKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbm9QZXJtaXNzaW9uJywgJ2ZpbGUudHh0JykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdLZXlib2FyZCBuYXZpZ2F0aW9uJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBGb3IgcmVmZXJlbmNlLCBleHBlY3RlZCBsaXN0aW5nIGluIGZpeHR1cmVzIGlzOlxuICAgICAgICAgICAgLi5cbiAgICAgICAgICAgIGV4YW1wbGVzXG4gICAgICAgICAgICBwcmVmaXhfbWF0Y2guanNcbiAgICAgICAgICAgIHByZWZpeF9vdGhlcl9tYXRjaC5qc1xuICAgICAgICAgICAgc2FtcGxlLmpzXG4gICAgICAgICovXG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZURvd24odGltZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGltZXM7IGsrKykge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6bW92ZS1jdXJzb3ItZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVVwKHRpbWVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRpbWVzOyBrKyspIHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLXVwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpdCgnYWxsb3dzIG1vdmluZyBhIGN1cnNvciB0byBhIGZpbGUgYW5kIGNvbmZpcm1pbmcgdG8gc2VsZWN0IGEgcGF0aCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDQpO1xuICAgICAgICAgICAgbW92ZVVwKDEpOyAvLyBUZXN0IG1vdmVtZW50IGJvdGggZG93biBhbmQgdXAuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJyldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYWxsb3dzIG1vdmluZyBhIGN1cnNvciB0byB0aGUgdG9wIGFuZCBjb25maXJtaW5nIHRvIHNlbGVjdCBhIHBhdGgnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigzKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6bW92ZS1jdXJzb3ItdG9wJyk7XG4gICAgICAgICAgICBtb3ZlRG93bigyKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdhbGxvd3MgbW92aW5nIGEgY3Vyc29yIHRvIHRoZSBib3R0b20gYW5kIGNvbmZpcm1pbmcgdG8gc2VsZWN0IGEgcGF0aCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDIpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTptb3ZlLWN1cnNvci1ib3R0b20nKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCd3cmFwcyB0aGUgY3Vyc29yIGF0IHRoZSBlZGdlcycsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVVcCgyKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDQpO1xuICAgICAgICAgICAgbW92ZVVwKDUpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlcGxhY2VzIHRoZSBjdXJyZW50IHBhdGggd2hlbiBzZWxlY3RpbmcgYSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigyKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgcGF0aC5zZXApXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdtb3ZlcyB0byB0aGUgcGFyZW50IGRpcmVjdG9yeSB3aGVuIHRoZSAuLiBlbGVtZW50IGlzIHNlbGVjdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDEpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKVxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIGFkZCBmb2xkZXJzIGFzIHByb2plY3QgZGlyZWN0b3JpZXMgdXNpbmcgYSBrZXlib2FyZCBjb21tYW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtdKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDIpOyAvLyBleGFtcGxlcyBmb2xkZXJcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2JlZXBzIHdoZW4gdHJ5aW5nIHRvIGFkZCB0aGUgcGFyZW50IGZvbGRlciBhcyBhIHByb2plY3QgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbXSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDEpOyAvLyBQYXJlbnQgZm9sZGVyXG4gICAgICAgICAgICBkaXNwYXRjaCgnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyk7XG5cbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdiZWVwcyB3aGVuIHRyeWluZyB0byBhZGQgYSBmaWxlIGFzIGEgcHJvamVjdCBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihhdG9tLCAnYmVlcCcpO1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtdKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMyk7IC8vIHByZWZpeF9tYXRjaC5qc1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuXG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgYmVlcHMgd2hlbiB0cnlpbmcgdG8gYWRkIGEgZm9sZGVyIGFzIGEgcHJvamVjdCBkaXJlY3RvcnkgdGhhdCBpc1xuICAgICAgICAgICAgICAgIGFscmVhZHkgb25lYCwgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoJ2V4YW1wbGVzJyldKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgcGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMik7IC8vIGV4YW1wbGVzIGZvbGRlclxuICAgICAgICAgICAgZGlzcGF0Y2goJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuXG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBjYW4gc2VsZWN0IHRoZSBmaXJzdCBpdGVtIGluIHRoZSBsaXN0IGlmIG5vbmUgYXJlIHNlbGVjdGVkIHVzaW5nXG4gICAgICAgICAgICBzcGVjaWFsIGNvbW1hbmRgLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXgnKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmNvbmZpcm0tc2VsZWN0ZWQtb3ItZmlyc3QnKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnTW91c2UgbmF2aWdhdGlvbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnb3BlbnMgYSBwYXRoIHdoZW4gaXQgaXMgY2xpY2tlZCBvbicsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGNsaWNrRmlsZSgnc2FtcGxlLmpzJylcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdyZXBsYWNlcyB0aGUgY3VycmVudCBwYXRoIHdoZW4gY2xpY2tpbmcgYSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcCk7XG4gICAgICAgICAgICBjbGlja0ZpbGUoJ2V4YW1wbGVzJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKVxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnbW92ZXMgdG8gdGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlbiB0aGUgLi4gZWxlbWVudCBpcyBjbGlja2VkJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHBhdGguc2VwKTtcbiAgICAgICAgICAgIHVpLmZpbmQoJy5wYXJlbnQtZGlyZWN0b3J5JykuY2xpY2soKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBwYXRoLnNlcClcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnRXZlbnRzJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdhbGxvd3Mgc3Vic2NyaXB0aW9uIHRvIGV2ZW50cyB3aGVuIHBhdGhzIGFyZSBvcGVuZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCdoYW5kbGVyJyk7XG4gICAgICAgICAgICBsZXQgc3ViID0gcHJvdmlkZUV2ZW50U2VydmljZSgpLm9uRGlkT3BlblBhdGgoaGFuZGxlcik7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IGZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKTtcblxuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChoYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChwYXRoKTtcbiAgICAgICAgICAgIHN1Yi5kaXNwb3NlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdhbGxvd3Mgc3Vic2NyaXB0aW9uIHRvIGV2ZW50cyB3aGVuIHBhdGhzIGFyZSBjcmVhdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRmlsZUluc3RhbnRseScsIHRydWUpO1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCAnbmV3ZmlsZS5qcycpO1xuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgnaGFuZGxlcicpO1xuICAgICAgICAgICAgbGV0IHN1YiA9IHByb3ZpZGVFdmVudFNlcnZpY2UoKS5vbkRpZENyZWF0ZVBhdGgoaGFuZGxlcik7XG5cbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoaGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZFdpdGgocGF0aCk7XG4gICAgICAgICAgICBzdWIuZGlzcG9zZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZW1pdHMgdGhlIGNyZWF0ZSBldmVudCB3aGVuIGNyZWF0aW5nIGEgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRGlyZWN0b3JpZXMnLCB0cnVlKTtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4odGVtcERpciwgJ25ld2RpcicpICsgc3RkUGF0aC5zZXA7XG4gICAgICAgICAgICBsZXQgaGFuZGxlciA9IGphc21pbmUuY3JlYXRlU3B5KCdoYW5kbGVyJyk7XG4gICAgICAgICAgICBsZXQgc3ViID0gcHJvdmlkZUV2ZW50U2VydmljZSgpLm9uRGlkQ3JlYXRlUGF0aChoYW5kbGVyKTtcblxuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChoYW5kbGVyKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChuZXcgUGF0aChwYXRoKS5hYnNvbHV0ZSk7XG4gICAgICAgICAgICBzdWIuZGlzcG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIE9ubHkgcnVuIFdpbmRvd3Mtc3BlY2lmaWMgdGVzdHMgd2hlbiBlbmFibGVkLlxuICAgIGxldCB3aW5kb3dzRGVzY3JpYmUgPSBwcm9jZXNzLmVudi5BT0ZfV0lORE9XU19URVNUUyA/IGRlc2NyaWJlIDogeGRlc2NyaWJlO1xuICAgIHdpbmRvd3NEZXNjcmliZSgnV2luZG93cy1zcGVjaWZpYyB0ZXN0cycsICgpID0+IHtcbiAgICAgICAgLy8gSnVzdCBhcyBhIG5vdGUsIHdlJ3JlIGFzc3VtaW5nIEM6XFwgZXhpc3RzIGFuZCBpcyB0aGUgcm9vdFxuICAgICAgICAvLyBzeXN0ZW0gZHJpdmUuIEl0IGlzIG9uIEFwcFZleW9yLCBhbmQgdGhhdCdzIGdvb2QgZW5vdWdoLlxuXG4gICAgICAgIGl0KCdjYW4gcmVhZCB0aGUgcm9vdCBkaXJlY3Rvcnkgd2l0aG91dCBmYWlsaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhpcyBwb3RlbnRpYWxseSBmYWlscyBiZWNhdXNlIHdlIHN0YXQgaW4tdXNlIGZpbGVzIGxpa2VcbiAgICAgICAgICAgIC8vIHBhZ2VmaWxlLnN5cy5cbiAgICAgICAgICAgIGV4cGVjdCgoKSA9PiB7c2V0UGF0aCgnQzpcXFxcJyl9KS5ub3QudG9UaHJvdygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZG9lcyBub3QgcmVwbGFjZSBkcml2ZSBsZXR0ZXJzIHdpdGggdGhlIHByb2plY3Qgcm9vdCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZml4dHVyZVBhdGgoKV0pO1xuICAgICAgICAgICAgc2V0UGF0aCgnQzovJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbCgnQzovJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ0Z1enp5IGZpbGVuYW1lIG1hdGNoaW5nJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5mdXp6eU1hdGNoJywgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ2xpc3RzIGZpbGVzIGFuZCBmb2xkZXJzIGFzIG5vcm1hbCB3aGVuIG5vIGZyYWdtZW50IGlzIGJlaW5nIG1hdGNoZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJy4uJyxcbiAgICAgICAgICAgICAgICAnZXhhbXBsZXMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfb3RoZXJfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdzYW1wbGUuanMnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3VzZXMgYSBmdXp6eSBhbGdvcml0aG0gZm9yIG1hdGNoaW5nIGZpbGVzIGluc3RlYWQgb2YgcHJlZml4IG1hdGNoaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnaXgnKSk7XG5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9vdGhlcl9tYXRjaC5qcycsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3NvcnRzIG1hdGNoZXMgYnkgd2VpZ2h0IGluc3RlYWQgb2YgYnkgbmFtZScsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Z1enp5V2VpZ2h0JywgJ2hlYXZ5XycpKTtcblxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFtcbiAgICAgICAgICAgICAgICAnbW9yZV9oZWF2eV9oZWF2eS5qcycsXG4gICAgICAgICAgICAgICAgJ2xlc3NfaGVhdnkuanMnLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjaG9vc2VzIHRoZSBmaXJzdCBtYXRjaCBmb3IgYXV0b2NvbXBsZXRlIHdoZW4gbm90aGluZyBpcyBoaWdobGlnaHRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGFzc2VydEF1dG9jb21wbGV0ZXNUbyhcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnaXgnKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iXX0=
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/spec/advanced-open-file-spec.js
