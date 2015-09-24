function Editor(selector) {
  var forth = new Forth();

  var $editor = $(selector);
  var $prevLines = $editor.find(".prev-lines");
  var $input = $editor.find("input");

  function addLine(code, output) {
    var $codeSpan = $("<span>").addClass("code").text(code);
    var $outputSpan = $("<span>").addClass("output").text(output);
    var $newLine = $("<p>").append($codeSpan, $outputSpan);
    $newLine.appendTo($prevLines);
  }

  $input.on("keydown", function (e) {
    if (e.keyCode === 13) { // Enter/Return
      var code = $input.val();
      $input.val("");
      addLine(code, forth.readLine(code));
    }
  });
}

var editor = Editor("#text");
