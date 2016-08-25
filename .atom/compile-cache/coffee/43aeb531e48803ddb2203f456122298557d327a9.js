(function() {
  var GitTimeMachine;

  GitTimeMachine = require('../lib/git-time-machine');

  describe("GitTimeMachine", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('git-time-machine');
    });
    return describe("when the git-time-machine:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.git-time-machine')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'git-time-machine:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var gitTimeMachineElement, gitTimeMachinePanel;
          expect(workspaceElement.querySelector('.git-time-machine')).toExist();
          gitTimeMachineElement = workspaceElement.querySelector('.git-time-machine');
          expect(gitTimeMachineElement).toExist();
          gitTimeMachinePanel = atom.workspace.panelForItem(gitTimeMachineElement);
          expect(gitTimeMachinePanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'git-time-machine:toggle');
          return expect(gitTimeMachinePanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.git-time-machine')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'git-time-machine:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var gitTimeMachineElement;
          gitTimeMachineElement = workspaceElement.querySelector('.git-time-machine');
          expect(gitTimeMachineElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'git-time-machine:toggle');
          return expect(gitTimeMachineElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL3NwZWMvZ2l0LXRpbWUtbWFjaGluZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxjQUFBOztBQUFBLEVBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEseUJBQVIsQ0FBakIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSx5Q0FBQTtBQUFBLElBQUEsT0FBd0MsRUFBeEMsRUFBQywwQkFBRCxFQUFtQiwyQkFBbkIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO2FBQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGtCQUE5QixFQUZYO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FNQSxRQUFBLENBQVMscURBQVQsRUFBZ0UsU0FBQSxHQUFBO0FBQzlELE1BQUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUdwQyxRQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixtQkFBL0IsQ0FBUCxDQUEyRCxDQUFDLEdBQUcsQ0FBQyxPQUFoRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx5QkFBekMsQ0FKQSxDQUFBO0FBQUEsUUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBTkEsQ0FBQTtlQVNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLDBDQUFBO0FBQUEsVUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsbUJBQS9CLENBQVAsQ0FBMkQsQ0FBQyxPQUE1RCxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBRUEscUJBQUEsR0FBd0IsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsbUJBQS9CLENBRnhCLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxxQkFBUCxDQUE2QixDQUFDLE9BQTlCLENBQUEsQ0FIQSxDQUFBO0FBQUEsVUFLQSxtQkFBQSxHQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIscUJBQTVCLENBTHRCLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxTQUFwQixDQUFBLENBQVAsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxJQUE3QyxDQU5BLENBQUE7QUFBQSxVQU9BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMseUJBQXpDLENBUEEsQ0FBQTtpQkFRQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsU0FBcEIsQ0FBQSxDQUFQLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsS0FBN0MsRUFURztRQUFBLENBQUwsRUFab0M7TUFBQSxDQUF0QyxDQUFBLENBQUE7YUF1QkEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtBQU83QixRQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixtQkFBL0IsQ0FBUCxDQUEyRCxDQUFDLEdBQUcsQ0FBQyxPQUFoRSxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBTUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx5QkFBekMsQ0FOQSxDQUFBO0FBQUEsUUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBUkEsQ0FBQTtlQVdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxjQUFBLHFCQUFBO0FBQUEsVUFBQSxxQkFBQSxHQUF3QixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixtQkFBL0IsQ0FBeEIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLHFCQUFQLENBQTZCLENBQUMsV0FBOUIsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMseUJBQXpDLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8scUJBQVAsQ0FBNkIsQ0FBQyxHQUFHLENBQUMsV0FBbEMsQ0FBQSxFQUxHO1FBQUEsQ0FBTCxFQWxCNkI7TUFBQSxDQUEvQixFQXhCOEQ7SUFBQSxDQUFoRSxFQVB5QjtFQUFBLENBQTNCLENBUEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/spec/git-time-machine-spec.coffee
