const video = document.getElementById('video');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let detectedSpots = [];
let isFrozen = false;
let cvLoaded = false;

// เกณฑ์ตัดสิน (Threshold) สำหรับกล่องมืดสนิท
const TH_NORMAL = 130;
const TH_PARTIAL = 70;

function cvReady() { 
    cvLoaded = true; 
    document.getElementById('btn-auto').disabled = false;
}

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: "environment",
            // พยายามล็อคค่า Exposure (รองรับในบางเบราว์เซอร์/Android)
            advanced: [{ exposureMode: "manual", whiteBalanceMode: "manual" }]
        }
    });
    video.srcObject = stream;
    video.play();
    requestAnimationFrame(renderLoop);
}

function renderLoop() {
    if (isFrozen) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        let stats = { n: 0, d: 0, p: 0 };
        detectedSpots.forEach((spot, i) => {
            const val = getAvgIntensity(spot.x, spot.y, spot.r);
            const res = analyze(val);
            if (res.type === 'n') stats.n++; else if (res.type === 'p') stats.p++; else stats.d++;
            drawOverlay(spot, res.color, val, res.label, i);
        });
        updateSummary(stats);
    }
    requestAnimationFrame(renderLoop);
}

function getAvgIntensity(cx, cy, r) {
    const data = ctx.getImageData(cx - r, cy - r, r * 2, r * 2).data;
    let sum = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        let x = (i / 4) % (r * 2) - r;
        let y = Math.floor((i / 4) / (r * 2)) - r;
        if (x*x + y*y <= r*r) {
            sum += (data[i] + data[i+1] + data[i+2]) / 3;
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

function analyze(val) {
    if (val >= TH_NORMAL) return { label: "Normal", color: "#00ff00", type: 'n' };
    if (val >= TH_PARTIAL) return { label: "Partial", color: "#ffaa00", type: 'p' };
    return { label: "Deficient", color: "#ff0000", type: 'd' };
}

function drawOverlay(spot, color, val, res, i) {
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI*2); ctx.stroke();
    
    ctx.fillStyle = color; ctx.font = "bold 24px Arial";
    // ตำแหน่ง 10 นาฬิกา (บนซ้าย)
    ctx.fillText(`S${i+1}`, spot.x - spot.r, spot.y - spot.r - 10);
    // ข้อมูลด้านล่าง
    ctx.font = "bold 20px Arial";
    ctx.fillText(res, spot.x - 40, spot.y + spot.r + 30);
    ctx.font = "18px Arial";
    ctx.fillText(`Val: ${val.toFixed(0)}`, spot.x - 40, spot.y + spot.r + 55);
}

function runAutoDetect() {
    if (!cvLoaded || isFrozen) return;
    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.medianBlur(gray, gray, 5);
    let circles = new cv.Mat();
    cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 50, 75, 40, 30, 70);
    detectedSpots = [];
    for (let i = 0; i < circles.cols; ++i) {
        detectedSpots.push({ x: circles.data32F[i*3], y: circles.data32F[i*3+1], r: circles.data32F[i*3+2] });
    }
    src.delete(); gray.delete(); circles.delete();
}

function handleCapture() { isFrozen = true; }
function handleReset() { isFrozen = false; detectedSpots = []; requestAnimationFrame(renderLoop); }
function updateSummary(s) { 
    document.getElementById('summary-bar').innerText = `S=${s.n}/${s.p}/${s.d} | T=${detectedSpots.length}`; 
}

startCamera();
