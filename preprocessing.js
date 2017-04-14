
var Jimp  = require('jimp'); //evtl auf Grafi umsteigen
var Tesseract = require('tesseract.js');
var PerspT = require('perspective-transform');
var getPixels = require('get-pixels');
//var Tracking = require('tracking');

//Image Processing
Jimp.read('kassenbon.jpg', function(err, img){

	// Manuel page recognition
	var pointsBefore = [205, 85, 544, 106, 520, 1210, 90, 1226];  // top-left - top-right - bottom-right - bottom-left

	var diffWidthTop = Math.sqrt(Math.pow(pointsBefore[2] - pointsBefore[0], 2) + Math.pow(pointsBefore[3] - pointsBefore[1], 2));
	var diffWidthBottom = Math.sqrt(Math.pow(pointsBefore[4] - pointsBefore[6], 2) + Math.pow(pointsBefore[5] - pointsBefore[7], 2));
	var receiptWidth = Math.round(Math.max(diffWidthTop, diffWidthBottom));

	var diffHeightTop = Math.sqrt(Math.pow(pointsBefore[6] - pointsBefore[0], 2) + Math.pow(pointsBefore[7] - pointsBefore[1], 2));
	var diffHeightBottom = Math.sqrt(Math.pow(pointsBefore[4] - pointsBefore[2], 2) + Math.pow(pointsBefore[5] - pointsBefore[3], 2));
	var receiptHeight = Math.round(Math.max(diffHeightTop, diffHeightBottom));

	var pointsAfter = [0, 0, receiptWidth, 0, receiptWidth, receiptHeight, 0, receiptHeight];

	var perspT = PerspT(pointsBefore, pointsAfter);

	for(var x=0; x<receiptWidth; x++){
		for (var y = 0; y < receiptHeight; y++) {
			var inversedPoint = perspT.transformInverse(x, y);
			img.setPixelColor(img.getPixelColor(inversedPoint[0], inversedPoint[1]), x, y)
		}

	}

	var scalingFactor = Math.ceil(3000 / receiptHeight);

	img.scale(3);

	img.greyscale();

	img.crop(0, 0, receiptWidth*3, receiptHeight*3);

	//img.contrast(0.5);

	img.write('kassenbon-processed.jpg');
});


Tesseract.recognize('kassenbon-processed.jpg', {lang: 'deu', tessedit_pageseg_mode: 4})
.progress(function(message){
	var progress = message.progress;
	var progressBar = '';
	for(var i=0; i<(20*progress); i++){
		progressBar += '#';
	}
	for(var i=20*progress; i<20; i++){
		progressBar += ' ';
	}
	process.stdout.write('Progress: [ ' + progressBar + ' ] \r');
})
.then(function(result){
    console.log(result.text);
});


