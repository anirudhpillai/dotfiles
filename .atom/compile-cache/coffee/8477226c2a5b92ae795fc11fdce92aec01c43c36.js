(function() {
  var CompositeDisposable, Emacs, GlobalEmacsState;

  CompositeDisposable = require('atom').CompositeDisposable;

  Emacs = require('./emacs');

  GlobalEmacsState = require('./global-emacs-state');

  module.exports = {
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.emacsObjects = new WeakMap;
      this.globalEmacsState = new GlobalEmacsState;
      return this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          if (editor.mini) {
            return;
          }
          if (!_this.emacsObjects.get(editor)) {
            return _this.emacsObjects.set(editor, new Emacs(editor, _this.globalEmacsState));
          }
        };
      })(this)));
    },
    deactivate: function() {
      var editor, _i, _len, _ref, _ref1, _ref2, _ref3;
      if ((_ref = this.subscriptions) != null) {
        _ref.dispose();
      }
      this.subscriptions = null;
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        editor = _ref1[_i];
        if ((_ref2 = this.emacsObjects.get(editor)) != null) {
          _ref2.destroy();
        }
      }
      this.emacsObjects = null;
      if ((_ref3 = this.globalEmacsState) != null) {
        _ref3.destroy();
      }
      return this.globalEmacsState = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBRFIsQ0FBQTs7QUFBQSxFQUVBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQUZuQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixHQUFBLENBQUEsT0FEaEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEdBQUEsQ0FBQSxnQkFGcEIsQ0FBQTthQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNuRCxVQUFBLElBQVUsTUFBTSxDQUFDLElBQWpCO0FBQUEsa0JBQUEsQ0FBQTtXQUFBO0FBQ0EsVUFBQSxJQUFBLENBQUEsS0FBUSxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE1BQWxCLENBQVA7bUJBQ0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE1BQWxCLEVBQThCLElBQUEsS0FBQSxDQUFNLE1BQU4sRUFBYyxLQUFDLENBQUEsZ0JBQWYsQ0FBOUIsRUFERjtXQUZtRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQW5CLEVBSlE7SUFBQSxDQUFWO0FBQUEsSUFTQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSwyQ0FBQTs7WUFBYyxDQUFFLE9BQWhCLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFEakIsQ0FBQTtBQUdBO0FBQUEsV0FBQSw0Q0FBQTsyQkFBQTs7ZUFDMkIsQ0FBRSxPQUEzQixDQUFBO1NBREY7QUFBQSxPQUhBO0FBQUEsTUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUxoQixDQUFBOzthQU9pQixDQUFFLE9BQW5CLENBQUE7T0FQQTthQVFBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixLQVRWO0lBQUEsQ0FUWjtHQU5GLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/main.coffee
