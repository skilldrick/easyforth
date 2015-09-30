function Memory() {
  var variables = Object.create(null);
  var memArray = [];
  var _memPointer = 0;

  function newMemPointer() {
    return _memPointer++;
  }

  function addVariable(name) {
    var pointer = newMemPointer();
    variables[name.toLowerCase()] = pointer;
    memArray[pointer] = 0;
    return getVariable(name);
  }

  function getVariable(name) {
    return variables[name.toLowerCase()];
  }

  function setValue(pointer, value) {
    memArray[pointer] = value;
  }

  function getValue(pointer) {
    return memArray[pointer];
  }

  return {
    addVariable: addVariable,
    getVariable: getVariable,
    setValue: setValue,
    getValue: getValue
  };
}
