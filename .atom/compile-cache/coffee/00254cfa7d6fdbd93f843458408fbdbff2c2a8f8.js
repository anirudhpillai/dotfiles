(function() {
  module.exports = {
    ignoreWhitespace: {
      title: 'Ignore Whitespace',
      description: 'Will not diff whitespace when this box is checked.',
      type: 'boolean',
      "default": false
    },
    diffWords: {
      title: 'Show Word Diff',
      description: 'Diffs the words between each line when this box is checked.',
      type: 'boolean',
      "default": true
    },
    syncHorizontalScroll: {
      title: 'Sync Horizontal Scroll',
      description: 'Syncs the horizontal scrolling of the editors.',
      type: 'boolean',
      "default": false
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red']
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red']
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9jb25maWctc2NoZW1hLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxnQkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sbUJBQVA7QUFBQSxNQUNBLFdBQUEsRUFBYSxvREFEYjtBQUFBLE1BRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxNQUdBLFNBQUEsRUFBUyxLQUhUO0tBREY7QUFBQSxJQUtBLFNBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLGdCQUFQO0FBQUEsTUFDQSxXQUFBLEVBQWEsNkRBRGI7QUFBQSxNQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsTUFHQSxTQUFBLEVBQVMsSUFIVDtLQU5GO0FBQUEsSUFVQSxvQkFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sd0JBQVA7QUFBQSxNQUNBLFdBQUEsRUFBYSxnREFEYjtBQUFBLE1BRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxNQUdBLFNBQUEsRUFBUyxLQUhUO0tBWEY7QUFBQSxJQWVBLGVBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsTUFDQSxXQUFBLEVBQWEsb0RBRGI7QUFBQSxNQUVBLElBQUEsRUFBTSxRQUZOO0FBQUEsTUFHQSxTQUFBLEVBQVMsT0FIVDtBQUFBLE1BSUEsTUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FKTjtLQWhCRjtBQUFBLElBcUJBLGdCQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxvQkFBUDtBQUFBLE1BQ0EsV0FBQSxFQUFhLHFEQURiO0FBQUEsTUFFQSxJQUFBLEVBQU0sUUFGTjtBQUFBLE1BR0EsU0FBQSxFQUFTLEtBSFQ7QUFBQSxNQUlBLE1BQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBSk47S0F0QkY7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/git-time-machine/node_modules/split-diff/lib/config-schema.coffee
