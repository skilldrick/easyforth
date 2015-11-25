variable snake-x-head
500 cells allot

variable snake-y-head
500 cells allot

variable apple-x
variable apple-y

0 constant left
1 constant up
2 constant right
3 constant down

24 constant width
24 constant height

variable direction
variable length

: snake-x ( offset -- address )
  cells snake-x-head + ;

: snake-y ( offset -- address )
  cells snake-y-head + ;

: convert-x-y ( x y -- offset )  24 cells * + ;
: draw ( color x y -- )  convert-x-y graphics + ! ;
: draw-white ( x y -- )  1 rot rot draw ;
: draw-black ( x y -- )  0 rot rot draw ;

: draw-walls
  width 0 do
    i 0 draw-black
    i height 1 - draw-black
  loop
  height 0 do
    0 i draw-black
    width 1 - i draw-black
  loop ;

: initialize-snake
  4 length !
  length @ 1 + 0 do
    12 i - i snake-x !
    12 i snake-y !
  loop
  right direction ! ;

: set-apple-position apple-x ! apple-y ! ;

: initialize-apple  4 4 set-apple-position ;

: initialize
  width 0 do
    height 0 do
      j i draw-white
    loop
  loop
  draw-walls
  initialize-snake
  initialize-apple ;

: move-up  -1 snake-y-head +! ;
: move-left  -1 snake-x-head +! ;
: move-down  1 snake-y-head +! ;
: move-right  1 snake-x-head +! ;

: move-snake-head  direction @
  left over  = if move-left else
  up over    = if move-up else
  right over = if move-right else
  down over  = if move-down
  then then then then drop ;

\ Move each segment of the snake forward by one
: move-snake-tail  0 length @ do
    i snake-x @ i 1 + snake-x !
    i snake-y @ i 1 + snake-y !
  -1 +loop ;

: is-horizontal  direction @ dup
  left = swap
  right = or ;

: is-vertical  direction @ dup
  up = swap
  down = or ;

: turn-up     is-horizontal if up direction ! then ;
: turn-left   is-vertical if left direction ! then ;
: turn-down   is-horizontal if down direction ! then ;
: turn-right  is-vertical if right direction ! then ;

: change-direction ( key -- )
  37 over = if turn-left else
  38 over = if turn-up else
  39 over = if turn-right else
  40 over = if turn-down
  then then then then drop ;

: check-input
  last-key @ change-direction
  0 last-key ! ;

\ get random x or y position within playable area
: random-position ( -- pos )
  width 4 - random 2 + ;

: move-apple
  apple-x @ apple-y @ draw-white
  random-position random-position
  set-apple-position ;

: grow-snake  1 length +! ;

: check-apple
  snake-x-head @ apple-x @ =
  snake-y-head @ apple-y @ =
  and if
    move-apple
    grow-snake
  then ;

: check-collision ( -- flag )
  \ get current x/y position
  snake-x-head @ snake-y-head @

  \ get color at current position
  convert-x-y graphics + @

  \ leave boolean flag on stack
  0 = ;

: draw-snake
  length @ 0 do
    i snake-x @ i snake-y @ draw-black
  loop
  length @ snake-x @
  length @ snake-y @
  draw-white ;

: draw-apple
  apple-x @ apple-y @ draw-black ;


: game-loop ( -- )
  begin
    draw-snake
    draw-apple
    100 sleep
    check-input
    move-snake-tail
    move-snake-head
    check-apple
    check-collision
  until
  ." Game Over" ;

: start  initialize game-loop ;
