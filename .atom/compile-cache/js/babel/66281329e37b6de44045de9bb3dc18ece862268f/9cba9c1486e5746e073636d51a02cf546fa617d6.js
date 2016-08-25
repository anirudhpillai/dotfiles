function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libWorkerHelpers = require('../lib/worker-helpers');

var Helpers = _interopRequireWildcard(_libWorkerHelpers);

var _common = require('./common');

var _path = require('path');

var Path = _interopRequireWildcard(_path);

'use babel';

describe('Worker Helpers', function () {
  describe('getESLintInstance && getESLintFromDirectory', function () {
    it('tries to find a local eslint', function () {
      var eslint = Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {});
      expect(eslint).toBe('located');
    });
    it('cries if local eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance((0, _common.getFixturesPath)('files', {}));
      }).toThrow();
    });

    it('tries to find a global eslint if config is specified', function () {
      var globalPath = '';
      if (process.platform === 'win32') {
        globalPath = (0, _common.getFixturesPath)(Path.join('global-eslint', 'lib'));
      } else {
        globalPath = (0, _common.getFixturesPath)('global-eslint');
      }
      var eslint = Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {
        useGlobalEslint: true,
        globalNodePath: globalPath
      });
      expect(eslint).toBe('located');
    });
    it('cries if global eslint is not found', function () {
      expect(function () {
        Helpers.getESLintInstance((0, _common.getFixturesPath)('local-eslint'), {
          useGlobalEslint: true,
          globalNodePath: (0, _common.getFixturesPath)('files')
        });
      }).toThrow();
    });

    it('tries to find a local eslint with nested node_modules', function () {
      var fileDir = Path.join((0, _common.getFixturesPath)('local-eslint'), 'lib', 'foo.js');
      var eslint = Helpers.getESLintInstance(fileDir, {});
      expect(eslint).toBe('located');
    });
  });

  describe('getConfigPath', function () {
    it('finds .eslintrc', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'no-ext'));
      var expectedPath = Path.join(fileDir, '.eslintrc');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.yaml', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'yaml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yaml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.yml', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'yml'));
      var expectedPath = Path.join(fileDir, '.eslintrc.yml');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.js', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'js'));
      var expectedPath = Path.join(fileDir, '.eslintrc.js');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
    it('finds .eslintrc.json', function () {
      var fileDir = (0, _common.getFixturesPath)(Path.join('configs', 'json'));
      var expectedPath = Path.join(fileDir, '.eslintrc.json');
      expect(Helpers.getConfigPath(fileDir)).toBe(expectedPath);
    });
  });

  describe('getRelativePath', function () {
    it('return path relative of ignore file if found', function () {
      var fixtureDir = (0, _common.getFixturesPath)('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, {});
      var expectedPath = Path.relative(Path.join(__dirname, '..'), fixtureFile);
      expect(relativePath).toBe(expectedPath);
    });
    it('does not return path relative to ignore file if config overrides it', function () {
      var fixtureDir = (0, _common.getFixturesPath)('eslintignore');
      var fixtureFile = Path.join(fixtureDir, 'ignored.js');
      var relativePath = Helpers.getRelativePath(fixtureDir, fixtureFile, { disableEslintIgnore: true });
      expect(relativePath).toBe('ignored.js');
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuaXJ1ZGgvLmF0b20vcGFja2FnZXMvbGludGVyLWVzbGludC9zcGVjL3dvcmtlci1oZWxwZXJzLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Z0NBRXlCLHVCQUF1Qjs7SUFBcEMsT0FBTzs7c0JBQ2EsVUFBVTs7b0JBQ3BCLE1BQU07O0lBQWhCLElBQUk7O0FBSmhCLFdBQVcsQ0FBQTs7QUFNWCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTtBQUMvQixVQUFRLENBQUMsNkNBQTZDLEVBQUUsWUFBTTtBQUM1RCxNQUFFLENBQUMsOEJBQThCLEVBQUUsWUFBTTtBQUN2QyxVQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsNkJBQWdCLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzdFLFlBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDL0IsQ0FBQyxDQUFBO0FBQ0YsTUFBRSxDQUFDLG9DQUFvQyxFQUFFLFlBQU07QUFDN0MsWUFBTSxDQUFDLFlBQU07QUFDWCxlQUFPLENBQUMsaUJBQWlCLENBQUMsNkJBQWdCLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO09BQ3hELENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNiLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsc0RBQXNELEVBQUUsWUFBTTtBQUMvRCxVQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDbkIsVUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUNoQyxrQkFBVSxHQUFHLDZCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO09BQ2hFLE1BQU07QUFDTCxrQkFBVSxHQUFHLDZCQUFnQixlQUFlLENBQUMsQ0FBQTtPQUM5QztBQUNELFVBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyw2QkFBZ0Is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LElBQUksRUFBRSxDQUFDLENBQUE7QUFDakYsWUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUN4QyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NwZWMvd29ya2VyLWhlbHBlcnMtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi4vbGliL3dvcmtlci1oZWxwZXJzJ1xuaW1wb3J0IHsgZ2V0Rml4dHVyZXNQYXRoIH0gZnJvbSAnLi9jb21tb24nXG5pbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnXG5cbmRlc2NyaWJlKCdXb3JrZXIgSGVscGVycycsICgpID0+IHtcbiAgZGVzY3JpYmUoJ2dldEVTTGludEluc3RhbmNlICYmIGdldEVTTGludEZyb21EaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3RyaWVzIHRvIGZpbmQgYSBsb2NhbCBlc2xpbnQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHt9KVxuICAgICAgZXhwZWN0KGVzbGludCkudG9CZSgnbG9jYXRlZCcpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbG9jYWwgZXNsaW50IGlzIG5vdCBmb3VuZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdCgoKSA9PiB7XG4gICAgICAgIEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZ2V0Rml4dHVyZXNQYXRoKCdmaWxlcycsIHt9KSlcbiAgICAgIH0pLnRvVGhyb3coKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGdsb2JhbCBlc2xpbnQgaWYgY29uZmlnIGlzIHNwZWNpZmllZCcsICgpID0+IHtcbiAgICAgIGxldCBnbG9iYWxQYXRoID0gJydcbiAgICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XG4gICAgICAgIGdsb2JhbFBhdGggPSBnZXRGaXh0dXJlc1BhdGgoUGF0aC5qb2luKCdnbG9iYWwtZXNsaW50JywgJ2xpYicpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2xvYmFsUGF0aCA9IGdldEZpeHR1cmVzUGF0aCgnZ2xvYmFsLWVzbGludCcpXG4gICAgICB9XG4gICAgICBjb25zdCBlc2xpbnQgPSBIZWxwZXJzLmdldEVTTGludEluc3RhbmNlKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksIHtcbiAgICAgICAgdXNlR2xvYmFsRXNsaW50OiB0cnVlLFxuICAgICAgICBnbG9iYWxOb2RlUGF0aDogZ2xvYmFsUGF0aFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChlc2xpbnQpLnRvQmUoJ2xvY2F0ZWQnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIGdsb2JhbCBlc2xpbnQgaXMgbm90IGZvdW5kJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IHtcbiAgICAgICAgSGVscGVycy5nZXRFU0xpbnRJbnN0YW5jZShnZXRGaXh0dXJlc1BhdGgoJ2xvY2FsLWVzbGludCcpLCB7XG4gICAgICAgICAgdXNlR2xvYmFsRXNsaW50OiB0cnVlLFxuICAgICAgICAgIGdsb2JhbE5vZGVQYXRoOiBnZXRGaXh0dXJlc1BhdGgoJ2ZpbGVzJylcbiAgICAgICAgfSlcbiAgICAgIH0pLnRvVGhyb3coKVxuICAgIH0pXG5cbiAgICBpdCgndHJpZXMgdG8gZmluZCBhIGxvY2FsIGVzbGludCB3aXRoIG5lc3RlZCBub2RlX21vZHVsZXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gUGF0aC5qb2luKGdldEZpeHR1cmVzUGF0aCgnbG9jYWwtZXNsaW50JyksICdsaWInLCAnZm9vLmpzJylcbiAgICAgIGNvbnN0IGVzbGludCA9IEhlbHBlcnMuZ2V0RVNMaW50SW5zdGFuY2UoZmlsZURpciwge30pXG4gICAgICBleHBlY3QoZXNsaW50KS50b0JlKCdsb2NhdGVkJylcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRDb25maWdQYXRoJywgKCkgPT4ge1xuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWxlRGlyID0gZ2V0Rml4dHVyZXNQYXRoKFBhdGguam9pbignY29uZmlncycsICduby1leHQnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG4gICAgaXQoJ2ZpbmRzIC5lc2xpbnRyYy55YW1sJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAneWFtbCcpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMueWFtbCcpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICAgIGl0KCdmaW5kcyAuZXNsaW50cmMueW1sJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAneW1sJykpXG4gICAgICBjb25zdCBleHBlY3RlZFBhdGggPSBQYXRoLmpvaW4oZmlsZURpciwgJy5lc2xpbnRyYy55bWwnKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuZ2V0Q29uZmlnUGF0aChmaWxlRGlyKSkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcbiAgICBpdCgnZmluZHMgLmVzbGludHJjLmpzJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAnanMnKSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGguam9pbihmaWxlRGlyLCAnLmVzbGludHJjLmpzJylcbiAgICAgIGV4cGVjdChIZWxwZXJzLmdldENvbmZpZ1BhdGgoZmlsZURpcikpLnRvQmUoZXhwZWN0ZWRQYXRoKVxuICAgIH0pXG4gICAgaXQoJ2ZpbmRzIC5lc2xpbnRyYy5qc29uJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZURpciA9IGdldEZpeHR1cmVzUGF0aChQYXRoLmpvaW4oJ2NvbmZpZ3MnLCAnanNvbicpKVxuICAgICAgY29uc3QgZXhwZWN0ZWRQYXRoID0gUGF0aC5qb2luKGZpbGVEaXIsICcuZXNsaW50cmMuanNvbicpXG4gICAgICBleHBlY3QoSGVscGVycy5nZXRDb25maWdQYXRoKGZpbGVEaXIpKS50b0JlKGV4cGVjdGVkUGF0aClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRSZWxhdGl2ZVBhdGgnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybiBwYXRoIHJlbGF0aXZlIG9mIGlnbm9yZSBmaWxlIGlmIGZvdW5kJywgKCkgPT4ge1xuICAgICAgY29uc3QgZml4dHVyZURpciA9IGdldEZpeHR1cmVzUGF0aCgnZXNsaW50aWdub3JlJylcbiAgICAgIGNvbnN0IGZpeHR1cmVGaWxlID0gUGF0aC5qb2luKGZpeHR1cmVEaXIsICdpZ25vcmVkLmpzJylcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEhlbHBlcnMuZ2V0UmVsYXRpdmVQYXRoKGZpeHR1cmVEaXIsIGZpeHR1cmVGaWxlLCB7fSlcbiAgICAgIGNvbnN0IGV4cGVjdGVkUGF0aCA9IFBhdGgucmVsYXRpdmUoUGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJyksIGZpeHR1cmVGaWxlKVxuICAgICAgZXhwZWN0KHJlbGF0aXZlUGF0aCkudG9CZShleHBlY3RlZFBhdGgpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgcmV0dXJuIHBhdGggcmVsYXRpdmUgdG8gaWdub3JlIGZpbGUgaWYgY29uZmlnIG92ZXJyaWRlcyBpdCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpeHR1cmVEaXIgPSBnZXRGaXh0dXJlc1BhdGgoJ2VzbGludGlnbm9yZScpXG4gICAgICBjb25zdCBmaXh0dXJlRmlsZSA9IFBhdGguam9pbihmaXh0dXJlRGlyLCAnaWdub3JlZC5qcycpXG4gICAgICBjb25zdCByZWxhdGl2ZVBhdGggPVxuICAgICAgICBIZWxwZXJzLmdldFJlbGF0aXZlUGF0aChmaXh0dXJlRGlyLCBmaXh0dXJlRmlsZSwgeyBkaXNhYmxlRXNsaW50SWdub3JlOiB0cnVlIH0pXG4gICAgICBleHBlY3QocmVsYXRpdmVQYXRoKS50b0JlKCdpZ25vcmVkLmpzJylcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==
//# sourceURL=/home/anirudh/.atom/packages/linter-eslint/spec/worker-helpers-spec.js
