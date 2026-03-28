const video = document.getElementById('video');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const summaryBar = document.getElementById('summary-bar');
const btnCamera = document.getElementById('btn-camera');

let detectedSpots = [
    { x: 200, y: 200, r: 40, state: 0, intensity: 0 },
    { x: 400, y: 200, r: 40, state: 0, intensity: 0 }
];

// 1. เริ่มต้นกล้อง
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: 1280, height: 720 },
            audio: false
        });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            tick(); // เริ่ม Loop การประมวลผล
        };
        btnCamera.style.display = 'none';
    } catch (err) {
        alert("กรุณาเข้าถึงผ่าน HTTPS หรือ Localhost เพื่อใช้งานกล้อง");
    }
}

// 2. คำนวณความสว่างเฉลี่ยในจุด (Intensity Measurement)
function getAverageIntensity(x, y, r) {
    const data = ctx.getImageData(x - r, y - r, r * 2, r * 2).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i+1] + data[i+2]) / 3;
    }
    return sum / (data.length / 4);
}

// 3. วาดและวิเคราะห์
function tick() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    let stats = { S: {n:0, d:0, p:0}, QCN: {n:0}, QCD: {d:0}, T: detectedSpots.length };
    const threshold = 140; // ค่าสมมติเบื้องต้น
    const buffer = 15;

    detectedSpots.forEach((spot, index) => {
        spot.intensity = getAverageIntensity(spot.x, spot.y, spot.r);
        
        let color = '#fff', label = '', type = '';
        
        // ตรรกะการแยกสีตามผลลัพธ์
        if (spot.intensity > threshold + buffer) { type = 'n'; color = '#00ff88'; }
        else if (spot.intensity < threshold - buffer) { type = 'd'; color = '#ff4466'; }
        else { type = 'p'; color = '#ffbb00'; }

        // นับสถิติตาม State (S/QCN/QCD)
        if (spot.state === 0) { stats.S[type]++; label = `S${index+1}`; }
        else if (spot.state === 1) { stats.QCN.n++; label = 'QCN'; color = '#00ff88'; }
        else { stats.QCD.d++; label = 'QCD'; color = '#ff4466'; }

        // วาด UI
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = color;
        ctx.font = "bold 30px Arial";
        ctx.fillText(label, spot.x - 30, spot.y - spot.r - 10);
    });

    summaryBar.innerText = `S=${stats.S.n+stats.S.d+stats.S.p}(${stats.S.n}/${stats.S.d}/${stats.S.p}) | QCN=${stats.QCN.n} | QCD=${stats.QCD.d} | T=${stats.T}`;
    
    requestAnimationFrame(tick);
}

// 4. Interaction
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const tx = (e.clientX - rect.left) * scaleX;
    const ty = (e.clientY - rect.top) * scaleY;

    detectedSpots.forEach(spot => {
        if (Math.sqrt((tx-spot.x)**2 + (ty-spot.y)**2) < spot.r) {
            spot.state = (spot.state + 1) % 3;
        }
    });
});

btnCamera.onclick = initCamera;
