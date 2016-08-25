(function() {
  var CompositeDisposable, DiffViewEditor, Directory, File, LoadingView, SplitDiff, SyncScroll, configSchema, path, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Directory = _ref.Directory, File = _ref.File;

  DiffViewEditor = require('./build-lines');

  LoadingView = require('./loading-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require("./config-schema");

  path = require('path');

  module.exports = SplitDiff = {
    config: configSchema,
    subscriptions: null,
    diffViewEditor1: null,
    diffViewEditor2: null,
    editorSubscriptions: null,
    isWhitespaceIgnored: false,
    isWordDiffEnabled: true,
    linkedDiffChunks: null,
    diffChunkPointer: 0,
    isFirstChunkSelect: true,
    wasEditor1SoftWrapped: false,
    wasEditor2SoftWrapped: false,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    loadingView: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'split-diff:enable': (function(_this) {
          return function() {
            return _this.diffPanes();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            return _this.nextDiff();
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            return _this.prevDiff();
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            return _this.copyChunkToRight();
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            return _this.copyChunkToLeft();
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable(false);
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable(true);
      } else {
        return this.diffPanes();
      }
    },
    disable: function(displayMsg) {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffViewEditor1 != null) {
        if (this.wasEditor1SoftWrapped) {
          this.diffViewEditor1.enableSoftWrap();
        }
        if (this.wasEditor1Created) {
          this.diffViewEditor1.cleanUp();
        }
      }
      if (this.diffViewEditor2 != null) {
        if (this.wasEditor2SoftWrapped) {
          this.diffViewEditor2.enableSoftWrap();
        }
        if (this.wasEditor2Created) {
          this.diffViewEditor2.cleanUp();
        }
      }
      this._clearDiff();
      this.diffChunkPointer = 0;
      this.isFirstChunkSelect = true;
      this.wasEditor1SoftWrapped = false;
      this.wasEditor1Created = false;
      this.wasEditor2SoftWrapped = false;
      this.wasEditor2Created = false;
      this.hasGitRepo = false;
      if (displayMsg) {
        return atom.notifications.addInfo('Split Diff Disabled', {
          dismissable: false
        });
      }
    },
    toggleIgnoreWhitespace: function() {
      this._setConfig('ignoreWhitespace', !this.isWhitespaceIgnored);
      return this.isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
    },
    nextDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer++;
        if (this.diffChunkPointer >= this.linkedDiffChunks.length) {
          this.diffChunkPointer = 0;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    prevDiff: function() {
      if (!this.isFirstChunkSelect) {
        this.diffChunkPointer--;
        if (this.diffChunkPointer < 0) {
          this.diffChunkPointer = this.linkedDiffChunks.length - 1;
        }
      } else {
        this.isFirstChunkSelect = false;
      }
      return this._selectDiffs(this.linkedDiffChunks[this.diffChunkPointer]);
    },
    copyChunkToRight: function() {
      var diffChunk, lineRange, linesToMove, moveText, offset, _i, _len, _results;
      linesToMove = this.diffViewEditor1.getCursorDiffLines();
      offset = 0;
      _results = [];
      for (_i = 0, _len = linesToMove.length; _i < _len; _i++) {
        lineRange = linesToMove[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.linkedDiffChunks;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            diffChunk = _ref1[_j];
            if (lineRange.start.row === diffChunk.oldLineStart) {
              moveText = this.diffViewEditor1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
              this.diffViewEditor2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], moveText);
              _results1.push(offset += (diffChunk.oldLineEnd - diffChunk.oldLineStart) - (diffChunk.newLineEnd - diffChunk.newLineStart));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    },
    copyChunkToLeft: function() {
      var diffChunk, lineRange, linesToMove, moveText, offset, _i, _len, _results;
      linesToMove = this.diffViewEditor2.getCursorDiffLines();
      offset = 0;
      _results = [];
      for (_i = 0, _len = linesToMove.length; _i < _len; _i++) {
        lineRange = linesToMove[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.linkedDiffChunks;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            diffChunk = _ref1[_j];
            if (lineRange.start.row === diffChunk.newLineStart) {
              moveText = this.diffViewEditor2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
              this.diffViewEditor1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], moveText);
              _results1.push(offset += (diffChunk.newLineEnd - diffChunk.newLineStart) - (diffChunk.oldLineEnd - diffChunk.oldLineStart));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    },
    diffPanes: function() {
      var detailMsg, editors;
      this.disable(false);
      editors = this._getVisibleEditors();
      this.editorSubscriptions = new CompositeDisposable();
      this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          return _this.disable(true);
        };
      })(this)));
      this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
        return function() {
          return _this.updateDiff(editors);
        };
      })(this)));
      if (!this.hasGitRepo) {
        this.updateDiff(editors);
      }
      this.editorSubscriptions.add(atom.menu.add([
        {
          'label': 'Packages',
          'submenu': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }, {
                  'label': 'Copy to Right',
                  'command': 'split-diff:copy-to-right'
                }, {
                  'label': 'Copy to Left',
                  'command': 'split-diff:copy-to-left'
                }
              ]
            }
          ]
        }
      ]));
      this.editorSubscriptions.add(atom.contextMenu.add({
        'atom-text-editor': [
          {
            'label': 'Split Diff',
            'submenu': [
              {
                'label': 'Ignore Whitespace',
                'command': 'split-diff:ignore-whitespace'
              }, {
                'label': 'Move to Next Diff',
                'command': 'split-diff:next-diff'
              }, {
                'label': 'Move to Previous Diff',
                'command': 'split-diff:prev-diff'
              }, {
                'label': 'Copy to Right',
                'command': 'split-diff:copy-to-right'
              }, {
                'label': 'Copy to Left',
                'command': 'split-diff:copy-to-left'
              }
            ]
          }
        ]
      }));
      detailMsg = 'Ignore Whitespace: ' + this.isWhitespaceIgnored;
      detailMsg += '\nShow Word Diff: ' + this.isWordDiffEnabled;
      detailMsg += '\nSync Horizontal Scroll: ' + this._getConfig('syncHorizontalScroll');
      return atom.notifications.addInfo('Split Diff Enabled', {
        detail: detailMsg,
        dismissable: false
      });
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, computedDiff, editorPaths, exit, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      this.isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, this.isWhitespaceIgnored];
      computedDiff = '';
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          theOutput = output;
          return computedDiff = JSON.parse(output);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          _this.loadingView.hide();
          if (code === 0) {
            return _this._resumeUpdateDiff(editors, computedDiff);
          } else {
            console.log('BufferedNodeProcess code was ' + code);
            return console.log(theOutput);
          }
        };
      })(this);
      return this.process = new BufferedNodeProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    _resumeUpdateDiff: function(editors, computedDiff) {
      var syncHorizontalScroll;
      this.linkedDiffChunks = this._evaluateDiffOrder(computedDiff.chunks);
      this._clearDiff();
      this._displayDiff(editors, computedDiff);
      this.isWordDiffEnabled = this._getConfig('diffWords');
      if (this.isWordDiffEnabled) {
        this._highlightWordDiff(this.linkedDiffChunks);
      }
      syncHorizontalScroll = this._getConfig('syncHorizontalScroll');
      this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, syncHorizontalScroll);
      return this.syncScroll.syncPositions();
    },
    _getVisibleEditors: function() {
      var activeItem, editor1, editor2, editors, leftPane, p, panes, rightPane, _i, _len;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (_i = 0, _len = panes.length; _i < _len; _i++) {
        p = panes[_i];
        activeItem = p.getActiveItem();
        if (atom.workspace.isTextEditor(activeItem)) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = atom.workspace.buildTextEditor();
        this.wasEditor1Created = true;
        leftPane = atom.workspace.getActivePane();
        leftPane.addItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPane = atom.workspace.getActivePane().splitRight();
        rightPane.addItem(editor2);
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      if (editor1.isSoftWrapped()) {
        this.wasEditor1SoftWrapped = true;
        editor1.setSoftWrapped(false);
      }
      if (editor2.isSoftWrapped()) {
        this.wasEditor2SoftWrapped = true;
        editor2.setSoftWrapped(false);
      }
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
      }
      editors = {
        editor1: editor1,
        editor2: editor2
      };
      return editors;
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, projectRepo, relativeEditor1Path, _i, _len, _ref1, _results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        _ref1 = atom.project.getDirectories();
        _results = [];
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
          directory = _ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.setText(gitHeadText);
                this.hasGitRepo = true;
                break;
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    _createTempFiles: function(editors) {
      var editor1Path, editor1TempFile, editor2Path, editor2TempFile, editorPaths, tempFolderPath;
      editor1Path = '';
      editor2Path = '';
      tempFolderPath = atom.getConfigDirPath() + '/split-diff';
      editor1Path = tempFolderPath + '/split-diff 1';
      editor1TempFile = new File(editor1Path);
      editor1TempFile.writeSync(editors.editor1.getText());
      editor2Path = tempFolderPath + '/split-diff 2';
      editor2TempFile = new File(editor2Path);
      editor2TempFile.writeSync(editors.editor2.getText());
      editorPaths = {
        editor1Path: editor1Path,
        editor2Path: editor2Path
      };
      return editorPaths;
    },
    _selectDiffs: function(diffChunk) {
      if ((diffChunk != null) && (this.diffViewEditor1 != null) && (this.diffViewEditor2 != null)) {
        this.diffViewEditor1.deselectAllLines();
        this.diffViewEditor2.deselectAllLines();
        if (diffChunk.oldLineStart != null) {
          this.diffViewEditor1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
          this.diffViewEditor2.getEditor().scrollToBufferPosition([diffChunk.oldLineStart, 0]);
        }
        if (diffChunk.newLineStart != null) {
          this.diffViewEditor2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
          return this.diffViewEditor2.getEditor().scrollToBufferPosition([diffChunk.newLineStart, 0]);
        }
      }
    },
    _clearDiff: function() {
      if (this.loadingView != null) {
        this.loadingView.hide();
      }
      if (this.diffViewEditor1 != null) {
        this.diffViewEditor1.destroyMarkers();
        this.diffViewEditor1 = null;
      }
      if (this.diffViewEditor2 != null) {
        this.diffViewEditor2.destroyMarkers();
        this.diffViewEditor2 = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        return this.syncScroll = null;
      }
    },
    _displayDiff: function(editors, computedDiff) {
      var leftColor, rightColor;
      this.diffViewEditor1 = new DiffViewEditor(editors.editor1);
      this.diffViewEditor2 = new DiffViewEditor(editors.editor2);
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      if (leftColor === 'green') {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'added');
      } else {
        this.diffViewEditor1.setLineHighlights(computedDiff.removedLines, 'removed');
      }
      if (rightColor === 'green') {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'added');
      } else {
        this.diffViewEditor2.setLineHighlights(computedDiff.addedLines, 'removed');
      }
      this.diffViewEditor1.setLineOffsets(computedDiff.oldLineOffsets);
      return this.diffViewEditor2.setLineOffsets(computedDiff.newLineOffsets);
    },
    _evaluateDiffOrder: function(chunks) {
      var c, diffChunk, diffChunks, newLineNumber, oldLineNumber, prevChunk, _i, _len;
      oldLineNumber = 0;
      newLineNumber = 0;
      prevChunk = null;
      diffChunks = [];
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        c = chunks[_i];
        if (c.added != null) {
          if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber + c.count,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          newLineNumber += c.count;
        } else if (c.removed != null) {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber + c.count
            };
            diffChunks.push(diffChunk);
            prevChunk = null;
          } else {
            prevChunk = c;
          }
          oldLineNumber += c.count;
        } else {
          if ((prevChunk != null) && (prevChunk.added != null)) {
            diffChunk = {
              newLineStart: newLineNumber - prevChunk.count,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          } else if ((prevChunk != null) && (prevChunk.removed != null)) {
            diffChunk = {
              newLineStart: newLineNumber,
              newLineEnd: newLineNumber,
              oldLineStart: oldLineNumber - prevChunk.count,
              oldLineEnd: oldLineNumber
            };
            diffChunks.push(diffChunk);
          }
          prevChunk = null;
          oldLineNumber += c.count;
          newLineNumber += c.count;
        }
      }
      if ((prevChunk != null) && (prevChunk.added != null)) {
        diffChunk = {
          newLineStart: newLineNumber - prevChunk.count,
          newLineEnd: newLineNumber
        };
        diffChunks.push(diffChunk);
      } else if ((prevChunk != null) && (prevChunk.removed != null)) {
        diffChunk = {
          oldLineStart: oldLineNumber - prevChunk.count,
          oldLineEnd: oldLineNumber
        };
        diffChunks.push(diffChunk);
      }
      return diffChunks;
    },
    _highlightWordDiff: function(chunks) {
      var ComputeWordDiff, c, excessLines, i, j, leftColor, lineRange, rightColor, wordDiff, _i, _j, _len, _results;
      ComputeWordDiff = require('./compute-word-diff');
      leftColor = this._getConfig('leftEditorColor');
      rightColor = this._getConfig('rightEditorColor');
      _results = [];
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        c = chunks[_i];
        if ((c.newLineStart != null) && (c.oldLineStart != null)) {
          lineRange = 0;
          excessLines = 0;
          if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
            lineRange = c.newLineEnd - c.newLineStart;
            excessLines = (c.oldLineEnd - c.oldLineStart) - lineRange;
          } else {
            lineRange = c.oldLineEnd - c.oldLineStart;
            excessLines = (c.newLineEnd - c.newLineStart) - lineRange;
          }
          for (i = _j = 0; _j < lineRange; i = _j += 1) {
            wordDiff = ComputeWordDiff.computeWordDiff(this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i), this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i), this.isWhitespaceIgnored);
            if (leftColor === 'green') {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, wordDiff.removedWords, 'removed', this.isWhitespaceIgnored);
            }
            if (rightColor === 'green') {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'added', this.isWhitespaceIgnored);
            } else {
              this.diffViewEditor2.setWordHighlights(c.newLineStart + i, wordDiff.addedWords, 'removed', this.isWhitespaceIgnored);
            }
          }
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (j = _k = 0; _k < excessLines; j = _k += 1) {
              if ((c.newLineEnd - c.newLineStart) < (c.oldLineEnd - c.oldLineStart)) {
                if (leftColor === 'green') {
                  _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else if ((c.newLineEnd - c.newLineStart) > (c.oldLineEnd - c.oldLineStart)) {
                if (rightColor === 'green') {
                  _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'added', this.isWhitespaceIgnored));
                } else {
                  _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + lineRange + j, [
                    {
                      changed: true,
                      value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + lineRange + j)
                    }
                  ], 'removed', this.isWhitespaceIgnored));
                }
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          }).call(this));
        } else if (c.newLineStart != null) {
          lineRange = c.newLineEnd - c.newLineStart;
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (i = _k = 0; _k < lineRange; i = _k += 1) {
              if (rightColor === 'green') {
                _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                _results1.push(this.diffViewEditor2.setWordHighlights(c.newLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor2.getEditor().lineTextForBufferRow(c.newLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return _results1;
          }).call(this));
        } else if (c.oldLineStart != null) {
          lineRange = c.oldLineEnd - c.oldLineStart;
          _results.push((function() {
            var _k, _results1;
            _results1 = [];
            for (i = _k = 0; _k < lineRange; i = _k += 1) {
              if (leftColor === 'green') {
                _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'added', this.isWhitespaceIgnored));
              } else {
                _results1.push(this.diffViewEditor1.setWordHighlights(c.oldLineStart + i, [
                  {
                    changed: true,
                    value: this.diffViewEditor1.getEditor().lineTextForBufferRow(c.oldLineStart + i)
                  }
                ], 'removed', this.isWhitespaceIgnored));
              }
            }
            return _results1;
          }).call(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9zcGxpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrSEFBQTs7QUFBQSxFQUFBLE9BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0IsaUJBQUEsU0FBdEIsRUFBaUMsWUFBQSxJQUFqQyxDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUixDQURqQixDQUFBOztBQUFBLEVBRUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUZkLENBQUE7O0FBQUEsRUFHQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FIYixDQUFBOztBQUFBLEVBSUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUpmLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FMUCxDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUNmO0FBQUEsSUFBQSxNQUFBLEVBQVEsWUFBUjtBQUFBLElBQ0EsYUFBQSxFQUFlLElBRGY7QUFBQSxJQUVBLGVBQUEsRUFBaUIsSUFGakI7QUFBQSxJQUdBLGVBQUEsRUFBaUIsSUFIakI7QUFBQSxJQUlBLG1CQUFBLEVBQXFCLElBSnJCO0FBQUEsSUFLQSxtQkFBQSxFQUFxQixLQUxyQjtBQUFBLElBTUEsaUJBQUEsRUFBbUIsSUFObkI7QUFBQSxJQU9BLGdCQUFBLEVBQWtCLElBUGxCO0FBQUEsSUFRQSxnQkFBQSxFQUFrQixDQVJsQjtBQUFBLElBU0Esa0JBQUEsRUFBb0IsSUFUcEI7QUFBQSxJQVVBLHFCQUFBLEVBQXVCLEtBVnZCO0FBQUEsSUFX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

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/node_modules/split-diff/lib/split-diff.coffee
