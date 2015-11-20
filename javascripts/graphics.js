function Graphics($canvas) {
  if (!$canvas.length) {
    return null;
  }

  var canvas = $canvas[0];
  var ctx = canvas.getContext('2d');
  var width = canvas.width;
  var height = canvas.height;
  var widthInBlocks = 24;
  var heightInBlocks = 24;
  var blockSize = width / widthInBlocks;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  function drawPixel(offset, value) {
    var x = offset % widthInBlocks;
    var y = Math.floor(offset / widthInBlocks);

    var color = value ? 'white' : 'black';
    ctx.fillStyle = color;

    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  return {
    drawPixel: drawPixel
  };
}
