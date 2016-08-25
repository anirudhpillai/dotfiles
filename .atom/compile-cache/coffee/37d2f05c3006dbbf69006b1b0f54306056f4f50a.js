(function() {
  var CompositeDisposable, Disposable, Mark, Point, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Point = _ref.Point, CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  Mark = (function() {
    var MARK_MODE_CLASS, _marks;

    MARK_MODE_CLASS = 'mark-mode';

    _marks = new WeakMap;

    Mark["for"] = function(cursor) {
      var mark;
      mark = _marks.get(cursor);
      if (!mark) {
        mark = new Mark(cursor);
        _marks.set(cursor, mark);
      }
      return mark;
    };

    function Mark(cursor) {
      var _ref1;
      this.cursor = cursor;
      this._onModified = __bind(this._onModified, this);
      this._updateSelection = __bind(this._updateSelection, this);
      this._destroy = __bind(this._destroy, this);
      this._addClickEventListener = __bind(this._addClickEventListener, this);
      this._addClass = __bind(this._addClass, this);
      this.editor = this.cursor.editor;
      if (((_ref1 = this.cursor.selection) != null ? _ref1.marker : void 0) != null) {
        this.marker = this.cursor.selection.marker;
      } else {
        this.marker = this.editor.markBufferPosition(this.cursor.getBufferPosition());
      }
      this.active = false;
      this.updating = false;
      this.destroyed = false;
      this.markerTailBufferPosition = null;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(this.cursor.onDidDestroy(this._destroy));
    }

    Mark.prototype.set = function() {
      this.deactivate();
      this.marker.setHeadBufferPosition(this.cursor.getBufferPosition());
      return this;
    };

    Mark.prototype.setBufferRange = function(range, options) {
      var end, start;
      if (options == null) {
        options = {};
      }
      this.deactivate();
      this.activate();
      if (options.reversed) {
        start = range.end;
        end = range.start;
      } else {
        start = range.start, end = range.end;
      }
      this.marker.setHeadBufferPosition(start);
      return this._updateSelection({
        newBufferPosition: end
      });
    };

    Mark.prototype.getBufferPosition = function() {
      return this.marker.getHeadBufferPosition();
    };

    Mark.prototype.activate = function() {
      if (this.active) {
        return;
      }
      this.marker.plantTail();
      this.markerTailBufferPosition = this.marker.getTailBufferPosition();
      this.markerSubscriptions = new CompositeDisposable();
      this.markerSubscriptions.add(this.cursor.onDidChangePosition(this._updateSelection));
      this.markerSubscriptions.add(this.editor.getBuffer().onDidChange(this._onModified));
      this.markerSubscriptions.add(this._addClickEventListener());
      this.markerSubscriptions.add(this._addClass());
      return this.active = true;
    };

    Mark.prototype.deactivate = function() {
      var _ref1;
      if (this.active) {
        this.active = false;
        this.markerTailBufferPosition = null;
        if ((_ref1 = this.markerSubscriptions) != null) {
          _ref1.dispose();
        }
        this.markerSubscriptions = null;
      }
      if (!this.marker.isDestroyed()) {
        return this.cursor.clearSelection();
      }
    };

    Mark.prototype.isActive = function() {
      return this.active;
    };

    Mark.prototype.exchange = function() {
      var a, b;
      if (!this.isActive()) {
        return;
      }
      b = this.marker.getTailBufferPosition();
      a = this.cursor.getBufferPosition();
      this.updating = true;
      this.cursor.selection.setBufferRange([a, b], {
        reversed: Point.min(a, b) === b,
        autoscroll: false
      });
      this.markerTailBufferPosition = a;
      return this.updating = false;
    };

    Mark.prototype._addClass = function() {
      var editorElement;
      editorElement = atom.views.getView(this.editor);
      editorElement.classList.add(MARK_MODE_CLASS);
      return new Disposable((function(_this) {
        return function() {
          if (!_this.editor.getCursors().some(function(cursor) {
            return Mark["for"](cursor).isActive();
          })) {
            return editorElement.classList.remove(MARK_MODE_CLASS);
          }
        };
      })(this));
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

    Mark.prototype._destroy = function() {
      var _ref1;
      if (this.destroyed) {
        return;
      }
      this.destroyed = true;
      if (this.active) {
        this.deactivate();
      }
      if (!this.marker.isDestroyed()) {
        this.marker.destroy();
      }
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      this.subscriptions = null;
      this.editor = null;
      this.cursor = null;
      return this.marker = null;
    };

    Mark.prototype._updateSelection = function(event) {
      var a, b, newBufferPosition;
      if (this.updating) {
        return;
      }
      newBufferPosition = event.newBufferPosition;
      this.updating = true;
      try {
        if (this.cursor.selection.isEmpty()) {
          if (this.marker.getBufferRange().isEmpty()) {
            a = this.markerTailBufferPosition;
          } else {
            a = this.marker.getTailBufferPosition();
          }
        } else {
          a = this.cursor.selection.getTailBufferPosition();
        }
        b = newBufferPosition;
        return this.cursor.selection.setBufferRange([a, b], {
          reversed: Point.min(a, b) === b,
          autoscroll: false
        });
      } finally {
        this.updating = false;
      }
    };

    Mark.prototype._onModified = function(event) {
      var newRange;
      newRange = event.newRange;
      if (!newRange.containsPoint(this.cursor.getBufferPosition())) {
        return;
      }
      if (this._isIndent(event) || this._isOutdent(event)) {
        return;
      }
      return this.deactivate();
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

    return Mark;

  })();

  module.exports = Mark;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9tYXJrLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrREFBQTtJQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBMkMsT0FBQSxDQUFRLE1BQVIsQ0FBM0MsRUFBQyxhQUFBLEtBQUQsRUFBUSwyQkFBQSxtQkFBUixFQUE2QixrQkFBQSxVQUE3QixDQUFBOztBQUFBLEVBYU07QUFDSixRQUFBLHVCQUFBOztBQUFBLElBQUEsZUFBQSxHQUFrQixXQUFsQixDQUFBOztBQUFBLElBRUEsTUFBQSxHQUFTLEdBQUEsQ0FBQSxPQUZULENBQUE7O0FBQUEsSUFJQSxJQUFDLENBQUEsS0FBQSxDQUFELEdBQU0sU0FBQyxNQUFELEdBQUE7QUFDSixVQUFBLElBQUE7QUFBQSxNQUFBLElBQUEsR0FBTyxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBUCxDQUFBO0FBQ0EsTUFBQSxJQUFBLENBQUEsSUFBQTtBQUNFLFFBQUEsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLE1BQUwsQ0FBWCxDQUFBO0FBQUEsUUFDQSxNQUFNLENBQUMsR0FBUCxDQUFXLE1BQVgsRUFBbUIsSUFBbkIsQ0FEQSxDQURGO09BREE7YUFJQSxLQUxJO0lBQUEsQ0FKTixDQUFBOztBQVdhLElBQUEsY0FBRSxNQUFGLEdBQUE7QUFDWCxVQUFBLEtBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLDZFQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbEIsQ0FBQTtBQUVBLE1BQUEs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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/mark.coffee
