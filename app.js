const gridContainer = document.getElementById('grid-container');
const tableBody = document.getElementById('table-body');
const video = document.getElementById('video');

const labels = ['A1','A2','A3','B1','B2','B3','C1','C2','C3'];

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
}

function initUI() {
    labels.forEach((label, index) => {
        // สร้าง Grid Item
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.onclick = () => selectTab(index);
        gridContainer.appendChild(item);

        // สร้างแถวตาราง
        const row = document.createElement('tr');
        row.id = `row-${index}`;
        row.innerHTML = `<td>${label}</td><td class="res">--</td><td class="val">0%</td>`;
        tableBody.appendChild(row);
    });
}

function selectTab(index) {
    document.querySelectorAll('.grid-item').forEach(el => el.classList.remove('active'));
    gridContainer.children[index].classList.add('active');
}

// จำลองการอัปเดต Real-time (จะเชื่อมกับ Logic HSV ในขั้นตอนถัดไป)
setInterval(() => {
    const activeIdx = Array.from(gridContainer.children).findIndex(el => el.classList.contains('active'));
    if (activeIdx !== -1) {
        const mockVal = Math.floor(Math.random() * 100);
        const row = document.getElementById(`row-${activeIdx}`);
        const resCell = row.querySelector('.res');
        
        row.querySelector('.val').innerText = mockVal + '%';
        if (mockVal > 70) { resCell.innerText = 'Normal'; resCell.className = 'res status-normal'; }
        else if (mockVal > 30) { resCell.innerText = 'Partial'; resCell.className = 'res status-partial'; }
        else { resCell.innerText = 'Deficient'; resCell.className = 'res status-deficient'; }
    }
}, 1000);

startCamera();
initUI();
