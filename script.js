// Current year setting
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Global variables
let mediaFiles = [];
let currentMediaIndex = 0;
let heroVideoElement = null;
const heroSection = document.getElementById("heroSection");

// Blink detection variables
const videoElement = document.getElementById("webcam");
const loadingOverlay = document.getElementById("loadingOverlay");
const blinkThreshold = 0.21;
let isBlinking = false;
let blinkCooldown = false;

// Cursor tracking for dark fireflies
let cursorX = 0;
let cursorY = 0;

// Load media files from files.json
async function loadMediaFiles() {
  try {
    const response = await fetch("files.json");
    const files = await response.json();

    mediaFiles = files.map((filename) => ({
      type: "image",
      src: `images/${filename}`,
    }));

    console.log(`✅ ${mediaFiles.length}개의 이미지 파일을 로드했습니다.`);

    if (mediaFiles.length > 0) {
      changeMedia();
    } else {
      console.warn("⚠️ images 폴더에 이미지 파일이 없습니다.");
    }
  } catch (error) {
    console.error("❌ 파일 목록을 가져오는데 실패했습니다:", error);
    console.log("💡 files.json 파일이 있는지 확인하세요.");
  }
}

// Change media function
function changeMedia() {
  if (mediaFiles.length === 0) return;

  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * mediaFiles.length);
  } while (newIndex === currentMediaIndex && mediaFiles.length > 1);

  currentMediaIndex = newIndex;
  const media = mediaFiles[currentMediaIndex];

  if (heroVideoElement) {
    heroVideoElement.remove();
    heroVideoElement = null;
  }

  const style = document.createElement("style");
  style.id = "hero-background-style";

  const oldStyle = document.getElementById("hero-background-style");
  if (oldStyle) oldStyle.remove();

  style.textContent = `
    #heroSection::before {
      background-image: url('${media.src}');
    }
  `;
  document.head.appendChild(style);
}

// Calculate Eye Aspect Ratio (EAR)
function calculateEAR(eyeLandmarks) {
  const v1 = distance(eyeLandmarks[1], eyeLandmarks[5]);
  const v2 = distance(eyeLandmarks[2], eyeLandmarks[4]);
  const h = distance(eyeLandmarks[0], eyeLandmarks[3]);

  if (h === 0) return 0;
  return (v1 + v2) / (2.0 * h);
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Face Mesh results callback
function onResults(results) {
  if (loadingOverlay.style.opacity !== "0") {
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 500);
  }

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    const leftEyeIndices = [33, 160, 158, 133, 153, 144];
    const rightEyeIndices = [362, 385, 387, 263, 373, 380];

    const leftEye = leftEyeIndices.map((index) => landmarks[index]);
    const rightEye = rightEyeIndices.map((index) => landmarks[index]);

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;

    if (avgEAR < blinkThreshold) {
      if (!isBlinking && !blinkCooldown) {
        isBlinking = true;
        console.log("👁️ 깜빡임 감지! EAR:", avgEAR);
        changeMedia();

        blinkCooldown = true;
        setTimeout(() => {
          blinkCooldown = false;
        }, 1000);
      }
    } else {
      isBlinking = false;
    }
  }
}

// Initialize MediaPipe Face Mesh
function initFaceMesh() {
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });

  camera.start();
}

// Setup cursor tracking for sections
function setupCursorTracking() {
  const sections = document.querySelectorAll(
    ".planning-section, .commentary-section"
  );

  sections.forEach((section) => {
    section.addEventListener("touchmove", function (e) {
      const touch = e.touches[0];
      const rect = this.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.style.setProperty("--cursor-x", x + "px");
      this.style.setProperty("--cursor-y", y + "px");

      // Update cursor position for dark fireflies
      if (this.classList.contains("commentary-section")) {
        cursorX = x;
        cursorY = y;
      }
    });

    section.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.style.setProperty("--cursor-x", x + "px");
      this.style.setProperty("--cursor-y", y + "px");

      // Update cursor position for dark fireflies
      if (this.classList.contains("commentary-section")) {
        cursorX = x;
        cursorY = y;
      }
    });
  });
}

// Firefly animation function
function animateFirefly(fireflyId, sectionSelector) {
  const firefly = document.getElementById(fireflyId);
  const section = document.querySelector(sectionSelector);

  // null 체크 추가
  if (!firefly || !section) {
    console.warn(`⚠️ ${fireflyId} 또는 ${sectionSelector}를 찾을 수 없습니다.`);
    return;
  }

  function moveFirefly() {
    const sectionRect = section.getBoundingClientRect();
    const sectionWidth = sectionRect.width;
    const sectionHeight = sectionRect.height;

    const startX = Math.random() * (sectionWidth - 100);
    const startY = Math.random() * (sectionHeight - 100);
    const endX = Math.random() * (sectionWidth - 100);
    const endY = Math.random() * (sectionHeight - 100);
    const duration = 20 + Math.random() * 20;

    firefly.style.left = startX + "px";
    firefly.style.top = startY + "px";

    const midX1 = startX + (Math.random() - 0.5) * 300;
    const midY1 = startY + (Math.random() - 0.5) * 300;
    const midX2 = endX + (Math.random() - 0.5) * 300;
    const midY2 = endY + (Math.random() - 0.5) * 300;

    firefly.style.animation = "none";
    firefly.offsetHeight;

    const animationName = `firefly-float-${fireflyId}-${Date.now()}`;
    const styleSheet = document.createElement("style");
    styleSheet.id = `style-${fireflyId}`;
    styleSheet.textContent = `
      @keyframes ${animationName} {
        0% {
          transform: translate(0, 0);
          opacity: 0;
        }
        5% {
          opacity: 0.8;
        }
        25% {
          transform: translate(${midX1 - startX}px, ${midY1 - startY}px);
          opacity: 1;
        }
        50% {
          transform: translate(${(endX - startX) * 0.5}px, ${
      (endY - startY) * 0.5
    }px);
          opacity: 1;
        }
        75% {
          transform: translate(${midX2 - startX}px, ${midY2 - startY}px);
          opacity: 1;
        }
        95% {
          opacity: 0.8;
        }
        100% {
          transform: translate(${endX - startX}px, ${endY - startY}px);
          opacity: 0;
        }
      }
    `;

    const oldStyle = document.getElementById(`style-${fireflyId}`);
    if (oldStyle) {
      document.head.removeChild(oldStyle);
    }

    document.head.appendChild(styleSheet);
    firefly.style.animation = `${animationName} ${duration}s ease-in-out`;

    setTimeout(() => {
      moveFirefly();
    }, duration * 1000);
  }

  moveFirefly();
}

// Dark firefly animation with cursor avoidance
function animateDarkFirefly(fireflyId, sectionSelector) {
  const firefly = document.getElementById(fireflyId);
  const section = document.querySelector(sectionSelector);

  // null 체크 추가
  if (!firefly || !section) {
    console.warn(`⚠️ ${fireflyId} 또는 ${sectionSelector}를 찾을 수 없습니다.`);
    return;
  }

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  function moveFirefly() {
    const sectionRect = section.getBoundingClientRect();
    const sectionWidth = sectionRect.width;
    const sectionHeight = sectionRect.height;

    targetX = Math.random() * sectionWidth;
    targetY = Math.random() * sectionHeight;
    currentX = targetX;
    currentY = targetY;

    firefly.style.left = currentX + "px";
    firefly.style.top = currentY + "px";

    const duration = 15 + Math.random() * 15;
    const endX = Math.random() * sectionWidth;
    const endY = Math.random() * sectionHeight;

    const midX1 = currentX + (Math.random() - 0.5) * 200;
    const midY1 = currentY + (Math.random() - 0.5) * 200;
    const midX2 = endX + (Math.random() - 0.5) * 200;
    const midY2 = endY + (Math.random() - 0.5) * 200;

    firefly.style.animation = "none";
    firefly.offsetHeight;

    const animationName = `dark-firefly-float-${fireflyId}-${Date.now()}`;
    const styleSheet = document.createElement("style");
    styleSheet.id = `style-${fireflyId}`;
    styleSheet.textContent = `
      @keyframes ${animationName} {
        0% {
          transform: translate(0, 0);
          opacity: 0;
        }
        5% {
          opacity: 0.8;
        }
        25% {
          transform: translate(${midX1 - currentX}px, ${midY1 - currentY}px);
          opacity: 1;
        }
        50% {
          transform: translate(${(endX - currentX) * 0.5}px, ${
      (endY - currentY) * 0.5
    }px);
          opacity: 1;
        }
        75% {
          transform: translate(${midX2 - currentX}px, ${midY2 - currentY}px);
          opacity: 1;
        }
        95% {
          opacity: 0.8;
        }
        100% {
          transform: translate(${endX - currentX}px, ${endY - currentY}px);
          opacity: 0;
        }
      }
    `;

    const oldStyle = document.getElementById(`style-${fireflyId}`);
    if (oldStyle) {
      document.head.removeChild(oldStyle);
    }

    document.head.appendChild(styleSheet);
    firefly.style.animation = `${animationName} ${duration}s ease-in-out`;

    targetX = endX;
    targetY = endY;

    setTimeout(() => {
      moveFirefly();
    }, duration * 1000);
  }

  // Cursor detection and flee logic
  function checkCursorProximity() {
    // null 체크 추가
    if (!firefly || !section) {
      return;
    }

    const fireflyRect = firefly.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    const fireflyX =
      fireflyRect.left - sectionRect.left + fireflyRect.width / 2;
    const fireflyY = fireflyRect.top - sectionRect.top + fireflyRect.height / 2;

    const dist = Math.sqrt(
      Math.pow(cursorX - fireflyX, 2) + Math.pow(cursorY - fireflyY, 2)
    );

    const fleeDistance = 150;

    if (dist < fleeDistance) {
      const angle = Math.atan2(fireflyY - cursorY, fireflyX - cursorX);
      const fleeX = Math.cos(angle) * 100;
      const fleeY = Math.sin(angle) * 100;

      firefly.style.transform = `translate(${fleeX}px, ${fleeY}px)`;
      firefly.style.transition = "transform 0.3s ease-out";
    } else {
      firefly.style.transform = "translate(0, 0)";
    }
  }

  setInterval(checkCursorProximity, 50);
  moveFirefly();
}

// Initialize fireflies
function initFireflies() {
  const fireflyIds = [
    "firefly1",
    "firefly2",
    "firefly3",
    "firefly4",
    "firefly5",
  ];

  fireflyIds.forEach((id, index) => {
    setTimeout(() => {
      animateFirefly(id, ".storyboard-section");
    }, index * 2000);
  });
}

// Setup video controls
function setupVideoControls() {
  const videoWrapper = document.getElementById("videoWrapper");
  const video = document.getElementById("projectVideo");
  const overlay = document.getElementById("videoOverlay");

  // null 체크 추가
  if (!video || !overlay || !videoWrapper) {
    console.warn("⚠️ 비디오 요소를 찾을 수 없습니다.");
    return;
  }

  video
    .play()
    .then(() => {
      overlay.classList.add("hidden");
    })
    .catch((error) => {
      console.log("자동 재생 실패:", error);
    });

  videoWrapper.addEventListener("mouseenter", () => {
    video.play();
    overlay.classList.add("hidden");
  });

  videoWrapper.addEventListener("click", () => {
    if (video.paused) {
      video.play();
      overlay.classList.add("hidden");
    } else {
      video.pause();
      overlay.classList.remove("hidden");
    }
  });
}

// Initialize on page load
loadMediaFiles();

if (typeof FaceMesh !== "undefined" && typeof Camera !== "undefined") {
  initFaceMesh();
} else {
  console.error("MediaPipe 라이브러리를 로드할 수 없습니다.");
  loadingOverlay.textContent = "❌ 웹캠 초기화 실패";
}

setupCursorTracking();
initFireflies();
setupVideoControls();
