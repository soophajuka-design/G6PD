//**
const video = document.getElementById('video');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// 1. ฟังก์ชันเปิดกล้อง
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }, // ใช้กล้องหลังสำหรับมือถือ
            audio: false
        });
        video.srcObject = stream;
        
        // รอให้วิดีโอโหลด Metadata เพื่อทราบขนาดที่แท้จริง
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve(video);
            };
        });
    } catch (err) {
        console.error("ไม่สามารถเข้าถึงกล้องได้:", err);
        alert("กรุณาอนุญาตการเข้าถึงกล้อง");
    }
}

// 2. ปรับปรุงฟังก์ชัน Render ให้ทำงานแบบ Real-time Loop
function processFrame() {
    // วาดภาพจากวิดีโอลงบน Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // เรียกใช้ Logic การวาดวงกลมและสรุปผลที่เราเขียนไว้ก่อนหน้านี้
    drawOverlays(); 

    // วนลูปทำงานเฟรมถัดไป
    requestAnimationFrame(processFrame);
}

// 3. เริ่มต้นระบบ
setupCamera().then(() => {
    video.play();
    processFrame();
});
//*
