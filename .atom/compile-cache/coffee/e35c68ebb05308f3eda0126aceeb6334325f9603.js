(function() {
  var $, GitTimeplotPopup, RevisionView, View, moment, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  moment = require('moment');

  _ref = require("atom-space-pen-views"), $ = _ref.$, View = _ref.View;

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplotPopup = (function(_super) {
    __extends(GitTimeplotPopup, _super);

    function GitTimeplotPopup() {
      this._onShowRevision = __bind(this._onShowRevision, this);
      this._onMouseLeave = __bind(this._onMouseLeave, this);
      this._onMouseEnter = __bind(this._onMouseEnter, this);
      this.isMouseInPopup = __bind(this.isMouseInPopup, this);
      this.remove = __bind(this.remove, this);
      this.hide = __bind(this.hide, this);
      return GitTimeplotPopup.__super__.constructor.apply(this, arguments);
    }

    GitTimeplotPopup.content = function(commitData, editor, start, end) {
      var dateFormat;
      dateFormat = "MMM DD YYYY ha";
      return this.div({
        "class": "select-list popover-list git-timemachine-popup"
      }, (function(_this) {
        return function() {
          _this.h5("There were " + commitData.length + " commits between");
          _this.h6("" + (start.format(dateFormat)) + " and " + (end.format(dateFormat)));
          return _this.ul(function() {
            var authorDate, commit, linesAdded, linesDeleted, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = commitData.length; _i < _len; _i++) {
              commit = commitData[_i];
              authorDate = moment.unix(commit.authorDate);
              linesAdded = commit.linesAdded || 0;
              linesDeleted = commit.linesDeleted || 0;
              _results.push(_this.li({
                "data-rev": commit.hash,
                click: '_onShowRevision'
              }, function() {
                return _this.div({
                  "class": "commit"
                }, function() {
                  _this.div({
                    "class": "header"
                  }, function() {
                    _this.div("" + (authorDate.format(dateFormat)));
                    _this.div("" + commit.hash);
                    return _this.div(function() {
                      _this.span({
                        "class": 'added-count'
                      }, "+" + linesAdded + " ");
                      return _this.span({
                        "class": 'removed-count'
                      }, "-" + linesDeleted + " ");
                    });
                  });
                  _this.div(function() {
                    return _this.strong("" + commit.message);
                  });
                  return _this.div("Authored by " + commit.authorName + " " + (authorDate.fromNow()));
                });
              }));
            }
            return _results;
          });
        };
      })(this));
    };

    GitTimeplotPopup.prototype.initialize = function(commitData, editor) {
      this.editor = editor;
      this.file = this.editor.getPath();
      this.appendTo(atom.views.getView(atom.workspace));
      this.mouseenter(this._onMouseEnter);
      return this.mouseleave(this._onMouseLeave);
    };

    GitTimeplotPopup.prototype.hide = function() {
      this._mouseInPopup = false;
      return GitTimeplotPopup.__super__.hide.apply(this, arguments);
    };

    GitTimeplotPopup.prototype.remove = function() {
      if (!this._mouseInPopup) {
        return GitTimeplotPopup.__super__.remove.apply(this, arguments);
      }
    };

    GitTimeplotPopup.prototype.isMouseInPopup = function() {
      return this._mouseInPopup === true;
    };

    GitTimeplotPopup.prototype._onMouseEnter = function(evt) {
      this._mouseInPopup = true;
    };

    GitTimeplotPopup.prototype._onMouseLeave = function(evt) {
      this.hide();
    };

    GitTimeplotPopup.prototype._onShowRevision = function(evt) {
      var revHash;
      revHash = $(evt.target).closest('li').data('rev');
      return RevisionView.showRevision(this.editor, revHash);
    };

    return GitTimeplotPopup;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL2xpYi9naXQtdGltZXBsb3QtcG9wdXAuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLE9BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBREosQ0FBQTs7QUFBQSxFQUdBLFlBQUEsR0FBZSxPQUFBLENBQVEscUJBQVIsQ0FIZixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFFckIsdUNBQUEsQ0FBQTs7Ozs7Ozs7OztLQUFBOztBQUFBLElBQUEsZ0JBQUMsQ0FBQSxPQUFELEdBQVcsU0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixLQUFyQixFQUE0QixHQUE1QixHQUFBO0FBQ1QsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsZ0JBQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxnREFBUDtPQUFMLEVBQThELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDNUQsVUFBQSxLQUFDLENBQUEsRUFBRCxDQUFLLGFBQUEsR0FBYSxVQUFVLENBQUMsTUFBeEIsR0FBK0Isa0JBQXBDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSSxFQUFBLEdBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLFVBQWIsQ0FBRCxDQUFGLEdBQTRCLE9BQTVCLEdBQWtDLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxVQUFYLENBQUQsQ0FBdEMsQ0FEQSxDQUFBO2lC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

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/lib/git-timeplot-popup.coffee
