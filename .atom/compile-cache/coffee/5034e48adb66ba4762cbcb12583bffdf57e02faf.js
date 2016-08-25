(function() {
  var CompositeDisposable, CursorTools, Disposable, Emacs, Mark, appendCopy, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  Mark = require('./mark');

  CursorTools = require('./cursor-tools');

  appendCopy = require('./selection').appendCopy;

  module.exports = Emacs = (function() {
    var KILL_COMMAND;

    KILL_COMMAND = 'emacs-plus:kill-region';

    Emacs.prototype.destroyed = false;

    function Emacs(editor, globalEmacsState) {
      this.editor = editor;
      this.globalEmacsState = globalEmacsState;
      this.transposeWords = __bind(this.transposeWords, this);
      this.transposeLines = __bind(this.transposeLines, this);
      this.setMark = __bind(this.setMark, this);
      this.recenterTopBottom = __bind(this.recenterTopBottom, this);
      this.openLine = __bind(this.openLine, this);
      this.killWord = __bind(this.killWord, this);
      this.killLine = __bind(this.killLine, this);
      this.killWholeLine = __bind(this.killWholeLine, this);
      this.killRegion = __bind(this.killRegion, this);
      this.justOneSpace = __bind(this.justOneSpace, this);
      this.exchangePointAndMark = __bind(this.exchangePointAndMark, this);
      this.deleteIndentation = __bind(this.deleteIndentation, this);
      this.deleteHorizontalSpace = __bind(this.deleteHorizontalSpace, this);
      this.deactivateCursors = __bind(this.deactivateCursors, this);
      this.copy = __bind(this.copy, this);
      this.capitalizeWord = __bind(this.capitalizeWord, this);
      this.backwardKillWord = __bind(this.backwardKillWord, this);
      this.appendNextKill = __bind(this.appendNextKill, this);
      this.destroy = __bind(this.destroy, this);
      this.editorElement = atom.views.getView(editor);
      this.mark = Mark["for"](this.editor);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.addClass());
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy));
      this.subscriptions.add(this.editor.onDidInsertText((function(_this) {
        return function() {
          return _this.globalEmacsState.logCommand({
            type: 'editor:didInsertText'
          });
        };
      })(this)));
      this.registerCommands();
    }

    Emacs.prototype.destroy = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      this.subscriptions = null;
      if ((_ref1 = this.mark) != null) {
        _ref1.destroy();
      }
      this.mark = null;
      this.editor = null;
      return this.editorElement = null;
    };

    Emacs.prototype.registerCommands = function() {
      return this.subscriptions.add(atom.commands.add(this.editorElement, {
        'emacs-plus:append-next-kill': this.appendNextKill,
        'emacs-plus:backward-kill-word': this.backwardKillWord,
        'emacs-plus:capitalize-word': this.capitalizeWord,
        'emacs-plus:copy': this.copy,
        'emacs-plus:delete-horizontal-space': this.deleteHorizontalSpace,
        'emacs-plus:delete-indentation': this.deleteIndentation,
        'emacs-plus:exchange-point-and-mark': this.exchangePointAndMark,
        'emacs-plus:just-one-space': this.justOneSpace,
        'emacs-plus:kill-line': this.killLine,
        'emacs-plus:kill-region': this.killRegion,
        'emacs-plus:kill-whole-line': this.killWholeLine,
        'emacs-plus:kill-word': this.killWord,
        'emacs-plus:open-line': this.openLine,
        'emacs-plus:recenter-top-bottom': this.recenterTopBottom,
        'emacs-plus:set-mark': this.setMark,
        'emacs-plus:transpose-lines': this.transposeLines,
        'emacs-plus:transpose-words': this.transposeWords,
        'emacs-plus:close-other-panes': this.closeOtherPanes,
        'core:cancel': this.deactivateCursors
      }));
    };

    Emacs.prototype.addClass = function() {
      var className;
      className = 'emacs-plus';
      this.editorElement.classList.add(className);
      return new Disposable((function(_this) {
        return function() {
          if (_this.editor.isAlive()) {
            return _this.editorElement.classList.remove(className);
          }
        };
      })(this));
    };

    Emacs.prototype.appendNextKill = function() {
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      return atom.notifications.addInfo('If a next command is a kill, it will append');
    };

    Emacs.prototype.backwardKillWord = function() {
      var maintainClipboard;
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      maintainClipboard = false;
      return this.killSelectedText(function(selection) {
        if (selection.isEmpty()) {
          selection.selectToBeginningOfWord();
        }
        if (!selection.isEmpty()) {
          selection.cut(maintainClipboard);
        }
        return maintainClipboard = true;
      }, true);
    };

    Emacs.prototype.capitalizeWord = function() {
      return this.editor.replaceSelectedText({
        selectWordIfEmpty: true
      }, function(text) {
        return _.capitalize(text);
      });
    };

    Emacs.prototype.copy = function() {
      this.editor.copySelectedText();
      return this.deactivateCursors();
    };

    Emacs.prototype.deactivateCursors = function() {
      return this.mark.deactivate();
    };

    Emacs.prototype.deleteHorizontalSpace = function() {
      var cursor, range, tools, _i, _len, _ref1, _results;
      _ref1 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        tools = new CursorTools(cursor);
        range = tools.horizontalSpaceRange();
        _results.push(this.editor.setTextInBufferRange(range, ''));
      }
      return _results;
    };

    Emacs.prototype.deleteIndentation = function() {
      return this.editor.transact((function(_this) {
        return function() {
          _this.editor.moveUp();
          return _this.editor.joinLines();
        };
      })(this));
    };

    Emacs.prototype.closeOtherPanes = function() {
      var activePane, pane, _i, _len, _ref1, _results;
      activePane = atom.workspace.getActivePane();
      if (!activePane) {
        return;
      }
      _ref1 = atom.workspace.getPanes();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pane = _ref1[_i];
        if (pane !== activePane) {
          _results.push(pane.close());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Emacs.prototype.exchangePointAndMark = function() {
      return this.mark.exchange();
    };

    Emacs.prototype.justOneSpace = function() {
      var cursor, range, tools, _i, _len, _ref1, _results;
      _ref1 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        tools = new CursorTools(cursor);
        range = tools.horizontalSpaceRange();
        _results.push(this.editor.setTextInBufferRange(range, ' '));
      }
      return _results;
    };

    Emacs.prototype.killRegion = function() {
      var maintainClipboard;
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      maintainClipboard = false;
      return this.killSelectedText(function(selection) {
        if (!selection.isEmpty()) {
          selection.cut(maintainClipboard, false);
        }
        return maintainClipboard = true;
      });
    };

    Emacs.prototype.killWholeLine = function() {
      var maintainClipboard;
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      maintainClipboard = false;
      return this.killSelectedText(function(selection) {
        selection.clear();
        selection.selectLine();
        selection.cut(maintainClipboard, true);
        return maintainClipboard = true;
      });
    };

    Emacs.prototype.killLine = function(event) {
      var maintainClipboard;
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      maintainClipboard = false;
      return this.killSelectedText(function(selection) {
        if (selection.isEmpty()) {
          selection.selectToEndOfLine();
        }
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.cut(maintainClipboard, false);
        return maintainClipboard = true;
      });
    };

    Emacs.prototype.killWord = function() {
      var maintainClipboard;
      this.globalEmacsState.thisCommand = KILL_COMMAND;
      maintainClipboard = false;
      return this.killSelectedText(function(selection) {
        if (selection.isEmpty()) {
          selection.selectToEndOfWord();
        }
        if (!selection.isEmpty()) {
          selection.cut(maintainClipboard);
        }
        return maintainClipboard = true;
      });
    };

    Emacs.prototype.openLine = function() {
      this.editor.insertNewline();
      return this.editor.moveUp();
    };

    Emacs.prototype.recenterTopBottom = function() {
      var c, maxOffset, maxRow, minOffset, minRow;
      minRow = Math.min.apply(Math, (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          c = _ref1[_i];
          _results.push(c.getBufferRow());
        }
        return _results;
      }).call(this));
      maxRow = Math.max.apply(Math, (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.editor.getCursors();
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          c = _ref1[_i];
          _results.push(c.getBufferRow());
        }
        return _results;
      }).call(this));
      minOffset = this.editorElement.pixelPositionForBufferPosition([minRow, 0]);
      maxOffset = this.editorElement.pixelPositionForBufferPosition([maxRow, 0]);
      return this.editorElement.setScrollTop((minOffset.top + maxOffset.top - this.editorElement.getHeight()) / 2);
    };

    Emacs.prototype.setMark = function() {
      return this.mark.activate();
    };

    Emacs.prototype.transposeLines = function() {
      var cursor, row;
      cursor = this.editor.getLastCursor();
      row = cursor.getBufferRow();
      return this.editor.transact((function(_this) {
        return function() {
          var text, tools;
          tools = new CursorTools(cursor);
          if (row === 0) {
            tools.endLineIfNecessary();
            cursor.moveDown();
            row += 1;
          }
          tools.endLineIfNecessary();
          text = _this.editor.getTextInBufferRange([[row, 0], [row + 1, 0]]);
          _this.editor.deleteLine(row);
          return _this.editor.setTextInBufferRange([[row - 1, 0], [row - 1, 0]], text);
        };
      })(this));
    };

    Emacs.prototype.transposeWords = function() {
      return this.editor.transact((function(_this) {
        return function() {
          var cursor, cursorTools, word1, word1Pos, word2, word2Pos, _i, _len, _ref1, _results;
          _ref1 = _this.editor.getCursors();
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            cursor = _ref1[_i];
            cursorTools = new CursorTools(cursor);
            cursorTools.skipNonWordCharactersBackward();
            word1 = cursorTools.extractWord();
            word1Pos = cursor.getBufferPosition();
            cursorTools.skipNonWordCharactersForward();
            if (_this.editor.getEofBufferPosition().isEqual(cursor.getBufferPosition())) {
              _this.editor.setTextInBufferRange([word1Pos, word1Pos], word1);
              cursorTools.skipNonWordCharactersBackward();
            } else {
              word2 = cursorTools.extractWord();
              word2Pos = cursor.getBufferPosition();
              _this.editor.setTextInBufferRange([word2Pos, word2Pos], word1);
              _this.editor.setTextInBufferRange([word1Pos, word1Pos], word2);
            }
            _results.push(cursor.setBufferPosition(cursor.getBufferPosition()));
          }
          return _results;
        };
      })(this));
    };

    Emacs.prototype.killSelectedText = function(fn, reversed) {
      var copyMethods, originalCopy, selection, _i, _j, _len, _len1, _ref1, _ref2;
      if (reversed == null) {
        reversed = false;
      }
      if (this.globalEmacsState.lastCommand !== KILL_COMMAND) {
        return this.editor.mutateSelectedText(fn);
      }
      copyMethods = new WeakMap;
      _ref1 = this.editor.getSelections();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        selection = _ref1[_i];
        copyMethods.set(selection, selection.copy);
        selection.copy = appendCopy.bind(selection, reversed);
      }
      this.editor.mutateSelectedText(fn);
      _ref2 = this.editor.getSelections();
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        selection = _ref2[_j];
        originalCopy = copyMethods.get(selection);
        if (originalCopy) {
          selection.copy = originalCopy;
        }
      }
    };

    return Emacs;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9lbWFjcy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEVBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBb0MsT0FBQSxDQUFRLE1BQVIsQ0FBcEMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixrQkFBQSxVQUR0QixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FIZCxDQUFBOztBQUFBLEVBSUMsYUFBYyxPQUFBLENBQVEsYUFBUixFQUFkLFVBSkQsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBLFlBQUE7O0FBQUEsSUFBQSxZQUFBLEdBQWUsd0JBQWYsQ0FBQTs7QUFBQSxvQkFFQSxTQUFBLEdBQVcsS0FGWCxDQUFBOztBQUlhLElBQUEsZUFBRSxNQUFGLEVBQVcsZ0JBQVgsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLG1CQUFBLGdCQUN0QixDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLHlFQUFBLENBQUE7QUFBQSxtRUFBQSxDQUFBO0FBQUEsMkVBQUEsQ0FBQTtBQUFBLG1FQUFB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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/emacs.coffee
