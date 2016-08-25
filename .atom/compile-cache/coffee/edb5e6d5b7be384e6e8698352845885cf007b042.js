(function() {
  var $, $$, DefinitionsView, SelectListView, path, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$, SelectListView = _ref.SelectListView;

  path = require('path');

  module.exports = DefinitionsView = (function(_super) {
    __extends(DefinitionsView, _super);

    function DefinitionsView() {
      return DefinitionsView.__super__.constructor.apply(this, arguments);
    }

    DefinitionsView.prototype.initialize = function(matches) {
      DefinitionsView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for definitions');
      return this.focusFilterEditor();
    };

    DefinitionsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    DefinitionsView.prototype.viewForItem = function(_arg) {
      var column, fileName, line, relativePath, text, _, _ref1;
      text = _arg.text, fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      _ref1 = atom.project.relativizePath(fileName), _ = _ref1[0], relativePath = _ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + text, {
              "class": 'primary-line'
            });
            return _this.div("" + relativePath + ", line " + (line + 1), {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    DefinitionsView.prototype.addItems = function(items) {
      var item, itemView, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        this.items.push(item);
        itemView = $(this.viewForItem(item));
        itemView.data('select-list-item', item);
        _results.push(this.list.append(itemView));
      }
      return _results;
    };

    DefinitionsView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    DefinitionsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No definition found';
      } else {
        return DefinitionsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    DefinitionsView.prototype.confirmed = function(_arg) {
      var column, fileName, line, promise, _ref1;
      fileName = _arg.fileName, line = _arg.line, column = _arg.column;
      if (!((_ref1 = this.panel) != null ? _ref1.visible : void 0)) {
        return;
      }
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line, column]);
        return editor.scrollToCursorPosition();
      });
    };

    DefinitionsView.prototype.cancelled = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.hide() : void 0;
    };

    return DefinitionsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9nb3RvLWRlZmluaXRpb24vbGliL2RlZmluaXRpb25zLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBRUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsc0JBQVIsQ0FBMUIsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBQUosRUFBUSxzQkFBQSxjQUFSLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHNDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSw4QkFBQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLGlEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELENBQVUsY0FBVixDQUZBLENBQUE7O1FBR0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QjtPQUhWO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUpBLENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxVQUFELENBQVkseUJBQVosQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFQVTtJQUFBLENBQVosQ0FBQTs7QUFBQSw4QkFTQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBRk87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

//# sourceURL=/home/anirudh/.atom/packages/goto-definition/lib/definitions-view.coffee
