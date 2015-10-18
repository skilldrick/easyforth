'use strict';

function Editor(selectorOrElement) {
  var forth = new Forth();

  var $editor = $(selectorOrElement);
  var $text = $editor.find(".text");
  var $prevLines = $text.find(".prev-lines");
  var $input = $text.find(".input");
  var $stack = $editor.find(".stack-viewer");
  var $window = $(window);

  function addLine(code, output) {
    var $codeSpan = $("<span>").addClass("code").text(code);
    var $outputSpan = $("<span>").addClass("output").text(output);
    var $newLine = $("<p>").append($codeSpan, $outputSpan);
    $newLine.appendTo($prevLines);
  }

  function updateStack() {
    $stack.text(forth.getStack());
  }

  function readInput() {
    var code = $input.val();

    // handle multiple lines - this will only come up when text is pasted
    code.split("\n").forEach(function (codeLine) {
      // This will break if multiple lines are pasted and one of them
      // contains a command that will pause execution of that line
      forth.readLine(codeLine, function (output) {
        addLine(codeLine, output);
      });
    });

    updateStack();
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

  var isMobile = window.matchMedia("only screen and (max-width: 720px)").matches;
  if (!isMobile) {
    $window.scroll(function () {
      var inputTop = $input.offset().top;
      var scrollTop = $window.scrollTop();
      var windowHeight = $window.height();
      var inputInWindow = inputTop > scrollTop && inputTop < scrollTop + windowHeight;
      if (inputInWindow) {
        $input.focus();
      }
    });
  }

  updateStack();
}

$(".editor").each(function (i, el) {
  Editor(el);
});
