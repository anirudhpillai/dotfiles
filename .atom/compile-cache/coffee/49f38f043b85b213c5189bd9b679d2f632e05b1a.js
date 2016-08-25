(function() {
  var EditorState, Mark, getEditorElement, keydown, _ref;

  Mark = require('../lib/mark');

  EditorState = require('./editor-state');

  _ref = require('./spec-helper'), keydown = _ref.keydown, getEditorElement = _ref.getEditorElement;

  describe('Emacs', function() {
    var editor, editorElement, workspaceElement, _ref1;
    _ref1 = [], workspaceElement = _ref1[0], editor = _ref1[1], editorElement = _ref1[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      return runs(function() {
        return getEditorElement(function(element) {
          editorElement = element;
          return editor = editorElement.getModel();
        });
      });
    });
    describe('activate', function() {
      return it("puts the editor in emacs-plus class", function() {
        return expect(editorElement.classList.contains('emacs-plus')).toBe(true);
      });
    });
    describe('emacs-plus:transpose-words', function() {
      it('transposes the current word with the one after it', function() {
        EditorState.set(editor, "aaa b[0]bb .\tccc ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa ccc .\tbbb[0] ddd");
      });
      it('transposes the previous and next words if at the end of a word', function() {
        EditorState.set(editor, "aaa bbb[0] .\tccc ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa ccc .\tbbb[0] ddd");
      });
      it('transposes the previous and next words if at the beginning of a word', function() {
        EditorState.set(editor, "aaa bbb .\t[0]ccc ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa ccc .\tbbb[0] ddd");
      });
      it("transposes the previous and next words if in between words", function() {
        EditorState.set(editor, "aaa bbb .[0]\tccc ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa ccc .\tbbb[0] ddd");
      });
      it("moves to the start of the last word if in the last word", function() {
        EditorState.set(editor, "aaa bbb .\tcc[0]c ");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa bbb .\tccc[0] ");
      });
      it("transposes the last two words if at the start of the last word", function() {
        EditorState.set(editor, "aaa bbb .\t[0]ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("aaa ccc .\tbbb[0]");
      });
      it("transposes the first two words if at the start of the buffer", function() {
        EditorState.set(editor, "[0]aaa .\tbbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual("bbb .\taaa[0] ccc");
      });
      return it("moves to the start of the word if it's the only word in the buffer", function() {
        EditorState.set(editor, " \taaa [0]\t");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-words');
        return expect(EditorState.get(editor)).toEqual(" \taaa[0] \t");
      });
    });
    describe("emacs-plus:transpose-lines", function() {
      it("transposes this line with the previous one, and moves to the next line", function() {
        EditorState.set(editor, "aaa\nb[0]bb\nccc\n");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("bbb\naaa\n[0]ccc\n");
      });
      it("pretends it's on the second line if it's on the first", function() {
        EditorState.set(editor, "a[0]aa\nbbb\nccc\n");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("bbb\naaa\n[0]ccc\n");
      });
      it("creates a newline at end of file if necessary", function() {
        EditorState.set(editor, "aaa\nb[0]bb");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("bbb\naaa\n[0]");
      });
      it("still transposes if at the end of the buffer after a trailing newline", function() {
        EditorState.set(editor, "aaa\nbbb\n[0]");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("aaa\n\nbbb\n[0]");
      });
      it("inserts a blank line at the top if there's only one line with a trailing newline", function() {
        EditorState.set(editor, "a[0]aa\n");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("\naaa\n[0]");
      });
      return it("inserts a blank line at the top if there's only one line with no trailing newline", function() {
        EditorState.set(editor, "a[0]aa");
        atom.commands.dispatch(editorElement, 'emacs-plus:transpose-lines');
        return expect(EditorState.get(editor)).toEqual("\naaa\n[0]");
      });
    });
    describe("emacs-plus:delete-horizontal-space", function() {
      it("deletes all horizontal space around each cursor", function() {
        EditorState.set(editor, "a [0]\tb c [1]\td");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-horizontal-space');
        return expect(EditorState.get(editor)).toEqual("a[0]b c[1]d");
      });
      it("deletes all horizontal space to the beginning of the buffer if in leading space", function() {
        EditorState.set(editor, " [0]\ta");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-horizontal-space');
        return expect(EditorState.get(editor)).toEqual("[0]a");
      });
      it("deletes all horizontal space to the end of the buffer if in trailing space", function() {
        EditorState.set(editor, "a [0]\t");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-horizontal-space');
        return expect(EditorState.get(editor)).toEqual("a[0]");
      });
      it("deletes all text if the buffer only contains horizontal spaces", function() {
        EditorState.set(editor, " [0]\t");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-horizontal-space');
        return expect(EditorState.get(editor)).toEqual("[0]");
      });
      return it("does not modify the buffer if there is no horizontal space around the cursor", function() {
        EditorState.set(editor, "a[0]b");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-horizontal-space');
        return expect(EditorState.get(editor)).toEqual("a[0]b");
      });
    });
    describe("emacs-plus:kill-word", function() {
      it("deletes from the cursor to the end of the word if inside a word", function() {
        EditorState.set(editor, "aaa b[0]bb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa b[0] ccc");
      });
      it("deletes the word in front of the cursor if at the beginning of a word", function() {
        EditorState.set(editor, "aaa [0]bbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0] ccc");
      });
      it("deletes the next word if at the end of a word", function() {
        EditorState.set(editor, "aaa[0] bbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa[0] ccc");
      });
      it("deletes the next word if between words", function() {
        EditorState.set(editor, "aaa [0] bbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0] ccc");
      });
      it("does nothing if at the end of the buffer", function() {
        EditorState.set(editor, "aaa bbb ccc[0]");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa bbb ccc[0]");
      });
      it("deletes any selected text", function() {
        EditorState.set(editor, "aaa b(0)b[0]b ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa b[0]b ccc");
      });
      it("operates on multiple cursors", function() {
        EditorState.set(editor, "aaa b[0]bb c[1]cc ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa b[0] c[1] ddd");
      });
      return it('appending kills', function() {
        EditorState.set(editor, 'aaa [0] bbb ccc');
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        expect(atom.clipboard.read()).toBe(' bbb ccc');
        return expect(EditorState.get(editor)).toEqual('aaa [0]');
      });
    });
    describe("emacs-plus:backward-kill-word", function() {
      it("deletes from the cursor to the beginning of the word if inside a word", function() {
        EditorState.set(editor, "aaa bb[0]b ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0]b ccc");
      });
      it("deletes the word behind the cursor if at the end of a word", function() {
        EditorState.set(editor, "aaa bbb[0] ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0] ccc");
      });
      it("deletes the previous word if at the beginning of a word", function() {
        EditorState.set(editor, "aaa bbb [0]ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0]ccc");
      });
      it("deletes the previous word if between words", function() {
        EditorState.set(editor, "aaa bbb [0] ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0] ccc");
      });
      it("does nothing if at the beginning of the buffer", function() {
        EditorState.set(editor, "[0]aaa bbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("[0]aaa bbb ccc");
      });
      it("deletes the leading space behind the cursor if at the beginning of the buffer", function() {
        EditorState.set(editor, " [0] aaa bbb ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("[0] aaa bbb ccc");
      });
      it("deletes any selected text", function() {
        EditorState.set(editor, "aaa b(0)b[0]b ccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa b[0]b ccc");
      });
      it("operates on multiple cursors", function() {
        EditorState.set(editor, "aaa bb[0]b cc[1]c ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        return expect(EditorState.get(editor)).toEqual("aaa [0]b [1]c ddd");
      });
      it('appending kills', function() {
        EditorState.set(editor, 'aaa bbb ccc[0]');
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        expect(atom.clipboard.read()).toBe('bbb ccc');
        return expect(EditorState.get(editor)).toEqual('aaa [0]');
      });
      return it('appending kills on multiple cursors', function() {
        EditorState.set(editor, "111 aaa bb[0]b 222 cc[1]c ddd");
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        atom.commands.dispatch(editorElement, 'emacs-plus:backward-kill-word');
        expect(atom.clipboard.read()).toBe("aaa bb\n222 cc");
        return EditorState.set(editor, "111 [0]b [1]c ddd");
      });
    });
    describe("emacs-plus:just-one-space", function() {
      it("replaces all horizontal space around each cursor with one space", function() {
        EditorState.set(editor, "a [0]\tb c [1]\td");
        atom.commands.dispatch(editorElement, 'emacs-plus:just-one-space');
        return expect(EditorState.get(editor)).toEqual("a [0]b c [1]d");
      });
      it("replaces all horizontal space at the beginning of the buffer with one space if in leading space", function() {
        EditorState.set(editor, " [0]\ta");
        atom.commands.dispatch(editorElement, 'emacs-plus:just-one-space');
        return expect(EditorState.get(editor)).toEqual(" [0]a");
      });
      it("replaces all horizontal space at the end of the buffer with one space if in trailing space", function() {
        EditorState.set(editor, "a [0]\t");
        atom.commands.dispatch(editorElement, 'emacs-plus:just-one-space');
        return expect(EditorState.get(editor)).toEqual("a [0]");
      });
      it("replaces all text with one space if the buffer only contains horizontal spaces", function() {
        EditorState.set(editor, " [0]\t");
        atom.commands.dispatch(editorElement, 'emacs-plus:just-one-space');
        return expect(EditorState.get(editor)).toEqual(" [0]");
      });
      return it("does not modify the buffer if there is already exactly one space at around the cursor", function() {
        EditorState.set(editor, "a[0]b");
        atom.commands.dispatch(editorElement, 'emacs-plus:just-one-space');
        return expect(EditorState.get(editor)).toEqual("a [0]b");
      });
    });
    describe("emacs-plus:set-mark", function() {
      return it("sets and activates the mark of all cursors", function() {
        var cursor0, cursor1, point, _ref2;
        EditorState.set(editor, "[0].[1]");
        _ref2 = editor.getCursors(), cursor0 = _ref2[0], cursor1 = _ref2[1];
        atom.commands.dispatch(editorElement, 'emacs-plus:set-mark');
        expect(Mark["for"](editor).isActive()).toBe(true);
        point = cursor0.getBufferPosition();
        expect([point.row, point.column]).toEqual([0, 0]);
        expect(Mark["for"](editor).isActive()).toBe(true);
        point = cursor1.getBufferPosition();
        return expect([point.row, point.column]).toEqual([0, 1]);
      });
    });
    describe("emacs-plus:keyboard-quit", function() {
      return it("deactivates all marks", function() {
        var mark;
        EditorState.set(editor, "[0].[1]");
        mark = Mark["for"](editor);
        mark.activate();
        atom.commands.dispatch(editorElement, 'core:cancel');
        return expect(mark.isActive()).toBe(false);
      });
    });
    describe("emacs-plus:exchange-point-and-mark", function() {
      return it("exchanges all cursors with their marks", function() {
        var mark;
        mark = Mark["for"](editor);
        EditorState.set(editor, "[0]..[1].");
        mark.activate(true);
        keydown('f', {
          ctrl: true
        });
        atom.commands.dispatch(editorElement, 'emacs-plus:exchange-point-and-mark');
        return expect(EditorState.get(editor)).toEqual("[0].(0).[1].(1)");
      });
    });
    describe('emacs-plus:kill-whole-line', function() {
      it('kill an entire line at once', function() {
        EditorState.set(editor, "aa\nb[0]b\ncc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-whole-line');
        return expect(EditorState.get(editor)).toEqual("aa\n[0]cc");
      });
      it('ignore the selection', function() {
        EditorState.set(editor, "a(0)aa[0]\nbbb\nccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-whole-line');
        expect(EditorState.get(editor)).toEqual("[0]bbb\nccc");
        EditorState.set(editor, "a(0)aa\nbb[0]b\nccc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-whole-line');
        return expect(EditorState.get(editor)).toEqual("aaa\n[0]ccc");
      });
      return it('appending kills', function() {
        EditorState.set(editor, "aa\nb[0]b\ncc\ndd");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-whole-line');
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-whole-line');
        expect(atom.clipboard.read()).toBe("bb\ncc\n");
        return expect(EditorState.get(editor)).toEqual("aa\n[0]dd");
      });
    });
    describe('emacs-plus:append-next-kill', function() {
      return it('appending kills', function() {
        EditorState.set(editor, '[0]aaa bbb ccc ddd');
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        atom.commands.dispatch(editorElement, 'editor:move-to-end-of-word');
        atom.commands.dispatch(editorElement, 'emacs-plus:append-next-kill');
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-word');
        expect(atom.clipboard.read()).toBe('aaa ccc');
        return expect(EditorState.get(editor)).toEqual(' bbb[0] ddd');
      });
    });
    describe('emacs-plus:capitalize-word', function() {
      it('capitalize the current word', function() {
        EditorState.set(editor, 'aaa b[0]bb ccc');
        atom.commands.dispatch(editorElement, 'emacs-plus:capitalize-word');
        return expect(EditorState.get(editor)).toEqual('aaa B[0]bb ccc');
      });
      return it('capitalize the current selection', function() {
        EditorState.set(editor, 'aaa b(0)bb[0] ccc');
        atom.commands.dispatch(editorElement, 'emacs-plus:capitalize-word');
        return expect(EditorState.get(editor)).toEqual('aaa b(0)Bb[0] ccc');
      });
    });
    describe('emacs-plus:delete-indentation', function() {
      it("joins the current line with the previous one if at the start of the line", function() {
        EditorState.set(editor, "aa \n[0] bb\ncc");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-indentation');
        return expect(EditorState.get(editor)).toEqual("aa[0] bb\ncc");
      });
      it("does exactly the same thing if at the end of the line", function() {
        EditorState.set(editor, "aa \n bb[0]\ncc");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-indentation');
        return expect(EditorState.get(editor)).toEqual("aa[0] bb\ncc");
      });
      return it("joins the two empty lines if they're both blank", function() {
        EditorState.set(editor, "aa\n\n[0]\nbb");
        atom.commands.dispatch(editorElement, 'emacs-plus:delete-indentation');
        return expect(EditorState.get(editor)).toEqual("aa\n[0]\nbb");
      });
    });
    return describe('emacs-plus:kill-line', function() {
      it('inside a line', function() {
        EditorState.set(editor, "aa\nb[0]b\ncc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-line');
        return expect(EditorState.get(editor)).toEqual("aa\nb[0]\ncc");
      });
      it('end of line', function() {
        EditorState.set(editor, "aa\nbb[0]\ncc");
        atom.commands.dispatch(editorElement, 'emacs-plus:kill-line');
        expect(EditorState.get(editor)).toEqual("aa\nbb[0]cc");
        atom.commands.dispatch(editorElement, 'core:paste');
        return expect(EditorState.get(editor)).toEqual("aa\nbb\n[0]cc");
      });
      return it('appending kills', function() {
        var metadata, n, text, _i, _ref2;
        EditorState.set(editor, "aa\n[0]bb\ncc\ndd");
        for (n = _i = 0; _i < 4; n = ++_i) {
          atom.commands.dispatch(editorElement, 'emacs-plus:kill-line');
        }
        _ref2 = atom.clipboard.readWithMetadata(), text = _ref2.text, metadata = _ref2.metadata;
        expect(text).toBe("bb\ncc\n");
        expect(metadata.fullLine).toBe(false);
        return expect(metadata.indentBasis).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL3NwZWMvZW1hY3Mtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGFBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUixDQURkLENBQUE7O0FBQUEsRUFFQSxPQUE4QixPQUFBLENBQVEsZUFBUixDQUE5QixFQUFDLGVBQUEsT0FBRCxFQUFVLHdCQUFBLGdCQUZWLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsUUFBQSw4Q0FBQTtBQUFBLElBQUEsUUFBNEMsRUFBNUMsRUFBQywyQkFBRCxFQUFtQixpQkFBbkIsRUFBMkIsd0JBQTNCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBREEsQ0FBQTthQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7ZUFDSCxnQkFBQSxDQUFpQixTQUFDLE9BQUQsR0FBQTtBQUNmLFVBQUEsYUFBQSxHQUFnQixPQUFoQixDQUFBO2lCQUNBLE1BQUEsR0FBUyxhQUFhLENBQUMsUUFBZCxDQUFBLEVBRk07UUFBQSxDQUFqQixFQURHO01BQUEsQ0FBTCxFQUpTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQVlBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTthQUNuQixFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFB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

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/spec/emacs-spec.coffee
