describe('Stack', function() {
  var stack;

  beforeEach(function () {
    stack = Stack('test stack');
  });

  describe('pop', function () {
    it('returns pushed value', function () {
      stack.push(5);
      expect(stack.pop()).toBe(5);
    });

    it('throws exception on empty stack', function () {
      expect(function () {
        stack.pop();
      }).toThrow(new StackUnderflowError());
    });
  });

  describe('print', function () {
    it('prints the stack', function () {
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.print()).toBe("1 2 3 <- Top ");
    });
  });

  describe('peek', function () {
    it('returns the top value without popping', function () {
      stack.push(1);
      stack.push(2);
      stack.push(3);
      expect(stack.peek()).toBe(3);
      expect(stack.print()).toBe("1 2 3 <- Top ");
    });
  });
});
