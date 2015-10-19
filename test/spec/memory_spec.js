describe('Memory', function() {
  var memory;
  var cellSize = 1;

  beforeEach(function () {
    memory = Memory();
  });

  it('adding variables', function () {
    memory.addVariable("foo");
    var pointerFoo = memory.getVariable("foo");
    memory.setValue(pointerFoo, 10);
    expect(memory.getValue(pointerFoo)).toBe(10);

    memory.addVariable("bar");
    var pointerBar = memory.getVariable("bar");
    memory.setValue(pointerBar, 20);
    expect(memory.getValue(pointerBar)).toBe(20);

    expect(memory.getValue(pointerFoo)).toBe(10);
    expect(pointerBar).toBe(pointerFoo + cellSize);

    memory.allot(10);

    var pointerBaz = memory.addVariable("baz");
    expect(pointerBaz).toBe(pointerBar + (cellSize * 10) + 1);
  });
});
