(function() {
  var getEditorElement, keydown;

  getEditorElement = function(callback) {
    waitsForPromise(function() {
      return atom.packages.activatePackage('emacs-plus').then(function(pack) {
        return pack.activateResources();
      });
    });
    return waitsForPromise(function() {
      return atom.workspace.open().then(function(editor) {
        return callback(atom.views.getView(editor));
      });
    });
  };

  keydown = function(key, options) {
    var buildKeydownEvent;
    if (options == null) {
      options = {};
    }
    buildKeydownEvent = atom.keymaps.constructor.buildKeydownEvent;
    if (options.target == null) {
      options.target = atom.views.getView(atom.workspace.getActiveTextEditor());
    }
    return atom.keymaps.handleKeyboardEvent(buildKeydownEvent(key, options));
  };

  module.exports = {
    keydown: keydown,
    getEditorElement: getEditorElement
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9lbWFjcy1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBOztBQUFBLEVBQUEsZ0JBQUEsR0FBbUIsU0FBQyxRQUFELEdBQUE7QUFDakIsSUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTthQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QixDQUEyQyxDQUFDLElBQTVDLENBQWlELFNBQUMsSUFBRCxHQUFBO2VBQy9DLElBQUksQ0FBQyxpQkFBTCxDQUFBLEVBRCtDO01BQUEsQ0FBakQsRUFEYztJQUFBLENBQWhCLENBQUEsQ0FBQTtXQUlBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQUEsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLE1BQUQsR0FBQTtlQUN6QixRQUFBLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CLENBQVQsRUFEeUI7TUFBQSxDQUEzQixFQURjO0lBQUEsQ0FBaEIsRUFMaUI7RUFBQSxDQUFuQixDQUFBOztBQUFBLEVBU0EsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLE9BQU4sR0FBQTtBQUNSLFFBQUEsaUJBQUE7O01BRGMsVUFBVTtLQUN4QjtBQUFBLElBQUMsb0JBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBbEMsaUJBQUQsQ0FBQTtBQUNBLElBQUEsSUFBTyxzQkFBUDtBQUNFLE1BQUEsT0FBTyxDQUFDLE1BQVIsR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFuQixDQUFqQixDQURGO0tBREE7V0FHQSxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFiLENBQWlDLGlCQUFBLENBQWtCLEdBQWxCLEVBQXVCLE9BQXZCLENBQWpDLEVBSlE7RUFBQSxDQVRWLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsU0FBQSxPQUFEO0FBQUEsSUFBVSxrQkFBQSxnQkFBVjtHQWZqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/emacs-plus/spec/spec-helper.coffee
