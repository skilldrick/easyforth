function Memory() {
  var variables = Object.create(null);
  var memArray = [];
  var _memPointer = 1000;

  function newMemPointer() {
    return _memPointer++;
  }

  function addVariable(name) {
    var address = newMemPointer();
    variables[name.toLowerCase()] = address;
    memArray[address];
    return getVariable(name);
  }

  function getVariable(name) {
    return variables[name.toLowerCase()];
  }

  function setValue(address, value) {
    memArray[address] = value;
  }

  function getValue(address) {
    return memArray[address] || 0;
  }

  function allot(cells) {
    _memPointer += cells;
  }

  return {
    addVariable: addVariable,
    getVariable: getVariable,
    setValue: setValue,
    getValue: getValue,
    allot: allot
  };
}
