
/*
  this is the expected data for the first five commits of test-data/fiveCommits.txt.
  Only the keys in these objects are tested against the actual first five commits read
  from git log
 */

(function() {
  module.exports = [
    {
      "id": "4d3547944bbac446b229838867bf60dd55289213",
      "authorName": "Bee",
      "authorDate": 1445053404,
      "message": "git-util-spec: fifth commit of spec/testData/fiveCommits.txt. only deleted a line",
      "hash": "4d35479",
      "linesAdded": 0,
      "linesDeleted": 2
    }, {
      "id": "fa4aee05281c12f2ba8c92eb1100964f98901caa",
      "authorName": "Bee",
      "authorDate": 1445053316,
      "message": "git-util-spec: forth commit of spec/testData/fiveCommits.txt",
      "hash": "fa4aee0",
      "linesAdded": 1,
      "linesDeleted": 0
    }, {
      "id": "010f49a2cf4fb08f7117782269ce8ede07e0797a",
      "authorName": "Bee",
      "authorDate": 1445053277,
      "message": "git-util-spec: third commit of spec/testData/fiveCommits.txt",
      "hash": "010f49a",
      "linesAdded": 2,
      "linesDeleted": 1
    }, {
      "id": "3d03801db29c1f9d92550c8bfed32b21c08ced4c",
      "authorName": "Bee",
      "authorDate": 1445053179,
      "message": "git-util-spec: load correct fully qualified test file name. plus second commit of fiveCommits.txt",
      "hash": "3d03801",
      "linesAdded": 2,
      "linesDeleted": 0
    }, {
      "id": "bb7b15fc68e681347185003ddb534366465c5b36",
      "authorName": "Bee",
      "authorDate": 1445052734,
      "message": "GitUtils.getFileCommitHistory should return valid data. +new failing test",
      "hash": "bb7b15f",
      "linesAdded": 7,
      "linesDeleted": 0
    }
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL3NwZWMvdGVzdC1kYXRhL2ZpdmVDb21taXRzRXhwZWN0ZWQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7OztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQztBQUFBLE1BQ2hCLElBQUEsRUFBTSwwQ0FEVTtBQUFBLE1BRWhCLFlBQUEsRUFBYyxLQUZFO0FBQUEsTUFHaEIsWUFBQSxFQUFjLFVBSEU7QUFBQSxNQUloQixTQUFBLEVBQVcsbUZBSks7QUFBQSxNQUtoQixNQUFBLEVBQVEsU0FMUTtBQUFBLE1BTWhCLFlBQUEsRUFBYyxDQU5FO0FBQUEsTUFPaEIsY0FBQSxFQUFnQixDQVBBO0tBQUQsRUFRZDtBQUFBLE1BQ0QsSUFBQSxFQUFNLDBDQURMO0FBQUEsTUFFRCxZQUFBLEVBQWMsS0FGYjtBQUFBLE1BR0QsWUFBQSxFQUFjLFVBSGI7QUFBQSxNQUlELFNBQUEsRUFBVyw4REFKVjtBQUFBLE1BS0QsTUFBQSxFQUFRLFNBTFA7QUFBQSxNQU1ELFlBQUEsRUFBYyxDQU5iO0FBQUEsTUFPRCxjQUFBLEVBQWdCLENBUGY7S0FSYyxFQWdCZDtBQUFBLE1BQ0QsSUFBQSxFQUFNLDBDQURMO0FBQUEsTUFFRCxZQUFBLEVBQWMsS0FGYjtBQUFBLE1BR0QsWUFBQSxFQUFjLFVBSGI7QUFBQSxNQUlELFNBQUEsRUFBVyw4REFKVjtBQUFBLE1BS0QsTUFBQSxFQUFRLFNBTFA7QUFBQSxNQU1ELFlBQUEsRUFBYyxDQU5iO0FBQUEsTUFPRCxjQUFBLEVBQWdCLENBUGY7S0FoQmMsRUF3QmQ7QUFBQSxNQUNELElBQUEsRUFBTSwwQ0FETDtBQUFBLE1BRUQsWUFBQSxFQUFjLEtBRmI7QUFBQSxNQUdELFlBQUEsRUFBYyxVQUhiO0FBQUEsTUFJRCxTQUFBLEVBQVcsbUdBSlY7QUFBQSxNQUtELE1BQUEsRUFBUSxTQUxQO0FBQUEsTUFNRCxZQUFBLEVBQWMsQ0FOYjtBQUFBLE1BT0QsY0FBQSxFQUFnQixDQVBmO0tBeEJjLEVBZ0NkO0FBQUEsTUFDRCxJQUFBLEVBQU0sMENBREw7QUFBQSxNQUVELFlBQUEsRUFBYyxLQUZiO0FBQUEsTUFHRCxZQUFBLEVBQWMsVUFIYjtBQUFBLE1BSUQsU0FBQSxFQUFXLDJFQUpWO0FBQUEsTUFLRCxNQUFBLEVBQVEsU0FMUDtBQUFBLE1BTUQsWUFBQSxFQUFjLENBTmI7QUFBQSxNQU9ELGNBQUEsRUFBZ0IsQ0FQZjtLQWhDYztHQUxqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/spec/test-data/fiveCommitsExpected.coffee
