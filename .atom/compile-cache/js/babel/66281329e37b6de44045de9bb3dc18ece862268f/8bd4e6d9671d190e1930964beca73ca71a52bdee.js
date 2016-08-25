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
            setPath(fixturePath() + _path2['default'].sep);

            var exampleListItem = ui.find('.list-item[data-file-name$=\'examples\']');
            var addProjectFolderButton = exampleListItem.find('.add-project-folder');
            expect(addProjectFolderButton.length).toEqual(1);

            addProjectFolderButton.click();
            expect(atom.project.getPaths()).toEqual([fixturePath('examples')]);

            // Do not open folder when clicking.
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);

            // Remove button when clicked.
            addProjectFolderButton = ui.find('.list-item[data-file-name$=\'examples\'] .add-project-folder');
            expect(addProjectFolderButton.length).toEqual(0);
        });

        it('does not show the add-project-folder button for folders that are\n            already project folders', function () {
            atom.project.setPaths([fixturePath('examples')]);
            setPath(fixturePath() + _path2['default'].sep);

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
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath('exam'));
        });

        it('can undo deleting path components', function () {
            setPath(fixturePath('exam'));
            dispatch('advanced-open-file:delete-path-component');
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath('exam'));
        });

        it('can undo clicking a folder', function () {
            setPath(fixturePath() + _path2['default'].sep);
            clickFile('examples');
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
            dispatch('advanced-open-file:undo');
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
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
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
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
            setPath(fixturePath() + _path2['default'].sep);
            moveDown(2);
            dispatch('core:confirm');
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
        });

        it('moves to the parent directory when the .. element is selected', function () {
            setPath(fixturePath('examples') + _path2['default'].sep);
            moveDown(1);
            dispatch('core:confirm');
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
        });

        it('can add folders as project directories using a keyboard command', function () {
            atom.project.setPaths([]);
            setPath(fixturePath() + _path2['default'].sep);
            moveDown(2); // examples folder
            dispatch('application:add-project-folder');
            expect(atom.project.getPaths()).toEqual([fixturePath('examples')]);
        });

        it('beeps when trying to add the parent folder as a project directory', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([]);

            setPath(fixturePath() + _path2['default'].sep);
            moveDown(1); // Parent folder
            dispatch('application:add-project-folder');

            expect(atom.beep).toHaveBeenCalled();
            expect(atom.project.getPaths()).toEqual([]);
        });

        it('beeps when trying to add a file as a project directory', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([]);

            setPath(fixturePath() + _path2['default'].sep);
            moveDown(3); // prefix_match.js
            dispatch('application:add-project-folder');

            expect(atom.beep).toHaveBeenCalled();
            expect(atom.project.getPaths()).toEqual([]);
        });

        it('beeps when trying to add a folder as a project directory that is\n                already one', function () {
            spyOn(atom, 'beep');
            atom.project.setPaths([fixturePath('examples')]);

            setPath(fixturePath() + _path2['default'].sep);
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
            setPath(fixturePath() + _path2['default'].sep);
            clickFile('examples');
            expect(currentPath()).toEqual(fixturePath('examples') + _path2['default'].sep);
        });

        it('moves to the parent directory when the .. element is clicked', function () {
            setPath(fixturePath('examples') + _path2['default'].sep);
            ui.find('.list-item.parent').click();
            expect(currentPath()).toEqual(fixturePath() + _path2['default'].sep);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvYWR2YW5jZWQtb3Blbi1maWxlL3NwZWMvYWR2YW5jZWQtb3Blbi1maWxlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztrQkFDZSxJQUFJOzs7O29CQUNDLE1BQU07Ozs7b0JBQ1QsTUFBTTs7OztzQkFFVCxRQUFROzs7O3NCQUNILFFBQVE7Ozs7cUJBQ1QsT0FBTzs7OztxQkFDUCxPQUFPOzs7O21DQUVTLDJCQUEyQjs7eUJBS3RELGVBQWU7O3lCQUNILGVBQWU7O0FBYlQsa0JBQUssS0FBSyxFQUFFLENBQUM7O0FBZ0J0QyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUMvQixRQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM1QixRQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDZCxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7O0FBRXRCLGNBQVUsQ0FBQyxZQUFNO0FBQ2Isd0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RELGVBQU8sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7O0FBR3RDLFlBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTttQkFBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQUEsQ0FBQyxDQUFDOztBQUU1RCx5QkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0tBQzNFLENBQUMsQ0FBQzs7QUFFSCxhQUFTLEtBQUssR0FBRztBQUNiLGVBQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDaEU7O0FBRUQsYUFBUyxXQUFXLEdBQVc7MENBQVAsS0FBSztBQUFMLGlCQUFL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QUM7U0FDMUQsQ0FBQyxDQUFDO0FBQ0gsa0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFdEIsVUFBRSxDQUFDLHFFQUFxRSxFQUFFLFlBQU07QUFDNUUsbUJBQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxrQkFBUSxHQUFHLENBQUMsQ0FBQzs7QUFFckMsa0JBQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QixJQUFJLEVBQ0osVUFBVSxFQUNWLGlCQUFpQixFQUNqQix1QkFBdUIsRUFDdkIsV0FBVyxDQUNkLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQzs7QUFFSCxVQUFFLENBQUMsc0VBQXNFLEVBQUUsWUFBTTtBQUM3RSxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUUzQixrQkFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQzlCLGlCQUFpQixFQUNqQix1QkFBdUIsQ0FDMUIsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDOztBQUVILFVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxZQUFNO0FBQ25ELG1CQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzs7QUFFMUQsa0JBQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUM5QixxQkFBcUIsRUFDckIsZUFBZSxDQUNsQixDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7O0FBRUgsVUFBRSxDQUFDLHNFQUFzRSxFQUFFLFlBQU07QUFDN0UsaUNBQXFCLENBQ2pCLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDakIsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQ2pDLENBQUM7U0FDTCxDQUFDLENBQUM7S0FDTixDQUFDLENBQUM7Q0FDTixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9hZHZhbmNlZC1vcGVuLWZpbGUvc3BlYy9hZHZhbmNlZC1vcGVuLWZpbGUtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgc3RkUGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnOyB0ZW1wLnRyYWNrKCk7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgb3NlbnYgZnJvbSAnb3NlbnYnO1xuaW1wb3J0IHRvdWNoIGZyb20gJ3RvdWNoJztcblxuaW1wb3J0IHtwcm92aWRlRXZlbnRTZXJ2aWNlfSBmcm9tICcuLi9saWIvYWR2YW5jZWQtb3Blbi1maWxlJztcbmltcG9ydCB7XG4gICAgREVGQVVMVF9BQ1RJVkVfRklMRV9ESVIsXG4gICAgREVGQVVMVF9FTVBUWSxcbiAgICBERUZBVUxUX1BST0pFQ1RfUk9PVFxufSBmcm9tICcuLi9saWIvY29uZmlnJztcbmltcG9ydCB7UGF0aH0gZnJvbSAnLi4vbGliL21vZGVscyc7XG5cblxuZGVzY3JpYmUoJ0Z1bmN0aW9uYWwgdGVzdHMnLCAoKSA9PiB7XG4gICAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBudWxsO1xuICAgIGxldCBhY3RpdmF0aW9uUHJvbWlzZSA9IG51bGw7XG4gICAgbGV0IHVpID0gbnVsbDtcbiAgICBsZXQgcGF0aEVkaXRvciA9IG51bGw7XG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG5cbiAgICAgICAgLy8gQ2xlYXIgb3V0IGFueSBsZWZ0b3ZlciBwYW5lcy5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKS5mb3JFYWNoKChwYW5lKSA9PiBwYW5lLmRlc3Ryb3koKSk7XG5cbiAgICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYWR2YW5jZWQtb3Blbi1maWxlJyk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBnZXRVSSgpIHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmFkdmFuY2VkLW9wZW4tZmlsZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpeHR1cmVQYXRoKC4uLnBhcnRzKSB7XG4gICAgICAgIHJldHVybiBzdGRQYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCAuLi5wYXJ0cyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0UGF0aChuZXdQYXRoKSB7XG4gICAgICAgIHBhdGhFZGl0b3Iuc2V0VGV4dChuZXdQYXRoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXJyZW50UGF0aCgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhFZGl0b3IuZ2V0VGV4dCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoKGNvbW1hbmQpIHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh1aVswXSwgY29tbWFuZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVudFBhdGhMaXN0KCkge1xuICAgICAgICByZXR1cm4gdWkuZmluZCgnLmxpc3QtaXRlbTpub3QoLmhpZGRlbiknKVxuICAgICAgICAgICAgICAgICAubWFwKChpLCBpdGVtKSA9PiAkKGl0ZW0pLnRleHQoKS50cmltKCkpXG4gICAgICAgICAgICAgICAgIC5nZXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXJyZW50RWRpdG9yUGF0aHMoKSB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLm1hcCgoZWRpdG9yKSA9PiBlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YWl0c0Zvck9wZW5QYXRocyhjb3VudCwgdGltZW91dD0yMDAwKSB7XG4gICAgICAgIHdhaXRzRm9yKFxuICAgICAgICAgICAgKCkgPT4gY3VycmVudEVkaXRvclBhdGhzKCkubGVuZ3RoID49IGNvdW50LFxuICAgICAgICAgICAgYCR7Y291bnR9IHBhdGhzIHRvIGJlIG9wZW5lZGAsXG4gICAgICAgICAgICB0aW1lb3V0XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb3Blbk1vZGFsKCkge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdhZHZhbmNlZC1vcGVuLWZpbGU6dG9nZ2xlJyk7XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYWN0aXZhdGlvblByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdWkgPSAkKGdldFVJKCkpO1xuICAgICAgICAgICAgICAgIHBhdGhFZGl0b3IgPSB1aS5maW5kKCcucGF0aC1pbnB1dCcpWzBdLmdldE1vZGVsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRDb25maWcoKSB7XG4gICAgICAgIGF0b20uY29uZmlnLnVuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRmlsZUluc3RhbnRseScpO1xuICAgICAgICBhdG9tLmNvbmZpZy51bnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmhlbG1EaXJTd2l0Y2gnKTtcbiAgICAgICAgYXRvbS5jb25maWcudW5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5kZWZhdWx0SW5wdXRWYWx1ZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbGVFeGlzdHMocGF0aCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMuc3RhdFN5bmMocGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRGlyZWN0b3J5KHBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBmcy5zdGF0U3luYyhwYXRoKS5pc0RpcmVjdG9yeSgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHt9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsaWNrRmlsZShmaWxlbmFtZSkge1xuICAgICAgICB1aS5maW5kKGAubGlzdC1pdGVtW2RhdGEtZmlsZS1uYW1lJD0nJHtmaWxlbmFtZX0nXWApLmNsaWNrKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKGlucHV0UGF0aCwgYXV0b2NvbXBsZXRlZFBhdGgpIHtcbiAgICAgICAgc2V0UGF0aChpbnB1dFBhdGgpO1xuICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChhdXRvY29tcGxldGVkUGF0aCk7XG4gICAgfVxuXG4gICAgZGVzY3JpYmUoJ01vZGFsIGRpYWxvZycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG5cbiAgICAgICAgaXQoJ2FwcGVhcnMgd2hlbiB0aGUgdG9nZ2xlIGNvbW1hbmQgaXMgdHJpZ2dlcmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgb3Blbk1vZGFsKClcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChnZXRVSSgpKS5ub3QudG9CZU51bGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZGlzYXBwZWFycyBpZiB0aGUgdG9nZ2xlIGNvbW1hbmQgaXMgdHJpZ2dlcmVkIHdoaWxlIGl0IGlzIHZpc2libGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2FkdmFuY2VkLW9wZW4tZmlsZTp0b2dnbGUnKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZ2V0VUkoKSkudG9CZU51bGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZGlzYXBwZWFycyBpZiB0aGUgY2FuY2VsIGNvbW1hbmQgaXMgdHJpZ2dlcmVkIHdoaWxlIGl0IGlzIHZpc2libGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNhbmNlbCcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChnZXRVSSgpKS50b0JlTnVsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdkaXNhcHBlYXJzIGlmIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIHRoZSBtb2RhbCcsICgpID0+IHtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdWkucGFyZW50KCkuY2xpY2soKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZ2V0VUkoKSkudG9CZU51bGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYXRoIGxpc3RpbmcnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ2xpc3RzIHRoZSBkaXJlY3RvcnkgY29udGVudHMgaWYgdGhlIHBhdGggZW5kcyBpbiBhIHNlcGFyYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgLy8gQWxzbyBpbmNsdWRlcyB0aGUgcGFyZW50IGRpcmVjdG9yeSBhbmQgaXMgc29ydGVkIGFscGhhYmV0aWNhbGx5XG4gICAgICAgICAgICAvLyBncm91cGVkIGJ5IGRpcmVjdG9yaWVzIGFuZCBmaWxlcy5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJy4uJyxcbiAgICAgICAgICAgICAgICAnZXhhbXBsZXMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfb3RoZXJfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdzYW1wbGUuanMnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2xpc3RzIG1hdGNoaW5nIGZpbGVzIGlmIHRoZSBwYXRoIGRvZXNuXFwndCBlbmQgaW4gYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXgnKSk7XG5cbiAgICAgICAgICAgIC8vIEFsc28gc2hvdWxkbid0IGluY2x1ZGUgdGhlIHBhcmVudC5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9tYXRjaC5qcycsXG4gICAgICAgICAgICAgICAgJ3ByZWZpeF9vdGhlcl9tYXRjaC5qcydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnZXhjbHVkZXMgZmlsZXMgdGhhdCBkb25cXCd0IGhhdmUgYSBwcmVmaXggbWF0Y2hpbmcgdGhlIGZyYWdtZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoJykpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFsncHJlZml4X21hdGNoLmpzJ10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY29uc2lkZXJzIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0IHJvb3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCldKTtcbiAgICAgICAgICAgIHNldFBhdGgoc3RkUGF0aC5qb2luKCdleGFtcGxlcycsICdzdWJkaXInKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbJy4uJywgJ3N1YnNhbXBsZS5qcyddKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2F1dG9tYXRpY2FsbHkgdXBkYXRlcyB3aGVuIHRoZSBwYXRoIGNoYW5nZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXgnKSk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfb3RoZXJfbWF0Y2guanMnXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoJykpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFsncHJlZml4X21hdGNoLmpzJ10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgbWF0Y2hlcyBmaWxlcyBjYXNlLWluc2Vuc2l0aXZlbHkgdW5sZXNzIHRoZSBmcmFnbWVudCBjb250YWlucyBhXG4gICAgICAgICAgICBjYXBpdGFsYCwgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfbWF0Y2gnKSk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2hfbG93ZXIuanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfTWF0Y2hfdXBwZXIuanMnXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfTWF0Y2gnKSk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoWydwcmVmaXhfTWF0Y2hfdXBwZXIuanMnXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBzaG93cyBhIGJ1dHRvbiBuZXh0IHRvIGZvbGRlcnMgdGhhdCBjYW4gYmUgY2xpY2tlZCB0byBhZGQgdGhlbSBhc1xuICAgICAgICAgICAgcHJvamVjdCBmb2xkZXJzYCwgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtdKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgbGV0IGV4YW1wbGVMaXN0SXRlbSA9IHVpLmZpbmQoJy5saXN0LWl0ZW1bZGF0YS1maWxlLW5hbWUkPVxcJ2V4YW1wbGVzXFwnXScpO1xuICAgICAgICAgICAgbGV0IGFkZFByb2plY3RGb2xkZXJCdXR0b24gPSBleGFtcGxlTGlzdEl0ZW0uZmluZCgnLmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuICAgICAgICAgICAgZXhwZWN0KGFkZFByb2plY3RGb2xkZXJCdXR0b24ubGVuZ3RoKS50b0VxdWFsKDEpO1xuXG4gICAgICAgICAgICBhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uLmNsaWNrKCk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG5cbiAgICAgICAgICAgIC8vIERvIG5vdCBvcGVuIGZvbGRlciB3aGVuIGNsaWNraW5nLlxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGJ1dHRvbiB3aGVuIGNsaWNrZWQuXG4gICAgICAgICAgICBhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uID0gdWkuZmluZChcbiAgICAgICAgICAgICAgICAnLmxpc3QtaXRlbVtkYXRhLWZpbGUtbmFtZSQ9XFwnZXhhbXBsZXNcXCddIC5hZGQtcHJvamVjdC1mb2xkZXInXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZXhwZWN0KGFkZFByb2plY3RGb2xkZXJCdXR0b24ubGVuZ3RoKS50b0VxdWFsKDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgZG9lcyBub3Qgc2hvdyB0aGUgYWRkLXByb2plY3QtZm9sZGVyIGJ1dHRvbiBmb3IgZm9sZGVycyB0aGF0IGFyZVxuICAgICAgICAgICAgYWxyZWFkeSBwcm9qZWN0IGZvbGRlcnNgLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIGxldCBleGFtcGxlTGlzdEl0ZW0gPSB1aS5maW5kKCcubGlzdC1pdGVtW2RhdGEtZmlsZS1uYW1lJD1cXCdleGFtcGxlc1xcJ10nKTtcbiAgICAgICAgICAgIGxldCBhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uID0gZXhhbXBsZUxpc3RJdGVtLmZpbmQoJy5hZGQtcHJvamVjdC1mb2xkZXInKTtcbiAgICAgICAgICAgIGV4cGVjdChhZGRQcm9qZWN0Rm9sZGVyQnV0dG9uLmxlbmd0aCkudG9FcXVhbCgwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2V4cGFuZHMgdGlsZGVzIGF0IHRoZSBzdGFydCB0byB0aGUgdXNlclxcJ3MgaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBzcHlPbihvc2VudiwgJ2hvbWUnKS5hbmRSZXR1cm4oZml4dHVyZVBhdGgoKSk7XG4gICAgICAgICAgICBzZXRQYXRoKHN0ZFBhdGguam9pbignficsICdleGFtcGxlcycsICdzdWJkaXInKSArIHN0ZFBhdGguc2VwKTtcblxuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoTGlzdCgpKS50b0VxdWFsKFsnLi4nLCAnc3Vic2FtcGxlLmpzJ10pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYXRoIGlucHV0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdjYW4gYXV0b2NvbXBsZXRlIHRoZSBjdXJyZW50IGlucHV0JywgKCkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmVmaXhfbWEnKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gYXV0b2NvbXBsZXRlIHRoZSBzaGFyZWQgcGFydHMgYmV0d2VlbiB0d28gbWF0Y2hpbmcgcGF0aHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZScpLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdwcmVmaXhfJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdpbnNlcnRzIGEgdHJhaWxpbmcgc2VwYXJhdG9yIHdoZW4gYXV0b2NvbXBsZXRpbmcgYSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW0nKSxcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHN0ZFBhdGguc2VwXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYmVlcHMgaWYgYXV0b2NvbXBsZXRlIGZpbmRzIG5vIG1hdGNocycsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdkb2VzX25vdF9leGlzdCcpKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdkb2VzX25vdF9leGlzdCcpKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2JlZXBzIGlmIGF1dG9jb21wbGV0ZSBjYW5ub3QgYXV0b2NvbXBsZXRlIGFueSBtb3JlIHNoYXJlZCBwYXJ0cycsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdwcmVmaXhfJykpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ3ByZWZpeF8nKSk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBpcyBjYXNlLXNlbnNpdGl2ZSBkdXJpbmcgYXV0b2NvbXBsZXRlIGlmIHRoZSBmcmFnbWVudCBoYXMgYSBjYXBpdGFsXG4gICAgICAgICAgICBsZXR0ZXJgLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9tJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdjYXNlU2Vuc2l0aXZlJywgJ3ByZWZpeF9tYXRjaF8nKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfTScpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6YXV0b2NvbXBsZXRlJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChcbiAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnY2FzZVNlbnNpdGl2ZScsICdwcmVmaXhfTWF0Y2hfdXBwZXIuanMnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGNhbiBhdXRvY29tcGxldGUgd2hlbiB0aGUgcGF0aCBsaXN0aW5nIGNvbnRhaW5zIHR3byBwYXRocyB3aGVyZVxuICAgICAgICAgICAgb25lIHBhdGggaXMgdGhlIHByZWZpeCBvZiBhbm90aGVyYCwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhlIGV4YW1wbGUgaGFzIGBwbGFubmluZ2AgYW5kIGBwbGFubmluZ19iYWNrZW5kYC4gVGhlIGJ1ZyBhcmlzZXNcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhlIGVudGlyZSBgcGxhbm5pbmdgIHBhdGggaXMgYSBwcmVmaXggb2YgdGhlIG90aGVyLlxuICAgICAgICAgICAgYXNzZXJ0QXV0b2NvbXBsZXRlc1RvKFxuICAgICAgICAgICAgICAgIGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdtYXRjaFByZWZpeCcsICdwbGFuJyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ21hdGNoUHJlZml4JywgJ3BsYW5uaW5nJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdmaXhlcyB0aGUgY2FzZSBvZiBsZXR0ZXJzIGluIHRoZSBmcmFnbWVudCBpZiBuZWNlc3NhcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X21hdGNoX3VwJyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2V4YW1wbGVzJywgJ2Nhc2VTZW5zaXRpdmUnLCAncHJlZml4X01hdGNoX3VwcGVyLmpzJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gcmVtb3ZlIHRoZSBjdXJyZW50IHBhdGggY29tcG9uZW50JywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZnJhZ21lbnQnKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmRlbGV0ZS1wYXRoLWNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICAvLyBMZWF2ZXMgdHJhaWxpbmcgc2xhc2gsIGFzIHdlbGwuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgcmVtb3ZlcyB0aGUgcGFyZW50IGRpcmVjdG9yeSB3aGVuIHJlbW92aW5nIGEgcGF0aCBjb21wb25lbnQgd2l0aCBub1xuICAgICAgICAgICAgZnJhZ21lbnRgLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6ZGVsZXRlLXBhdGgtY29tcG9uZW50Jyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIHN3aXRjaCB0byB0aGUgdXNlclxcJ3MgaG9tZSBkaXJlY3RvcnkgdXNpbmcgYSBzaG9ydGN1dCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmhlbG1EaXJTd2l0Y2gnLCB0cnVlKTtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpICsgc3RkUGF0aC5zZXAgKyAnficgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChvc2Vudi5ob21lKCkgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIC8vIEFsc28gdGVzdCB3aGVuIHRoZSByZXN0IG9mIHRoZSBwYXRoIGlzIGVtcHR5LlxuICAgICAgICAgICAgc2V0UGF0aCgnficgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChvc2Vudi5ob21lKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gc3dpdGNoIHRvIHRoZSBmaWxlc3lzdGVtIHJvb3QgdXNpbmcgYSBzaG9ydGN1dCcsICgpID0+IHtcbiAgICAgICAgICAgIC8vIEZvciBjcm9zcy1wbGF0Zm9ybW5lc3MsIHdlIGNoZWF0IGJ5IHVzaW5nIFBhdGguIE9oIHdlbGwuXG4gICAgICAgICAgICBsZXQgZnNSb290ID0gbmV3IFBhdGgoZml4dHVyZVBhdGgoJ3N1YmRpcicpKS5yb290KCkuZnVsbDtcblxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuaGVsbURpclN3aXRjaCcsIHRydWUpO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykgKyBzdGRQYXRoLnNlcCArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZzUm9vdCk7XG5cbiAgICAgICAgICAgIC8vIFdoZW4gdGhlIHJlc3Qgb2YgcGF0aCBpcyBlbXB0eSwgc29tZSBwbGF0Zm9ybXMgKFdpbmRvd3MgbWFpbmx5KVxuICAgICAgICAgICAgLy8gY2FuJ3QgaW5mZXIgYSBkcml2ZSBsZXR0ZXIsIHNvIHdlIGNhbid0IHVzZSBmc1Jvb3QgZnJvbSBhYm92ZS5cbiAgICAgICAgICAgIC8vIEluc3RlYWQsIHdlJ2xsIHVzZSB0aGUgcm9vdCBvZiB0aGUgcGF0aCB3ZSdyZSB0ZXN0aW5nLlxuICAgICAgICAgICAgZnNSb290ID0gbmV3IFBhdGgoc3RkUGF0aC5zZXAgKyBzdGRQYXRoLnNlcCkucm9vdCgpLmZ1bGw7XG5cbiAgICAgICAgICAgIC8vIEFsc28gdGVzdCB3aGVuIHRoZSByZXN0IG9mIHRoZSBwYXRoIGlzIGVtcHR5LlxuICAgICAgICAgICAgc2V0UGF0aChzdGRQYXRoLnNlcCArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZzUm9vdCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gc3dpdGNoIHRvIHRoZSBwcm9qZWN0IHJvb3QgZGlyZWN0b3J5IHVzaW5nIGEgc2hvcnRjdXQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5oZWxtRGlyU3dpdGNoJywgdHJ1ZSk7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdzdWJkaXInKSArIHN0ZFBhdGguc2VwICsgJzonICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIC8vIEFsc28gdGVzdCB3aGVuIHRoZSByZXN0IG9mIHRoZSBwYXRoIGlzIGVtcHR5LlxuICAgICAgICAgICAgc2V0UGF0aCgnOicgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IHJlc2V0IHRoZSBjdXJzb3IgcG9zaXRpb24gd2hpbGUgdHlwaW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnc3ViZGlyJykpO1xuXG4gICAgICAgICAgICAvLyBTZXQgY3Vyc29yIHRvIGJlIGJldHdlZW4gdGhlIGQgYW5kIGkgaW4gc3ViZGlyLlxuICAgICAgICAgICAgbGV0IGVuZCA9IHBhdGhFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgICAgICAgICAgIHBhdGhFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2VuZC5yb3csIGVuZC5jb2x1bW4gLSAyXSlcblxuICAgICAgICAgICAgLy8gSW5zZXJ0IGEgbmV3IGxldHRlciBhbmQgY2hlY2sgdGhhdCB0aGUgY3Vyc29yIGlzIGFmdGVyIGl0IGJ1dFxuICAgICAgICAgICAgLy8gbm90IGF0IHRoZSBlbmQgb2YgdGhlIGVkaXRvciBjb21wbGV0ZWx5LlxuICAgICAgICAgICAgcGF0aEVkaXRvci5pbnNlcnRUZXh0KCdhJyk7XG4gICAgICAgICAgICBsZXQgbmV3RW5kID0gcGF0aEVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgICAgZXhwZWN0KG5ld0VuZC5jb2x1bW4pLnRvRXF1YWwoZW5kLmNvbHVtbiAtIDEpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdQYXRoIGlucHV0IGRlZmF1bHQgdmFsdWUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuXG4gICAgICAgIGl0KCdjYW4gYmUgY29uZmlndXJlZCB0byBiZSB0aGUgY3VycmVudCBmaWxlXFwncyBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoXG4gICAgICAgICAgICAgICAgJ2FkdmFuY2VkLW9wZW4tZmlsZS5kZWZhdWx0SW5wdXRWYWx1ZScsXG4gICAgICAgICAgICAgICAgREVGQVVMVF9BQ1RJVkVfRklMRV9ESVJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBiZSBjb25maWd1cmVkIHRvIGJlIHRoZSBjdXJyZW50IHByb2plY3Qgcm9vdCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChcbiAgICAgICAgICAgICAgICAnYWR2YW5jZWQtb3Blbi1maWxlLmRlZmF1bHRJbnB1dFZhbHVlJyxcbiAgICAgICAgICAgICAgICAgREVGQVVMVF9QUk9KRUNUX1JPT1RcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG4gICAgICAgICAgICBvcGVuTW9kYWwoKTtcblxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBiZSBjb25maWd1cmVkIHRvIGJlIGJsYW5rJywgKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuZGVmYXVsdElucHV0VmFsdWUnLCBERUZBVUxUX0VNUFRZKTtcbiAgICAgICAgICAgIG9wZW5Nb2RhbCgpO1xuXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbCgnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnVW5kbycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnY2FuIHVuZG8gdGFiIGNvbXBsZXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTphdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTp1bmRvJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbScpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiB1bmRvIGRlbGV0aW5nIHBhdGggY29tcG9uZW50cycsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW0nKSk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOmRlbGV0ZS1wYXRoLWNvbXBvbmVudCcpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6dW5kbycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW0nKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gdW5kbyBjbGlja2luZyBhIGZvbGRlcicsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIGNsaWNrRmlsZSgnZXhhbXBsZXMnKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCdleGFtcGxlcycpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTp1bmRvJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYmVlcHMgd2hlbiBpdCBjYW5ub3QgdW5kbyBhbnkgZmFydGhlcicsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOnVuZG8nKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmJlZXApLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnT3BlbmluZyBmaWxlcycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnb3BlbnMgYW4gZXhpc3RpbmcgZmlsZSBpZiB0aGUgY3VycmVudCBwYXRoIHBvaW50cyB0byBvbmUnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IGZpeHR1cmVQYXRoKCdzYW1wbGUuanMnKTtcbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtwYXRoXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlcGxhY2VzIHRoZSBwYXRoIHdoZW4gYXR0ZW1wdGluZyB0byBvcGVuIGFuIGV4aXN0aW5nIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KGBiZWVwcyB3aGVuIGF0dGVtcHRpbmcgdG8gb3BlbiBhIHBhdGggZW5kaW5nIGluIGEgc2VwYXJhdG9yIChhXG4gICAgICAgICAgICBub24tZXhpc3RhbnQgZGlyZWN0b3J5KWAsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdub3R0aGVyZScpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgY3JlYXRlcyB0aGUgZGlyZWN0b3J5IHdoZW4gb3BlbmluZyBhIHBhdGggZW5kaW5nIGEgc2VwYXJhdG9yIGlmXG4gICAgICAgICAgICBjb25maWd1cmVkYCwgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCAnbmV3ZGlyJykgKyBzdGRQYXRoLnNlcDtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZURpcmVjdG9yaWVzJywgdHJ1ZSk7XG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0KGlzRGlyZWN0b3J5KHBhdGgpKS50b0VxdWFsKGZhbHNlKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGlzRGlyZWN0b3J5KHBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnb3BlbnMgYSBuZXcgZmlsZSB3aXRob3V0IHNhdmluZyBpdCBpZiBvcGVuaW5nIGEgbm9uLWV4aXN0YW50IHBhdGgnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IGZpeHR1cmVQYXRoKCdkb2VzLm5vdC5leGlzdCcpO1xuICAgICAgICAgICAgc2V0UGF0aChwYXRoKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW3BhdGhdKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhwYXRoKSkudG9FcXVhbChmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgYSBuZXcgZmlsZSB3aGVuIGNvbmZpZ3VyZWQgdG8nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsICduZXdmaWxlLmpzJyk7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2FkdmFuY2VkLW9wZW4tZmlsZS5jcmVhdGVGaWxlSW5zdGFudGx5JywgdHJ1ZSk7XG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMocGF0aCkpLnRvRXF1YWwoZmFsc2UpO1xuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygxKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChjdXJyZW50RWRpdG9yUGF0aHMoKSkudG9FcXVhbChbcGF0aF0pO1xuICAgICAgICAgICAgICAgIGV4cGVjdChmaWxlRXhpc3RzKHBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjcmVhdGVzIGludGVybWVkaWF0ZSBkaXJlY3RvcmllcyB3aGVuIG5lY2Vzc2FyeScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IG5ld0RpciA9IHN0ZFBhdGguam9pbih0ZW1wRGlyLCAnbmV3RGlyJyk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbihuZXdEaXIsICduZXdGaWxlLmpzJyk7XG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMobmV3RGlyKSkudG9FcXVhbChmYWxzZSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtwYXRoXSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMobmV3RGlyKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2FuIGNyZWF0ZSBmaWxlcyBmcm9tIHJlbGF0aXZlIHBhdGhzJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRlbXBEaXIgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoKSk7XG4gICAgICAgICAgICBsZXQgcGF0aCA9IHN0ZFBhdGguam9pbignbmV3RGlyJywgJ25ld0ZpbGUuanMnKTtcbiAgICAgICAgICAgIGxldCBhYnNvbHV0ZVBhdGggPSBzdGRQYXRoLmpvaW4odGVtcERpciwgcGF0aCk7XG5cbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbdGVtcERpcl0pO1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuY3JlYXRlRmlsZUluc3RhbnRseScsIHRydWUpO1xuXG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZXhwZWN0KGZpbGVFeGlzdHMoYWJzb2x1dGVQYXRoKSkudG9FcXVhbChmYWxzZSk7XG5cbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFthYnNvbHV0ZVBhdGhdKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZmlsZUV4aXN0cyhhYnNvbHV0ZVBhdGgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdjYW4gb3BlbiBmaWxlcyBmcm9tIHRpbGRlLXByZWZpeGVkIHBhdGhzJywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24ob3NlbnYsICdob21lJykuYW5kUmV0dXJuKGZpeHR1cmVQYXRoKCkpO1xuICAgICAgICAgICAgc2V0UGF0aChzdGRQYXRoLmpvaW4oJ34nLCAnZXhhbXBsZXMnLCAnc3ViZGlyJywgJ3N1YnNhbXBsZS5qcycpKTtcblxuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnc3ViZGlyJywgJ3N1YnNhbXBsZS5qcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBvcGVuIGZpbGVzIGluIG5ldyBzcGxpdCBwYW5lcycsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpLmxlbmd0aCkudG9FcXVhbCgxKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ3BhbmU6c3BsaXQtbGVmdCcpO1xuXG4gICAgICAgICAgICB3YWl0c0Zvck9wZW5QYXRocygyKTtcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4cGVjdChuZXcgU2V0KGN1cnJlbnRFZGl0b3JQYXRocygpKSkudG9FcXVhbChuZXcgU2V0KFtcbiAgICAgICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3NhbXBsZS5qcycpLFxuICAgICAgICAgICAgICAgICAgICBmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJyksXG4gICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpLmxlbmd0aCkudG9FcXVhbCgyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgc2hvd3MgYW4gZXJyb3Igbm90aWZpY2F0aW9uIHdoZW4gY3JlYXRpbmcgYSBzdWJkaXJlY3RvcnkgdGhyb3dzIGFuXG4gICAgICAgICAgICBlcnJvcmAsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20ubm90aWZpY2F0aW9ucywgJ2FkZEVycm9yJyk7XG4gICAgICAgICAgICBzcHlPbihta2RpcnAsICdzeW5jJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT0ggTk8nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbm9QZXJtaXNzaW9uJywgJ3N1YmRpcicsICdmaWxlLnR4dCcpKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYHNob3dzIGFuIGVycm9yIG5vdGlmaWNhdGlvbiB3aGVuIGNyZWF0aW5nIGEgZmlsZSBpbiBhIGRpcmVjdG9yeVxuICAgICAgICAgICAgdGhyb3dzIGFuIGVycm9yYCwgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbS5ub3RpZmljYXRpb25zLCAnYWRkRXJyb3InKTtcbiAgICAgICAgICAgIHNweU9uKHRvdWNoLCAnc3luYycpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ09IIE5PJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknLCB0cnVlKTtcblxuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnLCAnbm9QZXJtaXNzaW9uJywgJ2ZpbGUudHh0JykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdLZXlib2FyZCBuYXZpZ2F0aW9uJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKHJlc2V0Q29uZmlnKTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIC8qXG4gICAgICAgICAgICBGb3IgcmVmZXJlbmNlLCBleHBlY3RlZCBsaXN0aW5nIGluIGZpeHR1cmVzIGlzOlxuICAgICAgICAgICAgLi5cbiAgICAgICAgICAgIGV4YW1wbGVzXG4gICAgICAgICAgICBwcmVmaXhfbWF0Y2guanNcbiAgICAgICAgICAgIHByZWZpeF9vdGhlcl9tYXRjaC5qc1xuICAgICAgICAgICAgc2FtcGxlLmpzXG4gICAgICAgICovXG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZURvd24odGltZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGltZXM7IGsrKykge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoKCdhZHZhbmNlZC1vcGVuLWZpbGU6bW92ZS1jdXJzb3ItZG93bicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZVVwKHRpbWVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRpbWVzOyBrKyspIHtcbiAgICAgICAgICAgICAgICBkaXNwYXRjaCgnYWR2YW5jZWQtb3Blbi1maWxlOm1vdmUtY3Vyc29yLXVwJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpdCgnYWxsb3dzIG1vdmluZyBhIGN1cnNvciB0byBhIGZpbGUgYW5kIGNvbmZpcm1pbmcgdG8gc2VsZWN0IGEgcGF0aCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDQpO1xuICAgICAgICAgICAgbW92ZVVwKDEpOyAvLyBUZXN0IG1vdmVtZW50IGJvdGggZG93biBhbmQgdXAuXG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJyldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnd3JhcHMgdGhlIGN1cnNvciBhdCB0aGUgZWRnZXMnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlVXAoMik7XG4gICAgICAgICAgICBtb3ZlRG93big0KTtcbiAgICAgICAgICAgIG1vdmVVcCg1KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcblxuICAgICAgICAgICAgd2FpdHNGb3JPcGVuUGF0aHMoMSk7XG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgICBleHBlY3QoY3VycmVudEVkaXRvclBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdwcmVmaXhfbWF0Y2guanMnKV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdyZXBsYWNlcyB0aGUgY3VycmVudCBwYXRoIHdoZW4gc2VsZWN0aW5nIGEgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgbW92ZURvd24oMik7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKSArIHN0ZFBhdGguc2VwKVxuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnbW92ZXMgdG8gdGhlIHBhcmVudCBkaXJlY3Rvcnkgd2hlbiB0aGUgLi4gZWxlbWVudCBpcyBzZWxlY3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigxKTtcbiAgICAgICAgICAgIGRpc3BhdGNoKCdjb3JlOmNvbmZpcm0nKTtcbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aCgpKS50b0VxdWFsKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2NhbiBhZGQgZm9sZGVycyBhcyBwcm9qZWN0IGRpcmVjdG9yaWVzIHVzaW5nIGEga2V5Ym9hcmQgY29tbWFuZCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbXSk7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigyKTsgLy8gZXhhbXBsZXMgZm9sZGVyXG4gICAgICAgICAgICBkaXNwYXRjaCgnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdiZWVwcyB3aGVuIHRyeWluZyB0byBhZGQgdGhlIHBhcmVudCBmb2xkZXIgYXMgYSBwcm9qZWN0IGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW10pO1xuXG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBtb3ZlRG93bigxKTsgLy8gUGFyZW50IGZvbGRlclxuICAgICAgICAgICAgZGlzcGF0Y2goJ2FwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlcicpO1xuXG4gICAgICAgICAgICBleHBlY3QoYXRvbS5iZWVwKS50b0hhdmVCZWVuQ2FsbGVkKCk7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW10pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYmVlcHMgd2hlbiB0cnlpbmcgdG8gYWRkIGEgZmlsZSBhcyBhIHByb2plY3QgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc3B5T24oYXRvbSwgJ2JlZXAnKTtcbiAgICAgICAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbXSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDMpOyAvLyBwcmVmaXhfbWF0Y2guanNcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKTtcblxuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoYGJlZXBzIHdoZW4gdHJ5aW5nIHRvIGFkZCBhIGZvbGRlciBhcyBhIHByb2plY3QgZGlyZWN0b3J5IHRoYXQgaXNcbiAgICAgICAgICAgICAgICBhbHJlYWR5IG9uZWAsICgpID0+IHtcbiAgICAgICAgICAgIHNweU9uKGF0b20sICdiZWVwJyk7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCdleGFtcGxlcycpXSk7XG5cbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoKSArIHN0ZFBhdGguc2VwKTtcbiAgICAgICAgICAgIG1vdmVEb3duKDIpOyAvLyBleGFtcGxlcyBmb2xkZXJcbiAgICAgICAgICAgIGRpc3BhdGNoKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKTtcblxuICAgICAgICAgICAgZXhwZWN0KGF0b20uYmVlcCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgICAgICAgICAgZXhwZWN0KGF0b20ucHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgnZXhhbXBsZXMnKV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdChgY2FuIHNlbGVjdCB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdCBpZiBub25lIGFyZSBzZWxlY3RlZCB1c2luZ1xuICAgICAgICAgICAgc3BlY2lhbCBjb21tYW5kYCwgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgncHJlZml4JykpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2FkdmFuY2VkLW9wZW4tZmlsZTpjb25maXJtLXNlbGVjdGVkLW9yLWZpcnN0Jyk7XG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgncHJlZml4X21hdGNoLmpzJyldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ01vdXNlIG5hdmlnYXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2gocmVzZXRDb25maWcpO1xuICAgICAgICBiZWZvcmVFYWNoKG9wZW5Nb2RhbCk7XG5cbiAgICAgICAgaXQoJ29wZW5zIGEgcGF0aCB3aGVuIGl0IGlzIGNsaWNrZWQgb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCkgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICBjbGlja0ZpbGUoJ3NhbXBsZS5qcycpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yT3BlblBhdGhzKDEpO1xuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRFZGl0b3JQYXRocygpKS50b0VxdWFsKFtmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJyldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgncmVwbGFjZXMgdGhlIGN1cnJlbnQgcGF0aCB3aGVuIGNsaWNraW5nIGEgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuICAgICAgICAgICAgY2xpY2tGaWxlKCdleGFtcGxlcycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ21vdmVzIHRvIHRoZSBwYXJlbnQgZGlyZWN0b3J5IHdoZW4gdGhlIC4uIGVsZW1lbnQgaXMgY2xpY2tlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2V4YW1wbGVzJykgKyBzdGRQYXRoLnNlcCk7XG4gICAgICAgICAgICB1aS5maW5kKCcubGlzdC1pdGVtLnBhcmVudCcpLmNsaWNrKCk7XG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGgoKSkudG9FcXVhbChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ0V2ZW50cycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2gob3Blbk1vZGFsKTtcblxuICAgICAgICBpdCgnYWxsb3dzIHN1YnNjcmlwdGlvbiB0byBldmVudHMgd2hlbiBwYXRocyBhcmUgb3BlbmVkJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgnaGFuZGxlcicpO1xuICAgICAgICAgICAgbGV0IHN1YiA9IHByb3ZpZGVFdmVudFNlcnZpY2UoKS5vbkRpZE9wZW5QYXRoKGhhbmRsZXIpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBmaXh0dXJlUGF0aCgnc2FtcGxlLmpzJyk7XG5cbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoaGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZFdpdGgocGF0aCk7XG4gICAgICAgICAgICBzdWIuZGlzcG9zZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYWxsb3dzIHN1YnNjcmlwdGlvbiB0byBldmVudHMgd2hlbiBwYXRocyBhcmUgY3JlYXRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZUZpbGVJbnN0YW50bHknLCB0cnVlKTtcbiAgICAgICAgICAgIGxldCB0ZW1wRGlyID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKCkpO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBzdGRQYXRoLmpvaW4odGVtcERpciwgJ25ld2ZpbGUuanMnKTtcbiAgICAgICAgICAgIGxldCBoYW5kbGVyID0gamFzbWluZS5jcmVhdGVTcHkoJ2hhbmRsZXInKTtcbiAgICAgICAgICAgIGxldCBzdWIgPSBwcm92aWRlRXZlbnRTZXJ2aWNlKCkub25EaWRDcmVhdGVQYXRoKGhhbmRsZXIpO1xuXG4gICAgICAgICAgICBzZXRQYXRoKHBhdGgpO1xuICAgICAgICAgICAgZGlzcGF0Y2goJ2NvcmU6Y29uZmlybScpO1xuICAgICAgICAgICAgZXhwZWN0KGhhbmRsZXIpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHBhdGgpO1xuICAgICAgICAgICAgc3ViLmRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2VtaXRzIHRoZSBjcmVhdGUgZXZlbnQgd2hlbiBjcmVhdGluZyBhIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnYWR2YW5jZWQtb3Blbi1maWxlLmNyZWF0ZURpcmVjdG9yaWVzJywgdHJ1ZSk7XG4gICAgICAgICAgICBsZXQgdGVtcERpciA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYygpKTtcbiAgICAgICAgICAgIGxldCBwYXRoID0gc3RkUGF0aC5qb2luKHRlbXBEaXIsICduZXdkaXInKSArIHN0ZFBhdGguc2VwO1xuICAgICAgICAgICAgbGV0IGhhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgnaGFuZGxlcicpO1xuICAgICAgICAgICAgbGV0IHN1YiA9IHByb3ZpZGVFdmVudFNlcnZpY2UoKS5vbkRpZENyZWF0ZVBhdGgoaGFuZGxlcik7XG5cbiAgICAgICAgICAgIHNldFBhdGgocGF0aCk7XG4gICAgICAgICAgICBkaXNwYXRjaCgnY29yZTpjb25maXJtJyk7XG4gICAgICAgICAgICBleHBlY3QoaGFuZGxlcikudG9IYXZlQmVlbkNhbGxlZFdpdGgobmV3IFBhdGgocGF0aCkuYWJzb2x1dGUpO1xuICAgICAgICAgICAgc3ViLmRpc3Bvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBPbmx5IHJ1biBXaW5kb3dzLXNwZWNpZmljIHRlc3RzIHdoZW4gZW5hYmxlZC5cbiAgICBsZXQgd2luZG93c0Rlc2NyaWJlID0gcHJvY2Vzcy5lbnYuQU9GX1dJTkRPV1NfVEVTVFMgPyBkZXNjcmliZSA6IHhkZXNjcmliZTtcbiAgICB3aW5kb3dzRGVzY3JpYmUoJ1dpbmRvd3Mtc3BlY2lmaWMgdGVzdHMnLCAoKSA9PiB7XG4gICAgICAgIC8vIEp1c3QgYXMgYSBub3RlLCB3ZSdyZSBhc3N1bWluZyBDOlxcIGV4aXN0cyBhbmQgaXMgdGhlIHJvb3RcbiAgICAgICAgLy8gc3lzdGVtIGRyaXZlLiBJdCBpcyBvbiBBcHBWZXlvciwgYW5kIHRoYXQncyBnb29kIGVub3VnaC5cblxuICAgICAgICBpdCgnY2FuIHJlYWQgdGhlIHJvb3QgZGlyZWN0b3J5IHdpdGhvdXQgZmFpbGluZycsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRoaXMgcG90ZW50aWFsbHkgZmFpbHMgYmVjYXVzZSB3ZSBzdGF0IGluLXVzZSBmaWxlcyBsaWtlXG4gICAgICAgICAgICAvLyBwYWdlZmlsZS5zeXMuXG4gICAgICAgICAgICBleHBlY3QoKCkgPT4ge3NldFBhdGgoJ0M6XFxcXCcpfSkubm90LnRvVGhyb3coKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IHJlcGxhY2UgZHJpdmUgbGV0dGVycyB3aXRoIHRoZSBwcm9qZWN0IHJvb3QnLCAoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2ZpeHR1cmVQYXRoKCldKTtcbiAgICAgICAgICAgIHNldFBhdGgoJ0M6LycpO1xuICAgICAgICAgICAgZXhwZWN0KGN1cnJlbnRQYXRoKCkpLnRvRXF1YWwoJ0M6LycpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdGdXp6eSBmaWxlbmFtZSBtYXRjaGluZycsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaChyZXNldENvbmZpZyk7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhZHZhbmNlZC1vcGVuLWZpbGUuZnV6enlNYXRjaCcsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgYmVmb3JlRWFjaChvcGVuTW9kYWwpO1xuXG4gICAgICAgIGl0KCdsaXN0cyBmaWxlcyBhbmQgZm9sZGVycyBhcyBub3JtYWwgd2hlbiBubyBmcmFnbWVudCBpcyBiZWluZyBtYXRjaGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF0aChmaXh0dXJlUGF0aCgpICsgc3RkUGF0aC5zZXApO1xuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICcuLicsXG4gICAgICAgICAgICAgICAgJ2V4YW1wbGVzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAncHJlZml4X290aGVyX21hdGNoLmpzJyxcbiAgICAgICAgICAgICAgICAnc2FtcGxlLmpzJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCd1c2VzIGEgZnV6enkgYWxnb3JpdGhtIGZvciBtYXRjaGluZyBmaWxlcyBpbnN0ZWFkIG9mIHByZWZpeCBtYXRjaGluZycsICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdGgoZml4dHVyZVBhdGgoJ2l4JykpO1xuXG4gICAgICAgICAgICBleHBlY3QoY3VycmVudFBhdGhMaXN0KCkpLnRvRXF1YWwoW1xuICAgICAgICAgICAgICAgICdwcmVmaXhfbWF0Y2guanMnLFxuICAgICAgICAgICAgICAgICdwcmVmaXhfb3RoZXJfbWF0Y2guanMnLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzb3J0cyBtYXRjaGVzIGJ5IHdlaWdodCBpbnN0ZWFkIG9mIGJ5IG5hbWUnLCAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXRoKGZpeHR1cmVQYXRoKCdleGFtcGxlcycsICdmdXp6eVdlaWdodCcsICdoZWF2eV8nKSk7XG5cbiAgICAgICAgICAgIGV4cGVjdChjdXJyZW50UGF0aExpc3QoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgICAgJ21vcmVfaGVhdnlfaGVhdnkuanMnLFxuICAgICAgICAgICAgICAgICdsZXNzX2hlYXZ5LmpzJyxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnY2hvb3NlcyB0aGUgZmlyc3QgbWF0Y2ggZm9yIGF1dG9jb21wbGV0ZSB3aGVuIG5vdGhpbmcgaXMgaGlnaGxpZ2h0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRBdXRvY29tcGxldGVzVG8oXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ2l4JyksXG4gICAgICAgICAgICAgICAgZml4dHVyZVBhdGgoJ3ByZWZpeF9tYXRjaC5qcycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/anirudh/.atom/packages/advanced-open-file/spec/advanced-open-file-spec.js
