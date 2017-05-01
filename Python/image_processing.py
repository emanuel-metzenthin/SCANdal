import cv2
import numpy as np

def warp(contour, image):
	return cv2.warpPerspective(image, cv2.getPerspectiveTransform(np.array(contour, dtype='float32'), np.array([[499, 0], [0, 0], [0, 499], [499, 499]], dtype='float32')), (500, 500))

image = cv2.imread('../kassenbon-dark.jpg', 0)
cv2.namedWindow('Input', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Input', 400, 700)
cv2.imshow('Input', image)

warped = cv2.GaussianBlur(image, (5, 5), 0)
#output = cv2.Canny(image, 30, 100)	
_, warped = cv2.threshold(image, 0, 255, cv2.THRESH_OTSU)

(_, cnts, _) = cv2.findContours(warped.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:5]
screenCnt = cnts[0]
for c in cnts:
	# approximate the contour
	epsilon = 0.02 * cv2.arcLength(c, True)
	approx = cv2.approxPolyDP(c, epsilon, True)
 
	# if our approximated contour has four points, then we
	# can assume that we have found our screen
	if len(approx) == 4:
		screenCnt = approx
		break


warped = warp(screenCnt, image)

output = deskew(warped)

#output = cv2.cvtColor(output, cv2.COLOR_GRAY2RGB)
#cv2.drawContours(output, [screenCnt], -1, (0, 0, 255), 2)


cv2.namedWindow('Output', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Output', 400, 700)
cv2.imshow("Output", output)

while cv2.getWindowProperty('Input', 0) >= 0 and cv2.getWindowProperty('Output', 0) >= 0:
    keyCode = cv2.waitKey(50)



