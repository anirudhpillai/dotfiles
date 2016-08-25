(function() {
  var CursorTools, EditorState, rangeCoordinates;

  EditorState = require('./editor-state');

  CursorTools = require('../lib/cursor-tools');

  rangeCoordinates = function(range) {
    if (range) {
      return [range.start.row, range.start.column, range.end.row, range.end.column];
    } else {
      return range;
    }
  };

  describe("CursorTools", function() {
    beforeEach(function() {
      return waitsForPromise((function(_this) {
        return function() {
          return atom.workspace.open().then(function(editor) {
            _this.editor = editor;
            return _this.cursorTools = new CursorTools(editor.getLastCursor());
          });
        };
      })(this));
    });
    describe("locateBackward", function() {
      it("returns the range of the previous match if found", function() {
        var range;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        range = this.cursorTools.locateBackward(/x+/);
        expect(rangeCoordinates(range)).toEqual([0, 3, 0, 5]);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
      return it("returns null if no match is found", function() {
        var range;
        EditorState.set(this.editor, "[0]");
        range = this.cursorTools.locateBackward(/x+/);
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("[0]");
      });
    });
    describe("locateForward", function() {
      it("returns the range of the next match if found", function() {
        var range;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        range = this.cursorTools.locateForward(/x+/);
        expect(rangeCoordinates(range)).toEqual([0, 7, 0, 9]);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
      return it("returns null if no match is found", function() {
        var range;
        EditorState.set(this.editor, "[0]");
        range = this.cursorTools.locateForward(/x+/);
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("[0]");
      });
    });
    describe("locateWordCharacterBackward", function() {
      it("returns the range of the previous word character if found", function() {
        var range;
        EditorState.set(this.editor, " xx  [0]");
        range = this.cursorTools.locateWordCharacterBackward();
        expect(rangeCoordinates(range)).toEqual([0, 2, 0, 3]);
        return expect(EditorState.get(this.editor)).toEqual(" xx  [0]");
      });
      return it("returns null if there are no word characters behind", function() {
        var range;
        EditorState.set(this.editor, "  [0]");
        range = this.cursorTools.locateWordCharacterBackward();
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("  [0]");
      });
    });
    describe("locateWordCharacterForward", function() {
      it("returns the range of the next word character if found", function() {
        var range;
        EditorState.set(this.editor, "[0]  xx ");
        range = this.cursorTools.locateWordCharacterForward();
        expect(rangeCoordinates(range)).toEqual([0, 2, 0, 3]);
        return expect(EditorState.get(this.editor)).toEqual("[0]  xx ");
      });
      return it("returns null if there are no word characters ahead", function() {
        var range;
        EditorState.set(this.editor, "[0]  ");
        range = this.cursorTools.locateWordCharacterForward();
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("[0]  ");
      });
    });
    describe("locateNonWordCharacterBackward", function() {
      it("returns the range of the previous nonword character if found", function() {
        var range;
        EditorState.set(this.editor, "x  xx[0]");
        range = this.cursorTools.locateNonWordCharacterBackward();
        expect(rangeCoordinates(range)).toEqual([0, 2, 0, 3]);
        return expect(EditorState.get(this.editor)).toEqual("x  xx[0]");
      });
      return it("returns null if there are no nonword characters behind", function() {
        var range;
        EditorState.set(this.editor, "xx[0]");
        range = this.cursorTools.locateNonWordCharacterBackward();
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("xx[0]");
      });
    });
    describe("locateNonWordCharacterForward", function() {
      it("returns the range of the next nonword character if found", function() {
        var range;
        EditorState.set(this.editor, "[0]xx  x");
        range = this.cursorTools.locateNonWordCharacterForward();
        expect(rangeCoordinates(range)).toEqual([0, 2, 0, 3]);
        return expect(EditorState.get(this.editor)).toEqual("[0]xx  x");
      });
      return it("returns null if there are no nonword characters ahead", function() {
        var range;
        EditorState.set(this.editor, "[0]xx");
        range = this.cursorTools.locateNonWordCharacterForward();
        expect(range).toBe(null);
        return expect(EditorState.get(this.editor)).toEqual("[0]xx");
      });
    });
    describe("goToMatchStartBackward", function() {
      it("moves to the start of the previous match and returns true if a match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchStartBackward(/x+/);
        expect(result).toBe(true);
        return expect(EditorState.get(this.editor)).toEqual("xx [0]xx  xx xx");
      });
      return it("does not move and returns false if no match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchStartBackward(/y+/);
        expect(result).toBe(false);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
    });
    describe("goToMatchStartForward", function() {
      it("moves to the start of the next match and returns true if a match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchStartForward(/x+/);
        expect(result).toBe(true);
        return expect(EditorState.get(this.editor)).toEqual("xx xx  [0]xx xx");
      });
      return it("does not move and returns false if no match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchStartForward(/y+/);
        expect(result).toBe(false);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
    });
    describe("goToMatchEndBackward", function() {
      it("moves to the end of the previous match and returns true if a match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchEndBackward(/x+/);
        expect(result).toBe(true);
        return expect(EditorState.get(this.editor)).toEqual("xx xx[0]  xx xx");
      });
      return it("does not move and returns false if no match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchEndBackward(/y+/);
        expect(result).toBe(false);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
    });
    describe("goToMatchEndForward", function() {
      it("moves to the end of the next match and returns true if a match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchEndForward(/x+/);
        expect(result).toBe(true);
        return expect(EditorState.get(this.editor)).toEqual("xx xx  xx[0] xx");
      });
      return it("does not move and returns false if no match is found", function() {
        var result;
        EditorState.set(this.editor, "xx xx [0] xx xx");
        result = this.cursorTools.goToMatchEndForward(/y+/);
        expect(result).toBe(false);
        return expect(EditorState.get(this.editor)).toEqual("xx xx [0] xx xx");
      });
    });
    describe("skipCharactersBackward", function() {
      it("moves backward over the given characters", function() {
        EditorState.set(this.editor, "x..x..[0]");
        this.cursorTools.skipCharactersBackward('.');
        return expect(EditorState.get(this.editor)).toEqual("x..x[0]..");
      });
      it("does not move if the previous character is not in the list", function() {
        EditorState.set(this.editor, "..x[0]");
        this.cursorTools.skipCharactersBackward('.');
        return expect(EditorState.get(this.editor)).toEqual("..x[0]");
      });
      return it("moves to the beginning of the buffer if all prior characters are in the list", function() {
        EditorState.set(this.editor, "..[0]");
        this.cursorTools.skipCharactersBackward('.');
        return expect(EditorState.get(this.editor)).toEqual("[0]..");
      });
    });
    describe("skipCharactersForward", function() {
      it("moves forward over the given characters", function() {
        EditorState.set(this.editor, "[0]..x..x");
        this.cursorTools.skipCharactersForward('.');
        return expect(EditorState.get(this.editor)).toEqual("..[0]x..x");
      });
      it("does not move if the next character is not in the list", function() {
        EditorState.set(this.editor, "[0]x..");
        this.cursorTools.skipCharactersForward('.');
        return expect(EditorState.get(this.editor)).toEqual("[0]x..");
      });
      return it("moves to the end of the buffer if all following characters are in the list", function() {
        EditorState.set(this.editor, "[0]..");
        this.cursorTools.skipCharactersForward('.');
        return expect(EditorState.get(this.editor)).toEqual("..[0]");
      });
    });
    describe("skipWordCharactersBackward", function() {
      it("moves over any word characters backward", function() {
        EditorState.set(this.editor, "abc abc[0]abc abc");
        this.cursorTools.skipWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("abc [0]abcabc abc");
      });
      it("does not move if the previous character is not a word character", function() {
        EditorState.set(this.editor, "abc abc [0]");
        this.cursorTools.skipWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("abc abc [0]");
      });
      return it("moves to the beginning of the buffer if all prior characters are word characters", function() {
        EditorState.set(this.editor, "abc[0]");
        this.cursorTools.skipWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("[0]abc");
      });
    });
    describe("skipWordCharactersForward", function() {
      it("moves over any word characters forward", function() {
        EditorState.set(this.editor, "abc abc[0]abc abc");
        this.cursorTools.skipWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("abc abcabc[0] abc");
      });
      it("does not move if the next character is not a word character", function() {
        EditorState.set(this.editor, "[0] abc abc");
        this.cursorTools.skipWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("[0] abc abc");
      });
      return it("moves to the end of the buffer if all following characters are word characters", function() {
        EditorState.set(this.editor, "[0]abc");
        this.cursorTools.skipWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("abc[0]");
      });
    });
    describe("skipNonWordCharactersBackward", function() {
      it("moves over any nonword characters backward", function() {
        EditorState.set(this.editor, "   x   [0]   x   ");
        this.cursorTools.skipNonWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("   x[0]      x   ");
      });
      it("does not move if the previous character is a word character", function() {
        EditorState.set(this.editor, "   x   x[0]");
        this.cursorTools.skipNonWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("   x   x[0]");
      });
      return it("moves to the beginning of the buffer if all prior characters are nonword characters", function() {
        EditorState.set(this.editor, "   [0]");
        this.cursorTools.skipNonWordCharactersBackward();
        return expect(EditorState.get(this.editor)).toEqual("[0]   ");
      });
    });
    describe("skipNonWordCharactersForward", function() {
      it("moves over any word characters forward", function() {
        EditorState.set(this.editor, "   x   [0]   x   ");
        this.cursorTools.skipNonWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("   x      [0]x   ");
      });
      it("does not move if the next character is a word character", function() {
        EditorState.set(this.editor, "[0]x   x   ");
        this.cursorTools.skipNonWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("[0]x   x   ");
      });
      return it("moves to the end of the buffer if all following characters are nonword characters", function() {
        EditorState.set(this.editor, "[0]   ");
        this.cursorTools.skipNonWordCharactersForward();
        return expect(EditorState.get(this.editor)).toEqual("   [0]");
      });
    });
    describe("skipBackwardUntil", function() {
      it("moves backward over the given characters", function() {
        EditorState.set(this.editor, "x..x..[0]");
        this.cursorTools.skipBackwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("x..x[0]..");
      });
      it("does not move if the previous character is not in the list", function() {
        EditorState.set(this.editor, "..x[0]");
        this.cursorTools.skipBackwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("..x[0]");
      });
      return it("moves to the beginning of the buffer if all prior characters are in the list", function() {
        EditorState.set(this.editor, "..[0]");
        this.cursorTools.skipBackwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("[0]..");
      });
    });
    describe("skipForwardUntil", function() {
      it("moves forward over the given characters", function() {
        EditorState.set(this.editor, "[0]..x..x");
        this.cursorTools.skipForwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("..[0]x..x");
      });
      it("does not move if the next character is not in the list", function() {
        EditorState.set(this.editor, "[0]x..");
        this.cursorTools.skipForwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("[0]x..");
      });
      return it("moves to the end of the buffer if all following characters are in the list", function() {
        EditorState.set(this.editor, "[0]..");
        this.cursorTools.skipForwardUntil(/[^\.]/);
        return expect(EditorState.get(this.editor)).toEqual("..[0]");
      });
    });
    return describe("extractWord", function() {
      it("removes and returns the word the cursor is in", function() {
        var word;
        EditorState.set(this.editor, "aa bb[0]cc dd");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("bbcc");
        return expect(EditorState.get(this.editor)).toEqual("aa [0] dd");
      });
      it("removes and returns the word the cursor is at the start of", function() {
        var word;
        EditorState.set(this.editor, "aa [0]bb cc");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("bb");
        return expect(EditorState.get(this.editor)).toEqual("aa [0] cc");
      });
      it("removes and returns the word the cursor is at the end of", function() {
        var word;
        EditorState.set(this.editor, "aa bb[0] cc");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("bb");
        return expect(EditorState.get(this.editor)).toEqual("aa [0] cc");
      });
      it("returns an empty string and removes nothing if the cursor is not in a word", function() {
        var word;
        EditorState.set(this.editor, "aa [0] bb");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("");
        return expect(EditorState.get(this.editor)).toEqual("aa [0] bb");
      });
      it("returns an empty string and removes nothing if not in a word at the start of the buffer", function() {
        var word;
        EditorState.set(this.editor, "[0] aa");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("");
        return expect(EditorState.get(this.editor)).toEqual("[0] aa");
      });
      it("returns an empty string and removes nothing if not in a word at the end of the buffer", function() {
        var word;
        EditorState.set(this.editor, "aa [0]");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("");
        return expect(EditorState.get(this.editor)).toEqual("aa [0]");
      });
      return it("returns and removes the only word in a buffer if inside it", function() {
        var word;
        EditorState.set(this.editor, "a[0]b");
        word = this.cursorTools.extractWord();
        expect(word).toEqual("ab");
        return expect(EditorState.get(this.editor)).toEqual("[0]");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL3NwZWMvY3Vyc29yLXRvb2xzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBDQUFBOztBQUFBLEVBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQUFkLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLGdCQUFBLEdBQW1CLFNBQUMsS0FBRCxHQUFBO0FBQ2pCLElBQUEsSUFBRyxLQUFIO2FBQ0UsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQWIsRUFBa0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUE5QixFQUFzQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQWhELEVBQXFELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBL0QsRUFERjtLQUFBLE1BQUE7YUFHRSxNQUhGO0tBRGlCO0VBQUEsQ0FIbkIsQ0FBQTs7QUFBQSxFQVNBLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxlQUFBLENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLE1BQUQsR0FBQTtBQUN6QixZQUFBLEtBQUMsQ0FBQSxNQUFELEdBQVUsTUFBVixDQUFBO21CQUNBLEtBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsV0FBQSxDQUFZLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBWixFQUZNO1VBQUEsQ0FBM0IsRUFEYztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVB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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/spec/cursor-tools-spec.coffee
