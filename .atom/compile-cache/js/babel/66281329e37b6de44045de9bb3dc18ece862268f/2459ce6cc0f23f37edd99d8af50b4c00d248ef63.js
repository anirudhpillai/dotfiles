Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNodePrefixPath = getNodePrefixPath;
exports.getESLintFromDirectory = getESLintFromDirectory;
exports.refreshModulesPath = refreshModulesPath;
exports.getESLintInstance = getESLintInstance;
exports.getConfigPath = getConfigPath;
exports.getRelativePath = getRelativePath;
exports.getArgv = getArgv;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _resolveEnv = require('resolve-env');

var _resolveEnv2 = _interopRequireDefault(_resolveEnv);

var _atomLinter = require('atom-linter');

var _consistentPath = require('consistent-path');

var _consistentPath2 = _interopRequireDefault(_consistentPath);

'use babel';

var Cache = {
  ESLINT_LOCAL_PATH: _path2['default'].normalize(_path2['default'].join(__dirname, '..', 'node_modules', 'eslint')),
  NODE_PREFIX_PATH: null,
  LAST_MODULES_PATH: null
};

function getNodePrefixPath() {
  if (Cache.NODE_PREFIX_PATH === null) {
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    try {
      Cache.NODE_PREFIX_PATH = _child_process2['default'].spawnSync(npmCommand, ['get', 'prefix'], {
        env: Object.assign(Object.assign({}, process.env), { PATH: (0, _consistentPath2['default'])() })
      }).output[1].toString().trim();
    } catch (e) {
      throw new Error('Unable to execute `npm get prefix`. Please make sure Atom is getting $PATH correctly');
    }
  }
  return Cache.NODE_PREFIX_PATH;
}

function getESLintFromDirectory(modulesDir, config) {
  var ESLintDirectory = null;

  if (config.useGlobalEslint) {
    var prefixPath = config.globalNodePath || getNodePrefixPath();
    if (process.platform === 'win32') {
      ESLintDirectory = _path2['default'].join(prefixPath, 'node_modules', 'eslint');
    } else {
      ESLintDirectory = _path2['default'].join(prefixPath, 'lib', 'node_modules', 'eslint');
    }
  } else {
    ESLintDirectory = _path2['default'].join(modulesDir || '', 'eslint');
  }
  try {
    return require(_path2['default'].join(ESLintDirectory, 'lib', 'cli.js'));
  } catch (e) {
    if (config.useGlobalEslint && e.code === 'MODULE_NOT_FOUND') {
      throw new Error('ESLint not found, Please install or make sure Atom is getting $PATH correctly');
    }
    return require(_path2['default'].join(Cache.ESLINT_LOCAL_PATH, 'lib', 'cli.js'));
  }
}

function refreshModulesPath(modulesDir) {
  if (Cache.LAST_MODULES_PATH !== modulesDir) {
    Cache.LAST_MODULES_PATH = modulesDir;
    process.env.NODE_PATH = modulesDir || '';
    require('module').Module._initPaths();
  }
}

function getESLintInstance(fileDir, config) {
  var modulesDir = _path2['default'].dirname((0, _atomLinter.findCached)(fileDir, 'node_modules/eslint'));
  refreshModulesPath(modulesDir);
  return getESLintFromDirectory(modulesDir, config);
}

function getConfigPath(fileDir) {
  var configFile = (0, _atomLinter.findCached)(fileDir, ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json', '.eslintrc']);
  if (configFile) {
    return configFile;
  }

  var packagePath = (0, _atomLinter.findCached)(fileDir, 'package.json');
  if (packagePath && Boolean(require(packagePath).eslintConfig)) {
    return packagePath;
  }
  return null;
}

function getRelativePath(fileDir, filePath, config) {
  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');

  if (ignoreFile) {
    var ignoreDir = _path2['default'].dirname(ignoreFile);
    process.chdir(ignoreDir);
    return _path2['default'].relative(ignoreDir, filePath);
  }
  process.chdir(fileDir);
  return _path2['default'].basename(filePath);
}

function getArgv(type, config, filePath, fileDir, givenConfigPath) {
  var configPath = undefined;
  if (givenConfigPath === null) {
    configPath = config.eslintrcPath || null;
  } else configPath = givenConfigPath;

  var argv = [process.execPath, 'a-b-c' // dummy value for eslint executable
  ];
  if (type === 'lint') {
    argv.push('--stdin');
  }
  argv.push('--format', _path2['default'].join(__dirname, 'reporter.js'));

  var ignoreFile = config.disableEslintIgnore ? null : (0, _atomLinter.findCached)(fileDir, '.eslintignore');
  if (ignoreFile) {
    argv.push('--ignore-path', ignoreFile);
  }

  if (config.eslintRulesDir) {
    var rulesDir = (0, _resolveEnv2['default'])(config.eslintRulesDir);
    if (!_path2['default'].isAbsolute(rulesDir)) {
      rulesDir = (0, _atomLinter.findCached)(fileDir, rulesDir);
    }
    argv.push('--rulesdir', rulesDir);
  }
  if (configPath) {
    argv.push('--config', (0, _resolveEnv2['default'])(configPath));
  }
  if (config.disableEslintIgnore) {
    argv.push('--no-ignore');
  }
  if (type === 'lint') {
    argv.push('--stdin-filename', filePath);
  } else if (type === 'fix') {
    argv.push(filePath);
    argv.push('--fix');
  }

  return argv;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcmMvd29ya2VyLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztvQkFFaUIsTUFBTTs7Ozs2QkFDRSxlQUFlOzs7OzBCQUNqQixhQUFhOzs7OzBCQUNULGFBQWE7OzhCQUNwQixpQkFBaUI7Ozs7QUFOckMsV0FBVyxDQUFBOztBQVFYLElBQU0sS0FBSyxHQUFHO0FBQ1osbUJBQWlCLEVBQUUsa0JBQUssU0FBUyxDQUFDLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN2RixrQkFBZ0IsRUFBRSxJQUFJO0FBQ3RCLG1CQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQTs7QUFFTSxTQUFTLGlCQUFpQixHQUFHO0FBQ2xDLE1BQUksS0FBSyxDQUFDLGdCQUFnQixLQUFLLElBQUksRUFBRTtBQUNuQyxRQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ25FLFFBQUk7QUFDRixXQUFLLENBQUMsZ0JBQWdCLEdBQ3BCLDJCQUFhLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUU7QUFDcEQsV0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGtDQUFTLEVBQUUsQ0FBQztPQUN4RSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ2pDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixZQUFNLElBQUksS0FBSyxDQUNiLHNGQUFzRixDQUN2RixDQUFBO0tBQ0Y7R0FDRjtBQUNELFNB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QyxRQUFRLENBQUMsRUFBRTtBQUM5QixjQUFRLEdBQUcsNEJBQVcsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3pDO0FBQ0QsUUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDbEM7QUFDRCxNQUFJLFVBQVUsRUFBRTtBQUNkLFFBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLDZCQUFXLFVBQVUsQ0FBQyxDQUFDLENBQUE7R0FDOUM7QUFDRCxNQUFJLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRTtBQUM5QixRQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0dBQ3pCO0FBQ0QsTUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQ25CLFFBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDeEMsTUFBTSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7QUFDekIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNuQixRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ25COztBQUVELFNBQU8sSUFBSSxDQUFBO0NBQ1oiLCJmaWxlIjoiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy93b3JrZXItaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBQYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgQ2hpbGRQcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgcmVzb2x2ZUVudiBmcm9tICdyZXNvbHZlLWVudidcbmltcG9ydCB7IGZpbmRDYWNoZWQgfSBmcm9tICdhdG9tLWxpbnRlcidcbmltcG9ydCBnZXRQYXRoIGZyb20gJ2NvbnNpc3RlbnQtcGF0aCdcblxuY29uc3QgQ2FjaGUgPSB7XG4gIEVTTElOVF9MT0NBTF9QQVRIOiBQYXRoLm5vcm1hbGl6ZShQYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpKSxcbiAgTk9ERV9QUkVGSVhfUEFUSDogbnVsbCxcbiAgTEFTVF9NT0RVTEVTX1BBVEg6IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vZGVQcmVmaXhQYXRoKCkge1xuICBpZiAoQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9PT0gbnVsbCkge1xuICAgIGNvbnN0IG5wbUNvbW1hbmQgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gJ25wbS5jbWQnIDogJ25wbSdcbiAgICB0cnkge1xuICAgICAgQ2FjaGUuTk9ERV9QUkVGSVhfUEFUSCA9XG4gICAgICAgIENoaWxkUHJvY2Vzcy5zcGF3blN5bmMobnBtQ29tbWFuZCwgWydnZXQnLCAncHJlZml4J10sIHtcbiAgICAgICAgICBlbnY6IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcHJvY2Vzcy5lbnYpLCB7IFBBVEg6IGdldFBhdGgoKSB9KVxuICAgICAgICB9KS5vdXRwdXRbMV0udG9TdHJpbmcoKS50cmltKClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdVbmFibGUgdG8gZXhlY3V0ZSBgbnBtIGdldCBwcmVmaXhgLiBQbGVhc2UgbWFrZSBzdXJlIEF0b20gaXMgZ2V0dGluZyAkUEFUSCBjb3JyZWN0bHknXG4gICAgICApXG4gICAgfVxuICB9XG4gIHJldHVybiBDYWNoZS5OT0RFX1BSRUZJWF9QQVRIXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZykge1xuICBsZXQgRVNMaW50RGlyZWN0b3J5ID0gbnVsbFxuXG4gIGlmIChjb25maWcudXNlR2xvYmFsRXNsaW50KSB7XG4gICAgY29uc3QgcHJlZml4UGF0aCA9IGNvbmZpZy5nbG9iYWxOb2RlUGF0aCB8fCBnZXROb2RlUHJlZml4UGF0aCgpXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcbiAgICAgIEVTTGludERpcmVjdG9yeSA9IFBhdGguam9pbihwcmVmaXhQYXRoLCAnbm9kZV9tb2R1bGVzJywgJ2VzbGludCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIEVTTGludERpcmVjdG9yeSA9IFBhdGguam9pbihwcmVmaXhQYXRoLCAnbGliJywgJ25vZGVfbW9kdWxlcycsICdlc2xpbnQnKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBFU0xpbnREaXJlY3RvcnkgPSBQYXRoLmpvaW4obW9kdWxlc0RpciB8fCAnJywgJ2VzbGludCcpXG4gIH1cbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShQYXRoLmpvaW4oRVNMaW50RGlyZWN0b3J5LCAnbGliJywgJ2NsaS5qcycpKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGNvbmZpZy51c2VHbG9iYWxFc2xpbnQgJiYgZS5jb2RlID09PSAnTU9EVUxFX05PVF9GT1VORCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0VTTGludCBub3QgZm91bmQsIFBsZWFzZSBpbnN0YWxsIG9yIG1ha2Ugc3VyZSBBdG9tIGlzIGdldHRpbmcgJFBBVEggY29ycmVjdGx5J1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gcmVxdWlyZShQYXRoLmpvaW4oQ2FjaGUuRVNMSU5UX0xPQ0FMX1BBVEgsICdsaWInLCAnY2xpLmpzJykpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hNb2R1bGVzUGF0aChtb2R1bGVzRGlyKSB7XG4gIGlmIChDYWNoZS5MQVNUX01PRFVMRVNfUEFUSCAhPT0gbW9kdWxlc0Rpcikge1xuICAgIENhY2hlLkxBU1RfTU9EVUxFU19QQVRIID0gbW9kdWxlc0RpclxuICAgIHByb2Nlc3MuZW52Lk5PREVfUEFUSCA9IG1vZHVsZXNEaXIgfHwgJydcbiAgICByZXF1aXJlKCdtb2R1bGUnKS5Nb2R1bGUuX2luaXRQYXRocygpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVTTGludEluc3RhbmNlKGZpbGVEaXIsIGNvbmZpZykge1xuICBjb25zdCBtb2R1bGVzRGlyID0gUGF0aC5kaXJuYW1lKGZpbmRDYWNoZWQoZmlsZURpciwgJ25vZGVfbW9kdWxlcy9lc2xpbnQnKSlcbiAgcmVmcmVzaE1vZHVsZXNQYXRoKG1vZHVsZXNEaXIpXG4gIHJldHVybiBnZXRFU0xpbnRGcm9tRGlyZWN0b3J5KG1vZHVsZXNEaXIsIGNvbmZpZylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZ1BhdGgoZmlsZURpcikge1xuICBjb25zdCBjb25maWdGaWxlID1cbiAgICBmaW5kQ2FjaGVkKGZpbGVEaXIsIFtcbiAgICAgICcuZXNsaW50cmMuanMnLCAnLmVzbGludHJjLnlhbWwnLCAnLmVzbGludHJjLnltbCcsICcuZXNsaW50cmMuanNvbicsICcuZXNsaW50cmMnXG4gICAgXSlcbiAgaWYgKGNvbmZpZ0ZpbGUpIHtcbiAgICByZXR1cm4gY29uZmlnRmlsZVxuICB9XG5cbiAgY29uc3QgcGFja2FnZVBhdGggPSBmaW5kQ2FjaGVkKGZpbGVEaXIsICdwYWNrYWdlLmpzb24nKVxuICBpZiAocGFja2FnZVBhdGggJiYgQm9vbGVhbihyZXF1aXJlKHBhY2thZ2VQYXRoKS5lc2xpbnRDb25maWcpKSB7XG4gICAgcmV0dXJuIHBhY2thZ2VQYXRoXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlbGF0aXZlUGF0aChmaWxlRGlyLCBmaWxlUGF0aCwgY29uZmlnKSB7XG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcblxuICBpZiAoaWdub3JlRmlsZSkge1xuICAgIGNvbnN0IGlnbm9yZURpciA9IFBhdGguZGlybmFtZShpZ25vcmVGaWxlKVxuICAgIHByb2Nlc3MuY2hkaXIoaWdub3JlRGlyKVxuICAgIHJldHVybiBQYXRoLnJlbGF0aXZlKGlnbm9yZURpciwgZmlsZVBhdGgpXG4gIH1cbiAgcHJvY2Vzcy5jaGRpcihmaWxlRGlyKVxuICByZXR1cm4gUGF0aC5iYXNlbmFtZShmaWxlUGF0aClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZ3YodHlwZSwgY29uZmlnLCBmaWxlUGF0aCwgZmlsZURpciwgZ2l2ZW5Db25maWdQYXRoKSB7XG4gIGxldCBjb25maWdQYXRoXG4gIGlmIChnaXZlbkNvbmZpZ1BhdGggPT09IG51bGwpIHtcbiAgICBjb25maWdQYXRoID0gY29uZmlnLmVzbGludHJjUGF0aCB8fCBudWxsXG4gIH0gZWxzZSBjb25maWdQYXRoID0gZ2l2ZW5Db25maWdQYXRoXG5cbiAgY29uc3QgYXJndiA9IFtcbiAgICBwcm9jZXNzLmV4ZWNQYXRoLFxuICAgICdhLWItYycgLy8gZHVtbXkgdmFsdWUgZm9yIGVzbGludCBleGVjdXRhYmxlXG4gIF1cbiAgaWYgKHR5cGUgPT09ICdsaW50Jykge1xuICAgIGFyZ3YucHVzaCgnLS1zdGRpbicpXG4gIH1cbiAgYXJndi5wdXNoKCctLWZvcm1hdCcsIFBhdGguam9pbihfX2Rpcm5hbWUsICdyZXBvcnRlci5qcycpKVxuXG4gIGNvbnN0IGlnbm9yZUZpbGUgPSBjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSA/IG51bGwgOiBmaW5kQ2FjaGVkKGZpbGVEaXIsICcuZXNsaW50aWdub3JlJylcbiAgaWYgKGlnbm9yZUZpbGUpIHtcbiAgICBhcmd2LnB1c2goJy0taWdub3JlLXBhdGgnLCBpZ25vcmVGaWxlKVxuICB9XG5cbiAgaWYgKGNvbmZpZy5lc2xpbnRSdWxlc0Rpcikge1xuICAgIGxldCBydWxlc0RpciA9IHJlc29sdmVFbnYoY29uZmlnLmVzbGludFJ1bGVzRGlyKVxuICAgIGlmICghUGF0aC5pc0Fic29sdXRlKHJ1bGVzRGlyKSkge1xuICAgICAgcnVsZXNEaXIgPSBmaW5kQ2FjaGVkKGZpbGVEaXIsIHJ1bGVzRGlyKVxuICAgIH1cbiAgICBhcmd2LnB1c2goJy0tcnVsZXNkaXInLCBydWxlc0RpcilcbiAgfVxuICBpZiAoY29uZmlnUGF0aCkge1xuICAgIGFyZ3YucHVzaCgnLS1jb25maWcnLCByZXNvbHZlRW52KGNvbmZpZ1BhdGgpKVxuICB9XG4gIGlmIChjb25maWcuZGlzYWJsZUVzbGludElnbm9yZSkge1xuICAgIGFyZ3YucHVzaCgnLS1uby1pZ25vcmUnKVxuICB9XG4gIGlmICh0eXBlID09PSAnbGludCcpIHtcbiAgICBhcmd2LnB1c2goJy0tc3RkaW4tZmlsZW5hbWUnLCBmaWxlUGF0aClcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnZml4Jykge1xuICAgIGFyZ3YucHVzaChmaWxlUGF0aClcbiAgICBhcmd2LnB1c2goJy0tZml4JylcbiAgfVxuXG4gIHJldHVybiBhcmd2XG59XG4iXX0=
//# sourceURL=/home/anirudh/.atom/packages/linter-eslint/src/worker-helpers.js
