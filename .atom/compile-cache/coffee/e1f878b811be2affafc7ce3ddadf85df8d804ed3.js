(function() {
  var BOB, CursorTools, escapeRegExp;

  CursorTools = (function() {
    function CursorTools(cursor) {
      this.cursor = cursor;
      this.editor = this.cursor.editor;
    }

    CursorTools.prototype.locateBackward = function(regExp) {
      var result;
      result = null;
      this.editor.backwardsScanInBufferRange(regExp, [BOB, this.cursor.getBufferPosition()], function(hit) {
        return result = hit.range;
      });
      return result;
    };

    CursorTools.prototype.locateForward = function(regExp) {
      var eof, result;
      result = null;
      eof = this.editor.getEofBufferPosition();
      this.editor.scanInBufferRange(regExp, [this.cursor.getBufferPosition(), eof], function(hit) {
        return result = hit.range;
      });
      return result;
    };

    CursorTools.prototype.locateWordCharacterBackward = function() {
      return this.locateBackward(this._getWordCharacterRegExp());
    };

    CursorTools.prototype.locateWordCharacterForward = function() {
      return this.locateForward(this._getWordCharacterRegExp());
    };

    CursorTools.prototype.locateNonWordCharacterBackward = function() {
      return this.locateBackward(this._getNonWordCharacterRegExp());
    };

    CursorTools.prototype.locateNonWordCharacterForward = function() {
      return this.locateForward(this._getNonWordCharacterRegExp());
    };

    CursorTools.prototype.goToMatchStartBackward = function(regExp) {
      var _ref;
      return this._goTo((_ref = this.locateBackward(regExp)) != null ? _ref.start : void 0);
    };

    CursorTools.prototype.goToMatchStartForward = function(regExp) {
      var _ref;
      return this._goTo((_ref = this.locateForward(regExp)) != null ? _ref.start : void 0);
    };

    CursorTools.prototype.goToMatchEndBackward = function(regExp) {
      var _ref;
      return this._goTo((_ref = this.locateBackward(regExp)) != null ? _ref.end : void 0);
    };

    CursorTools.prototype.goToMatchEndForward = function(regExp) {
      var _ref;
      return this._goTo((_ref = this.locateForward(regExp)) != null ? _ref.end : void 0);
    };

    CursorTools.prototype.skipCharactersBackward = function(characters) {
      var regexp;
      regexp = new RegExp("[^" + (escapeRegExp(characters)) + "]");
      return this.skipBackwardUntil(regexp);
    };

    CursorTools.prototype.skipCharactersForward = function(characters) {
      var regexp;
      regexp = new RegExp("[^" + (escapeRegExp(characters)) + "]");
      return this.skipForwardUntil(regexp);
    };

    CursorTools.prototype.skipWordCharactersBackward = function() {
      return this.skipBackwardUntil(this._getNonWordCharacterRegExp());
    };

    CursorTools.prototype.skipWordCharactersForward = function() {
      return this.skipForwardUntil(this._getNonWordCharacterRegExp());
    };

    CursorTools.prototype.skipNonWordCharactersBackward = function() {
      return this.skipBackwardUntil(this._getWordCharacterRegExp());
    };

    CursorTools.prototype.skipNonWordCharactersForward = function() {
      return this.skipForwardUntil(this._getWordCharacterRegExp());
    };

    CursorTools.prototype.skipBackwardUntil = function(regexp) {
      if (!this.goToMatchEndBackward(regexp)) {
        return this._goTo(BOB);
      }
    };

    CursorTools.prototype.skipForwardUntil = function(regexp) {
      if (!this.goToMatchStartForward(regexp)) {
        return this._goTo(this.editor.getEofBufferPosition());
      }
    };

    CursorTools.prototype.extractWord = function(cursorTools) {
      var range, word, wordEnd, wordRange;
      this.skipWordCharactersBackward();
      range = this.locateNonWordCharacterForward();
      wordEnd = range ? range.start : this.editor.getEofBufferPosition();
      wordRange = [this.cursor.getBufferPosition(), wordEnd];
      word = this.editor.getTextInBufferRange(wordRange);
      this.editor.setTextInBufferRange(wordRange, '');
      return word;
    };

    CursorTools.prototype.horizontalSpaceRange = function() {
      var end, start;
      this.skipCharactersBackward(' \t');
      start = this.cursor.getBufferPosition();
      this.skipCharactersForward(' \t');
      end = this.cursor.getBufferPosition();
      return [start, end];
    };

    CursorTools.prototype.endLineIfNecessary = function() {
      var length, row;
      row = this.cursor.getBufferPosition().row;
      if (row === this.editor.getLineCount() - 1) {
        length = this.cursor.getCurrentBufferLine().length;
        return this.editor.setTextInBufferRange([[row, length], [row, length]], "\n");
      }
    };

    CursorTools.prototype._getWordCharacterRegExp = function() {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp('[^\\s' + escapeRegExp(nonWordCharacters) + ']');
    };

    CursorTools.prototype._getNonWordCharacterRegExp = function() {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp('[\\s' + escapeRegExp(nonWordCharacters) + ']');
    };

    CursorTools.prototype._goTo = function(point) {
      if (point) {
        this.cursor.setBufferPosition(point);
        return true;
      } else {
        return false;
      }
    };

    return CursorTools;

  })();

  escapeRegExp = function(string) {
    if (string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else {
      return '';
    }
  };

  BOB = {
    row: 0,
    column: 0
  };

  module.exports = CursorTools;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9jdXJzb3ItdG9vbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQU07QUFDUyxJQUFBLHFCQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBbEIsQ0FEVztJQUFBLENBQWI7O0FBQUEsMEJBTUEsY0FBQSxHQUFnQixTQUFDLE1BQUQsR0FBQTtBQUNkLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFTLElBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxNQUFuQyxFQUEyQyxDQUFDLEdBQUQsRUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQUEsQ0FBTixDQUEzQyxFQUErRSxTQUFDLEdBQUQsR0FBQTtlQUM3RSxNQUFBLEdBQVMsR0FBRyxDQUFDLE1BRGdFO01BQUEsQ0FBL0UsQ0FEQSxDQUFBO2FBR0EsT0FKYztJQUFBLENBTmhCLENBQUE7O0FBQUEsMEJBZUEsYUFBQSxHQUFlLFNBQUMsTUFBRCxHQUFBO0FBQ2IsVUFBQSxXQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUFBLENBRE4sQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixNQUExQixFQUFrQyxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBQSxDQUFELEVBQThCLEdBQTlCLENBQWxDLEVBQXNFLFNBQUMsR0FBRCxHQUFBO2VBQ3BFLE1BQUEsR0FBUyxHQUFHLENBQUMsTUFEdUQ7TUFBQSxDQUF0RSxDQUZBLENBQUE7YUFJQSxPQUxhO0lBQUEsQ0FmZixDQUFBOztBQUFBLDBCQXlCQSwyQkFBQSxHQUE2QixTQUFBLEdBQUE7YUFDM0IsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBaEIsRUFEMkI7SUFBQSxDQXpCN0IsQ0FBQTs7QUFBQSwwQkErQkEsMEJBQUEsR0FBNEIsU0FBQSxHQUFBO2FBQzFCLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBZixFQUQwQjtJQUFBLENBL0I1QixDQUFBOztBQUFBLDBCQXFDQSw4QkFBQSxHQUFnQyxTQUFBLEdBQUE7YUFDOUIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLDBCQUFELENBQUEsQ0FBaEIsRUFEOEI7SUFBQSxDQXJDaEMsQ0FBQTs7QUFBQSwwQkEyQ0EsNkJBQUEsR0FBK0IsU0FBQSxHQUFBO2FBQzdCLElBQUMsQ0FBQSxhQUFELENBQWUsSUFBQyxDQUFBLDBCQUFELENBQUEsQ0FBZixFQUQ2QjtJQUFBLENBM0MvQixDQUFBOztBQUFBLDBCQWlEQSxzQkFBQSxHQUF3QixTQUFDLE1BQUQsR0FBQTtBQUN0QixVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsS0FBRCxvREFBOEIsQ0FBRSxjQUFoQyxFQURzQjtJQUFBLENBakR4QixDQUFBOztBQUFBLDBCQXVEQSxxQkFBQSxHQUF1QixTQUFDLE1BQUQsR0FBQTtBQUNyQixVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsS0FBRCxtREFBNkIsQ0FBRSxjQUEvQixFQURxQjtJQUFBLENBdkR2QixDQUFBOztBQUFBLDBCQTZEQSxvQkFBQSxHQUFzQixTQUFDLE1BQUQsR0FBQTtBQUNwQixVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsS0FBRCxvREFBOEIsQ0FBRSxZQUFoQyxFQURvQjtJQUFBLENBN0R0QixDQUFBOztBQUFBLDBCQW1FQSxtQkFBQSxHQUFxQixTQUFDLE1BQUQsR0FBQTtBQUNuQixVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsS0FBRCxtREFBNkIsQ0FBRSxZQUEvQixFQURtQjtJQUFBLENBbkVyQixDQUFBOztBQUFBLDBCQXlFQSxzQkFBQSxHQUF3QixTQUFDLFVBQUQsR0FBQTtBQUN0QixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBYSxJQUFBLE1BQUEsQ0FBUSxJQUFBLEdBQUcsQ0FBQyxZQUFBLENBQWEsVUFBYixDQUFELENBQUgsR0FBNkIsR0FBckMsQ0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLEVBRnNCO0lBQUEsQ0F6RXhCLENBQUE7O0FBQUEsMEJBZ0ZBLHFCQUFBLEdBQXVCLFNBQUMsVUFBRCxHQUFBO0FBQ3JCLFVBQUEsTUFBQTtBQUFBLE1BQUEsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFRLElBQUEsR0FBRyxDQUFDLFlBQUEsQ0FBYSxVQUFiLENBQUQsQ0FBSCxHQUE2QixHQUFyQyxDQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsTUFBbEIsRUFGcUI7SUFBQSxDQWhGdkIsQ0FBQTs7QUFBQSwwQkF1RkEsMEJBQUEsR0FBNEIsU0FBQSxHQUFBO2FBQzFCLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixJQUFDLENBQUEsMEJBQUQsQ0FBQSxDQUFuQixFQUQwQjtJQUFBLENBdkY1QixDQUFBOztBQUFBLDBCQTZGQSx5QkFBQSxHQUEyQixTQUFBLEdBQUE7YUFDekIsSUFBQyxDQUFBLGdCQUFELENBQWtCLElBQUMsQ0FBQSwwQkFBRCxDQUFBLENBQWxCLEVBRHlCO0lBQUEsQ0E3RjNCLENBQUE7O0FBQUEsMEJBbUdBLDZCQUFBLEdBQStCLFNBQUEsR0FBQTthQUM3QixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsSUFBQyxDQUFBLHVCQUFELENBQUEsQ0FBbkIsRUFENkI7SUFBQSxDQW5HL0IsQ0FBQTs7QUFBQSwwQkF5R0EsNEJBQUEsR0FBOEIsU0FBQSxHQUFBO2FBQzVCLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUFsQixFQUQ0QjtJQUFBLENBekc5QixDQUFBOztBQUFBLDBCQStHQSxpQkFBQSxHQUFtQixTQUFDLE1BQUQsR0FBQTtBQUNqQixNQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsQ0FBUDtlQUNFLElBQUMsQ0FBQSxLQUFELENBQU8sR0FBUCxFQURGO09BRGlCO0lBQUEsQ0EvR25CLENBQUE7O0FBQUEsMEJBc0hBLGdCQUFBLEdBQWtCLFNBQUMsTUFBRCxHQUFBO0FBQ2hCLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxxQkFBRCxDQUF1QixNQUF2QixDQUFQO2VBQ0UsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQUEsQ0FBUCxFQURGO09BRGdCO0lBQUEsQ0F0SGxCLENBQUE7O0FBQUEsMEJBOEhBLFdBQUEsR0FBYSxTQUFDLFdBQUQsR0FBQTtBQUNYLFVBQUEsK0JBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSwwQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLElBQUMsQ0FBQSw2QkFBRCxDQUFBLENBRFIsQ0FBQTtBQUFBLE1BRUEsT0FBQSxHQUFhLEtBQUgsR0FBYyxLQUFLLENBQUMsS0FBcEIsR0FBK0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUFBLENBRnpDLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBQSxDQUFELEVBQThCLE9BQTlCLENBSFosQ0FBQTtBQUFBLE1BSUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsU0FBN0IsQ0FKUCxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLFNBQTdCLEVBQXdDLEVBQXhDLENBTEEsQ0FBQTthQU1BLEtBUFc7SUFBQSxDQTlIYixDQUFBOztBQUFBLDBCQXVJQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSxVQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsS0FBeEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUFBLENBRFIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLEtBQXZCLENBRkEsQ0FBQTtBQUFBLE1BR0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsaUJBQVIsQ0FBQSxDQUhOLENBQUE7YUFJQSxDQUFDLEtBQUQsRUFBUSxHQUFSLEVBTG9CO0lBQUEsQ0F2SXRCLENBQUE7O0FBQUEsMEJBOElBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixVQUFBLFdBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQUEsQ0FBMkIsQ0FBQyxHQUFsQyxDQUFBO0FBQ0EsTUFBQSxJQUFHLEdBQUEsS0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQSxDQUFBLEdBQXlCLENBQW5DO0FBQ0UsUUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUFBLENBQThCLENBQUMsTUFBeEMsQ0FBQTtlQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsQ0FBQyxDQUFDLEdBQUQsRUFBTSxNQUFOLENBQUQsRUFBZ0IsQ0FBQyxHQUFELEVBQU0sTUFBTixDQUFoQixDQUE3QixFQUE2RCxJQUE3RCxFQUZGO09BRmtCO0lBQUEsQ0E5SXBCLENBQUE7O0FBQUEsMEJBb0pBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTtBQUN2QixVQUFBLGlCQUFBO0FBQUEsTUFBQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLENBQXBCLENBQUE7YUFDSSxJQUFBLE1BQUEsQ0FBTyxPQUFBLEdBQVUsWUFBQSxDQUFhLGlCQUFiLENBQVYsR0FBNEMsR0FBbkQsRUFGbUI7SUFBQSxDQXBKekIsQ0FBQTs7QUFBQSwwQkF3SkEsMEJBQUEsR0FBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsaUJBQUE7QUFBQSxNQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBcEIsQ0FBQTthQUNJLElBQUEsTUFBQSxDQUFPLE1BQUEsR0FBUyxZQUFBLENBQWEsaUJBQWIsQ0FBVCxHQUEyQyxHQUFsRCxFQUZzQjtJQUFBLENBeEo1QixDQUFBOztBQUFBLDBCQTRKQSxLQUFBLEdBQU8sU0FBQyxLQUFELEdBQUE7QUFDTCxNQUFBLElBQUcsS0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixLQUExQixDQUFBLENBQUE7ZUFDQSxLQUZGO09BQUEsTUFBQTtlQUlFLE1BSkY7T0FESztJQUFBLENBNUpQLENBQUE7O3VCQUFBOztNQURGLENBQUE7O0FBQUEsRUFzS0EsWUFBQSxHQUFlLFNBQUMsTUFBRCxHQUFBO0FBQ2IsSUFBQSxJQUFHLE1BQUg7YUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLHdCQUFmLEVBQXlDLE1BQXpDLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FIRjtLQURhO0VBQUEsQ0F0S2YsQ0FBQTs7QUFBQSxFQTRLQSxHQUFBLEdBQU07QUFBQSxJQUFDLEdBQUEsRUFBSyxDQUFOO0FBQUEsSUFBUyxNQUFBLEVBQVEsQ0FBakI7R0E1S04sQ0FBQTs7QUFBQSxFQThLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQTlLakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/cursor-tools.coffee
