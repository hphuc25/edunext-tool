# EduNext Tool

Tampermonkey cho `fsc-edunext.fpt.edu.vn` - Chuẩn `https://.../api/v1`

## Tính năng chính

- `\` - Bypass chặn copy/paste
- `]` - Bôi đen text -> gửi AI -> tự copy kết quả
- `[` - Mở GUI cấu hình
- GUI: `Base URL` + `API Key` + `Model` + `↻ Refresh` (tự load model) + `Max tokens`

## Cài đặt

1. Cài Tampermonkey:
   - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
   - https://www.tampermonkey.net/

2. Copy `script.js` -> Tampermonkey Dashboard -> Create new script -> dán -> `Ctrl+S`

## Lấy API Free

- **OpenRouter (khuyên dùng):** https://openrouter.ai/keys - Base `https://openrouter.ai/api/v1` - Model free: `meta-llama/llama-3.1-8b-instruct:free`
- **Gemini:** https://aistudio.google.com/app/apikey - Base `https://generativelanguage.googleapis.com/v1beta/openai`
- **Ollama:** https://ollama.com/ - cần tunnel `https` (vd `npx localtunnel --port 11434`)

## Dùng

Bôi đen câu hỏi -> bấm `]` -> chờ pop-up `AI đang xử lý` -> `✓ Đã xong` -> bấm `📋 Copy` -> `Ctrl+V`

File duy nhất: `script.js`
