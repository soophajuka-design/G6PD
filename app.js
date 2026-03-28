const gridContainer = document.getElementById('grid');
const resBody = document.getElementById('res-body');

// สร้าง Grid 3x3 และตารางเริ่มต้น
const positions = ['A1','A2','A3','B1','B2','B3','C1','C2','C3'];

function init() {
    positions.forEach((pos, i) => {
        // สร้าง Grid Item
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.onclick = () => selectPosition(i);
        gridContainer.appendChild(item);

        // สร้างแถวในตาราง
        const row = document.createElement('tr');
        row.id = `row-${i}`;
        row.innerHTML = `
            <td>${pos}</td>
            <td class="status-cell">--</td>
            <td class="val-cell">--</td>
        `;
        resBody.appendChild(row);
    });
}

function selectPosition(index) {
    // ลบ class active จากตัวอื่น
    document.querySelectorAll('.grid-item').forEach(el => el.classList.remove('active'));
    // เพิ่มให้ตัวที่เลือก
    document.querySelectorAll('.grid-item')[index].classList.add('active');
}

// จำลองการอัปเดตค่า Real-time
setInterval(() => {
    // ในขั้นตอนนี้คุณสามารถนำ Logic การวิเคราะห์ HSV มาใส่เพื่อเปลี่ยนสีข้อความจริงได้
    // ตัวอย่างการเปลี่ยนสี:
    // element.className = 'text-normal';
}, 1000);

init();
