(function() {
  var CompositeDisposable, GlobalEmacsState,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = GlobalEmacsState = (function() {
    var ignoreCommands;

    ignoreCommands = new Set(['editor:display-updated', 'cursor:moved', 'selection:changed']);

    GlobalEmacsState.prototype.subscriptions = null;

    GlobalEmacsState.prototype.lastCommand = null;

    GlobalEmacsState.prototype.thisCommand = null;

    function GlobalEmacsState() {
      this.logCommand = __bind(this.logCommand, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.onWillDispatch(this.logCommand));
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9nbG9iYWwtZW1hY3Mtc3RhdGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixRQUFBLGNBQUE7O0FBQUEsSUFBQSxjQUFBLEdBQXFCLElBQUEsR0FBQSxDQUFJLENBQ3ZCLHdCQUR1QixFQUNHLGNBREgsRUFDbUIsbUJBRG5CLENBQUosQ0FBckIsQ0FBQTs7QUFBQSwrQkFJQSxhQUFBLEdBQWUsSUFKZixDQUFBOztBQUFBLCtCQUtBLFdBQUEsR0FBYSxJQUxiLENBQUE7O0FBQUEsK0JBTUEsV0FBQSxHQUFhLElBTmIsQ0FBQTs7QUFRYSxJQUFBLDBCQUFBLEdBQUE7QUFDWCxxREFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWQsQ0FBNkIsSUFBQyxDQUFBLFVBQTlCLENBQW5CLENBREEsQ0FEVztJQUFBLENBUmI7O0FBQUEsK0JBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLFVBQUEsSUFBQTs7WUFBYyxDQUFFLE9BQWhCLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBRlY7SUFBQSxDQVpULENBQUE7O0FBQUEsK0JBZ0JBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLFVBQUEsT0FBQTtBQUFBLE1BRGtCLFVBQVAsS0FBQyxJQUNaLENBQUE7QUFBQSxNQUFBLElBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsR0FBaEIsQ0FBQSxLQUF3QixDQUFBLENBQWxDO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFDQSxNQUFBLElBQVUsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsT0FBbkIsQ0FBVjtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxXQUZoQixDQUFBO2FBR0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxRQUpMO0lBQUEsQ0FoQlosQ0FBQTs7NEJBQUE7O01BTEYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/global-emacs-state.coffee
