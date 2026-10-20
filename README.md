# EduNext Tool

## Tính năng chính

- `\` - Bypass chặn copy/paste
- `]` - Bấm -> **chọn phần tử trên trang** (text hoặc ảnh) -> gửi AI -> tự copy kết quả
- `[` - Mở GUI cấu hình
- `📷` - Nút nổi: chọn phần tử (ảnh -> OCR)
- Ảnh được đọc chữ bằng **Tesseract.js** (chạy ngay trong trình duyệt)

## Cài đặt

1. Cài Tampermonkey:
   - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
   - https://www.tampermonkey.net/

2. Cài script:
   - **Cài 1 click:** https://raw.githubusercontent.com/hphuc25/edunext-tool/main/edunext-tool.user.js
   - Hoặc copy `edunext-tool.user.js` -> Tampermonkey Dashboard -> Create new script -> dán -> `Ctrl+S`

   **Video hướng dẫn:**

   <table>
   <tr>
   <td align="center"><b>HD Cài đặt</b></td>
   <td align="center"><b>HD Sử dụng</b></td>
   </tr>
   <tr>
   <td>
   <video src="https://raw.githubusercontent.com/hphuc25/edunext-tool/main/install.mp4" controls width="400"></video>
   <br>
   <a href="./install.mp4">▶️ Xem HD Cài đặt</a>
   </td>
   <td>
   <video src="https://raw.githubusercontent.com/hphuc25/edunext-tool/main/use.mp4" controls width="400"></video>
   <br>
   <a href="./use.mp4">▶️ Xem HD Sử dụng</a>
   </td>
   </tr>
   </table>

## Lấy API Free

- **OpenRouter (khuyên dùng):** https://openrouter.ai/keys - Base `https://openrouter.ai/api/v1` 
- **Gemini:** https://aistudio.google.com/app/apikey - Base `https://generativelanguage.googleapis.com/v1beta/openai`
- **Ollama:** https://ollama.com/ - cần tunnel `https` (vd `npx localtunnel --port 11434`)

## Dùng

1. Bấm `]` (hoặc nút `📷`) -> trỏ chuột qua phần tử cần lấy (sẽ hiện viền xanh) -> **click** để chọn. Bấm `ESC` để huỷ.
2. Nếu chọn phần tử **chỉ có ảnh**, script tải Tesseract.js và **OCR** đọc chữ trong ảnh.
3. Chờ pop-up `AI đang xử lý` -> `✓ Đã xong` -> bấm `📋 Copy` -> `Ctrl+V`.

> Lưu ý: OCR lần đầu phải tải thư viện + data tiếng Việt (~1.4 MB) từ CDN, hơi lâu; lần sau dùng cache. Đổi ngôn ngữ OCR trong `Setting` -> `OCR language` (vd `vie`, `eng`).

File: `edunext-tool.user.js` (mở link raw `.user.js` là Tampermonkey tự hiện Install)
