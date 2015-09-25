function Editor(selector) {
  var forth = new Forth();

  var $editor = $(selector);
  var $prevLines = $editor.find(".prev-lines");
  var $input = $editor.find(".input");

  function addLine(code, output) {
    var $codeSpan = $("<span>").addClass("code").text(code);
    var $outputSpan = $("<span>").addClass("output").text(output);
    var $newLine = $("<p>").append($codeSpan, $outputSpan);
    $newLine.appendTo($prevLines);
  }

  function readInput() {
    var code = $input.val();
    // handle multiple lines - this will only come up when text is pasted
    code.split("\n").forEach(function (codeLine) {
      addLine(codeLine, forth.readLine(codeLine));
    });
    $input.val("");
  }

  function adjustScroll() {
    $editor.scrollTop($editor[0].scrollHeight);
  }

  $input.on("keydown", function (e) {
    if (e.keyCode === 13) { // Enter/Return
      e.preventDefault(); // don't actually insert newline
      readInput();
      adjustScroll();
    }
  });

  $editor.click(function () {
    $input.focus();
  });
}

var editor = Editor("#text");
