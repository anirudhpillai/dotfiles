(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, NOT_GIT_ERRORS, View, moment, path, str, _, _ref;

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View;

  path = require('path');

  _ = require('underscore-plus');

  str = require('bumble-strings');

  moment = require('moment');

  GitLog = require('git-log-utils');

  GitTimeplot = require('./git-timeplot');

  GitRevisionView = require('./git-revision-view');

  NOT_GIT_ERRORS = ['File not a git repository', 'is outside repository', "Not a git repository"];

  module.exports = GitTimeMachineView = (function() {
    function GitTimeMachineView(serializedState, options) {
      if (options == null) {
        options = {};
      }
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
    }

    GitTimeMachineView.prototype.setEditor = function(editor) {
      var file, _ref1;
      if (editor === this.editor) {
        return;
      }
      file = editor != null ? editor.getPath() : void 0;
      if (!((file != null) && !str.startsWith(path.basename(file), GitRevisionView.FILE_PREFIX))) {
        return;
      }
      _ref1 = [editor, file], this.editor = _ref1[0], this.file = _ref1[1];
      return this.render();
    };

    GitTimeMachineView.prototype.render = function() {
      var commits;
      commits = this.gitCommitHistory();
      if (!((this.file != null) && (commits != null))) {
        this._renderPlaceholder();
      } else {
        this.$element.text("");
        this._renderCloseHandle();
        this._renderStats(commits);
        this._renderTimeline(commits);
      }
      return this.$element;
    };

    GitTimeMachineView.prototype.serialize = function() {
      return null;
    };

    GitTimeMachineView.prototype.destroy = function() {
      return this.$element.remove();
    };

    GitTimeMachineView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.timeplot) != null ? _ref1.hide() : void 0;
    };

    GitTimeMachineView.prototype.show = function() {
      var _ref1;
      return (_ref1 = this.timeplot) != null ? _ref1.show() : void 0;
    };

    GitTimeMachineView.prototype.getElement = function() {
      return this.$element.get(0);
    };

    GitTimeMachineView.prototype.gitCommitHistory = function(file) {
      var commits, e;
      if (file == null) {
        file = this.file;
      }
      if (file == null) {
        return null;
      }
      try {
        commits = GitLog.getCommitHistory(file);
      } catch (_error) {
        e = _error;
        if (e.message != null) {
          if (str.weaklyHas(e.message, NOT_GIT_ERRORS)) {
            console.warn("" + file + " not in a git repository");
            return null;
          }
        }
        atom.notifications.addError(String(e));
        console.error(e);
        return null;
      }
      return commits;
    };

    GitTimeMachineView.prototype._renderPlaceholder = function() {
      this.$element.html("<div class='placeholder'>Select a file in the git repo to see timeline</div>");
    };

    GitTimeMachineView.prototype._renderCloseHandle = function() {
      var $closeHandle;
      $closeHandle = $("<div class='close-handle'>X</div>");
      this.$element.append($closeHandle);
      return $closeHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "git-time-machine:toggle");
      });
    };

    GitTimeMachineView.prototype._renderTimeline = function(commits) {
      this.timeplot || (this.timeplot = new GitTimeplot(this.$element));
      this.timeplot.render(this.editor, commits);
    };

    GitTimeMachineView.prototype._renderStats = function(commits) {
      var authorCount, byAuthor, content, durationInMs, timeSpan;
      content = "";
      if (commits.length > 0) {
        byAuthor = _.indexBy(commits, 'authorName');
        authorCount = _.keys(byAuthor).length;
        durationInMs = moment.unix(commits[commits.length - 1].authorDate).diff(moment.unix(commits[0].authorDate));
        timeSpan = moment.duration(durationInMs).humanize();
        content = "<span class='total-commits'>" + commits.length + "</span> commits by " + authorCount + " authors spanning " + timeSpan;
      }
      this.$element.append("<div class='stats'>\n  " + content + "\n</div>");
    };

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZS1tYWNoaW5lLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZHQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FGSixDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxnQkFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FKVCxDQUFBOztBQUFBLEVBTUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBTlQsQ0FBQTs7QUFBQSxFQU9BLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FQZCxDQUFBOztBQUFBLEVBUUEsZUFBQSxHQUFrQixPQUFBLENBQVEscUJBQVIsQ0FSbEIsQ0FBQTs7QUFBQSxFQVVBLGNBQUEsR0FBaUIsQ0FBQywyQkFBRCxFQUE4Qix1QkFBOUIsRUFBdUQsc0JBQXZELENBVmpCLENBQUE7O0FBQUEsRUFZQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSw0QkFBQyxlQUFELEVBQWtCLE9BQWxCLEdBQUE7O1FBQWtCLFVBQVE7T0FDckM7QUFBQSxNQUFBLElBQUEsQ0FBQSxJQUF3RCxDQUFBLFFBQXhEO0FBQUEsUUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLENBQUEsQ0FBRSxnQ0FBRixDQUFaLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBRyxzQkFBSDtBQUNFLFFBQUEsSUFBQyxD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

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/lib/git-time-machine-view.coffee
