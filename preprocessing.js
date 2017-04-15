var Jimp = require('jimp');
var Tesseract = require('tesseract.js');
var PerspT = require('perspective-transform');
var getPixels = require('get-pixels');
var fs = require('fs');
var Tracking = require('./tracking');
var jpeg = require('jpeg-js')

//Image Processing

thresholding();

function thresholding(){
    const THRESHOLD = 70;
    getPixels('kassenbon.jpg', function(err, pixels){
        var width = pixels.shape[0];
        var height = pixels.shape[1];

        var img = Tracking.Image.grayscale(pixels.data, width, height, false);
        var mode = 0;
        var mode_element = 0;
        var mode_mapping = new Array(255).fill(0);
        for(var i=0; i<img.length; i++){
            mode_mapping[img[i]]++;
        }
        for(var i=0; i<mode_mapping.length; i++){
            if(mode_mapping[i] > mode){
                mode = mode_mapping[i];
                mode_element = i;
            }
        }

        for(var i=0; i< img.length; i++){
            if(img[i] < mode_element - THRESHOLD){
                img[i] = 0;
            }else{
                img[i] = 255;
            }
        }

		jpegData = jpeg.encode({data: Buffer.from(img), width: width, height: height}, 80);

		fs.writeFile('kassenbon-processed.jpg', jpegData.data, function(err){
			if(err) throw err;
            //resize();
		});
	});
}

function resize(){
    Jimp.read('kassenbon.jpg', function(err, img){

	img.contrast(0.3);

	var scalingFactor = Math.ceil(3000 / receiptHeight);

	img.scale(3);

	img.greyscale();

	img.crop(0, 0, receiptWidth*3, receiptHeight*3);

	img.write('kassenbon-processed.jpg');
});
}

function rgb2luminance(r, g, b){
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
