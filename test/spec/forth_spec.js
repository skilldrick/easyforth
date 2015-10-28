describe('Forth', function () {
  var forth;

  beforeEach(function (done) {
    Forth().then(function (_forth) {
      forth = _forth;
      done();
    });
  });

  describe('readLine', function () {
    it('reads and executes a line of Forth', function (done) {
      collectOutput(forth.readLine, "10 20 30").then(function (output) {
        expect(forth.getStack()).toBe("10 20 30 <- Top ");
        expect(output).toBe(" ok");
        done();
      });
    });

    it('handles weird spacing', function (done) {
      forth.readLine("100\t200    300  ").then(function () {
        expect(forth.getStack()).toBe("100 200 300 <- Top ");
        done();
      });
    });
  });

  describe('predefined words', function () {
    describe('arithmetic', function () {
      describe('+', function () {
        it('adds numbers on the stack', function (done) {
          forth.readLine("10").then(function () {
            expect(forth.getStack()).toBe("10 <- Top ");
          }).then(function () {
            return forth.readLine("3 4 +");
          }).then(function () {
            expect(forth.getStack()).toBe("10 7 <- Top ");
          }).then(function () {
            return forth.readLine("+");
          }).then(function () {
            expect(forth.getStack()).toBe("17 <- Top ");
            done();
          });
        });

        it('outputs Stack underflow when there is an underflow', function (done) {
          forth.readLine("10").then(function () {
            return collectOutput(forth.readLine, "+");
          }).then(function (output) {
            expect(output).toBe(" Stack underflow");
            done();
          });
        });
      });

      describe('*', function () {
        it('multiplies numbers on the stack', function (done) {
          forth.readLines([
            "10",
            "22 4 *"
          ]).then(function () {
            expect(forth.getStack()).toBe("10 88 <- Top ");
            done();
          });
        });
      });

      describe('/', function () {
        it('divides numbers on the stack', function (done) {
          forth.readLine("10").then(function () {
            return forth.readLine("22 4 /");
          }).then(function () {
            expect(forth.getStack()).toBe("10 5 <- Top ");
            done();
          });
        });
      });

      describe('mod', function () {
        it('mods numbers on the stack', function (done) {
          forth.readLine("10").then(function () {
            return forth.readLine("22 4 mod");
          }).then(function () {
            expect(forth.getStack()).toBe("10 2 <- Top ");
            done();
          });
        });
      });

      describe('/mod', function () {
        it('mods and divides numbers on the stack', function (done) {
          forth.readLines([
            "10",
            "22 4 /mod"
          ]).then(function () {
            expect(forth.getStack()).toBe("10 2 5 <- Top ");
            done();
          });
        });
      });
    });

    describe('comparison', function () {
      describe('=', function () {
        it('compares numbers on the stack for equality', function (done) {
          forth.readLines([
            "10",
            "5 5 ="
          ]).then(function () {
            expect(forth.getStack()).toBe("10 -1 <- Top ");
          }).then(function () {
            return forth.readLine("4 5 =");
          }).then(function () {
            expect(forth.getStack()).toBe("10 -1 0 <- Top ");
            done();
          });
        });
      });

      describe('<', function () {
        it('checks to see if second item is less than top item on stack', function (done) {
          forth.readLines([
            "10",
            "5 4 <"
          ]).then(function () {
            expect(forth.getStack()).toBe("10 0 <- Top ");
          }).then(function () {
            return forth.readLine("4 5 <");
          }).then(function () {
            expect(forth.getStack()).toBe("10 0 -1 <- Top ");
            done();
          });
        });
      });

      describe('>', function () {
        it('checks to see if second item is more than top item on stack', function (done) {
          forth.readLines([
            "10",
            "5 4 >"
          ]).then(function () {
            expect(forth.getStack()).toBe("10 -1 <- Top ");
          }).then(function () {
            return forth.readLine("4 5 >");
          }).then(function () {
            expect(forth.getStack()).toBe("10 -1 0 <- Top ");
            done();
          });
        });
      });
    });

    describe('stack manipulation', function () {
      describe('swap', function () {
        it('swaps the top two items', function (done) {
          forth.readLine("10 5").then(function () {
            expect(forth.getStack()).toBe("10 5 <- Top ");
          }).then(function () {
            return forth.readLine("swap");
          }).then(function () {
            expect(forth.getStack()).toBe("5 10 <- Top ");
            done();
          });
        });
      });

      describe('dup', function () {
        it('duplicates the top item', function (done) {
          forth.readLine("10 5").then(function () {
            expect(forth.getStack()).toBe("10 5 <- Top ");
          }).then(function () {
            return forth.readLine("dup");
          }).then(function () {
            expect(forth.getStack()).toBe("10 5 5 <- Top ");
            done();
          });
        });
      });

      describe('over', function () {
        it('copies the second item to the top', function (done) {
          forth.readLine("10 5").then(function () {
            expect(forth.getStack()).toBe("10 5 <- Top ");
          }).then(function () {
            return forth.readLine("over");
          }).then(function () {
            expect(forth.getStack()).toBe("10 5 10 <- Top ");
            done();
          });
        });
      });

      describe('rot', function () {
        it('rotates the top three items', function (done) {
          forth.readLine("1 2 3").then(function () {
            expect(forth.getStack()).toBe("1 2 3 <- Top ");
          }).then(function () {
            return forth.readLine("rot");
          }).then(function () {
            expect(forth.getStack()).toBe("2 3 1 <- Top ");
            done();
          });
        });
      });

      describe('drop', function () {
        it('drops the top item', function (done) {
          forth.readLine("1 2 3").then(function () {
            expect(forth.getStack()).toBe("1 2 3 <- Top ");
          }).then(function () {
            return forth.readLine("drop");
          }).then(function () {
            expect(forth.getStack()).toBe("1 2 <- Top ");
            done();
          });
        });
      });
    });

    describe('output', function () {
      describe('.', function () {
        it('pops and outputs the top of the stack as a number', function (done) {
          collectOutput(forth.readLine, "1 2 3 .").then(function (output) {
            expect(forth.getStack()).toBe("1 2 <- Top ");
            expect(output).toBe("3  ok");
            done();
          });
        });
      });

      describe('.s', function () {
        it('outputs the contents of the stack', function (done) {
          collectOutput(forth.readLine, "1 2 3 .s").then(function (output) {
            expect(forth.getStack()).toBe("1 2 3 <- Top ");
            expect(output).toBe("\n1 2 3 <- Top  ok");
            done();
          });
        });
      });

      describe('cr', function () {
        it('outputs a newline', function (done) {
          collectOutput(forth.readLine, "1 2 . cr .").then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("2 \n1  ok");
            done();
          });
        });
      });

      describe('space', function () {
        it('outputs a space', function (done) {
          collectOutput(forth.readLine, "1 2 . space space .").then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("2   1  ok");
            done();
          });
        });
      });

      describe('spaces', function () {
        it('outputs n (top of stack) spaces', function (done) {
          collectOutput(forth.readLine, "1 2 . 5 spaces .").then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("2      1  ok");
            done();
          });
        });
      });

      describe('emit', function () {
        it('outputs top of stack as ascii character', function (done) {
          collectOutput(forth.readLine, "99 emit").then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("c ok");
          }).then(function () {
            return collectOutput(forth.readLine, "108 111 111 99 emit emit emit emit");
          }).then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("cool ok");
            done();
          });
        });
      });
    });

    describe('input', function () {
      describe('key', function () {
        it('pauses execution of line until key is pressed', function (done) {
          var promise = forth.readLine("1 key 2");

          // Run test in a setTimeout to simulate waiting for keyboard input
          setTimeout(function () {
            expect(forth.getStack()).toBe("1 <- Top ");
            forth.keydown(65);
            promise.then(function () {
              expect(forth.getStack()).toBe("1 65 2 <- Top ");
              done();
            });
          }, 5);
        });

        describe('in definition', function () {
          it('pauses execution of line until key is pressed', function (done) {
            var promise = forth.readLine(": foo  1 key 2 ;").then(function () {
              return forth.readLine("foo");
            });

            // Run test in a setTimeout to simulate waiting for keyboard input
            setTimeout(function () {
              expect(forth.getStack()).toBe("1 <- Top ");
              forth.keydown(65);
              promise.then(function () {
                expect(forth.getStack()).toBe("1 65 2 <- Top ");
                done();
              });
            }, 5);
          });
        });
      });
    });

    describe('defining words', function () {
      describe(': ;', function () {
        it('defines a new word', function (done) {
          collectOutput(forth.readLine, ": add-10  10 + ;").then(function (output) {
            expect(output).toBe(" ok");
          }).then(function () {
            return forth.readLine("5 add-10");
          }).then(function () {
            expect(forth.getStack()).toBe("15 <- Top ");
            done();
          });
        });

        describe('with code before and after', function () {
          it('executes code before and after, and defines word', function (done) {
            collectOutput(forth.readLine, "100 : add-10  10 + ; 200").then(function (output) {
              expect(output).toBe(" ok");
            }).then(function () {
              return forth.readLine("5 add-10");
            }).then(function () {
              expect(forth.getStack()).toBe("100 200 15 <- Top ");
              done();
            });
          });
        });

        describe('over multiple lines', function () {
          it('uses all lines for word definition', function (done) {
            collectOutput(forth.readLine, ": add-20  10 + ").then(function (output) {
              expect(output).toBe(""); // no output should be produced
            }).then(function () {
              return collectOutput(forth.readLine, " 5 + ");
            }).then(function (output) {
              expect(output).toBe(""); // no output should be produced
            }).then(function () {
              return collectOutput(forth.readLine, " 5 + ; ");
            }).then(function (output) {
              expect(output).toBe(" ok"); // output ok after definition
            }).then(function () {
              return forth.readLine("5 add-20");
            }).then(function () {
              expect(forth.getStack()).toBe("25 <- Top ");
              done();
            });
          });
        });

        describe('with missing words in definition', function () {
          it('outputs error and stops definition', function (done) {
            collectOutput(forth.readLine, ": add-20  10 + foo ").then(function (output) {
              expect(output).toBe(" foo ? "); // output error
            }).then(function () {
              return collectOutput(forth.readLine, "5 5 + .");
            }).then(function (output) {
              expect(output).toBe("10  ok"); // output because definition has finished
              done();
            });
          });
        });
      });
    });

    describe('missing words', function () {
      it('outputs error', function (done) {
        collectOutput(forth.readLine, "10 10 + foo ").then(function (output) {
          expect(output).toBe(" foo ? ");
          done();
        });
      });
    });

    describe('control structures', function () {
      describe('if/else/then', function () {
        describe('with true condition', function () {
          it('executes consequent', function (done) {
            forth.readLines([
              ": foo  -1 if 1 else 2 then 3 ; ",
              "foo"
            ]).then(function () {
              expect(forth.getStack()).toBe("1 3 <- Top ");
              done();
            });
          });
        });

        describe('with false condition', function () {
          it('executes alternative', function (done) {
            forth.readLines([
              ": foo  0 if 1 else 2 then 3 ; ",
              "foo"
            ]).then(function () {
              expect(forth.getStack()).toBe("2 3 <- Top ");
              done();
            });
          });
        });

        describe('nested structures', function () {
          it('executes the correct parts', function (done) {
            forth.readLines([
              ": foo  0 if 0 else -1 if 1 else 2 then then ; ",
              "foo"
            ]).then(function () {
              expect(forth.getStack()).toBe("1 <- Top ");
              done();
            });
          });

          describe('with output', function () {
            it('executes the correct parts with output', function (done) {
              forth.readLines([
                ': foo  0 if ." if1 " 0 else ." else1 "',
                '  -1 if ." if2 " 1 else ." else2 " 2 then then ; '
              ]).then(function () {
                return collectOutput(forth.readLine, "foo");
              }).then(function (output) {
                expect(forth.getStack()).toBe("1 <- Top ");
                expect(output).toBe("else1 if2  ok");
                done();
              });
            });
          });

          describe('complexly nested', function () {
            it('executes the correct parts', function (done) {
              // example from http://www.forth.com/starting-forth/sf4/sf4.html
              forth.readLines([
                ': eggsize   dup  18 < if  ." reject "      else',
                '            dup  21 < if  ." small "       else',
                '            dup  24 < if  ." medium "      else',
                '            dup  27 < if  ." large "       else',
                '            dup  30 < if  ." extra large " else',
                '                    ." error "',
                '            then then then then then drop ;'
              ]).then(function () {
                return collectOutput(forth.readLine, '23 eggsize');
              }).then(function (output) {
                expect(output).toBe("medium  ok");
              }).then(function () {
                return collectOutput(forth.readLine, '29 eggsize');
              }).then(function (output) {
                expect(output).toBe("extra large  ok");
              }).then(function () {
                return collectOutput(forth.readLine, '31 eggsize');
              }).then(function (output) {
                expect(output).toBe("error  ok");
                expect(forth.getStack()).toBe(" <- Top ");
                done();
              });
            });
          });
        });
      });

      describe('do/loop', function () {
        it('loops', function (done) {
          forth.readLine(': foo  4 0 do ." hello! " loop ; ').then(function () {
            return collectOutput(forth.readLine, "foo");
          }).then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("hello! hello! hello! hello!  ok");
            done();
          });
        });

        it('loops, setting i to current index', function (done) {
          collectOutput(forth.readLine, ': foo  4 0 do ." hello! " i . loop ; ').then(function (output) {
            expect(output).toBe(" ok");
          }).then(function () {
            return collectOutput(forth.readLine, "foo");
          }).then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("hello! 0 hello! 1 hello! 2 hello! 3  ok");
            done();
          });
        });

        describe('nested loops', function () {
          it('loops, setting i and j to inner and outer indexes', function (done) {
            forth.readLine(': foo  3 0 do 2 0 do i . j . ."  " loop loop ; ').then(function () {
              return collectOutput(forth.readLine, "foo");
            }).then(function (output) {
              expect(forth.getStack()).toBe(" <- Top ");
              expect(output).toBe("0 0  1 0  0 1  1 1  0 2  1 2   ok");
              done();
            });
          });
        });
      });

      describe('do/+loop', function () {
        it('loops', function (done) {
          forth.readLine(': foo  128 1 do i . i +loop ; ').then(function () {
            return collectOutput(forth.readLine, "foo");
          }).then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("1 2 4 8 16 32 64  ok");
            done();
          });
        });
      });

      describe('begin/until', function () {
        it('loops', function (done) {
          forth.readLine(': foo  10 begin dup . 1- dup 0= until drop ; ').then(function () {
            return collectOutput(forth.readLine, "foo");
          }).then(function (output) {
            expect(forth.getStack()).toBe(" <- Top ");
            expect(output).toBe("10 9 8 7 6 5 4 3 2 1  ok");
            done();
          });
        });
      });
    });

    describe('variables', function () {
      it('saves and retrieves values from different variables', function (done) {
        collectOutput(forth.readLine, 'variable foo').then(function (output) {
          expect(output).toBe(" ok");
        }).then(function () {
          return forth.readLines([
            'variable bar',
            'foo bar'
          ]);
        }).then(function () {
          // this is testing an implementation detail, i.e. the particular memory addresses Memory uses
          expect(forth.getStack()).toBe("0 1 <- Top ");
        }).then(function () {
          return forth.readLine('100 foo !  200 bar !');
        }).then(function () {
          expect(forth.getStack()).toBe("0 1 <- Top ");
        }).then(function () {
          return forth.readLine('foo @  bar @');
        }).then(function () {
          expect(forth.getStack()).toBe("0 1 100 200 <- Top ");
        }).then(function () {
          return forth.readLines([
            '10 cells allot',
            'variable baz',
            'baz'
          ]);
        }).then(function () {
          expect(forth.getStack()).toBe("0 1 100 200 12 <- Top ");
          done();
        });
      });
    });

    describe('constants', function () {
      it('sets values in constants', function (done) {
        collectOutput(forth.readLine, '10 constant foo').then(function (output) {
          expect(output).toBe(" ok");
        }).then(function () {
          return forth.readLines([
            '20 constant bar',
            'foo bar'
          ]);
        }).then(function () {
          expect(forth.getStack()).toBe("10 20 <- Top ");
          done();
        });
      });
    });
  });

  function collectOutput(readLine, input) {
    var output = [];

    var promise = readLine(input, function (o) {
      output.push(o)
    });

    return promise.then(function () {
      return output.join("");
    });
  }

});
