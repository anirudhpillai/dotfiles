(function() {
  var Point;

  Point = require('atom').Point;

  module.exports = {
    open: function(state) {
      return atom.workspace.open().then((function(_this) {
        return function(editor) {
          return _this.set(editor, state);
        };
      })(this));
    },
    set: function(editor, state) {
      var cursor, descriptor, descriptors, head, i, re, reversed, tail, _i, _j, _len, _len1, _ref;
      editor.setText(state);
      re = /\[(\d+)\]|\((\d+)\)/g;
      descriptors = [];
      editor.scan(re, function(hit) {
        var i;
        i = parseInt(hit.match[0].slice(1, 2), 10);
        if (descriptors[i] == null) {
          descriptors[i] = {};
        }
        if (hit.match[1] != null) {
          descriptors[i].head = hit.range.start;
        } else {
          descriptors[i].tail = hit.range.start;
        }
        return hit.replace('');
      });
      for (i = _i = 0, _len = descriptors.length; _i < _len; i = ++_i) {
        descriptor = descriptors[i];
        head = (descriptor || {}).head;
        if (!head) {
          throw new Error("missing head of cursor " + i);
        }
        cursor = editor.getCursors()[i];
        if (!cursor) {
          cursor = editor.addCursorAtBufferPosition(head);
        } else {
          cursor.setBufferPosition(head);
        }
      }
      for (i = _j = 0, _len1 = descriptors.length; _j < _len1; i = ++_j) {
        descriptor = descriptors[i];
        _ref = descriptor || {}, head = _ref.head, tail = _ref.tail;
        if (tail) {
          cursor = editor.getCursors()[i];
          cursor = editor.getCursors()[i];
          reversed = Point.min(head, tail) === head;
          cursor.selection.setBufferRange([head, tail], {
            reversed: reversed
          });
        }
      }
      return editor;
    },
    get: function(editor) {
      var buffer, column, cursor, ending, head, i, insertions, line, lineWithEnding, linesWithEndings, row, tail, text, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      buffer = editor.getBuffer();
      linesWithEndings = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = buffer.getLineCount(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push([buffer.lineForRow(i), buffer.lineEndingForRow(i)]);
        }
        return _results;
      })();
      insertions = [];
      _ref = editor.getCursors();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        cursor = _ref[i];
        head = cursor.marker.getHeadBufferPosition();
        tail = cursor.marker.getTailBufferPosition();
        insertions.push([head.row, head.column, "[" + i + "]"]);
        if (!head.isEqual(tail)) {
          insertions.push([tail.row, tail.column, "(" + i + ")"]);
        }
      }
      _ref1 = insertions.sort().reverse();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        _ref2 = _ref1[_j], row = _ref2[0], column = _ref2[1], text = _ref2[2];
        _ref3 = linesWithEndings[row], line = _ref3[0], ending = _ref3[1];
        line = line.slice(0, column) + text + line.slice(column);
        linesWithEndings[row] = [line, ending];
      }
      return ((function() {
        var _k, _len2, _results;
        _results = [];
        for (_k = 0, _len2 = linesWithEndings.length; _k < _len2; _k++) {
          lineWithEnding = linesWithEndings[_k];
          _results.push(lineWithEnding.join(''));
        }
        return _results;
      })()).join('');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL3NwZWMvZWRpdG9yLXN0YXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxLQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBTSxTQUFDLEtBQUQsR0FBQTthQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUN6QixLQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFBYSxLQUFiLEVBRHlCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0IsRUFESTtJQUFBLENBQU47QUFBQSxJQVdBLEdBQUEsRUFBSyxTQUFDLE1BQUQsRUFBUyxLQUFULEdBQUE7QUFDSCxVQUFBLHVGQUFBO0FBQUEsTUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxFQUFBLEdBQUssc0JBREwsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLEVBSGQsQ0FBQTtBQUFBLE1BSUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaLEVBQWdCLFNBQUMsR0FBRCxHQUFBO0FBQ2QsWUFBQSxDQUFBO0FBQUEsUUFBQSxDQUFBLEdBQUksUUFBQSxDQUFTLEdBQUcsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixDQUFtQixDQUFuQixFQUFzQixDQUF0QixDQUFULEVBQW1DLEVBQW5DLENBQUosQ0FBQTs7VUFDQSxXQUFZLENBQUEsQ0FBQSxJQUFNO1NBRGxCO0FB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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/spec/editor-state.coffee
