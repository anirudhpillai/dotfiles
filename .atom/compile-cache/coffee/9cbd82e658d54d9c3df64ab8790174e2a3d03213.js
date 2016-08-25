(function() {
  var appendCopy;

  appendCopy = function(reversed, maintainClipboard, fullLine) {
    var appendTo, clipboardText, end, indentBasis, index, metadata, newMetadata, newText, precedingText, selectionData, selectionText, start, startLevel, _fullLine, _indentBasis, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _text;
    if (reversed == null) {
      reversed = false;
    }
    if (maintainClipboard == null) {
      maintainClipboard = false;
    }
    if (fullLine == null) {
      fullLine = false;
    }
    if (this.isEmpty()) {
      return;
    }
    _ref = atom.clipboard.readWithMetadata(), clipboardText = _ref.text, metadata = _ref.metadata;
    if (metadata == null) {
      return;
    }
    if (((_ref1 = metadata.selections) != null ? _ref1.length : void 0) > 1) {
      if (((_ref2 = metadata.selections) != null ? _ref2.length : void 0) !== this.editor.getSelections().length) {
        return;
      }
      maintainClipboard = true;
    }
    _ref3 = this.getBufferRange(), start = _ref3.start, end = _ref3.end;
    selectionText = this.editor.getTextInRange([start, end]);
    precedingText = this.editor.getTextInRange([[start.row, 0], start]);
    startLevel = this.editor.indentLevelForLine(precedingText);
    appendTo = function(_text, _indentBasis) {
      if (reversed) {
        _text = selectionText + _text;
        _indentBasis = startLevel;
      } else {
        _text = _text + selectionText;
      }
      return {
        text: _text,
        indentBasis: _indentBasis,
        fullLine: false
      };
    };
    if (maintainClipboard) {
      index = this.editor.getSelections().indexOf(this);
      _ref4 = metadata.selections[index], _text = _ref4.text, _indentBasis = _ref4.indentBasis, _fullLine = _ref4.fullLine;
      selectionData = appendTo(_text, _indentBasis);
      newMetadata = metadata;
      newMetadata.selections[index] = selectionData;
      newText = newMetadata.selections.map(function(selection) {
        return selection.text;
      }).join("\n");
    } else {
      _indentBasis = metadata.indentBasis, _fullLine = metadata.fullLine;
      _ref5 = appendTo(clipboardText, _indentBasis), newText = _ref5.text, indentBasis = _ref5.indentBasis, fullLine = _ref5.fullLine;
      newMetadata = {
        indentBasis: indentBasis,
        fullLine: fullLine
      };
    }
    newMetadata.replace = true;
    return atom.clipboard.write(newText, newMetadata);
  };

  module.exports = {
    appendCopy: appendCopy
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9zZWxlY3Rpb24uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFVBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsU0FBQyxRQUFELEVBQW1CLGlCQUFuQixFQUE0QyxRQUE1QyxHQUFBO0FBQ1gsUUFBQSx5TkFBQTs7TUFEWSxXQUFXO0tBQ3ZCOztNQUQ4QixvQkFBa0I7S0FDaEQ7O01BRHVELFdBQVM7S0FDaEU7QUFBQSxJQUFBLElBQVUsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFWO0FBQUEsWUFBQSxDQUFBO0tBQUE7QUFBQSxJQUVBLE9BQWtDLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWYsQ0FBQSxDQUFsQyxFQUFPLHFCQUFOLElBQUQsRUFBc0IsZ0JBQUEsUUFGdEIsQ0FBQTtBQUdBLElBQUEsSUFBYyxnQkFBZDtBQUFBLFlBQUEsQ0FBQTtLQUhBO0FBSUEsSUFBQSxrREFBc0IsQ0FBRSxnQkFBckIsR0FBOEIsQ0FBakM7QUFDRSxNQUFBLGtEQUE2QixDQUFFLGdCQUFyQixLQUFpQyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLE1BQW5FO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLGlCQUFBLEdBQW9CLElBRHBCLENBREY7S0FKQTtBQUFBLElBUUEsUUFBZSxJQUFDLENBQUEsY0FBRCxDQUFBLENBQWYsRUFBQyxjQUFBLEtBQUQsRUFBUSxZQUFBLEdBUlIsQ0FBQTtBQUFBLElBU0EsYUFBQSxHQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUF2QixDQVRoQixDQUFBO0FBQUEsSUFVQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQUQsRUFBaUIsS0FBakIsQ0FBdkIsQ0FWaEIsQ0FBQTtBQUFBLElBV0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsa0JBQVIsQ0FBMkIsYUFBM0IsQ0FYYixDQUFBO0FBQUEsSUFhQSxRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsWUFBUixHQUFBO0FBQ1QsTUFBQSxJQUFHLFFBQUg7QUFDRSxRQUFBLEtBQUEsR0FBUSxhQUFBLEdBQWdCLEtBQXhCLENBQUE7QUFBQSxRQUNBLFlBQUEsR0FBZSxVQURmLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxLQUFBLEdBQVEsS0FBQSxHQUFRLGFBQWhCLENBSkY7T0FBQTthQU1BO0FBQUEsUUFDRSxJQUFBLEVBQU0sS0FEUjtBQUFBLFFBRUUsV0FBQSxFQUFhLFlBRmY7QUFBQSxRQUdFLFFBQUEsRUFBVSxLQUhaO1FBUFM7SUFBQSxDQWJYLENBQUE7QUEwQkEsSUFBQSxJQUFHLGlCQUFIO0FBQ0UsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxJQUFoQyxDQUFSLENBQUE7QUFBQSxNQUNBLFFBQWdFLFFBQVEsQ0FBQyxVQUFXLENBQUEsS0FBQSxDQUFwRixFQUFPLGNBQU4sSUFBRCxFQUEyQixxQkFBYixXQUFkLEVBQW1ELGtCQUFWLFFBRHpDLENBQUE7QUFBQSxNQUVBLGFBQUEsR0FBZ0IsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsWUFBaEIsQ0FGaEIsQ0FBQTtBQUFBLE1BR0EsV0FBQSxHQUFjLFFBSGQsQ0FBQTtBQUFBLE1BSUEsV0FBVyxDQUFDLFVBQVcsQ0FBQSxLQUFBLENBQXZCLEdBQWdDLGFBSmhDLENBQUE7QUFBQSxNQUtBLE9BQUEsR0FBVSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQXZCLENBQTJCLFNBQUMsU0FBRCxHQUFBO2VBQWUsU0FBUyxDQUFDLEtBQXpCO01BQUEsQ0FBM0IsQ0FBeUQsQ0FBQyxJQUExRCxDQUErRCxJQUEvRCxDQUxWLENBREY7S0FBQSxNQUFBO0FBUUUsTUFBYyx3QkFBYixXQUFELEVBQXNDLHFCQUFWLFFBQTVCLENBQUE7QUFBQSxNQUNBLFFBQXlDLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFlBQXhCLENBQXpDLEVBQU8sZ0JBQU4sSUFBRCxFQUFnQixvQkFBQSxXQUFoQixFQUE2QixpQkFBQSxRQUQ3QixDQUFBO0FBQUEsTUFFQSxXQUFBLEdBQWM7QUFBQSxRQUFDLGFBQUEsV0FBRDtBQUFBLFFBQWMsVUFBQSxRQUFkO09BRmQsQ0FSRjtLQTFCQTtBQUFBLElBdUNBLFdBQVcsQ0FBQyxPQUFaLEdBQXNCLElBdkN0QixDQUFBO1dBd0NBLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBZixDQUFxQixPQUFyQixFQUE4QixXQUE5QixFQXpDVztFQUFBLENBQWIsQ0FBQTs7QUFBQSxFQTJDQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsWUFBQSxVQUFEO0dBM0NqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/selection.coffee
