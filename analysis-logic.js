
// ฟังก์ชันแปลง RGB เป็น HSV
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, v = max;

    // คำนวณ Hue (เฉดสี)
    if (delta === 0) h = 0;
    else if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * (((b - r) / delta) + 2);
    else h = 60 * (((b - g) / delta) + 4);

    if (h < 0) h += 360;

    // คำนวณ Saturation (ความสดของสี)
    s = max === 0 ? 0 : delta / max;

    return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}

// ฟังก์ชันตรวจสอบว่าเป็น "สีฟ้าเรืองแสง" หรือไม่
function isFluorescence(h, s, v) {
    const isBlueHue = h >= 190 && h <= 240; // ช่วงสีฟ้า
    const isSaturated = s > 20;             // ตัดสีขาว/เทาออก
    const isBrightEnough = v > 15;          // ตัด Noise ในที่มืด
    
    return isBlueHue && isSaturated && isBrightEnough;
}

