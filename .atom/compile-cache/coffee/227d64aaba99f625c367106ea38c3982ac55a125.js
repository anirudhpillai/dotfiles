(function() {
  var CompositeDisposable, GlobalEmacsState, Mark,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  Mark = require('./mark');

  module.exports = GlobalEmacsState = (function() {
    var ignoreCommands;

    ignoreCommands = new Set(['editor:display-updated', 'cursor:moved', 'selection:changed']);

    GlobalEmacsState.prototype.subscriptions = null;

    GlobalEmacsState.prototype.lastCommand = null;

    GlobalEmacsState.prototype.thisCommand = null;

    GlobalEmacsState.prototype.activateMarkCommands = new Set;

    function GlobalEmacsState() {
      this.logCommand = __bind(this.logCommand, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.onWillDispatch(this.logCommand));
      this.subscriptions.add(atom.config.observe('emacs-plus.activateMarkCommands', (function(_this) {
        return function(value) {
          return _this.activateMarkCommands = new Set(value);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onWillDispatch((function(_this) {
        return function(_arg) {
          var command;
          command = _arg.type;
          if (_this.activateMarkCommands.has(command)) {
            return Mark["for"](atom.workspace.getActiveTextEditor()).activate();
          }
        };
      })(this)));
    }

    GlobalEmacsState.prototype.destroy = function() {
      var _ref;
      if ((_ref = this.subscriptions) != null) {
        _ref.dispose();
      }
      return this.subscriptions = null;
    };

    GlobalEmacsState.prototype.logCommand = function(_arg) {
      var command;
      command = _arg.type;
      if (command.indexOf(':') === -1) {
        return;
      }
      if (ignoreCommands.has(command)) {
        return;
      }
      this.lastCommand = this.thisCommand;
      return this.thisCommand = command;
    };

    return GlobalEmacsState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9nbG9iYWwtZW1hY3Mtc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosUUFBQSxjQUFBOztBQUFBLElBQUEsY0FBQSxHQUFxQixJQUFBLEdBQUEsQ0FBSSxDQUN2Qix3QkFEdUIsRUFDRyxjQURILEVBQ21CLG1CQURuQixDQUFKLENBQXJCLENBQUE7O0FBQUEsK0JBSUEsYUFBQSxHQUFlLElBSmYsQ0FBQTs7QUFBQSwrQkFLQSxXQUFBLEdBQWEsSUFMYixDQUFBOztBQUFBLCtCQU1BLFdBQUEsR0FBYSxJQU5iLENBQUE7O0FBQUEsK0JBT0Esb0JBQUEsR0FBc0IsR0FBQSxDQUFBLEdBUHRCLENBQUE7O0FBU2EsSUFBQSwwQkFBQSxHQUFBO0FBQ1gscURBQUEsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFkLENBQTZCLElBQUMsQ0FBQSxVQUE5QixDQUFuQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsaUNBQXBCLEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFDeEUsS0FBQyxDQUFBLG9CQUFELEdBQTRCLElBQUEsR0FBQSxDQUFJLEtBQUosRUFENEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RCxDQUFuQixDQUZBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzlDLGNBQUEsT0FBQTtBQUFBLFVBRHNELFVBQVAsS0FBQyxJQUNoRCxDQUFBO0FBQUEsVUFBQSxJQUFHLEtBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxHQUF0QixDQUEwQixPQUExQixDQUFIO21CQUNFLElBQUksQ0FBQyxLQUFELENBQUosQ0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUE4QyxDQUFDLFFBQS9DLENBQUEsRUFERjtXQUQ4QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CLENBTEEsQ0FEVztJQUFBLENBVGI7O0FBQUEsK0JBb0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLElBQUE7O1lBQWMsQ0FBRSxPQUFoQixDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUZWO0lBQUEsQ0FwQlQsQ0FBQTs7QUFBQSwrQkF3QkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsVUFBQSxPQUFBO0FBQUEsTUFEa0IsVUFBUCxLQUFDLElBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBVSxPQUFPLENBQUMsT0FBUixDQUFnQixHQUFoQixDQUFBLEtBQXdCLENBQUEsQ0FBbEM7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBVSxjQUFjLENBQUMsR0FBZixDQUFtQixPQUFuQixDQUFWO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLFdBRmhCLENBQUE7YUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlLFFBSkw7SUFBQSxDQXhCWixDQUFBOzs0QkFBQTs7TUFORixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/global-emacs-state.coffee
