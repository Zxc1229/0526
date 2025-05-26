let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let circlePos = null;

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, handReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  // FaceMesh模型載入完成
}
function handReady() {
  // Handpose模型載入完成
}

// 手勢判斷：回傳 'rock', 'scissors', 'paper' 或 null
function detectGesture(hand) {
  if (!hand || !hand.landmarks) return null;
  const lm = hand.landmarks;
  // 大拇指、食指、中指、無名指、小指
  const thumb = createVector(lm[4][0], lm[4][1]);
  const index = createVector(lm[8][0], lm[8][1]);
  const middle = createVector(lm[12][0], lm[12][1]);
  const ring = createVector(lm[16][0], lm[16][1]);
  const pinky = createVector(lm[20][0], lm[20][1]);

  // 計算手勢：如果食指和中指伸出，則判斷為「V」手勢
  if (index.y < thumb.y && middle.y < index.y) {
    return 'scissors';
  }
  // 如果大拇指、食指和中指伸出，則判斷為「OK」手勢
  else if (thumb.y < index.y && index.y < middle.y) {
    return 'rock';
  }
  // 如果無名指和小指伸出，則判斷為「平」手勢
  else if (ring.y < middle.y && pinky.y < ring.y) {
    return 'paper';
  }
  // 其他情況皆為不明手勢
  return null;
}

function draw() {
  image(video, 0, 0, width, height);

  let gesture = null;
  if (handPredictions.length > 0) {
    const hand = handPredictions[0];
    gesture = detectGesture(hand);

    // 偵錯用
    // console.log('偵測到手勢:', gesture);

    if (gesture === 'rock') {
      stroke(0, 255, 0); // 綠色
    } else if (gesture === 'paper') {
      stroke(0, 0, 255); // 藍色
    } else if (gesture === 'scissors') {
      stroke(255, 255, 0); // 黃色
    } else {
      stroke(255, 0, 0); // 預設為紅色
    }
    strokeWeight(4);
    noFill();
  }

  if (predictions.length > 0 && predictions[0].scaledMesh) {
    const keypoints = predictions[0].scaledMesh;
    let circleX, circleY;

    if (gesture === 'scissors' && keypoints[10]) {
      [circleX, circleY] = keypoints[10];
    } else if (gesture === 'rock' && keypoints[234]) {
      [circleX, circleY] = keypoints[234];
    } else if (gesture === 'paper' && keypoints[454]) {
      [circleX, circleY] = keypoints[454];
    } else if (keypoints[1]) {
      [circleX, circleY] = keypoints[1];
    }

    if (circleX !== undefined && circleY !== undefined) {
      ellipse(circleX, circleY, 50, 50);
    }
  }
}
