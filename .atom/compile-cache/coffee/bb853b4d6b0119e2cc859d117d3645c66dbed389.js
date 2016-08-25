(function() {
  module.exports = {
    'JavaScript (JSX)': {
      regex: ["(^|\\s|\\.){word}\\s*[:=]\\s*function\\s*\\(", "(^|\\s)function\\s+{word}\\s*\\(", "(^|\\s){word}\\([\\s\\S]*?\\)\\s*{", "(^|\\s)class\\s+{word}(\\s|$)"],
      type: ["*.jsx", "*.js", "*.html"]
    },
    CoffeeScript: {
      regex: ["(^|\\s)class\\s+{word}(\\s|$)", "(^|\\s|\\.){word}\\s*[:=]\\s*(\\([\\s\\S]*?\\))?\\s*[=-]>", "(^|\\s|\\.){word}\\s*[:=]\\s*function\\s*\\(", "(^|\\s)function\\s+{word}\\s*\\(", "(^|\\s){word}\\([\\s\\S]*?\\)\\s*{"],
      type: ["*.coffee", "*.js", "*.html"]
    },
    TypeScript: {
      regex: ["(^|\\s)class\\s+{word}(\\s|$)", "(^|\\s|\\.){word}\\s*[:=]\\s*(\\([\\s\\S]*?\\))?\\s*[=-]>", "(^|\\s|\\.){word}\\s*[:=]\\s*function\\s*\\(", "(^|\\s)function\\s+{word}\\s*\\(", "(^|\\s){word}\\([\\s\\S]*?\\)\\s*{"],
      type: ["*.ts", "*.html"]
    },
    Python: {
      regex: ["(^|\\s)class\\s+{word}\\s*\\(", "(^|\\s)def\\s+{word}\\s*\\("],
      type: ["*.py"]
    },
    PHP: {
      regex: ["(^|\\s)class\\s+{word}(\\s|{|$)", "(^|\\s)interface\\s+{word}(\\s|{|$)", "(^|\\s)(static\\s+)?((public|private|protected)\\s+)?(static\\s+)?function\\s+{word}\\s*\\("],
      type: ["*.php"]
    },
    Hack: {
      regex: ["(^|\\s)class\\s+{word}(\\s|{|$)", "(^|\\s)interface\\s+{word}(\\s|{|$)", "(^|\\s)(static\\s+)?((public|private|protected)\\s+)?(static\\s+)?function\\s+{word}\\s*\\("],
      type: ["*.hh"]
    },
    Ruby: {
      regex: ["(^|\\s)class\\s+{word}(\\s|$)", "(^|\\s)module\\s+{word}(\\s|$)", "(^|\\s)def\\s+(?:self\\.)?{word}\\s*\\(?", "(^|\\s)define_method\\s+:?{word}\\s*\\(?"],
      type: ["*.rb"]
    },
    KRL: {
      regex: ["(^|\\s)DEF\\s+{word}\\s*\\(", "(^|\\s)DECL\\s+\\w*?{word}\\s*\\=?", "(^|\\s)(SIGNAL|INT|BOOL|REAL|STRUC|CHAR|ENUM|EXT|\\s)\\s*\\w*{word}.*"],
      type: ["*.src", "*.dat"]
    },
    Perl: {
      regex: ["(^|\\s)sub\\s+{word}\\s*\\{", "(^|\\s)package\\s+(\\w+::)*{word}\\s*\\;"],
      type: ["*.pm", "*.pl"]
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvYW5pcnVkaC8uYXRvbS9wYWNrYWdlcy9nb3RvLWRlZmluaXRpb24vbGliL2NvbmZpZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsa0JBQUEsRUFDRTtBQUFBLE1BQUEsS0FBQSxFQUFPLENBQ0wsOENBREssRUFFTCxrQ0FGSyxFQUdMLG9DQUhLLEVBSUwsK0JBSkssQ0FBUDtBQUFBLE1BTUEsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsUUFBbEIsQ0FOTjtLQURGO0FBQUEsSUFTQSxZQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUNMLCtCQURLLEVBRUwsMkRBRkssRUFHTCw4Q0FISyxFQUlMLGtDQUpLLEVBS0wsb0NBTEssQ0FBUDtBQUFBLE1BT0EsSUFBQSxFQUFNLENBQUMsVUFBRCxFQUFhLE1BQWIsRUFBcUIsUUFBckIsQ0FQTjtLQVZGO0FBQUEsSUFtQkEsVUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sQ0FDTCwrQkFESyxFQUVMLDJEQUZLLEVBR0wsOENBSEssRUFJTCxrQ0FKSyxFQUtMLG9DQUxLLENBQVA7QUFBQSxNQU9BLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxRQUFULENBUE47S0FwQkY7QUFBQSxJQTZCQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUNMLCtCQURLLEVBRUwsNkJBRkssQ0FBUDtBQUFBLE1BSUEsSUFBQSxFQUFNLENBQUMsTUFBRCxDQUpOO0tBOUJGO0FBQUEsSUFvQ0EsR0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sQ0FDTCxpQ0FESyxFQUVMLHFDQUZLLEVBR0wsNkZBSEssQ0FBUDtBQUFBLE1BS0EsSUFBQSxFQUFNLENBQUMsT0FBRCxDQUxOO0tBckNGO0FBQUEsSUE0Q0EsSUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sQ0FDTCxpQ0FESyxFQUVMLHFDQUZLLEVBR0wsNkZBSEssQ0FBUDtBQUFBLE1BS0EsSUFBQSxFQUFNLENBQUMsTUFBRCxDQUxOO0tBN0NGO0FBQUEsSUFvREEsSUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sQ0FDTCwrQkFESyxFQUVMLGdDQUZLLEVBR0wsMENBSEssRUFJTCwwQ0FKSyxDQUFQO0FBQUEsTUFNQSxJQUFBLEVBQU0sQ0FBQyxNQUFELENBTk47S0FyREY7QUFBQSxJQTZEQSxHQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUNMLDZCQURLLEVBRUwsb0NBRkssRUFHTCx1RUFISyxDQUFQO0FBQUEsTUFLQSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVMsT0FBVCxDQUxOO0tBOURGO0FBQUEsSUFxRUEsSUFBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sQ0FDTCw2QkFESyxFQUVMLDBDQUZLLENBQVA7QUFBQSxNQUlBLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUSxNQUFSLENBSk47S0F0RUY7R0FERixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/anirudh/.atom/packages/goto-definition/lib/config.coffee
