const gridOverlay = document.getElementById('grid-overlay');
const video = document.getElementById('webcam');
const spotsData = []; 

// ระบบตั้งชื่อคอลัมน์ A, B, C, D
const colsLabel = ['A', 'B', 'C', 'D'];

// สร้าง Grid แนวตั้ง 4x5 (รวม 20 จุด)
for (let i = 0; i < 20; i++) {
    const colIndex = i % 4;
    const rowIndex = Math.floor(i / 4) + 1;
    const positionName = `${colsLabel[colIndex]}${rowIndex}`; // เช่น A1, B1

    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    
    const spot = document.createElement('div');
    spot.className = 'spot';
    spot.id = `spot-${i}`;
    
    // เปลี่ยนเฉพาะคลาสของเส้นรอบวง
    let status = 'sample'; 
    cell.onclick = () => {
        if (status === 'sample') { status = 'normal'; spot.className = 'spot normal'; }
        else if (status === 'normal') { status = 'deficient'; spot.className = 'spot deficient'; }
        else { status = 'sample'; spot.className = 'spot'; }
        spotsData[i].type = status;
    };

    cell.appendChild(spot);
    gridOverlay.appendChild(cell);
    spotsData.push({ id: i, pos: positionName, type: 'sample', value: 0 });
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
        const col = i % 4;
        const row = Math.floor(i / 4);
        
        const imgData = ctx.getImageData(col * cellW + (cellW*0.2), row * cellH + (cellH*0.2), cellW*0.6, cellH*0.6);
        let sum = 0;
        
        // *จุดที่ต้องพัฒนาต่อ: ปัจจุบันใช้สมการ Grayscale พื้นฐาน
        for (let j = 0; j < imgData.data.length; j += 4) {
            sum += (imgData.data[j] * 0.299 + imgData.data[j+1] * 0.587 + imgData.data[j+2] * 0.114);
        }
        const avg = sum / (imgData.data.length / 4);
        
        // กำหนดเกณฑ์และคลาสสีข้อความ
        let resultText = '';
        let resultClass = '';
        if (avg > 60) { resultText = 'Normal'; resultClass = 'text-normal'; }
        else if (avg > 30) { resultText = 'Partial Deficient'; resultClass = 'text-partial'; }
        else { resultText = 'Deficient'; resultClass = 'text-deficient'; }

        // สร้างตารางแสดงผลตรงตามตำแหน่ง
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${spot.pos}</td>
            <td>${spot.type.toUpperCase()}</td>
            <td>${avg.toFixed(1)}</td>
            <td class="${resultClass}">${resultText}</td>
        `;
        tbody.appendChild(tr);
    });
};
