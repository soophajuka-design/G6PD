const video = document.getElementById('webcam');
const tableBody = document.getElementById('table-body');

// ฟังก์ชันเริ่มต้นกล้อง
async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
    });
    video.srcObject = stream;
}

// ฟังก์ชันจำลองการวิเคราะห์ Real-time (คุณต้องเชื่อมต่อ Logic HSV จริงที่นี่)
function updateRealTimeTable() {
    const positions = ['A1', 'A2', 'A3'];
    tableBody.innerHTML = ''; // Clear table

    positions.forEach((pos, index) => {
        // จำลองการอ่านค่า: ในงานจริงจะใช้ Canvas.getImageData วิเคราะห์สีฟ้า
        let intensity = Math.floor(Math.random() * 100); 
        let status = "Normal";
        let colorClass = "green";

        if (intensity < 30) { status = "Deficient"; colorClass = "red"; }
        else if (intensity < 60) { status = "Partial"; colorClass = "orange"; }

        const row = `<tr>
            <td>${pos}</td>
            <td style="color:${colorClass}">${status}</td>
            <td>${intensity}%</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

setInterval(updateRealTimeTable, 1000); // อัปเดตทุก 1 วินาที
setupCamera();
