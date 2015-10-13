---
layout: default
---

<div markdown="1" class="toc">
* toc
{:toc}
</div>



## Introduction

This ebook is here to teach you a programming language called Forth. Forth is a
language unlike most others. It's not functional or object oriented, it doesn't
have type-checking, and it has almost no syntax. It was written in the 70s, but
is still used today for certain applications.

Every new programming language you learn helps you think about problems in new ways.
Forth is super easy to learn, but it requires you to think in a different way than
you're used to, so it's a perfect language to broaden your coding horizons.

## Adding Some Numbers

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

{% include stack.html stack="1 2 3" %}

Every time you type a line followed by the Enter key, the Forth interpreter
executes it, and appends the string `ok` to let you know there were no errors. You should
also notice that as you press Enter on each line, the area at the top fills up with numbers.
That area is our visualization of the stack.

Now, into the same interpreter, type a single `+` followed by the Enter key. The top two
elements on the stack, `2` and `3`, have been replaced by `5`.

{% include stack.html stack="1 5" %}

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

{% include stack.html stack="579" %}

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


Defining Words

The syntax of Forth is extremely straightforward. Forth code is interpreted as
a series of space-delimited words. Almost all non-whitespace characters are valid
in words. When the Forth interpreter reads a word, it checks to see if a
definition exists in an internal structure known as the Dictionary. If it is
found, that definition is executed. Otherwise, the word is assumed to be a
number, and it is pushed onto the stack. If the word is not able to be
converted to a number, an error occurs.

You can try that out yourself below. Type `foo` (an unrecognized word)
and press enter.

{% include editor.html %}

You should see something like this:

<div class="editor-preview editor-text">foo  <span class="output">foo ?</span></div>

We can create our own definition of `foo`, using two special words called `:` and `;`.
`:` is our way of telling Forth we want to create a definition. The first word after the `:`
becomes the definition name, and the rest of the words (until the `;`) make up
the body of the definition. It's conventional to include two spaces between the name and the
body of the definition. Try entering the following:

    : foo  100 + ;
    1000 foo
    foo foo foo

(Be careful to include a space before the `;` word. Because Forth words are
space delimited, `+;` is a perfectly valid word, and is not treated as two separate words.)

{% include editor.html %}

As you've hopefully figured out, our `foo` word simply adds 100 to the value on
top of the stack. It's not very interesting, but it should give you an idea of
how simple definitions work.

Most Forth systems come with a large library of predefined words. This JavaScript Forth
is very straightforward so it only comes with a relatively small number of words, but there
are still enough to complete most tasks.


## Stack Manipulation

First, let's look at some words for manipulating the elements at the top of the stack.

### `dup`

`dup` is short for "duplicate" - it duplicates the top element of the stack. For example,
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

Finally, `rot` "rotates" the top _three_ elements of the stack. The third element from the top of the stack gets moved to the top of the stack, push the other two elements down.

    1 2 3 rot

gives you:

{% include stack.html stack="2 3 1" %}

{% include editor.html size="small"%}

## Playing With Output
