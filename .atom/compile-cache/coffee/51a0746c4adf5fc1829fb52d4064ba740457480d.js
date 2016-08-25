(function() {
  var DefinitionsView, config;

  DefinitionsView = require('./definitions-view.coffee');

  config = require('./config.coffee');

  module.exports = {
    config: {
      rightMenuDisplayAtFirst: {
        type: 'boolean',
        "default": true
      }
    },
    firstMenu: {
      'atom-workspace atom-text-editor:not(.mini)': [
        {
          label: 'Goto Definition',
          command: 'goto-definition:go'
        }, {
          type: 'separator'
        }
      ]
    },
    normalMenu: {
      'atom-workspace atom-text-editor:not(.mini)': [
        {
          label: 'Goto Definition',
          command: 'goto-definition:go'
        }
      ]
    },
    activate: function() {
      atom.commands.add('atom-workspace atom-text-editor:not(.mini)', 'goto-definition:go', (function(_this) {
        return function() {
          return _this.go();
        };
      })(this));
      if (atom.config.get('goto-definition.rightMenuDisplayAtFirst')) {
        atom.contextMenu.add(this.firstMenu);
        return atom.contextMenu.itemSets.unshift(atom.contextMenu.itemSets.pop());
      } else {
        return atom.contextMenu.add(this.normalMenu);
      }
    },
    deactivate: function() {},
    getScanOptions: function() {
      var editor, file_extension, grammar_name, grammar_option, regex, scan_paths, scan_regex, word;
      editor = atom.workspace.getActiveTextEditor();
      word = (editor.getSelectedText() || editor.getWordUnderCursor()).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      file_extension = "*." + editor.getPath().split('.').pop();
      scan_regex = [];
      scan_paths = [];
      for (grammar_name in config) {
        grammar_option = config[grammar_name];
        if (grammar_option.type.indexOf(file_extension) !== -1) {
          scan_regex.push.apply(scan_regex, grammar_option.regex);
          scan_paths.push.apply(scan_paths, grammar_option.type);
        }
      }
      if (scan_regex.length === 0) {
        return {};
      }
      scan_regex = scan_regex.filter(function(e, i, arr) {
        return arr.lastIndexOf(e) === i;
      });
      scan_paths = scan_paths.filter(function(e, i, arr) {
        return arr.lastIndexOf(e) === i;
      });
      regex = scan_regex.join('|').replace(/{word}/g, word);
      return {
        regex: new RegExp(regex, 'i'),
        paths: scan_paths
      };
    },
    go: function() {
      var paths, regex, _ref;
      _ref = this.getScanOptions(), regex = _ref.regex, paths = _ref.paths;
      if (!regex) {
        return atom.notifications.addWarning('This language is not supported . Pull Request Welcome 👏.');
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new DefinitionsView();
      return atom.workspace.scan(regex, {
        paths: paths
      }, (function(_this) {
        return function(result, error) {
          var items, _ref1;
          items = result.matches.map(function(match) {
            var all_lines, line_number, lines, start_position;
            if (Array.isArray(match.range)) {
              return {
                text: match.lineText,
                fileName: result.filePath,
                line: match.range[0][0],
                column: match.range[0][1]
              };
            } else {
              if (/\s/.test(match.match.input.charAt(match.match.index))) {
                start_position = match.match.index + 1;
              } else {
                start_position = match.match.index;
              }
              all_lines = match.match.input.split(/\r\n|\r|\n/);
              lines = match.match.input.substring(0, start_position).split(/\r\n|\r|\n/);
              line_number = lines.length - 1;
              return {
                text: all_lines[line_number],
                fileName: result.filePath,
                line: line_number,
                column: lines.pop().length
              };
            }
          });
          if (((_ref1 = _this.definitionsView.items) != null ? _ref1 : []).length === 0) {
            return _this.definitionsView.setItems(items);
          } else {
            return _this.definitionsView.addItems(items);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          var items, _ref1;
          items = (_ref1 = _this.definitionsView.items) != null ? _ref1 : [];
          switch (items.length) {
            case 0:
              return _this.definitionsView.setItems(items);
            case 1:
              return _this.definitionsView.confirmed(items[0]);
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9nb3RvLWRlZmluaXRpb24vbGliL2dvdG8tZGVmaW5pdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSwyQkFBUixDQUFsQixDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQURULENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLHVCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsSUFEVDtPQURGO0tBREY7QUFBQSxJQUtBLFNBQUEsRUFDRTtBQUFBLE1BQUEsNENBQUEsRUFBOEM7UUFDNUM7QUFBQSxVQUNFLEtBQUEsRUFBTyxpQkFEVDtBQUFBLFVBRUUsT0FBQSxFQUFTLG9CQUZYO1NBRDRDLEVBSzVDO0FBQUEsVUFDRSxJQUFBLEVBQU0sV0FEUjtTQUw0QztPQUE5QztLQU5GO0FBQUEsSUFnQkEsVUFBQSxFQUNFO0FBQUEsTUFBQSw0Q0FBQSxFQUE4QztRQUM1QztBQUFBLFVBQ0UsS0FBQSxFQUFPLGlCQURUO0FBQUEsVUFFRSxPQUFBLEVBQVMsb0JBRlg7U0FENEM7T0FBOUM7S0FqQkY7QUFBQSxJQXdCQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsNENBQWxCLEVBQWdFLG9CQUFoRSxFQUFzRixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwRixLQUFDLENBQUEsRUFBRCxDQUFBLEVBRG9GO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElB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

//# sourceURL=/home/anirudh/.atom/packages/goto-definition/lib/goto-definition.coffee
