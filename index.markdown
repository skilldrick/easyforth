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

The thing that separates Forth from most other languages you're likely to have used
is its use of the stack. In Forth, everything revolves around the stack. Any time
you type a number, it gets pushed onto the stack. If you want to add two numbers
together, the `+` procedure takes the top two numbers off the stack, adds them,
and puts the result back on the stack.

Let's take a look at an example. Type (don't copy-paste) the following into the
interpreter right below where it says `( Welcome to Forth )`:

    1
    2
    3

When I include code like this, just type it as-is, pressing enter/return after each line.

{% include editor.html %}

You should see this at the top of the editor window:

{% include stack.html stack="1 2 3 <- Top" %}

Every time you type something followed by the enter key, the Forth interpreter
executes it, and appends the string `ok` to let you know there were no errors. You should
also notice that as you press enter on each line, the area at the top fills up with numbers.
That area is our visualization of the stack.

Now, into the same interpreter, type a single `+` followed by the enter key. The top two
elements on the stack, `2` and `3`, have been replaced by `5`.

{% include stack.html stack="1 5 <- Top" %}

At this point, your editor window should look like this:

<div class="editor-preview editor-text">1  <span class="output">ok</span>
2  <span class="output">ok</span>
3  <span class="output">ok</span>
+  <span class="output">ok</span>
</div>

Type `+` again and press enter, and the top element will be replaced by 6. If
you type `+` one more time, Forth will try to pop the top two elements off the
stack, even though there's only _one_ element on the stack! This results in a
`Stack underflow` error:

<div class="editor-preview editor-text">1  <span class="output">ok</span>
2  <span class="output">ok</span>
3  <span class="output">ok</span>
+  <span class="output">ok</span>
+  <span class="output">ok</span>
+ <span class="output">Stack underflow</span>
</div>


