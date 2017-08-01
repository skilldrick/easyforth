describe('Michelson', function () {
  var michelson;

  // a la Flow-js
  function executeInSequence(functions) {
    function inner(fs, previousResult) {
      if (fs.length == 0) {
        return;
      }

      fs[0].call(function (result) {
        inner(fs.slice(1), result);
      }, previousResult);
    }

    inner(functions);
  }


  beforeEach(function (done) {
    Michelson(function (_michelson) {
      michelson = _michelson;
      done();
    });
  });

  describe('readLine', function () {
    it('reads and executes a line of Michelson', function (done) {
      collectOutput(michelson.readLine, "10 20 30", function (output) {
        expect(michelson.getStack()).toBe("10 20 30 <- Top ");
        expect(output).toBe(" ok");
        done();
      });
    });

    it('handles weird spacing', function (done) {
      michelson.readLine("100\t200    300  ", function () {
        expect(michelson.getStack()).toBe("100 200 300 <- Top ");
        done();
      });
    });
  });

  describe('predefined words', function () {
    describe('arithmetic', function () {
      describe('+', function () {
        it('adds numbers on the stack', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 <- Top ");
              michelson.readLine("3 4 +", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 7 <- Top ");
              michelson.readLine("+", this);
            },
            function () {
              expect(michelson.getStack()).toBe("17 <- Top ");
              done();
            }
          ])
        });

        it('outputs Stack underflow when there is an underflow', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10", this);
            },
            function () {
              collectOutput(michelson.readLine, "+", this)
            },
            function (output) {
              expect(output).toBe(" Stack underflow");
              done();
            }
          ]);
        });
      });

      describe('*', function () {
        it('multiplies numbers on the stack', function (done) {
          michelson.readLines([
            "10",
            "22 4 *"
          ], function () {
            expect(michelson.getStack()).toBe("10 88 <- Top ");
            done();
          });
        });
      });

      describe('/', function () {
        it('divides numbers on the stack', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10", this);
            },
            function () {
              michelson.readLine("22 4 /", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 5 <- Top ");
              done();
            }
          ]);
        });
      });

      describe('mod', function () {
        it('mods numbers on the stack', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10", this);
            },
            function () {
              michelson.readLine("22 4 mod", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 2 <- Top ");
              done();
            }
          ]);
        });
      });

      describe('/mod', function () {
        it('mods and divides numbers on the stack', function (done) {
          michelson.readLines([
            "10",
            "22 4 /mod"
          ], function () {
            expect(michelson.getStack()).toBe("10 2 5 <- Top ");
            done();
          });
        });
      });
    });

    describe('comparison', function () {
      describe('=', function () {
        it('compares numbers on the stack for equality', function (done) {
          executeInSequence([
            function () {
              michelson.readLines([
                "10",
                "5 5 ="
              ], this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 -1 <- Top ");

              michelson.readLine("4 5 =", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 -1 0 <- Top ");
              done();
            }
          ]);
        });
      });

      describe('<', function () {
        it('checks to see if second item is less than top item on stack', function (done) {
          executeInSequence([
            function () {
              michelson.readLines([
                "10",
                "5 4 <"
              ], this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 0 <- Top ");

              michelson.readLine("4 5 <", function () {
                expect(michelson.getStack()).toBe("10 0 -1 <- Top ");
                done();
              });
            }
          ]);
        });
      });

      describe('>', function () {
        it('checks to see if second item is more than top item on stack', function (done) {
          executeInSequence([
            function () {
              michelson.readLines([
                "10",
                "5 4 >"
              ], this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 -1 <- Top ");

              michelson.readLine("4 5 >", function () {
                expect(michelson.getStack()).toBe("10 -1 0 <- Top ");
                done();
              });
            }
          ]);
        });
      });
    });

    describe('stack manipulation', function () {
      describe('swap', function () {
        it('swaps the top two items', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10 5", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 5 <- Top ");

              michelson.readLine("swap", function () {
                expect(michelson.getStack()).toBe("5 10 <- Top ");
                done();
              });
            }
          ]);
        });
      });

      describe('dup', function () {
        it('duplicates the top item', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10 5", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 5 <- Top ");

              michelson.readLine("dup", function () {
                expect(michelson.getStack()).toBe("10 5 5 <- Top ");
                done();
              });
            }
          ]);
        });
      });

      describe('over', function () {
        it('copies the second item to the top', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("10 5", this);
            },
            function () {
              expect(michelson.getStack()).toBe("10 5 <- Top ");

              michelson.readLine("over", function () {
                expect(michelson.getStack()).toBe("10 5 10 <- Top ");
                done();
              });
            }
          ]);
        });
      });

      describe('rot', function () {
        it('rotates the top three items', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("1 2 3", this);
            },
            function () {
              expect(michelson.getStack()).toBe("1 2 3 <- Top ");

              michelson.readLine("rot", function () {
                expect(michelson.getStack()).toBe("2 3 1 <- Top ");
                done();
              });
            }
          ]);
        });
      });

      describe('drop', function () {
        it('drops the top item', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("1 2 3", this);
            },
            function () {
              expect(michelson.getStack()).toBe("1 2 3 <- Top ");

              michelson.readLine("drop", function () {
                expect(michelson.getStack()).toBe("1 2 <- Top ");
                done();
              });
            }
          ]);
        });
      });
    });

    describe('output', function () {
      describe('.', function () {
        it('pops and outputs the top of the stack as a number', function (done) {
          collectOutput(michelson.readLine, "1 2 3 .", function (output) {
            expect(michelson.getStack()).toBe("1 2 <- Top ");
            expect(output).toBe("3  ok");
            done();
          });
        });
      });

      describe('.s', function () {
        it('outputs the contents of the stack', function (done) {
          collectOutput(michelson.readLine, "1 2 3 .s", function (output) {
            expect(michelson.getStack()).toBe("1 2 3 <- Top ");
            expect(output).toBe("\n1 2 3 <- Top  ok");
            done();
          });
        });
      });

      describe('cr', function () {
        it('outputs a newline', function (done) {
          collectOutput(michelson.readLine, "1 2 . cr .", function (output) {
            expect(michelson.getStack()).toBe(" <- Top ");
            expect(output).toBe("2 \n1  ok");
            done();
          });
        });
      });

      describe('space', function () {
        it('outputs a space', function (done) {
          collectOutput(michelson.readLine, "1 2 . space space .", function (output) {
            expect(michelson.getStack()).toBe(" <- Top ");
            expect(output).toBe("2   1  ok");
            done();
          });
        });
      });

      describe('spaces', function () {
        it('outputs n (top of stack) spaces', function (done) {
          collectOutput(michelson.readLine, "1 2 . 5 spaces .", function (output) {
            expect(michelson.getStack()).toBe(" <- Top ");
            expect(output).toBe("2      1  ok");
            done();
          });
        });
      });

      describe('emit', function () {
        it('outputs top of stack as ascii character', function (done) {
          executeInSequence([
            function () {
              collectOutput(michelson.readLine, "99 emit", this);
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("c ok");

              collectOutput(michelson.readLine, "108 111 111 99 emit emit emit emit", this)
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("cool ok");
              done();
            }
          ]);
        });
      });
    });

    describe('input', function () {
      describe('key', function () {
        it('pauses execution of line until key is pressed', function (done) {
          michelson.readLine("1 key 2", function () {
            expect(michelson.getStack()).toBe("1 65 2 <- Top ");
            done();
          });

          // Call keydown in a setTimeout to simulate waiting for keyboard input
          setTimeout(function () {
            expect(michelson.getStack()).toBe("1 <- Top ");
            michelson.keydown(65);
          }, 5);
        });

        it('calls output callback appropriately before and after key press', function (done) {
          var output = [];

          michelson.readLine("1 . key . 2 . key . 3 .", function (o) {
            output.push(o);
          }, function () {
            expect(output.join("")).toBe("1 65 2 66 3  ok");
            done();
          });

          // Call keydown in a setTimeout to simulate waiting for keyboard input
          setTimeout(function () {
            expect(output.join("")).toBe("1 ");
            michelson.keydown(65);

            setTimeout(function () {
              expect(output.join("")).toBe("1 65 2 ");
              michelson.keydown(66);
            }, 5);
          }, 5);
        });

        describe('in definition', function () {
          it('pauses execution of line until key is pressed', function (done) {
            executeInSequence([
              function () {
                michelson.readLine(": foo  1 key 2 ;", this);
              },
              function () {
                michelson.readLine("foo", this);
              },
              function () {
                expect(michelson.getStack()).toBe("1 65 2 <- Top ");
                done();
              }
            ]);

            // Call keydown in a setTimeout to simulate waiting for keyboard input
            setTimeout(function () {
              expect(michelson.getStack()).toBe("1 <- Top ");
              michelson.keydown(65);
            }, 5);
          });

          it('calls output callback appropriately before and after key press', function (done) {
            var output = [];

            executeInSequence([
              function () {
                michelson.readLine(": foo  2 . key . 3 . ;", this);
              },
              function () {
                michelson.readLine("1 . foo 4 .", function (o) {
                  output.push(o);
                }, this);
              },
              function () {
                expect(output.join("")).toBe("1 2 65 3 4  ok");
                done();
              }
            ]);

            // Call keydown in a setTimeout to simulate waiting for keyboard input
            setTimeout(function () {
              expect(output.join("")).toBe("1 2 ");
              michelson.keydown(65);
            }, 5);
          });
        });

        describe('in loop', function () {
          it('calls output callback appropriately after each key press', function (done) {
            var output = [];

            executeInSequence([
              function () {
                michelson.readLine(": foo  2 . 3 0 do key . loop 3 . ;", this);
              },
              function () {
                michelson.readLine("1 . foo 4 .", function (o) {
                  output.push(o);
                }, this);
              },
              function () {
                expect(output.join("")).toBe("1 2 65 66 67 3 4  ok");
                done();
              }
            ]);

            // Call keydown in a setTimeout to simulate waiting for keyboard input
            setTimeout(function () {
              expect(output.join("")).toBe("1 2 ");
              michelson.keydown(65);

              setTimeout(function () {
                expect(output.join("")).toBe("1 2 65 ");
                michelson.keydown(66);

                setTimeout(function () {
                  expect(output.join("")).toBe("1 2 65 66 ");
                  michelson.keydown(67);
                }, 5);
              }, 5);
            }, 5);
          });
        });
      });

      describe('last-key', function () {
        it('stores the value of the last key pressed', function (done) {
          executeInSequence([
            function () {
              michelson.readLine("last-key @", this);
            },
            function () {
              expect(michelson.getStack()).toBe("0 <- Top ");

              michelson.readLine("50 sleep last-key @", this);
            },
            function () {
              expect(michelson.getStack()).toBe("0 32 <- Top ");
              done();
            }
          ]);

          setTimeout(function () {
            michelson.keydown(32);
          }, 5);
        });
      });
    });

    describe('sleep', function () {
      it('pauses execution of line until key is pressed', function (done) {
        michelson.readLine("1 50 sleep 2", function () {
          expect(michelson.getStack()).toBe("1 2 <- Top ");
          done();
        });

        setTimeout(function () {
          expect(michelson.getStack()).toBe("1 <- Top ");
        }, 5);
      });

      describe('in definition', function () {
        it('pauses execution of line until key is pressed', function (done) {
          executeInSequence([
            function () {
              michelson.readLine(": foo  1 50 sleep 2 ;", this);
            },
            function () {
              michelson.readLine("foo", this);
            },
            function () {
              expect(michelson.getStack()).toBe("1 2 <- Top ");
              done();
            }
          ]);

          setTimeout(function () {
            expect(michelson.getStack()).toBe("1 <- Top ");
          }, 5);
        });
      });
    });

    describe('defining words', function () {
      describe(': ;', function () {
        it('defines a new word', function (done) {
          executeInSequence([
            function () {
              collectOutput(michelson.readLine, ": add-10  10 + ;", this);
            },
            function (output) {
              expect(output).toBe(" ok");

              michelson.readLine("5 add-10", function () {
                expect(michelson.getStack()).toBe("15 <- Top ");
                done();
              });
            }
          ]);
        });

        describe('with code before and after', function () {
          it('executes code before and after, and defines word', function (done) {
            executeInSequence([
              function () {
                collectOutput(michelson.readLine, "100 : add-10  10 + ; 200", this);
              },
              function (output) {
                expect(output).toBe(" ok");

                michelson.readLine("5 add-10", function () {
                  expect(michelson.getStack()).toBe("100 200 15 <- Top ");
                  done();
                });
              }
            ]);
          });
        });

        describe('over multiple lines', function () {
          it('uses all lines for word definition', function (done) {
            executeInSequence([
              function () {
                collectOutput(michelson.readLine, ": add-20  10 + ", this);
              },
              function (output) {
                expect(output).toBe(""); // no output should be produced

                collectOutput(michelson.readLine, " 5 + ", this);
              },
              function (output) {
                expect(output).toBe(""); // no output should be produced

                collectOutput(michelson.readLine, " 5 + ; ", this);
              },
              function (output) {
                expect(output).toBe(" ok"); // output ok after definition

                michelson.readLine("5 add-20", function () {
                  expect(michelson.getStack()).toBe("25 <- Top ");
                  done();
                });
              }
            ]);
          });
        });

        describe('with missing words in definition', function () {
          it('outputs error and stops definition', function (done) {
            executeInSequence([
              function () {
                collectOutput(michelson.readLine, ": add-20  10 + foo ", this);
              },
              function (output) {
                expect(output).toBe(" foo ? "); // output error

                collectOutput(michelson.readLine, "5 5 + .", function (output) {
                  expect(output).toBe("10  ok"); // output because definition has finished
                  done();
                });
              }
            ]);
          });
        });
      });
    });

    describe('missing words', function () {
      it('outputs error', function (done) {
        collectOutput(michelson.readLine, "10 10 + foo ", function (output) {
          expect(output).toBe(" foo ? ");
          done();
        });
      });
    });

    describe('control structures', function () {
      describe('if/else/then', function () {
        describe('with true condition', function () {
          it('executes consequent', function (done) {
            michelson.readLines([
              ": foo  -1 if 1 else 2 then 3 ; ",
              "foo"
            ], function () {
              expect(michelson.getStack()).toBe("1 3 <- Top ");
              done();
            });
          });
        });

        describe('with false condition', function () {
          it('executes alternative', function (done) {
            michelson.readLines([
              ": foo  0 if 1 else 2 then 3 ; ",
              "foo"
            ], function () {
              expect(michelson.getStack()).toBe("2 3 <- Top ");
              done();
            });
          });
        });

        describe('nested structures', function () {
          it('executes the correct parts', function (done) {
            michelson.readLines([
              ": foo  0 if 0 else -1 if 1 else 2 then then ; ",
              "foo"
            ], function () {
              expect(michelson.getStack()).toBe("1 <- Top ");
              done();
            });
          });

          describe('with output', function () {
            it('executes the correct parts with output', function (done) {
              executeInSequence([
                function () {
                  michelson.readLines([
                    ': foo  0 if ." if1 " 0 else ." else1 "',
                    '  -1 if ." if2 " 1 else ." else2 " 2 then then ; '
                  ], this);
                }, function () {
                  collectOutput(michelson.readLine, "foo", function (output) {
                    expect(michelson.getStack()).toBe("1 <- Top ");
                    expect(output).toBe("else1 if2  ok");
                    done();
                  });
                }
              ]);
            });
          });

          describe('complexly nested', function () {
            it('executes the correct parts', function (done) {
              // example from http://www.michelson.com/starting-michelson/sf4/sf4.html
              executeInSequence([
                function () {
                  michelson.readLines([
                    ': eggsize   dup  18 < if  ." reject "      else',
                    '            dup  21 < if  ." small "       else',
                    '            dup  24 < if  ." medium "      else',
                    '            dup  27 < if  ." large "       else',
                    '            dup  30 < if  ." extra large " else',
                    '                    ." error "',
                    '            then then then then then drop ;'
                  ], this);
                },
                function () {
                  collectOutput(michelson.readLine, '23 eggsize', this);
                },
                function (output) {
                  expect(output).toBe("medium  ok");

                  collectOutput(michelson.readLine, '29 eggsize', this);
                },
                function (output) {
                  expect(output).toBe("extra large  ok");

                  collectOutput(michelson.readLine, '31 eggsize', this);
                },
                function (output) {
                  expect(output).toBe("error  ok");
                  expect(michelson.getStack()).toBe(" <- Top ");
                  done();
                }
              ]);
            });
          });
        });
      });

      describe('do/loop', function () {
        it('loops', function (done) {
          executeInSequence([
            function () {
              michelson.readLine(': foo  4 0 do ." hello! " loop ; ', this);
            },
            function () {
              collectOutput(michelson.readLine, "foo", this);
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("hello! hello! hello! hello!  ok");
              done();
            }
          ]);
        });

        it('loops, setting i to current index', function (done) {
          executeInSequence([
            function () {
              collectOutput(michelson.readLine, ': foo  4 0 do ." hello! " i . loop ; ', this);
            },
            function (output) {
              expect(output).toBe(" ok");

              collectOutput(michelson.readLine, "foo", this);
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("hello! 0 hello! 1 hello! 2 hello! 3  ok");
              done();
            }
          ]);
        });

        describe('nested loops', function () {
          it('loops, setting i and j to inner and outer indexes', function (done) {
            executeInSequence([
              function () {
                michelson.readLine(': foo  3 0 do 2 0 do i . j . ."  " loop loop ; ', this);
              },
              function () {
                collectOutput(michelson.readLine, "foo", this);
              },
              function (output) {
                expect(michelson.getStack()).toBe(" <- Top ");
                expect(output).toBe("0 0  1 0  0 1  1 1  0 2  1 2   ok");
                done();
              }
            ]);
          });
        });
      });

      describe('do/+loop', function () {
        it('loops', function (done) {
          executeInSequence([
            function () {
              michelson.readLine(': foo  128 1 do i . i +loop ; ', this);
            },
            function () {
              collectOutput(michelson.readLine, "foo", this);
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("1 2 4 8 16 32 64  ok");
              done();
            }
          ]);
        });
      });

      describe('begin/until', function () {
        it('loops', function (done) {
          executeInSequence([
            function () {
              michelson.readLine(': foo  10 begin dup . 1- dup 0= until drop ; ', this);
            },
            function () {
              collectOutput(michelson.readLine, "foo", this);
            },
            function (output) {
              expect(michelson.getStack()).toBe(" <- Top ");
              expect(output).toBe("10 9 8 7 6 5 4 3 2 1  ok");
              done();
            }
          ]);
        });
      });
    });

    describe('variables', function () {
      it('saves and retrieves values from different variables', function (done) {
        executeInSequence([
          function () {
            collectOutput(michelson.readLine, 'variable foo', this);
          },
          function (output) {
            expect(output).toBe(" ok");

            michelson.readLines([
              'variable bar',
              'foo bar'
            ], this);
          },
          function () {
            // this is testing an implementation detail, i.e. the particular memory addresses Memory uses
            expect(michelson.getStack()).toBe("1577 1578 <- Top ");

            michelson.readLine('drop drop 100 foo !  200 bar !', this);
          },
          function () {
            expect(michelson.getStack()).toBe(" <- Top ");

            michelson.readLine('foo @  bar @', this);
          },
          function () {
            expect(michelson.getStack()).toBe("100 200 <- Top ");

            michelson.readLines([
              '5 cells allot',
              'variable baz',
              'baz'
            ], this);
          },
          function () {
            expect(michelson.getStack()).toBe("100 200 1584 <- Top ");
            done();
          }
        ]);
      });
    });

    describe('constants', function () {
      it('sets values in constants', function (done) {
        executeInSequence([
          function () {
            collectOutput(michelson.readLine, '10 constant foo', this);
          },
          function (output) {
            expect(output).toBe(" ok");

            michelson.readLines([
              '20 constant bar',
              'foo bar'
            ], this);
          },
          function () {
            expect(michelson.getStack()).toBe("10 20 <- Top ");
            done();
          }
        ]);
      });
    });
  });

  function collectOutput(readLine, input, done) {
    var output = [];

    readLine(input, function (o) {
      output.push(o)
    }, function () {
      done(output.join(""));
    });
  }

});
