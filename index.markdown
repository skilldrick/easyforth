---
layout: default
---

<div markdown="1" class="toc">
  * toc
  {:toc}
</div>


## Introduction

This small ebook is here to teach you a programming language called Forth. Forth is a
language unlike most others. It's not functional _or_ object oriented, it doesn't
have type-checking, and it basically has zero syntax. It was written in the 70s, but
is still used today for
[certain applications](http://www.forth.com/resources/apps/more-applications.html).

Why would you want to learn such an odd language? Every new programming
language you learn helps you think about problems in new ways. Forth is very
easy to learn, but it requires you to think in a different way than you're used
to. That makes it a perfect language to broaden your coding horizons.

This book includes a simple implementation of Forth I wrote in JavaScript. It's by
no means perfect, and is missing a lot of the functionality you'd expect in a real
Forth system. It's just here to give you an easy way to try out the examples. (If
you're a Forth expert, please
[contribute here](https://github.com/skilldrick/easyforth) and make it better!)

I'm going to assume that you know at least one other programming language, and have
a basic idea of how stacks work as a data structure.


## Adding Some Numbers

The thing that separates Forth from most other languages is its use of the
stack. In Forth, everything revolves around the stack. Any time you type a
number, it gets pushed onto the stack. If you want to add two numbers together,
typing `+` takes the top two numbers off the stack, adds them, and puts
the result back on the stack.

Let's take a look at an example. Type (don't copy-paste) the following into the
interpreter, typing `Enter` after each line.

    1
    2
    3

{% include editor.html %}

Every time you type a line followed by the `Enter` key, the Forth interpreter
executes that line, and appends the string `ok` to let you know there were no
errors. You should also notice that as you execute each line, the area at the
top fills up with numbers. That area is our visualization of the stack. It
should look like this:

{% include stack.html stack="1 2 3" %}

Now, into the same interpreter, type a single `+` followed by the `Enter` key. The top two
elements on the stack, `2` and `3`, have been replaced by `5`.

{% include stack.html stack="1 5" %}

At this point, your editor window should look like this:

<div class="editor-preview editor-text">1  <span class="output">ok</span>
2  <span class="output">ok</span>
3  <span class="output">ok</span>
+  <span class="output">ok</span>
</div>

Type `+` again and press `Enter`, and the top two elements will be replaced by 6. If
you type `+` one more time, Forth will try to pop the top two elements off the
stack, even though there's only _one_ element on the stack! This results in a
`Stack underflow` error:

<div class="editor-preview editor-text">1  <span class="output">ok</span>
2  <span class="output">ok</span>
3  <span class="output">ok</span>
+  <span class="output">ok</span>
+  <span class="output">ok</span>
+  <span class="output">Stack underflow</span>
</div>

Forth doesn't force you to type every token as a separate line. Type the
following into the next editor, followed by the `Enter` key:

    123 456 +

{% include editor.html size="small"%}

The stack should now look like this:

{% include stack.html stack="579" %}

This style, where the operator appears after the operands, is known as
[Reverse-Polish
notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation). Let's try
something a bit more complicated, and calculate `10 * (5 + 2)`. Type the
following into the interpreter:

    5 2 + 10 *

{% include editor.html size="small"%}

One of the nice things about Forth is that the order of operations is
completely based on their order in the program. For example, when executing `5
2 + 10 *`, the interpreter pushes 5 to the stack, then 2, then adds them and
pushes the resulting 7, then pushes 10 to the stack, then multiplies 7 and 10.
Because of this, there's no need for parentheses to group operators with lower
precedence.


## Defining Words

The syntax of Forth is extremely straightforward. Forth code is interpreted as
a series of space-delimited words. Almost all non-whitespace characters are valid
in words. When the Forth interpreter reads a word, it checks to see if a
definition exists in an internal structure known as the Dictionary. If it is
found, that definition is executed. Otherwise, the word is assumed to be a
number, and it is pushed onto the stack. If the word cannot be converted to a
number, an error occurs.

You can try that out yourself below. Type `foo` (an unrecognized word)
and press enter.

{% include editor.html size="small"%}

You should see something like this:

<div class="editor-preview editor-text">foo  <span class="output">foo ?</span></div>

`foo ?` means that Forth was unable to find a definition for `foo`, and it
wasn't a valid number.

We can create our own definition of `foo` using two special words called `:`
(colon) and `;` (semicolon).  `:` is our way of telling Forth we want to create
a definition. The first word after the `:` becomes the definition name, and the
rest of the words (until the `;`) make up the body of the definition. It's
conventional to include two spaces between the name and the body of the
definition. Try entering the following:

    : foo  100 + ;
    1000 foo
    foo foo foo

**Warning:** A common mistake is to miss out the space before the `;` word. Because Forth
words are space delimited and can contain most characters, `+;` is a perfectly
valid word and is not parsed as two separate words.

{% include editor.html size="small"%}

As you've hopefully figured out, our `foo` word simply adds 100 to the value on
top of the stack. It's not very interesting, but it should give you an idea of
how simple definitions work.


## Stack Manipulation

Now we can start taking a look at some of Forth's predefined words. First,
let's look at some words for manipulating the elements at the top of the stack.

### `dup`

`dup` is short for "duplicate" -- it duplicates the top element of the stack. For example,
try this out:

    1 2 3 dup

{% include editor.html size="small" %}

You should end up with the following stack:

{% include stack.html stack="1 2 3 3" %}

### `drop`

`drop` simply drops the top element of the stack. Running:

    1 2 3 drop

gives you a stack of:

{% include stack.html stack="1 2" %}

{% include editor.html size="small"%}

### `swap`

`swap`, as you may have guessed, swaps the top two elements of the stack. For example:

    1 2 3 4 swap

will give you:

{% include stack.html stack="1 2 4 3" %}

{% include editor.html size="small"%}

### `over`

`over` is a bit less obvious: it takes the second element from the top of the
stack and duplicates it to the top of the stack. Running this:

    1 2 3 dup

will result in this:

{% include stack.html stack="1 2 3 2" %}

{% include editor.html size="small"%}

### `rot`

Finally, `rot` "rotates" the top _three_ elements of the stack. The third
element from the top of the stack gets moved to the top of the stack, pushing
the other two elements down.

    1 2 3 rot

gives you:

{% include stack.html stack="2 3 1" %}

{% include editor.html size="small"%}


## Generating Output

Next, let's look at some words for outputting text to the console.

### `.` (period)

The simplest output word in Forth is `.`. You can use `.` to output the top of
the stack in the output of the current line. For example, try running this
(make sure to include all the spaces!):

    1 . 2 . 3 . 4 5 6 . . .

{% include editor.html size="small"%}

You should see this:

<div class="editor-preview editor-text">1 . 2 . 3 . 4 5 6 . . . <span class="output">1 2 3 6 5 4  ok</span></div>

Going through this in order, we push `1`, then pop it off and output it. Then
we do the same with `2` and `3`. Next we push `4`, `5`, and `6` onto the stack.
We then pop them off and output them one-by-one. That's why the last three
numbers in the output are reversed: the stack is last in, first out.

### `emit`

`emit` can be used to output numbers as ascii characters. Just like `.` outputs
the number at the top of the stack, `emit` outputs that number as an ascii
character. For example:

     33 119 111 87 emit emit emit emit

{% include editor.html size="small"%}

I won't give the output here so as to not ruin the surprise. This could also be
written as:

    87 emit 111 emit 119 emit 33 emit

Unlike `.`, `emit` doesn't output any space after each character, enabling you
to build up arbitrary strings of output.

### `cr`

`cr` is short for carriage return -- it simply outputs a newline:

    cr 100 . cr 200 . cr 300 .

{% include editor.html size="small"%}

This will output:

<div class="editor-preview editor-text">cr 100 . cr 200 . cr 300 .<span class="output">
100
200
300  ok</span></div>

### `."`

Finally we have `."` -- a special word for outputting strings. The `."` word works
differently inside definitions to interactive mode. `."` marks the beginning of
a string to output, and the end of the string is marked by `"`. The closing `"`
isn't a word, and so doesn't need to be space-delimited. Here's an example:

    : say-hello  ." Hello there!" ;
    say-hello

{% include editor.html size="small"%}

You should see the following output

<div class="editor-preview editor-text">say-hello <span class="output">Hello there! ok</span></div>

We can combine `."`, `.`, `cr`, and `emit` to build up more complex output:

    : print-stack-top  cr dup ." The top of the stack is " .
      cr ." which looks like '" dup emit ." ' in ascii  " ;
    48 print-stack-top

{% include editor.html size="small"%}

Running this should give you the following output:

<div class="editor-preview editor-text">48 print-stack-top <span class="output">
The top of the stack is 48
which looks like '0' in ascii   ok</span></div>


## Conditionals and Loops

Now onto the fun stuff! Forth, like most other languages, has conditionals and
loops for controlling the flow of your program. To understand how they work,
however, first we need to understand booleans in Forth.

### Booleans

There's actually no boolean type in Forth. The number `0` is treated as false,
and any other number is true, although the canonical true value is `-1` (all
boolean operators return `0` or `-1`).

To test if two numbers are equal, you can use `=`:

    3 4 = .
    5 5 = .

This should output:

<div class="editor-preview editor-text">3 4 = . <span class="output">0  ok</span>
5 5 = . <span class="output">-1  ok</span></div>

{% include editor.html size="small"%}

You can use `<` and `>` for less than and greater than. `<` checks to see if the
second item from the top of the stack is less than the top item of the stack, and
vice versa for `>`:

    3 4 < .
    3 4 > .

<div class="editor-preview editor-text">3 4 < . <span class="output">-1  ok</span>
3 4 > . <span class="output">0  ok</span></div>

{% include editor.html size="small"%}

The boolean operators And, Or, and Not are available as `and`, `or`, and `invert`:

    3 4 < 20 30 < and .
    3 4 < 20 30 > or .
    3 4 < invert .

The first line is the equivalent of `3 < 4 & 20 < 30` in a C-based language.
The second line is the equivalent of `3 < 4 | 20 > 30`. The third line is the
equivalent of `!(3 < 4)`.

`and`, `or`, and `invert` are all bitwise operations. For well-formed flags
(`0` and `-1`) they'll work as expected, but they'll give incorrect results for
arbitrary numbers.

{% include editor.html size="small"%}

### `if then`

Now we can finally get onto conditionals. Conditionals in Forth can only be
used inside definitions. The simplest conditional statement in Forth is `if
then`, which is equivalent to a standard `if` statement in most languages.
Here's an example of a definition using `if then`. In this example, we're also
using the `mod` word, which returns the modulo of the top two numbers on the
stack. In this case, the top number is 5, and the other is whatever was placed
on the stack before calling `buzz?`. Therefore, `5 mod 0 =` is a boolean
expression that checks to see if the top of the stack is divisible by 5.

    : buzz?  5 mod 0 = if ." Buzz" then ;
    3 buzz?
    4 buzz?
    5 buzz?

{% include editor.html size="small"%}

This will output:

<div class="editor-preview editor-text">3 buzz?<span class="output">  ok</span>
4 buzz?<span class="output">  ok</span>
5 buzz?<span class="output"> Buzz ok</span></div>

It's important to note that the `then` word marks the end of the `if` statement.
This makes it equivalent to `fi` in Bash or `end` in Ruby, for example.

Another important thing to realize is that `if` consumes the top value on the
stack when it checks to see if it's true or false.

### `if else then`

`if else then` is equivalent to an `if/else` statement in most languages. Here's
an example of its use:

    : is-it-zero?  0 = if ." Yes!" else ." No!" then ;
    0 is-it-zero?
    1 is-it-zero?
    2 is-it-zero?

{% include editor.html size="small"%}

This outputs:

<div class="editor-preview editor-text">0 is-it-zero?<span class="output"> Yes! ok</span>
1 is-it-zero?<span class="output"> No! ok</span>
2 is-it-zero?<span class="output"> No! ok</span></div>

This time, the if clause (consequent) is everything between `if` and `else`,
and the else clause (alternative) is everything between `else` and `then`.

### `do loop`

`do loop` in Forth most closely resembles a `for` loop in most C-based languages.
In the body of a `do loop`, the special word `i` pushes the current loop index
onto the stack.

The top two values on the stack give the starting value (inclusive) and ending
value (exclusive) for the `i` value. The starting value is taken from the top
of the stack. Here's an example:

    : loop-test  10 0 do i . loop ;
    loop-test

{% include editor.html size="small"%}

This should output:

<div class="editor-preview editor-text">loop-test<span class="output"> 0 1 2 3 4 5 6 7 8 9  ok</span></div>

The expression `10 0 do i . loop` is roughly equivalent to:

    for (int i = 0; i < 10; i++) {
      print(i);
    }

### Fizz Buzz

We can write the classic [Fizz Buzz](https://en.wikipedia.org/wiki/Fizz_buzz)
program easily using a `do loop`:

    : fizz?  3 mod 0 = dup if ." Fizz" then ;
    : buzz?  5 mod 0 = dup if ." Buzz" then ;
    : fizz-buzz?  dup fizz? swap buzz? or invert ;
    : do-fizz-buzz  25 1 do cr i fizz-buzz? if i . then loop ;
    do-fizz-buzz

{% include editor.html %}

`fizz?` checks to see if the top of the stack is divisible by 3 using `3 mod 0
=`. It then uses `dup` to duplicate this result. The top copy of the value is
consumed by `if`.  The second copy is left on the stack and acts as the return
value of `fizz?`.

If the number on top of the stack is divisible by 3, the string `"Fizz"` will
be output, otherwise there will be no output.

`buzz?` does the same thing but with 5, and outputs the string `"Buzz"`.

`fizz-buzz?` calls `dup` to duplicate the value on top of the stack, then calls
`fizz?`, converting the top copy into a boolean. After this, the top of the
stack consists of the original value, and the boolean returned by `fizz?`.
`swap` swaps these, so the original top-of-stack value is back on top, and the
boolean is underneath. Next we call `buzz?`, which replaces the top-of-stack
value with a boolean flag. Now the top two values on the stack are booleans
representing whether the number was divisible by 3 or 5.  After this, we call
`or` to see if either of these is true, and `invert` to negate this value.
Logically, the body of `fizz-buzz?` is equivalent to:

    !(x % 3 == 0 || x % 5 == 0)

Therefore, `fizz-buzz?` returns a boolean indicating if the argument is not
divisible by 3 or 5, and thus should be printed.  Finally, `do-fizz-buzz` loops
from 1 to 25, calling `fizz-buzz?` on `i`, and outputting `i` if `fizz-buzz?`
returns true.

If you're having trouble figuring out what's going on inside `fizz-buzz?`, the
example below might help you to understand how it works. All we're doing here
is executing each word of the definition of `fizz-buzz?` on a separate line. As
you execute each line, watch the stack to see how it changes:

    : fizz?  3 mod 0 = dup if ." Fizz" then ;
    : buzz?  5 mod 0 = dup if ." Buzz" then ;
    4
    dup
    fizz?
    swap
    buzz?
    or
    invert

{% include editor.html %}

Here's how each line affects the stack:

    4         4 <- Top
    dup       4 4 <- Top
    fizz?     4 0 <- Top
    swap      0 4 <- Top
    buzz?     0 0 <- Top
    or        0 <- Top
    invert    -1 <- Top

Remember, the final value on the stack is the return value of the `fizz-buzz?`
word. In this case, it's true, because the number was not divisible by 3 or 5,
and so _should_ be printed.

Here's the same thing but starting with 5:

    5         5 <- Top
    dup       5 5 <- Top
    fizz?     5 0 <- Top
    swap      0 5 <- Top
    buzz?     0 -1 <- Top
    or        -1 <- Top
    invert    0 <- Top

In this case the original top-of-stack value was divisible by 5, so nothing
should be printed.


## Variables and Constants

Forth also allows you to save values in variables and constants. Variables allow
you to keep track of changing values without having to store them on the stack.
Constants give you a simple way to refer to a value that won't change.

### Variables

Because the role of local variables is generally played by the stack, variables
in Forth are used more to store state that may be needed across multiple
functions.

Defining variables is simple:

    variable balance

This basically associates a particular memory location with the name `balance`.
`balance` is now a word, and all it does is to push its memory location onto the
stack:

    variable balance
    balance

{% include editor.html size="small"%}

You should see the value `1000` on the stack. This Forth implementation arbitrarily
starts storing variables at the memory location `1000`.

The word `!` stores a value at the memory location referenced by a variable, and the
word `@` fetches the value from a memory location:

    variable balance
    123 balance !
    balance @

{% include editor.html size="small"%}

This time you should see the value `123` on the stack. `123 balance` pushes the
value and the memory location onto the stack, and `!` stores that value at that
memory location. Likewise, `@` retrieves the value based on the memory location,
and pushes that value onto the stack. If you've used C or C++, you can think of
`balance` as a pointer that is dereferenced by `@`.

The word `?` is defined as `@ .` and it prints the current value of a variable.
The word `+!` is used to increase the value of a variable by a certain amount
(like `+=` in C-based languages).

    variable balance
    123 balance !
    balance ?
    50 balance +!
    balance ?

{% include editor.html size="small"%}

Run this code and you should see:

<div class="editor-preview editor-text">variable balance<span class="output">  ok</span>
123 balance ! <span class="output"> ok</span>
balance ? <span class="output">123  ok</span>
50 balance +! <span class="output"> ok</span>
balance ? <span class="output">173  ok</span>
</div>

### Constants

If you have a value that doesn't change, you can store it as a constant. Constants
are defined in one line, like this:

    42 constant answer

This creates a new constant called `answer` with the value `42`. Unlike variables,
constants just represent values, rather than memory locations, so there's no need
to use `@`.

    42 constant answer
    2 answer *

{% include editor.html size="small"%}

Running this will push the value `84` on the stack. `answer` is treated as if it
was the number it represents (just like constants and variables in other languages).


## Keyboard Input

Forth has a special word called `key`, which is used for accepting keyboard input.
When the `key` word is executed, execution is paused until a key is pressed. Once
a key is pressed, the key code of that key is pushed onto the stack. Try out the
following:

    key . key . key .

{% include editor.html size="small"%}

When you run this line, you'll notice that at first nothing happens. This is because
the interpreter is waiting for your keyboard input. Try hitting the `A` key, and
you should see the keycode for that key, `65`, appear as output on the current line.
Now hit `B`, then `C`, and you should see the following:

<div class="editor-preview editor-text">key . key . key . <span class="output">65 66 67  ok</span></div>


### Printing keys with `begin until`

Forth has another kind of loop called `begin until`. This works like a `while`
loop in C-based languages. Every time the word `until` is hit, the interpreter
checks to see if the top of the stack is non-zero (true). If it is, it jumps
back to the matching `begin`. If not, execution continues.

Here's an example of using `begin until` to print key codes:

    : print-keycode  begin key dup . 32 = until ;
    print-keycode

{% include editor.html size="small"%}

This will keep printing key codes until you press space. You should see something like this:

<div class="editor-preview editor-text">print-keycode <span class="output">80 82 73 78 84 189 75 69 89 67 79 68 69 32  ok</span></div>

 `key` waits for key input, then `dup` duplicates the keycode from `key`. We
then use `.` to output the top copy of the keycode, and `32 =` to check to see
if the keycode is equal to 32. If it is, we break out of the loop, otherwise we
loop back to `begin`.


## Graphics

{% include editor.html canvas=true %}
