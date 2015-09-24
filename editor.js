function Editor(selector) {
  var forth = new Forth();

  var $editor = $(selector);
  var $prevLines = $editor.find(".prev-lines");
  var $input = $editor.find("input");

  function addLine(text) {
    var $newLine = $("<p>").text(text);
    $newLine.appendTo($prevLines);
  }

  $input.on("keydown", function (e) {
    if (e.keyCode === 13) { // Enter/Return
      addLine($input.val());
      $input.val("");
    }
  });
}

var editor = Editor("#text");
