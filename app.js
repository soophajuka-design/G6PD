
const gridOverlay = document.getElementById('grid-overlay');
const video = document.getElementById('webcam');
const spotsData = []; // เก็บสถานะทั้ง 20 จุด

// สร้าง Grid 4x5
for (let i = 0; i < 20; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    const spot = document.createElement('div');
    spot.className = 'spot';
    spot.id = `spot-${i}`;
    
    // คลิกเพื่อเปลี่ยนสถานะ: Sample -> Normal Control -> Deficient Control
    let status = 'sample'; 
    cell.onclick = () => {
        if (status === 'sample') { status = 'normal'; spot.className = 'spot normal'; }
        else if (status === 'normal') { status = 'deficient'; spot.className = 'spot deficient'; }
        else { status = 'sample'; spot.className = 'spot'; }
        spotsData[i].type = status;
    };

    cell.appendChild(spot);
    gridOverlay.appendChild(cell);
    spotsData.push({ id: i, type: 'sample', value: 0 });
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

    // วิเคราะห์ทีละจุด
    const cellW = canvas.width / 5;
    const cellH = canvas.height / 4;

    spotsData.forEach((spot, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        
        // ดึงข้อมูลภาพในพื้นที่ของจุดนั้นๆ
        const imgData = ctx.getImageData(col * cellW + (cellW*0.2), row * cellH + (cellH*0.2), cellW*0.6, cellH*0.6);
        let sum = 0;
        for (let j = 0; j < imgData.data.length; j += 4) {
            // คำนวณความสว่าง (เน้นสีเขียว/ฟ้าจาก Fluorescence)
            sum += (imgData.data[j] * 0.299 + imgData.data[j+1] * 0.587 + imgData.data[j+2] * 0.114);
        }
        const avg = sum / (imgData.data.length / 4);
        
        // แสดงผลในตาราง
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Spot ${i+1}</td>
            <td>${spot.type.toUpperCase()}</td>
            <td>${avg.toFixed(1)}</td>
            <td>${avg > 50 ? '✅ Positive' : '❌ Negative'}</td>
        `;
        tbody.appendChild(tr);
    });
};
