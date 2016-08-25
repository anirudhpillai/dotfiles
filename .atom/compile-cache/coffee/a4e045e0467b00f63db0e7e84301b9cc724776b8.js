(function() {
  var $, BufferedProcess, CompositeDisposable, GitRevisionView, SplitDiff, fs, path, _, _ref;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  _ref = require("atom"), CompositeDisposable = _ref.CompositeDisposable, BufferedProcess = _ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  SplitDiff = require('split-diff');

  module.exports = GitRevisionView = (function() {
    function GitRevisionView() {}

    GitRevisionView.FILE_PREFIX = "TimeMachine - ";


    /*
      This code and technique was originally from git-history package,
      see https://github.com/jakesankey/git-history/blob/master/lib/git-history-view.coffee
    
      Changes to permit click and drag in the time plot to travel in time:
      - don't write revision to disk for faster access and to give the user feedback when git'ing
        a rev to show is slow
      - reuse tabs more - don't open a new tab for every rev of the same file
    
      Changes to permit scrolling to same lines in view in the editor the history is for
    
      thank you, @jakesankey!
     */

    GitRevisionView.showRevision = function(editor, revHash, options) {
      var exit, file, fileContents, stdout;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        diff: false
      });
      SplitDiff.disable(false);
      file = editor.getPath();
      fileContents = "";
      stdout = (function(_this) {
        return function(output) {
          return fileContents += output;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this._showRevision(file, editor, revHash, fileContents, options);
          } else {
            return atom.notifications.addError("Could not retrieve revision for " + (path.basename(file)) + " (" + code + ")");
          }
        };
      })(this);
      return this._loadRevision(file, revHash, stdout, exit);
    };

    GitRevisionView._loadRevision = function(file, hash, stdout, exit) {
      var showArgs;
      showArgs = ["show", "" + hash + ":./" + (path.basename(file))];
      return new BufferedProcess({
        command: "git",
        args: showArgs,
        options: {
          cwd: path.dirname(file)
        },
        stdout: stdout,
        exit: exit
      });
    };

    GitRevisionView._getInitialLineNumber = function(editor) {
      var editorEle, lineNumber;
      editorEle = atom.views.getView(editor);
      lineNumber = 0;
      if ((editor != null) && editor !== '') {
        lineNumber = editorEle.getLastVisibleScreenRow();
        return lineNumber - 5;
      }
    };

    GitRevisionView._showRevision = function(file, editor, revHash, fileContents, options) {
      var outputDir, outputFilePath, tempContent, _ref1;
      if (options == null) {
        options = {};
      }
      outputDir = "" + (atom.getConfigDirPath()) + "/git-time-machine";
      if (!fs.existsSync(outputDir)) {
        fs.mkdir(outputDir);
      }
      outputFilePath = "" + outputDir + "/" + this.FILE_PREFIX + (path.basename(file));
      if (options.diff) {
        outputFilePath += ".diff";
      }
      tempContent = "Loading..." + ((_ref1 = editor.buffer) != null ? _ref1.lineEndingForRow(0) : void 0);
      return fs.writeFile(outputFilePath, tempContent, (function(_this) {
        return function(error) {
          var promise;
          if (!error) {
            promise = atom.workspace.open(file, {
              split: "left",
              activatePane: false,
              activateItem: true,
              searchAllPanes: false
            });
            return promise.then(function(editor) {
              promise = atom.workspace.open(outputFilePath, {
                split: "right",
                activatePane: false,
                activateItem: true,
                searchAllPanes: false
              });
              return promise.then(function(newTextEditor) {
                return _this._updateNewTextEditor(newTextEditor, editor, revHash, fileContents);
              });
            });
          }
        };
      })(this));
    };

    GitRevisionView._updateNewTextEditor = function(newTextEditor, editor, revHash, fileContents) {
      return _.delay((function(_this) {
        return function() {
          var lineEnding, _ref1;
          lineEnding = ((_ref1 = editor.buffer) != null ? _ref1.lineEndingForRow(0) : void 0) || "\n";
          fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
          newTextEditor.buffer.setPreferredLineEnding(lineEnding);
          newTextEditor.setText(fileContents);
          newTextEditor.buffer.cachedDiskContents = fileContents;
          _this._splitDiff(editor, newTextEditor);
          _this._syncScroll(editor, newTextEditor);
          return _this._affixTabTitle(newTextEditor, revHash);
        };
      })(this), 300);
    };

    GitRevisionView._affixTabTitle = function(newTextEditor, revHash) {
      var $el, $tabTitle, titleText;
      $el = $(atom.views.getView(newTextEditor));
      $tabTitle = $el.parents('atom-pane').find('li.tab.active .title');
      titleText = $tabTitle.text();
      if (titleText.indexOf('@') >= 0) {
        titleText = titleText.replace(/\@.*/, "@" + revHash);
      } else {
        titleText += " @" + revHash;
      }
      return $tabTitle.text(titleText);
    };

    GitRevisionView._splitDiff = function(editor, newTextEditor) {
      var editors;
      editors = {
        editor1: newTextEditor,
        editor2: editor
      };
      SplitDiff._setConfig('rightEditorColor', 'green');
      SplitDiff._setConfig('leftEditorColor', 'red');
      SplitDiff._setConfig('diffWords', true);
      SplitDiff._setConfig('ignoreWhitespace', true);
      SplitDiff._setConfig('syncHorizontalScroll', true);
      SplitDiff.editorSubscriptions = new CompositeDisposable();
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      return SplitDiff.updateDiff(editors);
    };

    GitRevisionView._syncScroll = function(editor, newTextEditor) {
      return _.delay((function(_this) {
        return function() {
          if (newTextEditor.isDestroyed()) {
            return;
          }
          return newTextEditor.scrollToBufferPosition({
            row: _this._getInitialLineNumber(editor),
            column: 0
          });
        };
      })(this), 50);
    };

    return GitRevisionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtcmV2aXNpb24tdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsT0FBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQix1QkFBQSxlQUp0QixDQUFBOztBQUFBLEVBS0MsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQUxELENBQUE7O0FBQUEsRUFPQSxTQUFBLEdBQVksT0FBQSxDQUFRLFlBQVIsQ0FQWixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtpQ0FFSjs7QUFBQSxJQUFBLGVBQUMsQ0FBQSxXQUFELEdBQWUsZ0JBQWYsQ0FBQTs7QUFDQTtBQUFBOzs7Ozs7Ozs7Ozs7T0FEQTs7QUFBQSxJQWVBLGVBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixPQUFsQixHQUFBO0FBQ2IsVUFBQSxnQ0FBQTs7UUFEK0IsVUFBUTtPQUN2QztBQUFBLE1BQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxFQUNSO0FBQUEsUUFBQSxJQUFBLEVBQU0sS0FBTjtPQURRLENBQVYsQ0FBQTtBQUFBLE1BR0EsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBbEIsQ0FIQSxDQUFBO0FBQUEsTUFLQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxD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

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/lib/git-revision-view.coffee
