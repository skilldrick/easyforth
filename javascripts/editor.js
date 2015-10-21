'use strict';

function Editor(selectorOrElement) {
  // Forth() returns a promise of forth
  Forth().then(function (forth) {
    var $editor = $(selectorOrElement);
    var $text = $editor.find(".text");
    var $prevLines = $text.find(".prev-lines");
    var $input = $text.find(".input");
    var $stack = $editor.find(".stack-viewer");
    var $window = $(window);

    function addLine(code) {
      var $codeSpan = $("<span>").addClass("code").text(code);
      var $spacer = $("<span> </span>");
      var $newLine = $("<p>").append($codeSpan, $spacer);
      $newLine.appendTo($prevLines);
      return $newLine;
    }

    function addOutput($line, output) {
      var $outputSpan = $("<span>").addClass("output").text(output);
      $line.append($outputSpan);
    }

    function updateStack() {
      $stack.text(forth.getStack());
    }

    function readInput() {
      var code = $input.val();
      var codeLines = code.split("\n");

      var $line;

      // Handle multiple lines - this will only come up when text is pasted.
      forth.readLines(codeLines, function (codeLine) {
        $line = addLine(codeLine);
      }, function (output) {
        addOutput($line, output);
        updateStack();
      });

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
  });
}

$(".editor").each(function (i, el) {
  Editor(el);
});
