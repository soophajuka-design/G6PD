const gridOverlay = document.getElementById('grid-overlay');
const video = document.getElementById('webcam');
const spotsData = []; 

// ระบบตั้งชื่อคอลัมน์ A, B, C, D
const colsLabel = ['A', 'B', 'C', 'D'];

// สร้าง Grid แนวตั้ง 4x5 (รวม 20 จุด)
// สร้าง Grid แนวตั้ง 4x5
for (let i = 0; i < 20; i++) {
    // ... (การตั้งชื่อตำแหน่งเหมือนเดิม) ...
    
    // กำหนดสถานะเริ่มต้นเป็น 'nd' (Not Done)
    let status = 'nd'; 
    cell.onclick = () => {
        // วนลูปการกด: ND -> Sample -> Normal -> Deficient -> ND
        if (status === 'nd') { status = 'sample'; spot.className = 'spot sample'; }
        else if (status === 'sample') { status = 'normal'; spot.className = 'spot normal'; }
        else if (status === 'normal') { status = 'deficient'; spot.className = 'spot deficient'; }
        else { status = 'nd'; spot.className = 'spot'; }
        
        spotsData[i].type = status;
    };

    cell.appendChild(spot);
    gridOverlay.appendChild(cell);
    spotsData.push({ id: i, pos: positionName, type: 'nd', value: 0 }); // เริ่มที่ nd
}


// เปิดกล้อง
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => video.srcObject = stream);

document.getElementById('capture-btn').onclick = () => {
    const canvas = document.getElementById('proc-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const tbody = document.querySelector('#result-table tbody');
    tbody.innerHTML = '';

    // คำนวณขนาดเซลล์ใหม่ตามแนวตั้ง (4 คอลัมน์, 5 แถว)
    const cellW = canvas.width / 4;
    const cellH = canvas.height / 5;

        spotsData.forEach((spot, i) => {
        // หากตำแหน่งไหนไม่ได้เลือก (ND) ให้ข้ามการคำนวณและรายงานผลทันที
        if (spot.type === 'nd') {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${spot.pos}</td><td>-</td><td>-</td>
                <td style="color: gray;">Not Done (ND)</td>
            `;
            tbody.appendChild(tr);
            return; // ข้ามไปทำจุดต่อไป
        }

        const col = i % 4;
        const row = Math.floor(i / 4);
        const imgData = ctx.getImageData(col * cellW + (cellW*0.2), row * cellH + (cellH*0.2), cellW*0.6, cellH*0.6);
        
        let blueIntensitySum = 0;
        let validPixels = 0;
        
        // วิเคราะห์การเรืองแสงสีฟ้า (Blue Fluorescence Filtering)
        for (let j = 0; j < imgData.data.length; j += 4) {
            let r = imgData.data[j];
            let g = imgData.data[j+1];
            let b = imgData.data[j+2];

            // กรองเฉพาะพิกเซลที่สีน้ำเงิน (B) มีค่ามากกว่าสีแดงและเขียว (คือช่วงสีฟ้าใน HSV)
            // และตัดจุดที่มืดเกินไปออก (b > 30) เพื่อลด Noise
            if (b > r && b > g && b > 30) {
                blueIntensitySum += b; // เก็บเฉพาะความสว่างของสีน้ำเงิน
                validPixels++;
            }
        }
        
        // หาค่าเฉลี่ยความสว่างของแสงสีฟ้าในวงกลมนั้น
        const avgBlue = validPixels > 0 ? (blueIntensitySum / validPixels) : 0;
        
        // การตัดสินผล (ตัวเลข Threshold ตรงนี้ต้องปรับจูนหน้างานจริง)
        let resultText = ''; let resultClass = '';
        if (avgBlue > 80) { resultText = 'Normal'; resultClass = 'text-normal'; }
        else if (avgBlue > 40) { resultText = 'Partial Deficient'; resultClass = 'text-partial'; }
        else { resultText = 'Deficient'; resultClass = 'text-deficient'; }

        // แสดงผล
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${spot.pos}</td>
            <td>${spot.type.toUpperCase()}</td>
            <td>${avgBlue.toFixed(1)}</td>
            <td class="${resultClass}">${resultText}</td>
        `;
        tbody.appendChild(tr);
    });
};

/////**
// ... (ส่วนต้นของโค้ดเหมือนเดิม) ...


// ... (เปิดกล้องเหมือนเดิม) ...

///* document.getElementById('capture-btn').onclick = () => {
    // ... (ดึงภาพลง Canvas เหมือนเดิม) ...


////**