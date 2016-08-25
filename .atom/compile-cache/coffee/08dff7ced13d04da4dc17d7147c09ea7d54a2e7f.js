(function() {
  var GitLog, expectedCommits, fs, path;

  GitLog = require('git-log-utils');

  fs = require('fs');

  path = require('path');

  expectedCommits = require('./test-data/fiveCommitsExpected');

  describe("GitLogUtils", function() {
    return describe("when loading file history for known file in git", function() {
      beforeEach(function() {
        var projectRoot, testFileName;
        this.addMatchers({
          toHaveKnownValues: function(expected) {
            var key, matches, messages, pass, value;
            pass = true;
            messages = "";
            for (key in expected) {
              value = expected[key];
              matches = this.actual[key] === value;
              if (!matches) {
                if (pass) {
                  messages += "Commit " + this.actual.hash + ": ";
                } else {
                  messages += "; ";
                }
                messages += "" + key + " expected: " + value + " actual: " + this.actual[key];
                pass = false;
              }
            }
            if (pass) {
              this.message = function() {
                return "Expected commit " + this.actual.hash + " to not equal " + (JSON.stringify(this.expected));
              };
            } else {
              this.message = function() {
                return messages;
              };
            }
            return pass;
          }
        });
        projectRoot = __dirname;
        testFileName = path.join(projectRoot, 'test-data', 'fiveCommits.txt');
        return this.testdata = GitLog.getCommitHistory(testFileName);
      });
      it("should have 5 commits", function() {
        return expect(this.testdata.length).toEqual(5);
      });
      return it("first 5 commits should match last known good", function() {
        var actualCommit, expectedCommit, index, _i, _len, _results;
        _results = [];
        for (index = _i = 0, _len = expectedCommits.length; _i < _len; index = ++_i) {
          expectedCommit = expectedCommits[index];
          actualCommit = this.testdata[index];
          _results.push(expect(actualCommit).toHaveKnownValues(expectedCommit));
        }
        return _results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL3NwZWMvZ2l0LXV0aWxzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLGlDQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEsaUNBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtXQUN0QixRQUFBLENBQVMsaURBQVQsRUFBNEQsU0FBQSxHQUFBO0FBQzFELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEseUJBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxXQUFELENBQWE7QUFBQSxVQUFBLGlCQUFBLEVBQW1CLFNBQUMsUUFBRCxHQUFBO0FBQzlCLGdCQUFBLG1DQUFBO0FBQUEsWUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsWUFDQSxRQUFBLEdBQVcsRUFEWCxDQUFBO0FBRUEsaUJBQUEsZUFBQTtvQ0FBQTtBQUNFLGNBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSLEtBQWdCLEtBQTFCLENBQUE7QUFDQSxjQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0UsZ0JBQUEsSUFBRyxJQUFIO0FBQ0Usa0JBQUEsUUFBQSxJQUFhLFNBQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQWpCLEdBQXNCLElBQW5DLENBREY7aUJBQUEsTUFBQTtBQUdFLGtCQUFBLFFBQUEsSUFBWSxJQUFaLENBSEY7aUJBQUE7QUFBQSxnQkFJQSxRQUFBLElBQVksRUFBQSxHQUFHLEdBQUgsR0FBTyxhQUFQLEdBQW9CLEtBQXBCLEdBQTBCLFdBQTFCLEdBQXFDLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUp6RCxDQUFBO0FBQUEsZ0JBS0EsSUFBQSxHQUFPLEtBTFAsQ0FERjtlQUZGO0FBQUEsYUFGQTtBQVdBLFlBQUEsSUFBRyxJQUFIO0FBQ0UsY0FBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUEsR0FBQTt1QkFBSSxrQkFBQSxHQUFrQixJQUFDLENBQUEsTUFBTSxDQUFDLElBQTFCLEdBQStCLGdCQUEvQixHQUE4QyxDQUFDLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQyxDQUFBLFFBQWhCLENBQUQsRUFBbEQ7Y0FBQSxDQUFYLENBREY7YUFBQSxNQUFBO0FBR0UsY0FBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUEsR0FBQTt1QkFBRyxTQUFIO2NBQUEsQ0FBWCxDQUhGO2FBWEE7QUFlQSxtQkFBTyxJQUFQLENBaEI4QjtVQUFBLENBQW5CO1NBQWIsQ0FBQSxDQUFBO0FBQUEsUUFrQkEsV0FBQSxHQUFjLFNBbEJkLENBQUE7QUFBQSxRQW1CQSxZQUFBLEdBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQXVCLFdBQXZCLEVBQW9DLGlCQUFwQyxDQW5CZixDQUFBO2VBb0JBLElBQUMsQ0FBQSxRQUFELEdBQVksTUFBTSxDQUFDLGdCQUFQLENBQXdCLFlBQXhCLEVBckJIO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQXdCQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO2VBQzFCLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQWpCLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsQ0FBakMsRUFEMEI7TUFBQSxDQUE1QixDQXhCQSxDQUFBO2FBNEJBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBLEdBQUE7QUFDakQsWUFBQSx1REFBQTtBQUFBO2FBQUEsc0VBQUE7a0RBQUE7QUFDRSxVQUFBLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBUyxDQUFBLEtBQUEsQ0FBekIsQ0FBQTtBQUFBLHdCQUNBLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsaUJBQXJCLENBQXVDLGNBQXZDLEVBREEsQ0FERjtBQUFBO3dCQURpRDtNQUFBLENBQW5ELEVBN0IwRDtJQUFBLENBQTVELEVBRHNCO0VBQUEsQ0FBeEIsQ0FOQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/spec/git-utils-spec.coffee
