Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spawnWorker = spawnWorker;
exports.showError = showError;
exports.ruleURI = ruleURI;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _atom = require('atom');

var _processCommunication = require('process-communication');

var _path = require('path');

'use babel';

function spawnWorker() {
  var env = Object.create(process.env);

  delete env.NODE_PATH;
  delete env.NODE_ENV;
  delete env.OS;

  var child = _child_process2['default'].fork((0, _path.join)(__dirname, 'worker.js'), [], { env: env, silent: true });
  var worker = (0, _processCommunication.createFromProcess)(child);

  child.stdout.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDOUT', chunk.toString());
  });
  child.stderr.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDERR', chunk.toString());
  });

  return { worker: worker, subscription: new _atom.Disposable(function () {
      worker.kill();
    }) };
}

function showError(givenMessage) {
  var givenDetail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var detail = undefined;
  var message = undefined;
  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  } else {
    detail = givenDetail;
    message = givenMessage;
  }
  atom.notifications.addError('[Linter-ESLint] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function ruleURI(ruleId) {
  var ruleParts = ruleId.split('/');

  if (ruleParts.length === 1) {
    return 'http://eslint.org/docs/rules/' + ruleId;
  }

  var pluginName = ruleParts[0];
  var ruleName = ruleParts[1];
  switch (pluginName) {
    case 'angular':
      return 'https://github.com/Gillespie59/eslint-plugin-angular/blob/master/docs/' + ruleName + '.md';

    case 'ava':
      return 'https://github.com/sindresorhus/eslint-plugin-ava/blob/master/docs/rules/' + ruleName + '.md';

    case 'import':
      return 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/' + ruleName + '.md';

    case 'import-order':
      return 'https://github.com/jfmengels/eslint-plugin-import-order/blob/master/docs/rules/' + ruleName + '.md';

    case 'jasmine':
      return 'https://github.com/tlvince/eslint-plugin-jasmine/blob/master/docs/rules/' + ruleName + '.md';

    case 'jsx-a11y':
      return 'https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/' + ruleName + '.md';

    case 'lodash':
      return 'https://github.com/wix/eslint-plugin-lodash/blob/master/docs/rules/' + ruleName + '.md';

    case 'mocha':
      return 'https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/' + ruleName + '.md';

    case 'promise':
      return 'https://github.com/xjamundx/eslint-plugin-promise#' + ruleName;

    case 'react':
      return 'https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/' + ruleName + '.md';

    default:
      return 'https://github.com/AtomLinter/linter-eslint/wiki/Linking-to-Rule-Documentation';
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7NkJBRXlCLGVBQWU7Ozs7b0JBQ2IsTUFBTTs7b0NBQ0MsdUJBQXVCOztvQkFDcEMsTUFBTTs7QUFMM0IsV0FBVyxDQUFBOztBQU9KLFNBQVMsV0FBVyxHQUFHO0FBQzVCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUV0QyxTQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUE7QUFDcEIsU0FBTyxHQUFHLENBQUMsUUFBUSxDQUFBO0FBQ25CLFNBQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQTs7QUFFYixNQUFNLEtBQUssR0FBRywyQkFBYSxJQUFJLENBQUMsZ0JBQUssU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7QUFDeEYsTUFBTSxNQUFNLEdBQUcsNkNBQWtCLEtBQUssQ0FBQyxDQUFBOztBQUV2QyxPQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakMsV0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUN4RCxDQUFDLENBQUE7QUFDRixPQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDakMsV0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUN4RCxDQUFDLENBQUE7O0FBRUYsU0FBTyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsWUFBWSxFQUFFLHFCQUFlLFlBQU07QUFDbEQsWUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2QsQ0FBQyxFQUFFLENBQUE7Q0FDTDs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxZQUFZLEVBQXNCO01BQXBCLFdBQVcseURBQUcsSUFBSTs7QUFDeEQsTUFBSSxNQUFNLFlBQUEsQ0FBQTtBQUNWLE1BQUksT0FBTyxZQUFBLENBQUE7QUFDWCxNQUFJLE9BQU8sWUFBWSxLQUFLLEVBQUU7QUFDNUIsVUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUE7QUFDdEIsV0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUE7R0FDMUIsTUFBTTtBQUNMLFVBQU0sR0FBRyxXQUFXLENBQUE7QUFDcEIsV0FBTyxHQUFHLFlBQVksQ0FBQTtHQUN2QjtBQUNELE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxzQkFBb0IsT0FBTyxFQUFJO0FBQ3hELFVBQU0sRUFBTixNQUFNO0FBQ04sZUFBVyxFQUFFLElBQUk7R0FDbEIsQ0FBQyxDQUFBO0NBQ0g7O0FBRU0sU0FBUyxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQzlCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7O0FBRW5DLE1BQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDMUIsNkNBQXVDLE1BQU0sQ0FBRTtHQUNoRDs7QUFFRCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0IsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzdCLFVBQVEsVUFBVTtBQUNoQixTQUFLLFNBQVM7QUFDWix3RkFBZ0YsUUFBUSxTQUFLOztBQUFBLEFBRS9GLFNBQUssS0FBSztBQUNSLDJGQUFtRixRQUFRLFNBQUs7O0FBQUEsQUFFbEcsU0FBSyxRQUFRO0FBQ1gsMkZBQW1GLFFBQVEsU0FBSzs7QUFBQSxBQUVsRyxTQUFLLGNBQWM7QUFDakIsaUdBQXlGLFFBQVEsU0FBSzs7QUFBQSxBQUV4RyxTQUFLLFNBQVM7QUFDWiwwRkFBa0YsUUFBUSxTQUFLOztBQUFBLEFBRWpHLFNBQUssVUFBVTtBQUNiLDJGQUFtRixRQUFRLFNBQUs7O0FBQUEsQUFFbEcsU0FBSyxRQUFRO0FBQ1gscUZBQTZFLFFBQVEsU0FBSzs7QUFBQSxBQUU1RixTQUFLLE9BQU87QUFDVix3RkFBZ0YsUUFBUSxTQUFLOztBQUFBLEFBRS9GLFNBQUssU0FBUztBQUNaLG9FQUE0RCxRQUFRLENBQUU7O0FBQUEsQUFFeEUsU0FBSyxPQUFPO0FBQ1YsMEZBQWtGLFFBQVEsU0FBSzs7QUFBQSxBQUVqRztBQUNFLGFBQU8sZ0ZBQWdGLENBQUE7QUFBQSxHQUMxRjtDQUNGIiwiZmlsZSI6Ii9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBDaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgY3JlYXRlRnJvbVByb2Nlc3MgfSBmcm9tICdwcm9jZXNzLWNvbW11bmljYXRpb24nXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCdcblxuZXhwb3J0IGZ1bmN0aW9uIHNwYXduV29ya2VyKCkge1xuICBjb25zdCBlbnYgPSBPYmplY3QuY3JlYXRlKHByb2Nlc3MuZW52KVxuXG4gIGRlbGV0ZSBlbnYuTk9ERV9QQVRIXG4gIGRlbGV0ZSBlbnYuTk9ERV9FTlZcbiAgZGVsZXRlIGVudi5PU1xuXG4gIGNvbnN0IGNoaWxkID0gQ2hpbGRQcm9jZXNzLmZvcmsoam9pbihfX2Rpcm5hbWUsICd3b3JrZXIuanMnKSwgW10sIHsgZW52LCBzaWxlbnQ6IHRydWUgfSlcbiAgY29uc3Qgd29ya2VyID0gY3JlYXRlRnJvbVByb2Nlc3MoY2hpbGQpXG5cbiAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1tMaW50ZXItRVNMaW50XSBTVERPVVQnLCBjaHVuay50b1N0cmluZygpKVxuICB9KVxuICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICBjb25zb2xlLmxvZygnW0xpbnRlci1FU0xpbnRdIFNUREVSUicsIGNodW5rLnRvU3RyaW5nKCkpXG4gIH0pXG5cbiAgcmV0dXJuIHsgd29ya2VyLCBzdWJzY3JpcHRpb246IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICB3b3JrZXIua2lsbCgpXG4gIH0pIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcihnaXZlbk1lc3NhZ2UsIGdpdmVuRGV0YWlsID0gbnVsbCkge1xuICBsZXQgZGV0YWlsXG4gIGxldCBtZXNzYWdlXG4gIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICBkZXRhaWwgPSBtZXNzYWdlLnN0YWNrXG4gICAgbWVzc2FnZSA9IG1lc3NhZ2UubWVzc2FnZVxuICB9IGVsc2Uge1xuICAgIGRldGFpbCA9IGdpdmVuRGV0YWlsXG4gICAgbWVzc2FnZSA9IGdpdmVuTWVzc2FnZVxuICB9XG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgW0xpbnRlci1FU0xpbnRdICR7bWVzc2FnZX1gLCB7XG4gICAgZGV0YWlsLFxuICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydWxlVVJJKHJ1bGVJZCkge1xuICBjb25zdCBydWxlUGFydHMgPSBydWxlSWQuc3BsaXQoJy8nKVxuXG4gIGlmIChydWxlUGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGBodHRwOi8vZXNsaW50Lm9yZy9kb2NzL3J1bGVzLyR7cnVsZUlkfWBcbiAgfVxuXG4gIGNvbnN0IHBsdWdpbk5hbWUgPSBydWxlUGFydHNbMF1cbiAgY29uc3QgcnVsZU5hbWUgPSBydWxlUGFydHNbMV1cbiAgc3dpdGNoIChwbHVnaW5OYW1lKSB7XG4gICAgY2FzZSAnYW5ndWxhcic6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS9HaWxsZXNwaWU1OS9lc2xpbnQtcGx1Z2luLWFuZ3VsYXIvYmxvYi9tYXN0ZXIvZG9jcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ2F2YSc6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvZXNsaW50LXBsdWdpbi1hdmEvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ2ltcG9ydCc6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5tb3NoZXIvZXNsaW50LXBsdWdpbi1pbXBvcnQvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ2ltcG9ydC1vcmRlcic6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS9qZm1lbmdlbHMvZXNsaW50LXBsdWdpbi1pbXBvcnQtb3JkZXIvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ2phc21pbmUnOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20vdGx2aW5jZS9lc2xpbnQtcGx1Z2luLWphc21pbmUvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ2pzeC1hMTF5JzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL2V2Y29oZW4vZXNsaW50LXBsdWdpbi1qc3gtYTExeS9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnbG9kYXNoJzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL3dpeC9lc2xpbnQtcGx1Z2luLWxvZGFzaC9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnbW9jaGEnOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20vbG8xdHVtYS9lc2xpbnQtcGx1Z2luLW1vY2hhL2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvJHtydWxlTmFtZX0ubWRgXG5cbiAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL3hqYW11bmR4L2VzbGludC1wbHVnaW4tcHJvbWlzZSMke3J1bGVOYW1lfWBcblxuICAgIGNhc2UgJ3JlYWN0JzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL3lhbm5pY2tjci9lc2xpbnQtcGx1Z2luLXJlYWN0L2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvJHtydWxlTmFtZX0ubWRgXG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICdodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9saW50ZXItZXNsaW50L3dpa2kvTGlua2luZy10by1SdWxlLURvY3VtZW50YXRpb24nXG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/linter-eslint/src/helpers.js
