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
      this.selectionRangeChanged = __bind(this.selectionRangeChanged, this);
      this.destroy = __bind(this.destroy, this);
      this.editorElement = atom.views.getView(editor);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.addClass());
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange(_.debounce((function(_this) {
        return function(event) {
          return _this.selectionRangeChanged(event);
        };
      })(this), 100)));
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
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      this.subscriptions.dispose();
      this.subscriptions = null;
      this.editor = null;
      return this.editorElement = null;
    };

    Emacs.prototype.selectionRangeChanged = function(event) {
      var mark, newBufferRange, selection;
      if (event == null) {
        event = {};
      }
      selection = event.selection, newBufferRange = event.newBufferRange;
      if (selection == null) {
        return;
      }
      if (selection.isEmpty()) {
        return;
      }
      if (this.destroyed) {
        return;
      }
      if (selection.cursor.destroyed != null) {
        return;
      }
      mark = Mark["for"](selection.cursor);
      if (!mark.isActive()) {
        return mark.activate();
      }
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
      var cursor, _i, _len, _ref1, _results;
      _ref1 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        _results.push(Mark["for"](cursor).deactivate());
      }
      return _results;
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
      return this.editor.moveCursors(function(cursor) {
        return Mark["for"](cursor).exchange();
      });
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
      var cursor, _i, _len, _ref1, _results;
      _ref1 = this.editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cursor = _ref1[_i];
        _results.push(Mark["for"](cursor).set().activate());
      }
      return _results;
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
