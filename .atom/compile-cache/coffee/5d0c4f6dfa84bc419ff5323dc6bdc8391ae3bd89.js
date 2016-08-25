(function() {
  var CompositeDisposable, Disposable, Mark, Point, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Point = _ref.Point, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  Mark = (function() {
    var MARK_MODE_CLASS, _marks;

    MARK_MODE_CLASS = 'mark-mode';

    _marks = new WeakMap;

    Mark["for"] = function(editor) {
      var mark;
      mark = _marks.get(editor);
      if (!mark) {
        mark = new Mark(editor);
        _marks.set(editor, mark);
      }
      return mark;
    };

    function Mark(editor) {
      this.editor = editor;
      this._addClickEventListener = __bind(this._addClickEventListener, this);
      this._onModified = __bind(this._onModified, this);
      this._clearSelection = __bind(this._clearSelection, this);
      this._addClass = __bind(this._addClass, this);
      this.destroy = __bind(this.destroy, this);
      this.deactivate = __bind(this.deactivate, this);
      this.activate = __bind(this.activate, this);
      this.active = false;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.editor.onDidDestroy(this.destroy));
    }

    Mark.prototype.activate = function(keepSelection) {
      if (keepSelection == null) {
        keepSelection = false;
      }
      if (!keepSelection) {
        this._clearSelection();
      }
      if (this.active) {
        return;
      }
      this.activateSubscriptions = new CompositeDisposable;
      this.activateSubscriptions.add(this.editor.getBuffer().onDidChange(this._onModified));
      this.activateSubscriptions.add(this._addClickEventListener());
      this.activateSubscriptions.add(this._addClass());
      return this.active = true;
    };

    Mark.prototype.deactivate = function(options) {
      var _ref1;
      if (options == null) {
        options = {};
      }
      this.active = false;
      if ((_ref1 = this.activateSubscriptions) != null) {
        _ref1.dispose();
      }
      this.activateSubscriptions = null;
      if (options.immediate) {
        return setImmediate(this._clearSelection);
      } else {
        return this._clearSelection();
      }
    };

    Mark.prototype.destroy = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      if (this.active) {
        this.deactivate();
      }
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      this.subscriptions = null;
      return this.editor = null;
    };

    Mark.prototype.isActive = function() {
      return this.active;
    };

    Mark.prototype.exchange = function() {
      if (!this.isActive()) {
        return;
      }
      return this.editor.getCursors().forEach(this._exchange);
    };

    Mark.prototype._exchange = function(cursor) {
      var a, b;
      if (cursor.selection == null) {
        return;
      }
      b = cursor.selection.getTailBufferPosition();
      a = cursor.getBufferPosition();
      return cursor.selection.setBufferRange([a, b], {
        reversed: Point.min(a, b) === b,
        autoscroll: false
      });
    };

    Mark.prototype._addClass = function() {
      var editorElement;
      editorElement = atom.views.getView(this.editor);
      editorElement.classList.add(MARK_MODE_CLASS);
      return new Disposable(function() {
        return editorElement.classList.remove(MARK_MODE_CLASS);
      });
    };

    Mark.prototype._clearSelection = function() {
      if (this.editor == null) {
        return;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      return this.editor.getCursors().forEach(function(cursor) {
        return cursor.clearSelection();
      });
    };

    Mark.prototype._onModified = function(event) {
      if (this._isIndent(event) || this._isOutdent(event)) {
        return;
      }
      return this.deactivate({
        immediate: true
      });
    };

    Mark.prototype._isIndent = function(event) {
      return this._isIndentOutdent(event.newRange, event.newText);
    };

    Mark.prototype._isOutdent = function(event) {
      return this._isIndentOutdent(event.oldRange, event.oldText);
    };

    Mark.prototype._isIndentOutdent = function(range, text) {
      var diff, tabLength;
      tabLength = this.editor.getTabLength();
      diff = range.end.column - range.start.column;
      if (diff === this.editor.getTabLength() && range.start.row === range.end.row && this._checkTextForSpaces(text, tabLength)) {
        return true;
      }
    };

    Mark.prototype._checkTextForSpaces = function(text, tabSize) {
      var ch, _i, _len;
      if (!(text && text.length === tabSize)) {
        return false;
      }
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        ch = text[_i];
        if (ch !== " ") {
          return false;
        }
      }
      return true;
    };

    Mark.prototype._addClickEventListener = function() {
      var callback, editorElement;
      callback = (function(_this) {
        return function(_arg) {
          var which;
          which = _arg.which;
          if (which === 1) {
            return _this.deactivate();
          }
        };
      })(this);
      editorElement = atom.views.getView(this.editor);
      editorElement.addEventListener('mousedown', callback);
      return new Disposable(function() {
        return editorElement.removeEventListener('mousedown', callback);
      });
    };

    return Mark;

  })();

  module.exports = Mark;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9tYXJrLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxhQUFBLEtBQUQsRUFBUSwyQkFBQSxtQkFBUixFQUE2QixrQkFBQSxVQUE3QixDQUFBOztBQUFBLEVBRU07QUFDSixRQUFBLHVCQUFBOztBQUFBLElBQUEsZUFBQSxHQUFrQixXQUFsQixDQUFBOztBQUFBLElBRUEsTUFBQSxHQUFTLEdBQUEsQ0FBQSxPQUZULENBQUE7O0FBQUEsSUFJQSxJQUFDLENBQUEsS0FBQSxDQUFELEdBQU0sU0FBQyxNQUFELEdBQUE7QUFDSixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUNFLFFBQUEsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLE1BQUwsQ0FBWCxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsSUFBbkIsQ0FEQSxDQURGO09BREE7YUFJQSxLQUxJO0lBQUEsQ0FKTixDQUFBOztBQVdhLElBQUEsY0FBRSxNQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FBVixDQUFBO0FBQUEsTUFDQSxJQUFD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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/mark.coffee
