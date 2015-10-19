describe('Forth', function () {
  var forth;

  beforeEach(function () {
    forth = new Forth();
  });

  describe('readLine', function () {
    it('reads and executes a line of Forth', function () {
      var output = collectOutput(forth.readLine, "10 20 30");
      expect(forth.getStack()).toBe("10 20 30 <- Top ");
      expect(output).toBe(" ok");
    });

    it('handles weird spacing', function () {
      forth.readLine("100\t200    300  ");
      expect(forth.getStack()).toBe("100 200 300 <- Top ");
    });
  });

  describe('predefined words', function () {
    describe('arithmetic', function () {
      describe('+', function () {
        it('adds numbers on the stack', function () {
          forth.readLine("10");
          expect(forth.getStack()).toBe("10 <- Top ");
          forth.readLine("3 4 +");
          expect(forth.getStack()).toBe("10 7 <- Top ");
          forth.readLine("+");
          expect(forth.getStack()).toBe("17 <- Top ");
        });

        it('outputs Stack underflow when there is an underflow', function () {
          forth.readLine("10");
          var output = collectOutput(forth.readLine, "+");
          expect(output).toBe(" Stack underflow");
        });
      });

      describe('*', function () {
        it('multiplies numbers on the stack', function () {
          forth.readLine("10");
          forth.readLine("22 4 *");
          expect(forth.getStack()).toBe("10 88 <- Top ");
        });
      });

      describe('/', function () {
        it('divides numbers on the stack', function () {
          forth.readLine("10");
          forth.readLine("22 4 /");
          expect(forth.getStack()).toBe("10 5 <- Top ");
        });
      });

      describe('mod', function () {
        it('mods numbers on the stack', function () {
          forth.readLine("10");
          forth.readLine("22 4 mod");
          expect(forth.getStack()).toBe("10 2 <- Top ");
        });
      });

      describe('/mod', function () {
        it('mods and divides numbers on the stack', function () {
          forth.readLine("10");
          forth.readLine("22 4 /mod");
          expect(forth.getStack()).toBe("10 2 5 <- Top ");
        });
      });
    });

    describe('comparison', function () {
      describe('=', function () {
        it('compares numbers on the stack for equality', function () {
          forth.readLine("10");
          forth.readLine("5 5 =");
          expect(forth.getStack()).toBe("10 -1 <- Top ");

          forth.readLine("4 5 =");
          expect(forth.getStack()).toBe("10 -1 0 <- Top ");
        });
      });

      describe('<', function () {
        it('checks to see if second item is less than top item on stack', function () {
          forth.readLine("10");
          forth.readLine("5 4 <");
          expect(forth.getStack()).toBe("10 0 <- Top ");

          forth.readLine("4 5 <");
          expect(forth.getStack()).toBe("10 0 -1 <- Top ");
        });
      });

      describe('>', function () {
        it('checks to see if second item is more than top item on stack', function () {
          forth.readLine("10");
          forth.readLine("5 4 >");
          expect(forth.getStack()).toBe("10 -1 <- Top ");

          forth.readLine("4 5 >");
          expect(forth.getStack()).toBe("10 -1 0 <- Top ");
        });
      });
    });

    describe('stack manipulation', function () {
      describe('swap', function () {
        it('swaps the top two items', function () {
          forth.readLine("10 5");
          expect(forth.getStack()).toBe("10 5 <- Top ");
          forth.readLine("swap");
          expect(forth.getStack()).toBe("5 10 <- Top ");
        });
      });

      describe('dup', function () {
        it('duplicates the top item', function () {
          forth.readLine("10 5");
          expect(forth.getStack()).toBe("10 5 <- Top ");
          forth.readLine("dup");
          expect(forth.getStack()).toBe("10 5 5 <- Top ");
        });
      });

      describe('over', function () {
        it('copies the second item to the top', function () {
          forth.readLine("10 5");
          expect(forth.getStack()).toBe("10 5 <- Top ");
          forth.readLine("over");
          expect(forth.getStack()).toBe("10 5 10 <- Top ");
        });
      });

      describe('rot', function () {
        it('rotates the top three items', function () {
          forth.readLine("1 2 3");
          expect(forth.getStack()).toBe("1 2 3 <- Top ");
          forth.readLine("rot");
          expect(forth.getStack()).toBe("2 3 1 <- Top ");
        });
      });

      describe('drop', function () {
        it('drops the top item', function () {
          forth.readLine("1 2 3");
          expect(forth.getStack()).toBe("1 2 3 <- Top ");
          forth.readLine("drop");
          expect(forth.getStack()).toBe("1 2 <- Top ");
        });
      });
    });

    describe('output', function () {
      describe('.', function () {
        it('pops and outputs the top of the stack as a number', function () {
          var output = collectOutput(forth.readLine, "1 2 3 .");
          expect(forth.getStack()).toBe("1 2 <- Top ");
          expect(output).toBe("3  ok");
        });
      });

      describe('.s', function () {
        it('outputs the contents of the stack', function () {
          var output = collectOutput(forth.readLine, "1 2 3 .s");
          expect(forth.getStack()).toBe("1 2 3 <- Top ");
          expect(output).toBe("\n1 2 3 <- Top  ok");
        });
      });

      describe('cr', function () {
        it('outputs a newline', function () {
          var output = collectOutput(forth.readLine, "1 2 . cr .");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("2 \n1  ok");
        });
      });

      describe('space', function () {
        it('outputs a space', function () {
          var output = collectOutput(forth.readLine, "1 2 . space space .");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("2   1  ok");
        });
      });

      describe('spaces', function () {
        it('outputs n (top of stack) spaces', function () {
          var output = collectOutput(forth.readLine, "1 2 . 5 spaces .");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("2      1  ok");
        });
      });

      describe('emit', function () {
        it('outputs top of stack as ascii character', function () {
          var output = collectOutput(forth.readLine, "99 emit");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("c ok");

          output = collectOutput(forth.readLine, "108 111 111 99 emit emit emit emit");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("cool ok");
        });
      });
    });

    describe('defining words', function () {
      describe(': ;', function () {
        it('defines a new word', function () {
          var output = collectOutput(forth.readLine, ": add-10  10 + ;");
          expect(output).toBe(" ok");
          forth.readLine("5 add-10");
          expect(forth.getStack()).toBe("15 <- Top ");
        });

        describe('with code before and after', function () {
          it('executes code before and after, and defines word', function () {
            var output = collectOutput(forth.readLine, "100 : add-10  10 + ; 200");
            expect(output).toBe(" ok");
            forth.readLine("5 add-10");
            expect(forth.getStack()).toBe("100 200 15 <- Top ");
          });
        });

        describe('over multiple lines', function () {
          it('uses all lines for word definition', function () {
            var output = collectOutput(forth.readLine, ": add-20  10 + ");
            expect(output).toBe(""); // no output should be produced
            output = collectOutput(forth.readLine, " 5 + ");
            expect(output).toBe(""); // no output should be produced
            output = collectOutput(forth.readLine, " 5 + ; ");
            expect(output).toBe(" ok"); // output ok after definition
            forth.readLine("5 add-20");
            expect(forth.getStack()).toBe("25 <- Top ");
          });
        });

        describe('with missing words in definition', function () {
          it('outputs error and stops definition', function () {
            var output = collectOutput(forth.readLine, ": add-20  10 + foo ");
            expect(output).toBe(" foo ? "); // output error
            output = collectOutput(forth.readLine, "5 5 + .");
            expect(output).toBe("10  ok"); // output because definition has finished
          });
        });
      });
    });

    describe('missing words', function () {
      it('outputs error', function () {
        var output = collectOutput(forth.readLine, "10 10 + foo ");
        expect(output).toBe(" foo ? ");
      });
    });

    describe('control structures', function () {
      describe('if/else/then', function () {
        describe('with true condition', function () {
          it('executes consequent', function () {
            forth.readLine(": foo  -1 if 1 else 2 then 3 ; ");
            forth.readLine("foo");
            expect(forth.getStack()).toBe("1 3 <- Top ");
          });
        });

        describe('with false condition', function () {
          it('executes alternative', function () {
            forth.readLine(": foo  0 if 1 else 2 then 3 ; ");
            forth.readLine("foo");
            expect(forth.getStack()).toBe("2 3 <- Top ");
          });
        });

        describe('nested structures', function () {
          it('executes the correct parts', function () {
            forth.readLine(": foo  0 if 0 else -1 if 1 else 2 then then ; ");
            forth.readLine("foo");
            expect(forth.getStack()).toBe("1 <- Top ");
          });

          describe('with output', function () {
            it('executes the correct parts with output', function () {
              forth.readLine(': foo  0 if ." if1 " 0 else ." else1 "');
              forth.readLine('  -1 if ." if2 " 1 else ." else2 " 2 then then ; ');
              var output = collectOutput(forth.readLine, "foo");
              expect(forth.getStack()).toBe("1 <- Top ");
              expect(output).toBe("else1 if2  ok");
            });
          });

          describe('complexly nested', function () {
            it('executes the correct parts', function () {
              // example from http://www.forth.com/starting-forth/sf4/sf4.html
              forth.readLine(': eggsize   dup  18 < if  ." reject "      else');
              forth.readLine('            dup  21 < if  ." small "       else');
              forth.readLine('            dup  24 < if  ." medium "      else');
              forth.readLine('            dup  27 < if  ." large "       else');
              forth.readLine('            dup  30 < if  ." extra large " else');
              forth.readLine('                    ." error "');
              forth.readLine('            then then then then then drop ;');

              var output = collectOutput(forth.readLine, '23 eggsize');
              expect(output).toBe("medium  ok");

              output = collectOutput(forth.readLine, '29 eggsize');
              expect(output).toBe("extra large  ok");

              output = collectOutput(forth.readLine, '31 eggsize');
              expect(output).toBe("error  ok");

              expect(forth.getStack()).toBe(" <- Top ");
            });
          });
        });
      });

      describe('do/loop', function () {
        it('loops', function () {
          forth.readLine(': foo  4 0 do ." hello! " loop ; ');
          var output = collectOutput(forth.readLine, "foo");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("hello! hello! hello! hello!  ok");
        });

        it('loops, setting i to current index', function () {
          var output = collectOutput(forth.readLine, ': foo  4 0 do ." hello! " i . loop ; ');
          expect(output).toBe(" ok");
          output = collectOutput(forth.readLine, "foo");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("hello! 0 hello! 1 hello! 2 hello! 3  ok");
        });

        describe('nested loops', function () {
          it('loops, setting i and j to inner and outer indexes', function () {
            forth.readLine(': foo  3 0 do 2 0 do i . j . ."  " loop loop ; ');
            var output = collectOutput(forth.readLine, "foo");
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("0 0  1 0  0 1  1 1  0 2  1 2   ok");
          });
        });
      });

      describe('do/+loop', function () {
        it('loops', function () {
          forth.readLine(': foo  128 1 do i . i +loop ; ');
          var output = collectOutput(forth.readLine, "foo");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("1 2 4 8 16 32 64  ok");
        });
      });

      describe('begin/until', function () {
        it('loops', function () {
          forth.readLine(': foo  10 begin dup . 1- dup 0= until drop ; ');
          var output = collectOutput(forth.readLine, "foo");
          expect(forth.getStack()).toBe(" <- Top ");
          expect(output).toBe("10 9 8 7 6 5 4 3 2 1  ok");
        });
      });
    });

    describe('variables', function () {
      it('saves and retrieves values from different variables', function () {
        var output = collectOutput(forth.readLine, 'variable foo');
        expect(output).toBe(" ok");
        forth.readLine('variable bar');
        forth.readLine('foo bar');
        // this is testing an implementation detail, i.e. the particular memory addresses Memory uses
        expect(forth.getStack()).toBe("0 1 <- Top ");

        forth.readLine('100 foo !  200 bar !');
        expect(forth.getStack()).toBe("0 1 <- Top ");

        forth.readLine('foo @  bar @');
        expect(forth.getStack()).toBe("0 1 100 200 <- Top ");

        forth.readLine('10 cells allot');
        forth.readLine('variable baz');
        forth.readLine('baz');
        expect(forth.getStack()).toBe("0 1 100 200 12 <- Top ");
      });
    });

    describe('constants', function () {
      it('sets values in constants', function () {
        var output = collectOutput(forth.readLine, '10 constant foo');
        expect(output).toBe(" ok");
        forth.readLine('20 constant bar');
        forth.readLine('foo bar');
        expect(forth.getStack()).toBe("10 20 <- Top ");
      });
    });

  });

  function collectOutput(func, input) {
    var output = [];
    func(input, function (o) {
      output.push(o)
    });
    return output.join("");
  }

});
