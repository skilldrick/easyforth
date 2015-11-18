variable x-pos
100 cells allot

variable y-pos
100 cells allot

0 constant left
1 constant up
2 constant right
3 constant down

24 constant width
24 constant height

variable direction

: convert-x-y  24 * + ;
: draw ( color x y -- )  convert-x-y graphics + ! ;
: draw-white  ( x y -- )  1 rot rot draw ;
: draw-black  ( x y -- )  0 rot rot draw ;

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
  12 x-pos !
  12 y-pos !
  \ 4 0 do 12 i y-pos + ! loop ;
  right direction ! ;

: initialize
  width 0 do
    height 0 do
      j i draw-white
    loop
  loop

  draw-walls
  initialize-snake ;


: is-horizontal  direction @ dup
  left = swap
  right = or ;

: is-vertical  direction @ dup
  up = swap
  down = or ;

: move-up  -1 y-pos +! ;
: move-left  -1 x-pos +! ;
: move-down  1 y-pos +! ;
: move-right  1 x-pos +! ;

: move-snake  direction @
  left over  = if move-left else
  up over    = if move-up else
  right over = if move-right else
  down over  = if move-down
  then then then then drop ;

: turn-up     is-horizontal if up direction ! then ;
: turn-left   is-vertical if left direction ! then ;
: turn-down   is-horizontal if down direction ! then ;
: turn-right  is-vertical if right direction ! then ;

: change-direction  ( key -- )
  37 over = if turn-left else
  38 over = if turn-up else
  39 over = if turn-right else
  40 over = if turn-down
  then then then then drop ;

: check-input
  last-key @ change-direction
  0 last-key ! ;

: check-collision  x-pos @ y-pos @  \ get current x/y position
  convert-x-y graphics + @          \ get color at current position
  0 = ; \ leave boolean flag on stack

: draw-snake  x-pos @ y-pos @ draw-black ;

: game-loop ( -- )
  begin
    200 sleep
    check-input
    move-snake
    check-collision
    draw-snake
  until ;

: start  initialize game-loop ;

start
