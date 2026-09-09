// ==UserScript==
// @name         Bypass + Unified AI - FPT EduNext
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  \ bypass, ] gửi AI (chuẩn OpenAI /api/v1), [ mở GUI - Refresh + API Key - đa nhà cung cấp
// @match        https://fsc-edunext.fpt.edu.vn/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      *
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    let savedText = "";
    const get = (k,v) => GM_getValue(k,v);
    const set = (k,v) => GM_setValue(k,v);

    function toast(msg, t=2500){
        let d=document.createElement('div');
        d.textContent=msg;
        d.style.cssText='position:fixed;top:15px;right:15px;background:#222;color:#fff;padding:10px 14px;border-radius:8px;z-index:2147483647;font-size:13px;max-width:450px;white-space:pre-wrap';
        document.body.appendChild(d); setTimeout(()=>d.remove(),t);
    }
    let statusEl=null, statusTimer=null, currentRequest=null;
    function ensureStatus(){
        if(statusEl) return statusEl;
        statusEl=document.createElement('div');
        statusEl.id='opencode-status';
        statusEl.style.cssText='position:fixed;bottom:52px;right:15px;min-width:220px;max-width:340px;background:#fff;color:#111;border:1px solid #ddd;border-radius:10px;z-index:2147483647;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,0.18);font-family:sans-serif;font-size:12px;display:none;';
        document.body.appendChild(statusEl);
        return statusEl;
    }
    function showStatusRunning(model){
        const el=ensureStatus();
        el.style.display='block';
        el.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border:2px solid #009688;border-top-color:transparent;border-radius:50%;display:inline-block;animation:ocSpin 0.8s linear infinite"></span><b>AI đang xử lý...</b><span style="margin-left:auto;font-size:10px;color:#888">${model}</span></div><div id="oc-status-text" style="margin-top:6px;color:#555;font-size:11px;white-space:pre-wrap;max-height:80px;overflow:hidden">Đang suy nghĩ, vui lòng chờ...</div><div style="margin-top:8px;text-align:right"><button id="oc-cancel" style="padding:6px 10px;background:#ff5252;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:11px">✕ Cancel</button></div>`;
        if(!document.getElementById('ocSpinStyle')){
            const s=document.createElement('style'); s.id='ocSpinStyle'; s.textContent='@keyframes ocSpin{to{transform:rotate(360deg)}}';
            document.head.appendChild(s);
        }
        el.querySelector('#oc-cancel').onclick=()=>{
            if(currentRequest && currentRequest.abort) currentRequest.abort();
            clearInterval(statusTimer);
            el.style.display='none';
            toast('Đã cancel',1500);
            currentRequest=null;
        };
        clearInterval(statusTimer);
        let dots=0;
        statusTimer=setInterval(()=>{
            const t=document.getElementById('oc-status-text');
            if(t) t.textContent='Đang suy nghĩ' + '.'.repeat((dots++%3)+1);
        },600);
    }
    function showStatusDone(result){
        clearInterval(statusTimer);
        const el=ensureStatus();
        el.style.display='block';
        const preview=result.slice(0,120).replace(/</g,'&lt;');
        el.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><span style="color:#2e7d32">✓</span><b>Đã xong</b><span style="margin-left:auto;font-size:10px;color:#888">${result.length} ký tự</span></div><div style="margin-top:6px;background:#f5f5f5;border-radius:6px;padding:6px 8px;font-size:11px;max-height:100px;overflow:auto;white-space:pre-wrap">${preview}${result.length>120?'...':''}</div><div style="display:flex;gap:6px;margin-top:8px"><button id="oc-copy" style="flex:1;padding:6px;background:#1a73e8;color:#fff;border:0;border-radius:6px;cursor:pointer;font-weight:bold">📋 Copy</button><button id="oc-close" style="padding:6px 10px;background:#eee;border:0;border-radius:6px;cursor:pointer">✕</button></div>`;
        el.querySelector('#oc-copy').onclick=()=>{
            navigator.clipboard.writeText(result).catch(()=>{});
            toast('Đã copy!');
        };
        el.querySelector('#oc-close').onclick=()=> el.style.display='none';
        setTimeout(()=>{ if(el) el.style.display='none'; },15000);
    }
    function showStatusError(msg){
        clearInterval(statusTimer);
        const el=ensureStatus();
        el.style.display='block';
        el.innerHTML=`<div style="color:#c62828;font-weight:bold">✕ Lỗi</div><div style="margin-top:4px;white-space:pre-wrap;font-size:11px">${msg.slice(0,400)}</div><div style="margin-top:8px;text-align:right"><button id="oc-close2" style="padding:6px 10px;background:#eee;border:0;border-radius:6px;cursor:pointer">Đóng</button></div>`;
        el.querySelector('#oc-close2').onclick=()=> el.style.display='none';
    }
    function runBypass(){
        const b=e=>{e.stopImmediatePropagation();return true};
        document.addEventListener('paste',b,{capture:true});
        document.addEventListener('copy',b,{capture:true});
        document.addEventListener('cut',b,{capture:true});
        document.addEventListener('contextmenu',b,{capture:true});
        document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(el=>{el.onpaste=null;el.oncopy=null;el.oncut=null});
        toast("bypass successful");
    }

    function getBase(){ return (get('ai_base','https://openrouter.ai/api/v1')).replace(/\/$/,''); }
    function getChatUrl(){ return getBase() + '/chat/completions'; }
    function getModelsUrl(){ return getBase() + '/models'; }
    function getHeaders(){
        let h={'Content-Type':'application/json'};
        const k=get('ai_api_key','').trim();
        if(k) h['Authorization']='Bearer '+k;
        const ref=get('ai_referer','');
        if(ref) h['HTTP-Referer']=ref;
        return h;
    }

    function fetchModels(){
        const sel=document.getElementById('gm-model');
        const btn=document.getElementById('gm-refresh');
        if(!sel) return;
        sel.innerHTML='<option>Đang load...</option>';
        btn.disabled=true; btn.textContent='⏳';
        const tryOllamaFallback = ()=>{
            let base=getBase();
            let ollamaBase=base.replace(/\/v1$/,'').replace(/\/api\/v1$/,'').replace(/\/api$/,'');
            if(ollamaBase===base) ollamaBase=base.replace(/\/v1.*$/,'');
            const url2 = ollamaBase + '/api/tags';
            GM_xmlhttpRequest({
                method:'GET',
                url: url2,
                headers: getHeaders(),
                onload: r=>{
                    btn.disabled=false; btn.textContent='↻ Refresh';
                    try{
                        if(r.status!==200) throw new Error('HTTP '+r.status);
                        const data=JSON.parse(r.responseText);
                        const models=data.models||[];
                        if(!models.length) throw new Error('Không có model');
                        sel.innerHTML='';
                        models.forEach(m=>{
                            const name=m.name||m.id;
                            const o=document.createElement('option');
                            o.value=name; o.textContent=name; o.title=name; sel.appendChild(o);
                        });
                        sel.title=sel.value;
                        const cur=get('ai_model','');
                        if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
                        else set('ai_model', sel.value);
                        sel.title=sel.value;
                        sel.onchange=()=> sel.title=sel.value;
                        toast('Đã load '+models.length+' model (Ollama)');
                    }catch(e){ toast('Lỗi load model: '+e.message,4000); sel.innerHTML='<option value="">-- lỗi --</option>'; }
                },
                onerror: ()=>{ btn.disabled=false; btn.textContent='↻ Refresh'; toast('Lỗi kết nối '+url2,4000); }
            });
        };

        GM_xmlhttpRequest({
            method:'GET',
            url: getModelsUrl(),
            headers: getHeaders(),
            onload: r=>{
                if(r.status===200){
                    try{
                        const data=JSON.parse(r.responseText);
                        const models=data.data||data.models||[];
                        if(!models.length) throw new Error('Không có model');
                        btn.disabled=false; btn.textContent='↻ Refresh';
                        sel.innerHTML='';
                        models.forEach(m=>{
                            const name=m.id||m.name||m.model;
                            const o=document.createElement('option');
                            o.value=name; o.textContent=name; o.title=name; sel.appendChild(o);
                        });
                        const cur=get('ai_model','');
                        if(cur && [...sel.options].some(o=>o.value===cur)) sel.value=cur;
                        else set('ai_model', sel.value);
                        sel.title=sel.value;
                        sel.onchange=()=> sel.title=sel.value;
                        toast('Đã load '+models.length+' model');
                        return;
                    }catch(e){  }
                }
                tryOllamaFallback();
            },
            onerror: tryOllamaFallback
        });
    }

    function callAI(text){
        const model=get('ai_model','');
        const promptTpl=get('ai_prompt','Giải bài tập cho tôi:');
        if(!model){ toast('Chưa chọn model! Bấm [ > Refresh'); openPanel(); return; }
        showStatusRunning(model);
        const fullPrompt = `${promptTpl}\n\n"""${text}"""`;
        let maxTok = parseInt(get('ai_max_tokens','1024')) || 0;
        if(!maxTok || maxTok<=0){
            const est = Math.ceil(fullPrompt.length/4);
            maxTok = Math.min(2048, Math.max(256, Math.ceil(est*1.2)+256));
            const totalEst = est + maxTok;
            if(totalEst > 1400) maxTok = Math.max(256, 1400 - est);
        }
        const send = (mt)=>{
            currentRequest = GM_xmlhttpRequest({
                method:'POST',
                url: getChatUrl(),
                headers: getHeaders(),
                data: JSON.stringify({ model: model, messages:[{role:'user', content: fullPrompt}], temperature:0.7, max_tokens: mt, stream:false }),
                onload: r=>{
                    currentRequest=null;
                    try{
                        if(r.status===402 && mt>256){
                            const newMt = Math.max(256, Math.floor(mt/2));
                            toast('402 hết credit, đang thử lại với max_tokens='+newMt,3000);
                            showStatusRunning(model + ' (retry '+newMt+')');
                            send(newMt);
                            return;
                        }
                        if(r.status!==200) throw new Error('HTTP '+r.status+': '+r.responseText.slice(0,400));
                        const data=JSON.parse(r.responseText);
                        const result=data.choices?.[0]?.message?.content || data.message?.content || data.response || data.content;
                        if(!result) throw new Error('Không có kết quả: '+r.responseText.slice(0,300));
                        navigator.clipboard.writeText(result).catch(()=>{});
                        savedText=result;
                        showStatusDone(result);
                        toast('AI xong! Đã copy',2000);
                    }catch(e){ showStatusError(e.message); toast('Lỗi AI: '+e.message,5000); console.error(e); }
                },
                onerror: ()=>{ currentRequest=null; showStatusError('Lỗi kết nối '+getBase()); toast('Lỗi kết nối '+getBase(),4000); }
            });
        };
        send(maxTok);
    }

    document.addEventListener('keydown', e=>{
        if(e.key==='\\' && !e.ctrlKey && !e.altKey) runBypass();
        if(e.key===']' && !e.ctrlKey && !e.altKey){
            const sel=window.getSelection().toString();
            if(sel.trim().length>0){ savedText=sel; toast('Đã copy: '+sel.slice(0,40)+'... Đang gửi AI'); callAI(sel); }
        }
        if(e.key==='[' && !e.ctrlKey && !e.altKey){ openPanel(); e.preventDefault(); }
    });
    document.addEventListener('click', e=>{
        const el=e.target.closest('input, textarea, [contenteditable="true"]');
        if(el && savedText && get('auto_paste',false)){
            setTimeout(()=>{
                el.focus();
                if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
                    const s=el.selectionStart, ee=el.selectionEnd;
                    el.value=el.value.slice(0,s)+savedText+el.value.slice(ee);
                    el.selectionStart=el.selectionEnd=s+savedText.length;
                    el.dispatchEvent(new Event('input',{bubbles:true}));
                } else document.execCommand('insertText',false,savedText);
            },10);
        }
    }, true);

    let panel;
    function createPanel(){
        panel=document.createElement('div');
        panel.id='ai-panel';
        panel.style.cssText='position:fixed;bottom:60px;right:15px;width:360px;background:#fff;color:#111;border:1px solid #ddd;border-radius:12px;z-index:2147483647;padding:16px;box-shadow:0 8px 30px rgba(0,0,0,0.2);display:none;font-family:sans-serif;';
        panel.innerHTML=`
            <b style="font-size:15px">⚙️ AI Unified (OpenAI /api/v1)</b>
            <div style="margin:10px 0 6px;font-size:12px">Base URL - chuẩn https://.../api/v1</div>
            <input id="gm-base" placeholder="https://openrouter.ai/api/v1" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box">
            <div style="margin:10px 0 6px;font-size:12px">API Key</div>
            <input id="gm-key" type="password" placeholder="sk-or-... / sk-... / Bearer" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box">
            <div style="margin:10px 0 6px;font-size:12px">Model</div>
            <div style="display:flex;gap:6px;min-width:0">
                <select id="gm-model" title="Chọn model" style="flex:1;min-width:0;max-width:240px;padding:8px;border:1px solid #ccc;border-radius:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><option>Chưa load</option></select>
                <button id="gm-refresh" style="padding:8px 10px;background:#009688;color:#fff;border:0;border-radius:6px;cursor:pointer;white-space:nowrap;flex-shrink:0">↻ Refresh</button>
            </div>
            <div style="margin:10px 0 6px;font-size:12px">Prompt</div>
            <textarea id="gm-prompt" rows="3" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box"></textarea>
            <div style="display:flex;gap:8px;margin-top:10px">
                <div style="flex:1"><div style="font-size:11px;color:#555;margin-bottom:4px">Max tokens (0=auto)</div><input id="gm-max" type="number" min="0" max="8192" step="128" placeholder="1024" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box"></div>
                <label style="display:flex;align-items:center;gap:6px;margin-top:18px;font-size:12px;white-space:nowrap"><input type="checkbox" id="gm-autopaste"> Tự dán</label>
            </div>
            <button id="gm-bypass" style="width:100%;margin-top:10px;padding:10px;background:#ff9800;color:#fff;border:0;border-radius:8px;cursor:pointer;font-weight:bold">🔓 Bypass Paste</button>
            <button id="gm-save" style="width:100%;margin-top:8px;padding:10px;background:#1a73e8;color:#fff;border:0;border-radius:8px;cursor:pointer;font-weight:bold">Lưu</button>
            <div id="gm-status" style="font-size:12px;color:green;margin-top:6px;text-align:center"></div>
            <div style="text-align:center;font-size:10px;color:#888;margin-top:6px">Chuẩn OpenAI: base + /chat/completions</div>
        `;
        document.body.appendChild(panel);
        panel.querySelector('#gm-base').value=get('ai_base','https://openrouter.ai/api/v1');
        panel.querySelector('#gm-key').value=get('ai_api_key','');
        panel.querySelector('#gm-prompt').value=get('ai_prompt','Giải bài tập cho tôi:');
        panel.querySelector('#gm-max').value=get('ai_max_tokens','1024');
        panel.querySelector('#gm-autopaste').checked=get('auto_paste',false);
        panel.querySelector('#gm-refresh').onclick=fetchModels;
        panel.querySelector('#gm-save').onclick=()=>{
            set('ai_base', panel.querySelector('#gm-base').value.trim().replace(/\/$/,''));
            set('ai_api_key', panel.querySelector('#gm-key').value.trim());
            set('ai_model', panel.querySelector('#gm-model').value);
            set('ai_prompt', panel.querySelector('#gm-prompt').value.trim());
            set('ai_max_tokens', panel.querySelector('#gm-max').value.trim());
            set('auto_paste', panel.querySelector('#gm-autopaste').checked);
            panel.querySelector('#gm-status').textContent='Đã lưu!';
            toast('Đã lưu',1500);
            setTimeout(()=>panel.querySelector('#gm-status').textContent='',1500);
        };
        panel.querySelector('#gm-bypass').onclick=()=>runBypass();
        setTimeout(fetchModels,500);
    }
    function openPanel(){ if(!panel) createPanel(); panel.style.display=panel.style.display==='none'?'block':'none'; if(panel.style.display==='block') fetchModels(); }
    function createBtn(){ const b=document.createElement('div'); b.textContent='⚙️ AI'; b.style.cssText='position:fixed;bottom:15px;right:15px;background:#009688;color:#fff;padding:8px 12px;border-radius:20px;z-index:2147483647;cursor:pointer;font-size:12px'; b.onclick=openPanel; document.body.appendChild(b); }
    window.addEventListener('load',()=>{createPanel();createBtn();});
    setTimeout(()=>{if(!document.getElementById('ai-panel')){createPanel();createBtn();}},2000);
    GM_registerMenuCommand('⚙️ AI Unified', openPanel);
})();
