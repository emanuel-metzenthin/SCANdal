var Jimp = require('jimp');
var Tesseract = require('tesseract.js');
var PerspT = require('perspective-transform');
var getPixels = require('get-pixels');
var fs = require('fs');
var Tracking = require('./tracking');
var jpeg = require('jpeg-js');

function edgeDetection(){
	getPixels('kassenbon-step2.jpg', function(err, pixels){

		var img = Tracking.Image.blur(pixels.data, pixels.shape[0], pixels.shape[1], 5);
		img = Tracking.Image.sobel(img, pixels.shape[0], pixels.shape[1]);

		jpegData = jpeg.encode({data: Buffer.from(img), width: pixels.shape[0], height: pixels.shape[1]}, 80);

		fs.writeFile('kassenbon-processed.jpg', jpegData.data, function(err){
			if(err) throw err;

			console.log(houghTransform());
		});
	});
}

function houghTransform(){
	getPixels('kassenbon-processed.jpg', function(err, pixels){	
		console.log(pixels.data);
		const WHITE_THRESHOLD = 250;
		const ACC_THRESHOLD = 80;

		var width = pixels.shape[0];
		var height = pixels.shape[1];

		var hough_h = (Math.sqrt(2.0) * (height>width?height:width)) / 2.0;  
		var accumulator_h = Math.round(hough_h) * 2.0;
		var accumulator_w = 180;

		var accumulator = new Array(accumulator_h);
		for(var i=0; i < accumulator_h; i++){
			accumulator[i] = new Array(accumulator_w).fill(0);
		}

		var center_x = width / 2;
		var center_y = height / 2;

		var lines = [];

		for(var y=0; y < height; y++){
			for(var x=0; x < width; x++){
				if(pixels.data[(y * width) + x] > WHITE_THRESHOLD){
					for(var t=0; t < 180; t++){
						var r = ((x - center_x) * Math.cos(deg2rad(t))) + ((y - center_y) * Math.sin(deg2rad(t)));
						accumulator[Math.round(r + hough_h)][t]++;
					}
				}
			}
		}

		for(var r=0; r < accumulator_h; r++){
			for(var t=0; t < accumulator_w; t++){
				if(accumulator[accumulator_w][t] > ACC_THRESHOLD){
					//Is this point a local maxima (9x9)  
	                var max = accumulator[r*accumulator_w][t];  
	                for(var ly=-4;ly<=4;ly++){  
                        for(var lx=-4;lx<=4;lx++){  
							if( (ly+r>=0 && ly+r<accumulator_h) && (lx+t>=0 && lx+t<accumulator_w) )  
							{  
								if( accumulator[(r+ly)*accumulator_w][t+lx] > max )  
								{  
									max = accumulator[(r+ly)*accumulator_w][t+lx];  
									break; 
								}  
							}  
                        }  
                    }  
                    if(max > accumulator[r*_accu_w][t])  
                        continue;  
					
					var x1, x2, y1, y2 = 0;
					if(t >= 45 && t <= 135){
						// y = (r - x * cos(t)) / sin(t)
						x1 = 0;
						y1 = ((r - accumulator_h / 2) - ((x1 - width/2) * Math.cos(deg2rad(t)))) / Math.sin(deg2rad(t)) + (height / 2); 
						x2 = width;
						y2 = ((r - accumulator_h / 2) - ((x2 - width/2) * Math.cos(deg2rad(t)))) / Math.sin(deg2rad(t)) + (height / 2); 
					}else{
						// x = (r - y * sin(t)) / cos(t)
						y1 = 0;
						x1 = ((r - accumulator_h / 2) - ((y1 - height/2) * Math.cos(deg2rad(t)))) / Math.sin(deg2rad(t)) + (width / 2); 
						y2 = height;
						x2 = ((r - accumulator_h / 2) - ((y2 - height/2) * Math.cos(deg2rad(t)))) / Math.sin(deg2rad(t)) + (width / 2); 
					}

					lines.push([x1, y1, x2, y2]);
				}
			}
		}

		return lines;
	});
}

function deg2rad (angle) {
    return (angle / 180) * Math.PI;
}