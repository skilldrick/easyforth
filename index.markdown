---
layout: default
---

<h2 id="intro">Introduction</h2>

This ebook is here to teach you a programming language called Forth. Forth is a
language unlike most others. It's not functional or object oriented, it doesn't
have type-checking, and it has almost no syntax. It was written in the 70s, but
is still used today for certain applications.

Every new programming language you learn helps you think about problems in new ways.
Forth is super easy to learn, but it requires you to think in a different way than
you're used to, so it's a perfect language to broaden your coding horizons.

<h2 id="adding">Adding some numbers</h2>

The thing that separates Forth from most other languages is its use of the
stack. In Forth, everything revolves around the stack. Any time you type a
number, it gets pushed onto the stack. If you want to add two numbers together,
typing `+` takes the top two numbers off the stack, adds them, and puts
the result back on the stack.

Let's take a look at an example. Type (don't copy-paste) the following into the
interpreter, typing Enter after each line.

    1
    2
    3

{% include editor.html %}

You should see this at the top of the editor window:

{% include stack.html stack="1 2 3 <- Top" %}

Every time you type a line followed by the Enter key, the Forth interpreter
executes it, and appends the string `ok` to let you know there were no errors. You should
also notice that as you press Enter on each line, the area at the top fills up with numbers.
That area is our visualization of the stack.

Now, into the same interpreter, type a single `+` followed by the Enter key. The top two
elements on the stack, `2` and `3`, have been replaced by `5`.

{% include stack.html stack="1 5 <- Top" %}

At this point, your editor window should look like this:

<div class="editor-preview editor-text">1  <span class="output">ok</span>
2  <span class="output">ok</span>
3  <span class="output">ok</span>
+  <span class="output">ok</span>
</div>

Type `+` again and press Enter, and the top two elements will be replaced by 6. If
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
following, followed by the Enter key:

    123 456 +

{% include editor.html %}

The stack should now look like this:

{% include stack.html stack="579 <- Top" %}

This style, where the operator appears after the operands, is known as
[Reverse-Polish
notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation). Let's try
something a bit more complicated, and calculate `10 * (5 + 2)`. Type the
following into the interpreter:

    5 2 + 10 *

{% include editor.html %}

One of the nice things about Forth is that the order of operations is
completely based on their order in the program. For example, when executing `5
2 + 10 *`, the interpreter pushes 5 to the stack, then 2, then adds them and
pushes the result, then pushes 10 to the stack, then multiplies 7 and 10. Because
of this, there's no need for parentheses to group operators with lower
precedence.
