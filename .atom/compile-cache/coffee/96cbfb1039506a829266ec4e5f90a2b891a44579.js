(function() {
  var $, GitTimeMachineView, Path, View, _ref;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View;

  Path = require('path');

  GitTimeMachineView = require('../lib/git-time-machine-view');

  describe("GitTimeMachineView", function() {
    return describe("when open", function() {
      var activationPromise, timeMachineElement, workspaceElement, _ref1;
      _ref1 = [], workspaceElement = _ref1[0], activationPromise = _ref1[1], timeMachineElement = _ref1[2];
      beforeEach(function() {
        activationPromise = atom.packages.activatePackage('git-time-machine');
        workspaceElement = atom.views.getView(atom.workspace);
        atom.commands.dispatch(workspaceElement, 'git-time-machine:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          return timeMachineElement = workspaceElement.querySelector('.git-time-machine');
        });
      });
      it("should not show timeplot if no file loaded", function() {
        return expect(timeMachineElement.innerHTML).toEqual("");
      });
      return describe("after opening a known file", function() {
        beforeEach(function() {
          var openPromise;
          openPromise = atom.workspace.open("" + __dirname + "/test-data/fiveCommits.txt");
          waitsForPromise(function() {
            return openPromise;
          });
          return runs(function() {
            timeMachineElement = workspaceElement.querySelector('.git-time-machine');
          });
        });
        it("should not be showing placeholder", function() {
          return expect(timeMachineElement.querySelector('.placeholder')).not.toExist();
        });
        it("should be showing timeline", function() {
          return expect(timeMachineElement.querySelector('.timeplot')).toExist();
        });
        return it("total-commits should be five", function() {
          var totalCommits;
          totalCommits = $(timeMachineElement).find('.total-commits').text();
          return expect(totalCommits).toEqual("5");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL3NwZWMvZ2l0LXRpbWUtbWFjaGluZS12aWV3LXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLHVDQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw4QkFBUixDQUhyQixDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtXQUU3QixRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSw4REFBQTtBQUFBLE1BQUEsUUFBNEQsRUFBNUQsRUFBQywyQkFBRCxFQUFtQiw0QkFBbkIsRUFBc0MsNkJBQXRDLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixrQkFBOUIsQ0FBcEIsQ0FBQTtBQUFBLFFBQ0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQURuQixDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHlCQUF6QyxDQUZBLENBQUE7QUFBQSxRQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FIQSxDQUFBO2VBS0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtpQkFDSCxrQkFBQSxHQUFxQixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixtQkFBL0IsRUFEbEI7UUFBQSxDQUFMLEVBTlM7TUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLE1BaUJBLEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBLEdBQUE7ZUFDL0MsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFNBQTFCLENBQW9DLENBQUMsT0FBckMsQ0FBNkMsRUFBN0MsRUFEK0M7TUFBQSxDQUFqRCxDQWpCQSxDQUFBO2FBb0JBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBR1QsY0FBQSxXQUFBO0FBQUEsVUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLEVBQUEsR0FBRyxTQUFILEdBQWEsNEJBQWpDLENBQWQsQ0FBQTtBQUFBLFVBQ0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxtQkFBTyxXQUFQLENBRGM7VUFBQSxDQUFoQixDQURBLENBQUE7aUJBR0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFlBQUEsa0JBQUEsR0FBcUIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsbUJBQS9CLENBQXJCLENBREc7VUFBQSxDQUFMLEVBTlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBVUEsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtpQkFDdEMsTUFBQSxDQUFPLGtCQUFrQixDQUFDLGFBQW5CLENBQWlDLGNBQWpDLENBQVAsQ0FBd0QsQ0FBQyxHQUFHLENBQUMsT0FBN0QsQ0FBQSxFQURzQztRQUFBLENBQXhDLENBVkEsQ0FBQTtBQUFBLFFBYUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTtpQkFDL0IsTUFBQSxDQUFPLGtCQUFrQixDQUFDLGFBQW5CLENBQWlDLFdBQWpDLENBQVAsQ0FBcUQsQ0FBQyxPQUF0RCxDQUFBLEVBRCtCO1FBQUEsQ0FBakMsQ0FiQSxDQUFBO2VBZ0JBLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBLEdBQUE7QUFDakMsY0FBQSxZQUFBO0FBQUEsVUFBQSxZQUFBLEdBQWUsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsZ0JBQTNCLENBQTRDLENBQUMsSUFBN0MsQ0FBQSxDQUFmLENBQUE7aUJBQ0EsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxPQUFyQixDQUE2QixHQUE3QixFQUZpQztRQUFBLENBQW5DLEVBakJxQztNQUFBLENBQXZDLEVBckJvQjtJQUFBLENBQXRCLEVBRjZCO0VBQUEsQ0FBL0IsQ0FOQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/spec/git-time-machine-view-spec.coffee
