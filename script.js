const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const summaryBar = document.getElementById('summary-bar');

// จำลองข้อมูลจากการตรวจจับอัตโนมัติ (ในอนาคตจะมาจาก OpenCV)
let detectedSpots = [
    { x: 100, y: 150, r: 30, state: 0, intensity: 200 }, // S
    { x: 200, y: 150, r: 30, state: 1, intensity: 240 }, // N
    { x: 300, y: 150, r: 30, state: 2, intensity: 50 }   // D
];

// ตั้งค่า Canvas
canvas.width = 600;
canvas.height = 400;

// ฟังก์ชันวาด UI
function render() {
    ctx.fillStyle = "#222"; // จำลองพื้นหลังกระดาษกรอง
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let counters = { 0: 1, 1: 1, 2: 1 }; // ตัวนับ S, N, D
    let stats = {
        S: { total: 0, n: 0, d: 0, p: 0 },
        QCN: { total: 0, n: 0, d: 0 },
        QCD: { total: 0, n: 0, d: 0 }
    };

    // สมมติค่า Threshold กึ่งกลางคือ 150 (ในระบบจริงจะคำนวณจาก QC)
    const threshold = 150;
    const buffer = 20;

    detectedSpots.forEach(spot => {
        let color, prefix, label;
        
        // 1. กำหนด Prefix และสีตาม State
        if (spot.state === 0) { prefix = 'S'; color = '#00e5ff'; }
        else if (spot.state === 1) { prefix = 'N'; color = '#00ff88'; }
        else { prefix = 'D'; color = '#ff4466'; }

        // 2. วิเคราะห์ผลจากค่าแสง (Fluorescence)
        let resultType = "";
        if (spot.intensity > (threshold + buffer)) resultType = "n";
        else if (spot.intensity < (threshold - buffer)) resultType = "d";
        else resultType = "p";

        // 3. เก็บสถิติสำหรับ Summary
        if (spot.state === 0) { stats.S.total++; stats.S[resultType]++; }
        else if (spot.state === 1) { stats.QCN.total++; stats.QCN[resultType === 'd' ? 'd' : 'n']++; }
        else { stats.QCD.total++; stats.QCD[resultType === 'd' ? 'd' : 'n']++; }

        label = prefix + counters[spot.state]++;

        // 4. วาดวงกลมและตัวหนังสือ
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = "bold 16px Arial";
        ctx.fillText(label, spot.x - 15, spot.y + 5);
        
        // วาดสัญลักษณ์ผลลัพธ์ย่อย (n/d/p)
        ctx.font = "12px Arial";
        ctx.fillText(resultType.toUpperCase(), spot.x - 10, spot.y + 25);
    });

    // อัปเดต Summary Bar
    summaryBar.innerText = `S=${stats.S.total}(${stats.S.n}/${stats.S.d}/${stats.S.p}) | ` +
                          `QCN=${stats.QCN.total}(${stats.QCN.n}/${stats.QCN.d}) | ` +
                          `QCD=${stats.QCD.total}(${stats.QCD.n}/${stats.QCD.d}) | ` +
                          `T=${detectedSpots.length}`;
}

// ระบบจัดการการแตะ (Tap to Cycle State)
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const tx = e.clientX - rect.left;
    const ty = e.clientY - rect.top;

    detectedSpots.forEach(spot => {
        const dist = Math.sqrt((tx - spot.x)**2 + (ty - spot.y)**2);
        if (dist < spot.r) {
            spot.state = (spot.state + 1) % 3; // วนสถานะ
            render();
        }
    });
});

render(); // เริ่มต้นวาดครั้งแรก
