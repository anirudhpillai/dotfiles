(function() {
  describe("Haskell grammar", function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("haskell-grammar");
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName("source.hs");
      });
    });
    it("parses the grammar", function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe("source.hs");
    });
    describe("chars", function() {
      it('tokenizes general chars', function() {
        var char, chars, scope, tokens, _results;
        chars = ['a', '0', '9', 'z', '@', '0', '"'];
        _results = [];
        for (scope in chars) {
          char = chars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          expect(tokens[0].value).toEqual("'");
          expect(tokens[0].scopes).toEqual(["source.hs", 'constant.character.hs', "punctuation.definition.character.begin.hs"]);
          expect(tokens[1].value).toEqual(char);
          expect(tokens[1].scopes).toEqual(["source.hs", 'constant.character.hs']);
          expect(tokens[2].value).toEqual("'");
          _results.push(expect(tokens[2].scopes).toEqual(["source.hs", 'constant.character.hs', "punctuation.definition.character.end.hs"]));
        }
        return _results;
      });
      return it('tokenizes escape chars', function() {
        var char, escapeChars, scope, tokens, _results;
        escapeChars = ['\t', '\n', '\''];
        _results = [];
        for (scope in escapeChars) {
          char = escapeChars[scope];
          tokens = grammar.tokenizeLine("'" + char + "'").tokens;
          expect(tokens[0].value).toEqual("'");
          expect(tokens[0].scopes).toEqual(["source.hs", 'constant.character.hs', "punctuation.definition.character.begin.hs"]);
          expect(tokens[1].value).toEqual(char);
          expect(tokens[1].scopes).toEqual(["source.hs", 'constant.character.hs', 'constant.character.escape.hs']);
          expect(tokens[2].value).toEqual("'");
          _results.push(expect(tokens[2].scopes).toEqual(["source.hs", 'constant.character.hs', "punctuation.definition.character.end.hs"]));
        }
        return _results;
      });
    });
    describe("strings", function() {
      return it("tokenizes single-line strings", function() {
        var delim, delimsByScope, scope, tokens, _results;
        delimsByScope = {
          "string.quoted.double.hs": '"'
        };
        _results = [];
        for (scope in delimsByScope) {
          delim = delimsByScope[scope];
          tokens = grammar.tokenizeLine(delim + "x" + delim).tokens;
          expect(tokens[0].value).toEqual(delim);
          expect(tokens[0].scopes).toEqual(["source.hs", scope, "punctuation.definition.string.begin.hs"]);
          expect(tokens[1].value).toEqual("x");
          expect(tokens[1].scopes).toEqual(["source.hs", scope]);
          expect(tokens[2].value).toEqual(delim);
          _results.push(expect(tokens[2].scopes).toEqual(["source.hs", scope, "punctuation.definition.string.end.hs"]));
        }
        return _results;
      });
    });
    describe("backtick function call", function() {
      return it("finds backtick function names", function() {
        var tokens;
        tokens = grammar.tokenizeLine("\`func\`").tokens;
        expect(tokens[0]).toEqual({
          value: '`',
          scopes: ['source.hs', 'meta.method.hs']
        });
        expect(tokens[1]).toEqual({
          value: 'func',
          scopes: ['source.hs', 'meta.method.hs', 'variable.other.hs']
        });
        return expect(tokens[2]).toEqual({
          value: '`',
          scopes: ['source.hs', 'meta.method.hs']
        });
      });
    });
    describe("keywords", function() {
      var controlKeywords, keyword, scope, _results;
      controlKeywords = ['case', 'of', 'in', 'where', 'if', 'then', 'else'];
      _results = [];
      for (scope in controlKeywords) {
        keyword = controlKeywords[scope];
        _results.push(it("tokenizes " + keyword + " as a keyword", function() {
          var tokens;
          tokens = grammar.tokenizeLine(keyword).tokens;
          return expect(tokens[0]).toEqual({
            value: keyword,
            scopes: ['source.hs', 'keyword.control.hs']
          });
        }));
      }
      return _results;
    });
    describe("operators", function() {
      return it("tokenizes the / arithmetic operator when separated by newlines", function() {
        var lines;
        lines = grammar.tokenizeLines("1\n/ 2");
        expect(lines[0][0]).toEqual({
          value: '1',
          scopes: ['source.hs', 'constant.numeric.hs']
        });
        expect(lines[1][0]).toEqual({
          value: '/ ',
          scopes: ['source.hs']
        });
        return expect(lines[1][1]).toEqual({
          value: '2',
          scopes: ['source.hs', 'constant.numeric.hs']
        });
      });
    });
    it("tokenizes {-  -} comments", function() {
      var tokens;
      tokens = grammar.tokenizeLine('{--}').tokens;
      expect(tokens[0]).toEqual({
        value: '{-',
        scopes: ['source.hs', 'comment.block.hs', 'punctuation.definition.comment.hs']
      });
      expect(tokens[1]).toEqual({
        value: '-}',
        scopes: ['source.hs', 'comment.block.hs', 'punctuation.definition.comment.hs']
      });
      tokens = grammar.tokenizeLine('{- foo -}').tokens;
      expect(tokens[0]).toEqual({
        value: '{-',
        scopes: ['source.hs', 'comment.block.hs', 'punctuation.definition.comment.hs']
      });
      expect(tokens[1]).toEqual({
        value: ' foo ',
        scopes: ['source.hs', 'comment.block.hs']
      });
      return expect(tokens[2]).toEqual({
        value: '-}',
        scopes: ['source.hs', 'comment.block.hs', 'punctuation.definition.comment.hs']
      });
    });
    return describe("ids", function() {
      it('handles var_ids', function() {
        var id, scope, tokens, variableIds, _results;
        variableIds = ['a', 'c#', 'c90', 'laueou', 'uohcro\'390', 'coheruoeh\'CntoeuhCHR1neouhsS'];
        _results = [];
        for (scope in variableIds) {
          id = variableIds[scope];
          tokens = grammar.tokenizeLine(id).tokens;
          _results.push(expect(tokens[0]).toEqual({
            value: id,
            scopes: ['source.hs', 'variable.other.hs']
          }));
        }
        return _results;
      });
      return it('handles type_ids', function() {
        var id, scope, tokens, typeIds, _results;
        typeIds = ['Char', 'Data', 'List', 'Int#', 'Integral', 'Float', 'Date'];
        _results = [];
        for (scope in typeIds) {
          id = typeIds[scope];
          tokens = grammar.tokenizeLine(id).tokens;
          _results.push(expect(tokens[0]).toEqual({
            value: id,
            scopes: ['source.hs', 'storage.type.hs']
          }));
        }
        return _results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9oYXNrZWxsLWdyYW1tYXIvc3BlYy9oYXNrZWxsLWdyYW1tYXItc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFLQTtBQUFBLEVBQUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGlCQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FBQSxDQUFBO2FBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtlQUNILE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLFdBQWxDLEVBRFA7TUFBQSxDQUFMLEVBSlM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBU0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtBQUN2QixNQUFBLE1BQUEsQ0FBTyxPQUFQLENBQWUsQ0FBQyxVQUFoQixDQUFBLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBZixDQUF5QixDQUFDLElBQTFCLENBQStCLFdBQS9CLEVBRnVCO0lBQUEsQ0FBekIsQ0FUQSxDQUFBO0FBQUEsSUFhQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsTUFBQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsb0NBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxFQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUEwQixHQUExQixF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

//# sourceURL=/home/anirudh/.atom/packages/haskell-grammar/spec/haskell-grammar-spec.coffee
