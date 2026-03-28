const gridOverlay = document.getElementById('grid-overlay');
const video = document.getElementById('webcam');
const spotsData = [];
const labels = ['A','B','C','D'];

function initGrid() {
    gridOverlay.innerHTML = '';
    spotsData.length = 0;
    for (let i = 0; i < 20; i++) {
        const pos = `${labels[i % 4]}${Math.floor(i / 4) + 1}`;
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const spot = document.createElement('div');
        spot.className = 'spot';
        
        let state = 0; // 0:ND, 1:Sample, 2:Normal, 3:Deficient
        cell.onclick = () => {
            state = (state + 1) % 4;
            const classes = ['spot', 'spot sample', 'spot normal', 'spot deficient'];
            spot.className = classes[state];
            spotsData[i].type = state;
        };

        cell.appendChild(spot);
        gridOverlay.appendChild(cell);
        spotsData.push({ id: i, pos: pos, type: 0 });
    }
}

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(s => video.srcObject = s);

document.getElementById('reset-btn').onclick = () => {
    initGrid();
    document.querySelector('#result-table tbody').innerHTML = '';
};

document.getElementById('capture-btn').onclick = () => {
    const canvas = document.getElementById('proc-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const tbody = document.querySelector('#result-table tbody');
    tbody.innerHTML = '';

    const ratio = video.videoWidth / video.clientWidth;
    const offset = 10 * ratio;
    const cellW = (canvas.width - offset*2) / 4;
    const cellH = (canvas.height - offset*2) / 5;

    spotsData.forEach((spot, i) => {
        if (spot.type === 0) {
            tbody.innerHTML += `<tr><td>${spot.pos}</td><td>-</td><td>-</td><td class="text-nd">ND</td></tr>`;
            return;
        }

        const x = offset + (i % 4) * cellW + cellW * 0.25;
        const y = offset + Math.floor(i / 4) * cellH + cellH * 0.25;
        const data = ctx.getImageData(x, y, cellW * 0.5, cellH * 0.5).data;
        
        let bSum = 0, count = 0;
        for (let j = 0; j < data.length; j += 4) {
            const r = data[j], g = data[j+1], b = data[j+2];
            if (b > r && b > g && b > 30) { bSum += b; count++; }
        }

        const avgB = count > 0 ? bSum / count : 0;
        let res = 'Deficient', cls = 'text-deficient';
        if (avgB > 80) { res = 'Normal'; cls = 'text-normal'; }
        else if (avgB > 40) { res = 'Partial'; cls = 'text-partial'; }

        const typeNames = ['ND', 'SAMPLE', 'QC NORM', 'QC DEF'];
        tbody.innerHTML += `<tr><td>${spot.pos}</td><td>${typeNames[spot.type]}</td><td>${avgB.toFixed(1)}</td><td class="${cls}">${res}</td></tr>`;
    });
};

initGrid();
