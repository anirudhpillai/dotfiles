(function() {
  var CompositeDisposable, Emacs, GlobalEmacsState, packageDeps;

  CompositeDisposable = require('atom').CompositeDisposable;

  packageDeps = require('atom-package-deps');

  Emacs = require('./emacs');

  GlobalEmacsState = require('./global-emacs-state');

  module.exports = {
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      this.emacsObjects = new WeakMap;
      this.globalEmacsState = new GlobalEmacsState;
      this.subscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          if (editor.mini) {
            return;
          }
          if (!_this.emacsObjects.get(editor)) {
            return _this.emacsObjects.set(editor, new Emacs(editor, _this.globalEmacsState));
          }
        };
      })(this)));
      return packageDeps.install('emacs-plus');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5REFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxtQkFBUixDQURkLENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVIsQ0FGUixDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSLENBSG5CLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEdBQUEsQ0FBQSxPQURoQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsR0FBQSxDQUFBLGdCQUZwQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7QUFDbkQsVUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFqQjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUNBLFVBQUEsSUFBQSxDQUFBLEtBQVEsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixNQUFsQixDQUFQO21CQUNFLEtBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixNQUFsQixFQUE4QixJQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsS0FBQyxDQUFBLGdCQUFmLENBQTlCLEVBREY7V0FGbUQ7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQixDQUhBLENBQUE7YUFPQSxXQUFXLENBQUMsT0FBWixDQUFvQixZQUFwQixFQVJRO0lBQUEsQ0FBVjtBQUFBLElBVUEsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLFVBQUEsMkNBQUE7O1lBQWMsQ0FBRSxPQUFoQixDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRGpCLENBQUE7QUFHQTtBQUFBLFdBQUEsNENBQUE7MkJBQUE7O2VBQzJCLENBQUUsT0FBM0IsQ0FBQTtTQURGO0FBQUEsT0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFMaEIsQ0FBQTs7YUFPaUIsQ0FBRSxPQUFuQixDQUFBO09BUEE7YUFRQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsS0FUVjtJQUFBLENBVlo7R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/lib/main.coffee
