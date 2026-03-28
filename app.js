const gridOverlay = document.getElementById('grid-overlay');
const video = document.getElementById('webcam');
const spotsData = []; 
const labels = ['A','B','C','D'];

// สร้าง Grid 4x5 และระบบ Cycle Tab
for (let i = 0; i < 20; i++) {
    const colLabel = labels[i % 4];
    const rowLabel = Math.floor(i / 4) + 1;
    const posName = `${colLabel}${rowLabel}`;

    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    const spot = document.createElement('div');
    spot.className = 'spot';
    
    let state = 0; // 0: ND, 1: Sample, 2: Normal QC, 3: Deficient QC
    cell.onclick = () => {
        state = (state + 1) % 4;
        if (state === 1) spot.className = 'spot sample';
        else if (state === 2) spot.className = 'spot normal';
        else if (state === 3) spot.className = 'spot deficient';
        else spot.className = 'spot'; // กลับเป็น ND
        spotsData[i].type = state;
    };

    cell.appendChild(spot);
    gridOverlay.appendChild(cell);
    spotsData.push({ id: i, pos: posName, type: 0 });
}

// เริ่มกล้อง
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

    const cellW = canvas.width / 4;
    const cellH = canvas.height / 5;

    spotsData.forEach((spot, i) => {
        if (spot.type === 0) { // กรณี Not Done (ND)
            tbody.innerHTML += `<tr><td>${spot.pos}</td><td>-</td><td>-</td><td class="text-nd">ND</td></tr>`;
            return;
        }

        const col = i % 4;
        const row = Math.floor(i / 4);
        const data = ctx.getImageData(col * cellW + (cellW*0.25), row * cellH + (cellH*0.25), cellW*0.5, cellH*0.5);
        
        let bSum = 0, count = 0;
        for (let j = 0; j < data.data.length; j += 4) {
            const r = data.data[j], g = data.data[j+1], b = data.data[j+2];
            // วิเคราะห์เฉพาะจุดที่ "สีน้ำเงินเด่น" และสว่างพอ
            if (b > r && b > g && b > 20) {
                bSum += b; count++;
            }
        }
        
        const avgB = count > 0 ? bSum / count : 0;
        let res = 'Deficient', cls = 'text-deficient';
        if (avgB > 75) { res = 'Normal'; cls = 'text-normal'; }
        else if (avgB > 35) { res = 'Partial'; cls = 'text-partial'; }

        const typeLabels = ['', 'SAMPLE', 'QC NORM', 'QC DEF'];
        tbody.innerHTML += `
            <tr>
                <td>${spot.pos}</td>
                <td>${typeLabels[spot.type]}</td>
                <td>${avgB.toFixed(1)}</td>
                <td class="${cls}">${res}</td>
            </tr>`;
    });
};
