(function() {
  var LoadingView;

  module.exports = LoadingView = (function() {
    function LoadingView() {
      var icon, message, messageOuter;
      this.element = document.createElement('div');
      this.element.classList.add('split-diff-modal');
      icon = document.createElement('div');
      icon.classList.add('split-diff-icon');
      this.element.appendChild(icon);
      message = document.createElement('div');
      message.textContent = "Computing the diff for you.";
      message.classList.add('split-diff-message');
      messageOuter = document.createElement('div');
      messageOuter.appendChild(message);
      this.element.appendChild(messageOuter);
    }

    LoadingView.prototype.destroy = function() {
      this.element.remove();
      return this.modalPanel.destroy();
    };

    LoadingView.prototype.getElement = function() {
      return this.element;
    };

    LoadingView.prototype.createModal = function() {
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.element,
        visible: false
      });
      return this.modalPanel.item.parentNode.classList.add('split-diff-hide-mask');
    };

    LoadingView.prototype.show = function() {
      return this.modalPanel.show();
    };

    LoadingView.prototype.hide = function() {
      return this.modalPanel.hide();
    };

    return LoadingView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9sb2FkaW5nLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFdBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxxQkFBQSxHQUFBO0FBRVgsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLGtCQUF2QixDQURBLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUpQLENBQUE7QUFBQSxNQUtBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBZixDQUFtQixpQkFBbkIsQ0FMQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBckIsQ0FOQSxDQUFBO0FBQUEsTUFTQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FUVixDQUFBO0FBQUEsTUFVQSxPQUFPLENBQUMsV0FBUixHQUFzQiw2QkFWdEIsQ0FBQTtBQUFBLE1BV0EsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFsQixDQUFzQixvQkFBdEIsQ0FYQSxDQUFBO0FBQUEsTUFZQSxZQUFBLEdBQWUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FaZixDQUFBO0FBQUEsTUFhQSxZQUFZLENBQUMsV0FBYixDQUF5QixPQUF6QixDQWJBLENBQUE7QUFBQSxNQWNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixZQUFyQixDQWRBLENBRlc7SUFBQSxDQUFiOztBQUFBLDBCQW1CQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxFQUZPO0lBQUEsQ0FuQlQsQ0FBQTs7QUFBQSwwQkF1QkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUMsQ0FBQSxRQURTO0lBQUEsQ0F2QlosQ0FBQTs7QUFBQSwwQkEwQkEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBUDtBQUFBLFFBQWdCLE9BQUEsRUFBUyxLQUF6QjtPQUE3QixDQUFkLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQXRDLENBQTBDLHNCQUExQyxFQUZXO0lBQUEsQ0ExQmIsQ0FBQTs7QUFBQSwwQkE4QkEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBREk7SUFBQSxDQTlCTixDQUFBOztBQUFBLDBCQWlDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUEsRUFESTtJQUFBLENBakNOLENBQUE7O3VCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/node_modules/split-diff/lib/loading-view.coffee
