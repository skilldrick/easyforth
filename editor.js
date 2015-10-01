'use strict';

function Editor(selector) {
  var forth = new Forth();

  var $editor = $(selector);
  var $text = $editor.find(".text");
  var $prevLines = $text.find(".prev-lines");
  var $input = $text.find(".input");

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
      var output = forth.readLine(codeLine) || "";
      addLine(codeLine, output);
    });

    $(".stack-viewer").text(forth.getStack());
    $input.val("");
  }

  function adjustScroll() {
    $text.scrollTop($text[0].scrollHeight);
  }

  $input.on("keydown", function (e) {
    if (e.keyCode === 13) { // Enter/Return
      e.preventDefault(); // don't actually insert newline
      readInput();
      adjustScroll();
    }
  });

  $editor.click(function (e) {
    // Don't include clicks on prev lines or we won't be able to select that text
    if ($(e.target).closest('.prev-lines').length === 0) {
      $input.focus();
    }
  });
}

var editor = Editor(".editor");
