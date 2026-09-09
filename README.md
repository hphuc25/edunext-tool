# EduNext Tool

## Tính năng chính

- `\` - Bypass chặn copy/paste
- `]` - Bôi đen text -> gửi AI -> tự copy kết quả
- `[` - Mở GUI cấu hình

## Cài đặt

1. Cài Tampermonkey:
   - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
   - https://www.tampermonkey.net/

2. Cài script:
   - **Cài 1 click:** https://raw.githubusercontent.com/hphuc25/edunext-tool/main/edunext-tool.user.js
   - Hoặc copy `edunext-tool.user.js` -> Tampermonkey Dashboard -> Create new script -> dán -> `Ctrl+S`

## Lấy API Free

- **OpenRouter (khuyên dùng):** https://openrouter.ai/keys - Base `https://openrouter.ai/api/v1` 
- **Gemini:** https://aistudio.google.com/app/apikey - Base `https://generativelanguage.googleapis.com/v1beta/openai`
- **Ollama:** https://ollama.com/ - cần tunnel `https` (vd `npx localtunnel --port 11434`)

## Dùng

Bôi đen câu hỏi -> bấm `]` -> chờ pop-up `AI đang xử lý` -> `✓ Đã xong` -> bấm `📋 Copy` -> `Ctrl+V`

File: `edunext-tool.user.js` (mở link raw `.user.js` là Tampermonkey tự hiện Install)
