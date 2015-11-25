'use strict';

function Editor(selectorOrElement) {
  // Forth takes a callback that is passed a forth
  Forth(function (forth) {
    var $editor = $(selectorOrElement);
    var $text = $editor.find(".text");
    var $prevLines = $text.find(".prev-lines");
    var $input = $text.find(".input");
    var $stack = $editor.find(".stack-viewer");
    var graphics = Graphics($editor.find(".canvas"));
    var $window = $(window);
    var lineBuffer = [""]; // Start line buffer with blank line
    var selectedLine = null; // Set this to null to reset selected line
    var inputHidden = false;

    function addLine(code) {
      selectedLine = null;
      lineBuffer.push(code);
      var $codeSpan = $("<span>").addClass("code").text(code);
      var $spacer = $("<span> </span>");
      var $newLine = $("<p>").append($codeSpan, $spacer);
      $newLine.appendTo($prevLines);
      return $newLine;
    }

    function addOutput($line, output) {
      if (output == undefined) return;
      var $outputSpan = $("<span>").addClass("output").text(output);
      $line.append($outputSpan);
      adjustScroll();
    }

    function updateStack() {
      $stack.text(forth.getStack());
    }

    function hideInput() {
      inputHidden = true;
      $input.addClass('hide');
    }

    function showInput() {
      inputHidden = false;
      $input.removeClass('hide');
    }

    function readInput() {
      var code = $input.val();
      var codeLines = code.split("\n");

      var $line;

      hideInput();

      // Handle multiple lines - this will only come up when text is pasted.
      forth.readLines(codeLines, {
        lineCallback: function (codeLine) {
          $line = addLine(codeLine);
        },
        outputCallback: function (output) {
          addOutput($line, output);
        }
      }, function () {
        updateStack();
        showInput();
      });

      $input.val("");
    }

    function adjustScroll() {
      $text.scrollTop($text[0].scrollHeight);
    }

    function selectLine() {
      $input.val(lineBuffer[selectedLine]);
    }

    function selectPreviousLine() {
      if (selectedLine === null || selectedLine === 0) {
        selectedLine = lineBuffer.length - 1;
      } else {
        selectedLine--;
      }

      selectLine();
    }

    function selectNextLine() {
      if (selectedLine === null || selectedLine === lineBuffer.length - 1) {
        selectedLine = 0;
      } else {
        selectedLine++;
      }

      selectLine();
    }

    if (graphics) {
      forth.setMemoryHandler(function (address, value, baseAddress) {
        graphics.drawPixel(address - baseAddress, value);
      });
    }

    $input.on("keydown", function (e) {
      if (inputHidden) { // any time the input is hidden, send keys to forth
        forth.keydown(e.keyCode);
        e.preventDefault();
      } else if (e.keyCode === 13) { // Enter/Return
        e.preventDefault(); // don't actually insert newline
        readInput();
        adjustScroll();
      } else if (e.keyCode === 38) { // Up
        e.preventDefault();
        selectPreviousLine();
      } else if (e.keyCode == 40) { // Down
        e.preventDefault();
        selectNextLine();
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

    // If input is pre-filled, run it on-load
    if ($input.val()) {
      readInput();
    }
  });
}

$(".editor").each(function (i, el) {
  Editor(el);
});
