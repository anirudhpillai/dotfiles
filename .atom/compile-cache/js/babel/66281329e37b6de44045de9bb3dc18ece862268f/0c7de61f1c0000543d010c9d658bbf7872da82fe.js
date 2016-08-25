function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _workerHelpers = require('./worker-helpers');

var Helpers = _interopRequireWildcard(_workerHelpers);

var _processCommunication = require('process-communication');

var _atomLinter = require('atom-linter');

'use babel';
// Note: 'use babel' doesn't work in forked processes
process.title = 'linter-eslint helper';

var ignoredMessageV1 = 'File ignored because of your .eslintignore file. Use --no-ignore to override.';
var ignoredMessageV2 = 'File ignored because of a matching ignore pattern. Use --no-ignore to override.';

function lintJob(argv, contents, eslint, configPath, config) {
  if (configPath === null && config.disableWhenNoEslintConfig) {
    return [];
  }
  eslint.execute(argv, contents);
  return global.__LINTER_ESLINT_RESPONSE.filter(function (e) {
    return e.message !== ignoredMessageV1;
  }).filter(function (e) {
    return e.message !== ignoredMessageV2;
  });
}
function fixJob(argv, eslint) {
  try {
    eslint.execute(argv);
    return 'Linter-ESLint: Fix Complete';
  } catch (err) {
    throw new Error('Linter-ESLint: Fix Attempt Completed, Linting Errors Remain');
  }
}

(0, _processCommunication.create)().onRequest('job', function (_ref, job) {
  var contents = _ref.contents;
  var type = _ref.type;
  var config = _ref.config;
  var filePath = _ref.filePath;

  global.__LINTER_ESLINT_RESPONSE = [];

  if (config.disableFSCache) {
    _atomLinter.FindCache.clear();
  }

  var fileDir = _path2['default'].dirname(filePath);
  var eslint = Helpers.getESLintInstance(fileDir, config);
  var configPath = Helpers.getConfigPath(fileDir);
  var relativeFilePath = Helpers.getRelativePath(fileDir, filePath, config);

  var argv = Helpers.getArgv(type, config, relativeFilePath, fileDir, configPath);

  if (type === 'lint') {
    job.response = lintJob(argv, contents, eslint, configPath, config);
  } else if (type === 'fix') {
    job.response = fixJob(argv, eslint);
  }
});

process.exit = function () {/* Stop eslint from closing the daemon */};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBSWlCLE1BQU07Ozs7NkJBQ0Usa0JBQWtCOztJQUEvQixPQUFPOztvQ0FDSSx1QkFBdUI7OzBCQUNwQixhQUFhOztBQVB2QyxXQUFXLENBQUE7O0FBRVgsT0FBTyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsQ0FBQTs7QUFPdEMsSUFBTSxnQkFBZ0IsR0FDcEIsK0VBQStFLENBQUE7QUFDakYsSUFBTSxnQkFBZ0IsR0FDcEIsaUZBQWlGLENBQUE7O0FBRW5GLFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7QUFDM0QsTUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRTtBQUMzRCxXQUFPLEVBQUUsQ0FBQTtHQUNWO0FBQ0QsUUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDOUIsU0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQ25DLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsT0FBTyxLQUFLLGdCQUFnQjtHQUFBLENBQUMsQ0FDM0MsTUFBTSxDQUFDLFVBQUEsQ0FBQztXQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssZ0JBQWdCO0dBQUEsQ0FBQyxDQUFBO0NBQy9DO0FBQ0QsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM1QixNQUFJO0FBQ0YsVUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwQixXQUFPLDZCQUE2QixDQUFBO0dBQ3JDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWixVQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7R0FDL0U7Q0FDRjs7QUFFRCxtQ0FBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFvQyxFQUFFLEdBQUcsRUFBSztNQUE1QyxRQUFRLEdBQVYsSUFBb0MsQ0FBbEMsUUFBUTtNQUFFLElBQUksR0FBaEIsSUFBb0MsQ0FBeEIsSUFBSTtNQUFFLE1BQU0sR0FBeEIsSUFBb0MsQ0FBbEIsTUFBTTtNQUFFLFFBQVEsR0FBbEMsSUFBb0MsQ0FBVixRQUFROztBQUMzRCxRQUFNLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFBOztBQUVwQyxNQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7QUFDekIsMEJBQVUsS0FBSyxFQUFFLENBQUE7R0FDbEI7O0FBRUQsTUFBTSxPQUFPLEdBQUcsa0JBQUssT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDekQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNqRCxNQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTs7QUFFM0UsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFakYsTUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQ25CLE9BQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQTtHQUNuRSxNQUFNLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRTtBQUN6QixPQUFHLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDcEM7Q0FDRixDQUFDLENBQUE7O0FBRUYsT0FBTyxDQUFDLElBQUksR0FBRyxZQUFZLDJDQUE2QyxDQUFBIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8vIE5vdGU6ICd1c2UgYmFiZWwnIGRvZXNuJ3Qgd29yayBpbiBmb3JrZWQgcHJvY2Vzc2VzXG5wcm9jZXNzLnRpdGxlID0gJ2xpbnRlci1lc2xpbnQgaGVscGVyJ1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL3dvcmtlci1oZWxwZXJzJ1xuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAncHJvY2Vzcy1jb21tdW5pY2F0aW9uJ1xuaW1wb3J0IHsgRmluZENhY2hlIH0gZnJvbSAnYXRvbS1saW50ZXInXG5cbmNvbnN0IGlnbm9yZWRNZXNzYWdlVjEgPVxuICAnRmlsZSBpZ25vcmVkIGJlY2F1c2Ugb2YgeW91ciAuZXNsaW50aWdub3JlIGZpbGUuIFVzZSAtLW5vLWlnbm9yZSB0byBvdmVycmlkZS4nXG5jb25zdCBpZ25vcmVkTWVzc2FnZVYyID1cbiAgJ0ZpbGUgaWdub3JlZCBiZWNhdXNlIG9mIGEgbWF0Y2hpbmcgaWdub3JlIHBhdHRlcm4uIFVzZSAtLW5vLWlnbm9yZSB0byBvdmVycmlkZS4nXG5cbmZ1bmN0aW9uIGxpbnRKb2IoYXJndiwgY29udGVudHMsIGVzbGludCwgY29uZmlnUGF0aCwgY29uZmlnKSB7XG4gIGlmIChjb25maWdQYXRoID09PSBudWxsICYmIGNvbmZpZy5kaXNhYmxlV2hlbk5vRXNsaW50Q29uZmlnKSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cbiAgZXNsaW50LmV4ZWN1dGUoYXJndiwgY29udGVudHMpXG4gIHJldHVybiBnbG9iYWwuX19MSU5URVJfRVNMSU5UX1JFU1BPTlNFXG4gICAgLmZpbHRlcihlID0+IGUubWVzc2FnZSAhPT0gaWdub3JlZE1lc3NhZ2VWMSlcbiAgICAuZmlsdGVyKGUgPT4gZS5tZXNzYWdlICE9PSBpZ25vcmVkTWVzc2FnZVYyKVxufVxuZnVuY3Rpb24gZml4Sm9iKGFyZ3YsIGVzbGludCkge1xuICB0cnkge1xuICAgIGVzbGludC5leGVjdXRlKGFyZ3YpXG4gICAgcmV0dXJuICdMaW50ZXItRVNMaW50OiBGaXggQ29tcGxldGUnXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IG5ldyBFcnJvcignTGludGVyLUVTTGludDogRml4IEF0dGVtcHQgQ29tcGxldGVkLCBMaW50aW5nIEVycm9ycyBSZW1haW4nKVxuICB9XG59XG5cbmNyZWF0ZSgpLm9uUmVxdWVzdCgnam9iJywgKHsgY29udGVudHMsIHR5cGUsIGNvbmZpZywgZmlsZVBhdGggfSwgam9iKSA9PiB7XG4gIGdsb2JhbC5fX0xJTlRFUl9FU0xJTlRfUkVTUE9OU0UgPSBbXVxuXG4gIGlmIChjb25maWcuZGlzYWJsZUZTQ2FjaGUpIHtcbiAgICBGaW5kQ2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgY29uc3QgZmlsZURpciA9IFBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgY29uc3QgZXNsaW50ID0gSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShmaWxlRGlyLCBjb25maWcpXG4gIGNvbnN0IGNvbmZpZ1BhdGggPSBIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcilcbiAgY29uc3QgcmVsYXRpdmVGaWxlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpbGVEaXIsIGZpbGVQYXRoLCBjb25maWcpXG5cbiAgY29uc3QgYXJndiA9IEhlbHBlcnMuZ2V0QXJndih0eXBlLCBjb25maWcsIHJlbGF0aXZlRmlsZVBhdGgsIGZpbGVEaXIsIGNvbmZpZ1BhdGgpXG5cbiAgaWYgKHR5cGUgPT09ICdsaW50Jykge1xuICAgIGpvYi5yZXNwb25zZSA9IGxpbnRKb2IoYXJndiwgY29udGVudHMsIGVzbGludCwgY29uZmlnUGF0aCwgY29uZmlnKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdmaXgnKSB7XG4gICAgam9iLnJlc3BvbnNlID0gZml4Sm9iKGFyZ3YsIGVzbGludClcbiAgfVxufSlcblxucHJvY2Vzcy5leGl0ID0gZnVuY3Rpb24gKCkgeyAvKiBTdG9wIGVzbGludCBmcm9tIGNsb3NpbmcgdGhlIGRhZW1vbiAqLyB9XG4iXX0=
//# sourceURL=/home/anirudh/.atom/packages/linter-eslint/src/worker.js
