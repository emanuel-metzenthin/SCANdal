
var Tracking = require('tracking');
var getPixels = require('get-pixels');

getPixels('kassenbon.jpg', function(err, pixels){

	console.log(Tracking.Image.blur(pixels.data, pixels.scale[0], pixels.scale[1], 2));

});
