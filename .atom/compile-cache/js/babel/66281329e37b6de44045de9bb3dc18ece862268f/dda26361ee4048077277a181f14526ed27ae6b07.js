function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _helpers = require('./helpers');

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

'use babel';

module.exports = {
  config: {
    lintHtmlFiles: {
      title: 'Lint HTML Files',
      description: 'You should also add `eslint-plugin-html` to your .eslintrc plugins',
      type: 'boolean',
      'default': false
    },
    useGlobalEslint: {
      title: 'Use global ESLint installation',
      description: 'Make sure you have it in your $PATH',
      type: 'boolean',
      'default': false
    },
    showRuleIdInMessage: {
      title: 'Show Rule ID in Messages',
      type: 'boolean',
      'default': true
    },
    disableWhenNoEslintConfig: {
      title: 'Disable when no ESLint config is found (in package.json or .eslintrc)',
      type: 'boolean',
      'default': true
    },
    eslintrcPath: {
      title: '.eslintrc Path',
      description: "It will only be used when there's no config file in project",
      type: 'string',
      'default': ''
    },
    globalNodePath: {
      title: 'Global Node Installation Path',
      description: 'Write the value of `npm get prefix` here',
      type: 'string',
      'default': ''
    },
    eslintRulesDir: {
      title: 'ESLint Rules Dir',
      description: 'Specify a directory for ESLint to load rules from',
      type: 'string',
      'default': ''
    },
    disableEslintIgnore: {
      title: 'Disable using .eslintignore files',
      type: 'boolean',
      'default': false
    },
    disableFSCache: {
      title: 'Disable FileSystem Cache',
      description: 'Paths of node_modules, .eslintignore and others are cached',
      type: 'boolean',
      'default': false
    },
    fixOnSave: {
      title: 'Fix errors on save',
      description: 'Have eslint attempt to fix some errors automatically when saving the file.',
      type: 'boolean',
      'default': false
    }
  },
  activate: function activate() {
    var _this = this;

    require('atom-package-deps').install();

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;
    this.worker = null;
    this.scopes = ['source.js', 'source.jsx', 'source.js.jsx', 'source.babel', 'source.js-semantic'];

    var embeddedScope = 'source.js.embedded.html';
    this.subscriptions.add(atom.config.observe('linter-eslint.lintHtmlFiles', function (lintHtmlFiles) {
      if (lintHtmlFiles) {
        _this.scopes.push(embeddedScope);
      } else {
        if (_this.scopes.indexOf(embeddedScope) !== -1) {
          _this.scopes.splice(_this.scopes.indexOf(embeddedScope), 1);
        }
      }
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (_this.scopes.indexOf(editor.getGrammar().scopeName) !== -1 && atom.config.get('linter-eslint.fixOnSave')) {
          _this.worker.request('job', {
            type: 'fix',
            config: atom.config.get('linter-eslint'),
            filePath: editor.getPath()
          })['catch'](function (response) {
            return atom.notifications.addWarning(response);
          });
        }
      });
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'linter-eslint:fix-file': function linterEslintFixFile() {
        var textEditor = atom.workspace.getActiveTextEditor();
        var filePath = textEditor.getPath();

        if (!textEditor || textEditor.isModified()) {
          // Abort for invalid or unsaved text editors
          atom.notifications.addError('Linter-ESLint: Please save before fixing');
          return;
        }

        _this.worker.request('job', {
          type: 'fix',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return atom.notifications.addSuccess(response);
        })['catch'](function (response) {
          return atom.notifications.addWarning(response);
        });
      }
    }));

    var initializeWorker = function initializeWorker() {
      var _spawnWorker = (0, _helpers.spawnWorker)();

      var worker = _spawnWorker.worker;
      var subscription = _spawnWorker.subscription;

      _this.worker = worker;
      _this.subscriptions.add(subscription);
      worker.onDidExit(function () {
        if (_this.active) {
          (0, _helpers.showError)('Worker died unexpectedly', 'Check your console for more ' + 'info. A new worker will be spawned instantly.');
          setTimeout(initializeWorker, 1000);
        }
      });
    };
    initializeWorker();
  },
  deactivate: function deactivate() {
    this.active = false;
    this.subscriptions.dispose();
  },
  provideLinter: function provideLinter() {
    var _this2 = this;

    var Helpers = require('atom-linter');
    return {
      name: 'ESLint',
      grammarScopes: this.scopes,
      scope: 'file',
      lintOnFly: true,
      lint: function lint(textEditor) {
        var text = textEditor.getText();
        if (text.length === 0) {
          return Promise.resolve([]);
        }
        var filePath = textEditor.getPath();
        var showRule = atom.config.get('linter-eslint.showRuleIdInMessage');

        return _this2.worker.request('job', {
          contents: text,
          type: 'lint',
          config: atom.config.get('linter-eslint'),
          filePath: filePath
        }).then(function (response) {
          return response.map(function (_ref) {
            var message = _ref.message;
            var line = _ref.line;
            var severity = _ref.severity;
            var ruleId = _ref.ruleId;
            var column = _ref.column;
            var fix = _ref.fix;

            var textBuffer = textEditor.getBuffer();
            var linterFix = null;
            if (fix) {
              var fixRange = new _atom.Range(textBuffer.positionForCharacterIndex(fix.range[0]), textBuffer.positionForCharacterIndex(fix.range[1]));
              linterFix = {
                range: fixRange,
                newText: fix.text
              };
            }
            var range = Helpers.rangeFromLineNumber(textEditor, line - 1);
            if (column) {
              range[0][1] = column - 1;
            }
            if (column > range[1][1]) {
              range[1][1] = column - 1;
            }
            var ret = {
              filePath: filePath,
              type: severity === 1 ? 'Warning' : 'Error',
              range: range
            };
            if (showRule) {
              var elName = ruleId ? 'a' : 'span';
              var href = ruleId ? ' href=' + (0, _helpers.ruleURI)(ruleId) : '';
              ret.html = '<' + elName + href + ' class="badge badge-flexible eslint">' + ((ruleId || 'Fatal') + '</' + elName + '> ' + (0, _escapeHtml2['default'])(message));
            } else {
              ret.text = message;
            }
            if (linterFix) {
              ret.fix = linterFix;
            }
            return ret;
          });
        });
      }
    };
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztvQkFFMkMsTUFBTTs7dUJBQ0QsV0FBVzs7MEJBQ3BDLGFBQWE7Ozs7QUFKcEMsV0FBVyxDQUFBOztBQU1YLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixRQUFNLEVBQUU7QUFDTixpQkFBYSxFQUFFO0FBQ2IsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLG9FQUFvRTtBQUNqRixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLGlCQUFXLEVBQUUscUNBQXFDO0FBQ2xELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELDZCQUF5QixFQUFFO0FBQ3pCLFdBQUssRUFBRSx1RUFBdUU7QUFDOUUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLDZEQUE2RDtBQUMxRSxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLEVBQUU7S0FDWjtBQUNELGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsK0JBQStCO0FBQ3RDLGlCQUFXLEVBQUUsMENBQTBDO0FBQ3ZELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsaUJBQVcsRUFBRSxtREFBbUQ7QUFDaEUsVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7QUFDRCx1QkFBbUIs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dkIsTUFBTSxJQUFJLE9BQU8sQ0FBQSxVQUFLLE1BQU0sVUFBSyw2QkFBVyxPQUFPLENBQUMsQ0FBRSxDQUFBO2FBQzVELE1BQU07QUFDTCxpQkFBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7YUFDbkI7QUFDRCxnQkFBSSxTQUFTLEVBQUU7QUFDYixpQkFBRyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUE7YUFDcEI7QUFDRCxtQkFBTyxHQUFHLENBQUE7V0FDWCxDQUFDO1NBQUEsQ0FDSCxDQUFBO09BQ0Y7S0FDRixDQUFBO0dBQ0Y7Q0FDRixDQUFBIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IHNwYXduV29ya2VyLCBzaG93RXJyb3IsIHJ1bGVVUkkgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgZXNjYXBlSFRNTCBmcm9tICdlc2NhcGUtaHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbmZpZzoge1xuICAgIGxpbnRIdG1sRmlsZXM6IHtcbiAgICAgIHRpdGxlOiAnTGludCBIVE1MIEZpbGVzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnWW91IHNob3VsZCBhbHNvIGFkZCBgZXNsaW50LXBsdWdpbi1odG1sYCB0byB5b3VyIC5lc2xpbnRyYyBwbHVnaW5zJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICB1c2VHbG9iYWxFc2xpbnQ6IHtcbiAgICAgIHRpdGxlOiAnVXNlIGdsb2JhbCBFU0xpbnQgaW5zdGFsbGF0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBzdXJlIHlvdSBoYXZlIGl0IGluIHlvdXIgJFBBVEgnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIHNob3dSdWxlSWRJbk1lc3NhZ2U6IHtcbiAgICAgIHRpdGxlOiAnU2hvdyBSdWxlIElEIGluIE1lc3NhZ2VzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGRpc2FibGVXaGVuTm9Fc2xpbnRDb25maWc6IHtcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSB3aGVuIG5vIEVTTGludCBjb25maWcgaXMgZm91bmQgKGluIHBhY2thZ2UuanNvbiBvciAuZXNsaW50cmMpJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9LFxuICAgIGVzbGludHJjUGF0aDoge1xuICAgICAgdGl0bGU6ICcuZXNsaW50cmMgUGF0aCcsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJdCB3aWxsIG9ubHkgYmUgdXNlZCB3aGVuIHRoZXJlJ3Mgbm8gY29uZmlnIGZpbGUgaW4gcHJvamVjdFwiLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgIH0sXG4gICAgZ2xvYmFsTm9kZVBhdGg6IHtcbiAgICAgIHRpdGxlOiAnR2xvYmFsIE5vZGUgSW5zdGFsbGF0aW9uIFBhdGgnLFxuICAgICAgZGVzY3JpcHRpb246ICdXcml0ZSB0aGUgdmFsdWUgb2YgYG5wbSBnZXQgcHJlZml4YCBoZXJlJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuICAgIGVzbGludFJ1bGVzRGlyOiB7XG4gICAgICB0aXRsZTogJ0VTTGludCBSdWxlcyBEaXInLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IGEgZGlyZWN0b3J5IGZvciBFU0xpbnQgdG8gbG9hZCBydWxlcyBmcm9tJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJydcbiAgICB9LFxuICAgIGRpc2FibGVFc2xpbnRJZ25vcmU6IHtcbiAgICAgIHRpdGxlOiAnRGlzYWJsZSB1c2luZyAuZXNsaW50aWdub3JlIGZpbGVzJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBkaXNhYmxlRlNDYWNoZToge1xuICAgICAgdGl0bGU6ICdEaXNhYmxlIEZpbGVTeXN0ZW0gQ2FjaGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdQYXRocyBvZiBub2RlX21vZHVsZXMsIC5lc2xpbnRpZ25vcmUgYW5kIG90aGVycyBhcmUgY2FjaGVkJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBmaXhPblNhdmU6IHtcbiAgICAgIHRpdGxlOiAnRml4IGVycm9ycyBvbiBzYXZlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGF2ZSBlc2xpbnQgYXR0ZW1wdCB0byBmaXggc29tZSBlcnJvcnMgYXV0b21hdGljYWxseSB3aGVuIHNhdmluZyB0aGUgZmlsZS4nLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGFjdGl2YXRlKCkge1xuICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlXG4gICAgdGhpcy53b3JrZXIgPSBudWxsXG4gICAgdGhpcy5zY29wZXMgPSBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanN4JywgJ3NvdXJjZS5qcy5qc3gnLCAnc291cmNlLmJhYmVsJywgJ3NvdXJjZS5qcy1zZW1hbnRpYyddXG5cbiAgICBjb25zdCBlbWJlZGRlZFNjb3BlID0gJ3NvdXJjZS5qcy5lbWJlZGRlZC5odG1sJ1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLWVzbGludC5saW50SHRtbEZpbGVzJywgbGludEh0bWxGaWxlcyA9PiB7XG4gICAgICBpZiAobGludEh0bWxGaWxlcykge1xuICAgICAgICB0aGlzLnNjb3Blcy5wdXNoKGVtYmVkZGVkU2NvcGUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnNjb3Blcy5zcGxpY2UodGhpcy5zY29wZXMuaW5kZXhPZihlbWJlZGRlZFNjb3BlKSwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcbiAgICAgIGVkaXRvci5vbkRpZFNhdmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zY29wZXMuaW5kZXhPZihlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xICYmXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQuZml4T25TYXZlJykpIHtcbiAgICAgICAgICB0aGlzLndvcmtlci5yZXF1ZXN0KCdqb2InLCB7XG4gICAgICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgICAgIGNvbmZpZzogYXRvbS5jb25maWcuZ2V0KCdsaW50ZXItZXNsaW50JyksXG4gICAgICAgICAgICBmaWxlUGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgIH0pLmNhdGNoKChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHJlc3BvbnNlKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2xpbnRlci1lc2xpbnQ6Zml4LWZpbGUnOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgIGlmICghdGV4dEVkaXRvciB8fCB0ZXh0RWRpdG9yLmlzTW9kaWZpZWQoKSkge1xuICAgICAgICAgIC8vIEFib3J0IGZvciBpbnZhbGlkIG9yIHVuc2F2ZWQgdGV4dCBlZGl0b3JzXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdMaW50ZXItRVNMaW50OiBQbGVhc2Ugc2F2ZSBiZWZvcmUgZml4aW5nJylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMud29ya2VyLnJlcXVlc3QoJ2pvYicsIHtcbiAgICAgICAgICB0eXBlOiAnZml4JyxcbiAgICAgICAgICBjb25maWc6IGF0b20uY29uZmlnLmdldCgnbGludGVyLWVzbGludCcpLFxuICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PlxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKHJlc3BvbnNlKVxuICAgICAgICApLmNhdGNoKChyZXNwb25zZSkgPT5cbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhyZXNwb25zZSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgY29uc3QgaW5pdGlhbGl6ZVdvcmtlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHsgd29ya2VyLCBzdWJzY3JpcHRpb24gfSA9IHNwYXduV29ya2VyKClcbiAgICAgIHRoaXMud29ya2VyID0gd29ya2VyXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbilcbiAgICAgIHdvcmtlci5vbkRpZEV4aXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICBzaG93RXJyb3IoJ1dvcmtlciBkaWVkIHVuZXhwZWN0ZWRseScsICdDaGVjayB5b3VyIGNvbnNvbGUgZm9yIG1vcmUgJyArXG4gICAgICAgICAgJ2luZm8uIEEgbmV3IHdvcmtlciB3aWxsIGJlIHNwYXduZWQgaW5zdGFudGx5LicpXG4gICAgICAgICAgc2V0VGltZW91dChpbml0aWFsaXplV29ya2VyLCAxMDAwKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBpbml0aWFsaXplV29ya2VyKClcbiAgfSxcbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuICBwcm92aWRlTGludGVyKCkge1xuICAgIGNvbnN0IEhlbHBlcnMgPSByZXF1aXJlKCdhdG9tLWxpbnRlcicpXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdFU0xpbnQnLFxuICAgICAgZ3JhbW1hclNjb3BlczogdGhpcy5zY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgbGludDogdGV4dEVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgICAgICBpZiAodGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgY29uc3Qgc2hvd1J1bGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQuc2hvd1J1bGVJZEluTWVzc2FnZScpXG5cbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2VyLnJlcXVlc3QoJ2pvYicsIHtcbiAgICAgICAgICBjb250ZW50czogdGV4dCxcbiAgICAgICAgICB0eXBlOiAnbGludCcsXG4gICAgICAgICAgY29uZmlnOiBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci1lc2xpbnQnKSxcbiAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT5cbiAgICAgICAgICByZXNwb25zZS5tYXAoKHsgbWVzc2FnZSwgbGluZSwgc2V2ZXJpdHksIHJ1bGVJZCwgY29sdW1uLCBmaXggfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGV4dEJ1ZmZlciA9IHRleHRFZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgICAgICAgIGxldCBsaW50ZXJGaXggPSBudWxsXG4gICAgICAgICAgICBpZiAoZml4KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpeFJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMF0pLFxuICAgICAgICAgICAgICAgIHRleHRCdWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChmaXgucmFuZ2VbMV0pXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgbGludGVyRml4ID0ge1xuICAgICAgICAgICAgICAgIHJhbmdlOiBmaXhSYW5nZSxcbiAgICAgICAgICAgICAgICBuZXdUZXh0OiBmaXgudGV4dFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IEhlbHBlcnMucmFuZ2VGcm9tTGluZU51bWJlcih0ZXh0RWRpdG9yLCBsaW5lIC0gMSlcbiAgICAgICAgICAgIGlmIChjb2x1bW4pIHtcbiAgICAgICAgICAgICAgcmFuZ2VbMF1bMV0gPSBjb2x1bW4gLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uID4gcmFuZ2VbMV1bMV0pIHtcbiAgICAgICAgICAgICAgcmFuZ2VbMV1bMV0gPSBjb2x1bW4gLSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXQgPSB7XG4gICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICB0eXBlOiBzZXZlcml0eSA9PT0gMSA/ICdXYXJuaW5nJyA6ICdFcnJvcicsXG4gICAgICAgICAgICAgIHJhbmdlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvd1J1bGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgZWxOYW1lID0gcnVsZUlkID8gJ2EnIDogJ3NwYW4nXG4gICAgICAgICAgICAgIGNvbnN0IGhyZWYgPSBydWxlSWQgPyBgIGhyZWY9JHtydWxlVVJJKHJ1bGVJZCl9YCA6ICcnXG4gICAgICAgICAgICAgIHJldC5odG1sID0gYDwke2VsTmFtZX0ke2hyZWZ9IGNsYXNzPVwiYmFkZ2UgYmFkZ2UtZmxleGlibGUgZXNsaW50XCI+YCArXG4gICAgICAgICAgICAgICAgYCR7cnVsZUlkIHx8ICdGYXRhbCd9PC8ke2VsTmFtZX0+ICR7ZXNjYXBlSFRNTChtZXNzYWdlKX1gXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXQudGV4dCA9IG1lc3NhZ2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW50ZXJGaXgpIHtcbiAgICAgICAgICAgICAgcmV0LmZpeCA9IGxpbnRlckZpeFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/linter-eslint/src/main.js
