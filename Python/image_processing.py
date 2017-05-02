import cv2
import numpy as np
from scipy import stats
from scipy.spatial import distance as dist

def order_points(pts):
	xSorted = pts[np.argsort(pts[:, 0]), :]

	leftMost = xSorted[:2, :]
	rightMost = xSorted[2:, :]

	leftMost = leftMost[np.argsort(leftMost[:, 1]), :]
	(tl, bl) = leftMost

	D = dist.cdist(tl[np.newaxis], rightMost, "euclidean")[0]
	(br, tr) = rightMost[np.argsort(D)[::-1], :]
 
	return np.array([tl, tr, br, bl], dtype="float32")

def warp(contour, image):

	contour = order_points(contour)
	receipt_width = int(max(dist.euclidean(contour[0, :], contour[1, :]), dist.euclidean(contour[2, :], contour[3, :])))
	receipt_height = int(max(dist.euclidean(contour[0, :], contour[3, :]), dist.euclidean(contour[1, :], contour[2, :])))

	target_frame = np.array([[0, 0], [0, receipt_width - 1], [receipt_width - 1, receipt_height - 1], [0, receipt_height - 1]], dtype='float32')

	print(contour)
	print(target_frame)

	return cv2.warpPerspective(image, cv2.getPerspectiveTransform(contour, target_frame), (receipt_width, receipt_height))

def getThresholdValue(image):
	_, thresh = cv2.threshold(image, 0, 255, cv2.THRESH_OTSU)
	# get all dark areas in image
	FRAME_BORDER = 0.1 * image.shape[0]
	coords = np.column_stack(np.where(thresh == 0))
	idx = []
	for i in range(len(coords)):
		if coords[i][0] > FRAME_BORDER and coords[i][0] < image.shape[0] - FRAME_BORDER:
			if coords[i][1] > FRAME_BORDER and coords[i][1] < image.shape[1] - FRAME_BORDER:
				idx.append(i)
	print(idx)
	np.delete(coords, idx)

	# get median of this area in image
	area = []
	for y in range(len(coords)):
		area.append(image[coords[y][0]][coords[y][1]])

	return np.float32(np.median(area))

image = cv2.imread('../kassenbon.jpg', 0)
cv2.namedWindow('Input', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Input', 400, 700)
cv2.imshow('Input', image)

warped = cv2.GaussianBlur(image, (5, 5), 0)
#warped = cv2.Canny(image, 35, 70)	
_, warped = cv2.threshold(image, 0, 255, cv2.THRESH_OTSU)

(_, cnts, _) = cv2.findContours(warped.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:5]
screenCnt = cnts[0]
for c in cnts:
	# approximate the contour
	epsilon = 0.02 * cv2.arcLength(c, True)
	approx = cv2.approxPolyDP(c, epsilon, True)
 
	# if our approximated contour has four points, then we
	# can assume that we have found our receipt
	if len(approx) == 4:
		screenCnt = approx
		break

contour = cv2.cvtColor(warped, cv2.COLOR_GRAY2RGB)
cv2.drawContours(contour, [screenCnt], -1, (0, 0, 255), 2)

cv2.namedWindow('Contours', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Contours', 400, 700)
cv2.imshow("Contours", contour)

if len(screenCnt) == 4:
	warped = warp(screenCnt, image)
else:
	warped = warp(cv2.boxPoints(cv2.minAreaRect(screenCnt)), image) # if the contour does not have 4 points, use a surrounding rect as contour

cv2.namedWindow('Output', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Output', 400, 700)
cv2.imshow("Output", warped)

while cv2.getWindowProperty('Input', 0) >= 0 and cv2.getWindowProperty('Output', 0) >= 0:
    keyCode = cv2.waitKey(50)



