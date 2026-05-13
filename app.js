'use strict';

/* ── YEAR ─────────────────────────────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Set today in A4 preview */
const a4Today = document.getElementById('a4-today');
if (a4Today) {
  a4Today.textContent = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/* ── HAMBURGER ───────────────────────────── */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('header-nav');
hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  nav.classList.toggle('open', open);
});
nav?.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
}));

/* ── HEADER SCROLL ───────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('site-header')?.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

/* ═══════════════════════════════════════════
   SPA NAVIGATION
═══════════════════════════════════════════ */
const DOC_META = {
  orcamento: {
    icon: '💰', title: 'Criar Orçamento',
    a4Type: 'ORÇAMENTO DE PRODUÇÃO', accentStart: '#00e5ff',
  },
  proposta: {
    icon: '📄', title: 'Criar Proposta Comercial',
    a4Type: 'PROPOSTA COMERCIAL', accentStart: '#c77dff',
  },
  contrato: {
    icon: '✍️', title: 'Gerar Contrato de Prestação de Serviços',
    a4Type: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS', accentStart: '#ff9f43',
  },
};

let currentDoc = null;

function goToForm(docKey) {
  currentDoc = docKey;
  const meta = DOC_META[docKey];

  /* Update form topbar */
  document.getElementById('form-doc-icon').textContent = meta.icon;
  document.getElementById('form-doc-title').textContent = meta.title;

  /* Update A4 doc type label */
  document.getElementById('a4-doc-type').textContent = meta.a4Type;

  /* Set initial accent color for this doc type */
  setAccentColor(meta.accentStart);
  document.getElementById('color-picker').value = meta.accentStart;
  document.getElementById('color-hex-input').value = meta.accentStart;
  updateSwatchActive(meta.accentStart);

  /* Transition views */
  const dash = document.getElementById('view-dashboard');
  const form = document.getElementById('view-form');

  dash.classList.remove('view-active');
  dash.classList.add('view-exit');
  setTimeout(() => {
    dash.classList.remove('view-exit');
    dash.style.display = 'none';
    form.removeAttribute('aria-hidden');
    form.style.display = 'block';
    form.classList.add('view-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    renderDocForm(docKey);
    /* Show themed placeholder in preview */
    const previewArea = document.querySelector('.preview-scroll-area');
    if (previewArea) {
      const docLabel = DOC_META[docKey].title.toLowerCase();
      previewArea.innerHTML = `<div class="preview-placeholder"><div class="preview-placeholder-icon">✨</div><div class="preview-placeholder-text">Preencha o formulário e clique em "Gerar Documento" para criar seu ${docLabel} com IA.</div></div>`;
    }
  }, 280);
}

function goToDashboard() {
  const dash = document.getElementById('view-dashboard');
  const form = document.getElementById('view-form');

  form.classList.remove('view-active');
  setTimeout(() => {
    form.style.display = 'none';
    form.setAttribute('aria-hidden', 'true');
    dash.style.display = 'block';
    dash.classList.add('view-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, 260);
}

/* Bind cards */
document.querySelectorAll('.doc-card').forEach(card => {
  const key = card.dataset.doc;
  card.addEventListener('click', () => goToForm(key));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToForm(key); }
  });
});

/* Bind individual buttons (stop propagation so card click doesn't double-fire) */
['btn-orcamento', 'btn-proposta', 'btn-contrato'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', e => {
    e.stopPropagation();
    const key = id.replace('btn-', '');
    goToForm(key);
  });
});

/* Back buttons */
document.getElementById('back-btn')?.addEventListener('click', goToDashboard);
document.getElementById('back-btn-2')?.addEventListener('click', goToDashboard);
document.getElementById('nav-dashboard')?.addEventListener('click', e => {
  e.preventDefault();
  if (document.getElementById('view-form').style.display === 'block') goToDashboard();
});

/* ═══════════════════════════════════════════
   COLOR PICKER
═══════════════════════════════════════════ */
const colorPicker = document.getElementById('color-picker');
const colorHexInput = document.getElementById('color-hex-input');
const a4AccentBar = document.getElementById('a4-accent-bar');

function setAccentColor(hex) {
  if (a4AccentBar) a4AccentBar.style.background = hex;

  document.getElementById('a4-sheet')?.style.setProperty('--doc-accent', hex);

  /* Section titles in A4 also get the accent color */
  document.querySelectorAll('.a4-section-title').forEach(el => {
    el.style.color = hex;
    el.style.borderBottomColor = hex;
  });
}

function isValidHex(val) { return /^#[0-9A-Fa-f]{6}$/.test(val); }

colorPicker?.addEventListener('input', () => {
  const hex = colorPicker.value;
  colorHexInput.value = hex;
  setAccentColor(hex);
  updateSwatchActive(hex);
});

colorHexInput?.addEventListener('input', () => {
  const hex = colorHexInput.value.startsWith('#') ? colorHexInput.value : '#' + colorHexInput.value;
  if (isValidHex(hex)) {
    colorPicker.value = hex;
    setAccentColor(hex);
    updateSwatchActive(hex);
  }
});

function updateSwatchActive(hex) {
  document.querySelectorAll('.swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color.toLowerCase() === hex.toLowerCase());
  });
}

document.querySelectorAll('.swatch').forEach(s => {
  s.addEventListener('click', () => {
    const hex = s.dataset.color;
    colorPicker.value = hex;
    colorHexInput.value = hex;
    setAccentColor(hex);
    updateSwatchActive(hex);
  });
});

/* ═══════════════════════════════════════════
   LOGO UPLOAD
═══════════════════════════════════════════ */
const logoDropZone = document.getElementById('logo-drop-zone');
const logoInput = document.getElementById('logo-input');
const logoDropInner = document.getElementById('logo-drop-inner');
const logoPreviewImg = document.getElementById('logo-preview-img');
const logoRemoveBtn = document.getElementById('logo-remove-btn');
const a4LogoImg = document.getElementById('a4-logo-img');
const a4LogoFallback = document.getElementById('a4-logo-fallback');

function handleLogoFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 5 * 1024 * 1024) { alert('Arquivo muito grande (máx 5 MB).'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    const src = e.target.result;

    /* Form preview */
    logoPreviewImg.src = src;
    logoPreviewImg.hidden = false;
    logoDropInner.hidden = true;
    logoRemoveBtn.hidden = false;

    /* A4 preview */
    a4LogoImg.src = src;
    a4LogoImg.hidden = false;
    a4LogoImg.className = 'a4-logo-img-el';
    if (a4LogoFallback) a4LogoFallback.hidden = true;
  };
  reader.readAsDataURL(file);
}

logoDropZone?.addEventListener('click', e => {
  if (e.target === logoRemoveBtn) return;
  logoInput.click();
});
logoDropZone?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); logoInput.click(); }
});
logoInput?.addEventListener('change', () => handleLogoFile(logoInput.files[0]));

/* Drag and drop */
logoDropZone?.addEventListener('dragover', e => { e.preventDefault(); logoDropZone.classList.add('drag-over'); });
logoDropZone?.addEventListener('dragleave', () => logoDropZone.classList.remove('drag-over'));
logoDropZone?.addEventListener('drop', e => {
  e.preventDefault();
  logoDropZone.classList.remove('drag-over');
  handleLogoFile(e.dataTransfer.files[0]);
});

logoRemoveBtn?.addEventListener('click', e => {
  e.stopPropagation();
  logoPreviewImg.src = '';
  logoPreviewImg.hidden = true;
  logoDropInner.hidden = false;
  logoRemoveBtn.hidden = true;
  logoInput.value = '';

  if (a4LogoImg) { a4LogoImg.src = ''; a4LogoImg.hidden = true; }
  if (a4LogoFallback) a4LogoFallback.hidden = false;
});

/* ═══════════════════════════════════════════
   DYNAMIC FORM TEMPLATES
═══════════════════════════════════════════ */
let orcamentoItems = [{ desc: '', valor: '' }];

function renderItemRows() {
  const lista = document.getElementById('itens-lista');
  if (!lista) return;
  lista.innerHTML = orcamentoItems.map((row, i) => `
    <div class="item-row">
      <input type="text" class="form-input item-desc" placeholder="Ex: Captação" value="${row.desc}" data-i="${i}" />
      <input type="text" class="form-input item-valor" placeholder="R$ 0,00" value="${row.valor}" data-i="${i}" />
      <button class="item-del-btn" data-i="${i}" ${orcamentoItems.length === 1 ? 'disabled' : ''}>✕</button>
    </div>`).join('');
  lista.querySelectorAll('.item-desc').forEach(el =>
    el.addEventListener('input', e => { orcamentoItems[+e.target.dataset.i].desc = e.target.value; }));
  lista.querySelectorAll('.item-valor').forEach(el =>
    el.addEventListener('input', e => { orcamentoItems[+e.target.dataset.i].valor = e.target.value; }));
  lista.querySelectorAll('.item-del-btn').forEach(el =>
    el.addEventListener('click', e => { orcamentoItems.splice(+e.target.dataset.i, 1); renderItemRows(); }));
}

function renderDocForm(docKey) {
  const container = document.getElementById('doc-form-body');
  if (!container) return;

  if (docKey === 'orcamento') {
    orcamentoItems = [{ desc: '', valor: '' }];
    container.innerHTML = `
      <div class="form-section">
        <div class="form-section-hd"><span class="fs-icon">💰</span><div><div class="fs-title">Detalhes do Orçamento</div><div class="fs-sub">Informe os itens e valores do serviço</div></div></div>
        <div class="field-group"><label class="field-label" for="o-client">Nome do Cliente <span class="req">*</span></label><input type="text" id="o-client" class="form-input" placeholder="Ex: Loja do João / Empresa XYZ" /></div>
        <div class="field-group"><label class="field-label">Itens do Serviço <span class="req">*</span></label>
          <div class="items-header"><span>Item / Descrição</span><span>Valor</span><span></span></div>
          <div id="itens-lista"></div>
          <button class="btn-add-item" id="btn-add-item" type="button">+ Adicionar Item</button>
        </div>
        <div class="field-group"><label class="field-label" for="o-pagamento">Forma de Pagamento <span class="req">*</span></label>
          <div class="select-wrap"><select id="o-pagamento" class="form-select"><option value="" disabled selected>Selecione…</option><option>50% entrada + 50% na entrega</option><option>À vista na entrega</option><option>30% + 30% + 40%</option><option>Parcelado (combinar)</option></select><span class="select-arrow">▾</span></div>
        </div>
        <div class="field-group" style="padding-bottom:20px"><label class="field-label" for="o-validade">Validade do Orçamento <span class="req">*</span></label>
          <div class="select-wrap"><select id="o-validade" class="form-select"><option value="" disabled selected>Selecione…</option><option>7 dias</option><option>15 dias</option><option>30 dias</option><option>60 dias</option></select><span class="select-arrow">▾</span></div>
        </div>
      </div>`;
    renderItemRows();
    document.getElementById('btn-add-item')?.addEventListener('click', () => {
      orcamentoItems.push({ desc: '', valor: '' });
      renderItemRows();
    });

  } else if (docKey === 'proposta') {
    container.innerHTML = `
      <div class="form-section">
        <div class="form-section-hd"><span class="fs-icon">✨</span><div><div class="fs-title">Briefing Criativo</div><div class="fs-sub">Informações para o deck de apresentação</div></div></div>
        <div class="field-group"><label class="field-label" for="p-client">Nome do Cliente / Empresa <span class="req">*</span></label><input type="text" id="p-client" class="form-input" placeholder="Ex: Studio Manu / Burger Co." /></div>
        <div class="field-group"><label class="field-label" for="p-objetivo">Objetivo do Vídeo <span class="req">*</span></label><textarea id="p-objetivo" class="form-textarea" rows="3" placeholder="Ex: Aumentar vendas, gerar autoridade, lançar produto…"></textarea></div>
        <div class="field-group"><label class="field-label" for="p-publico">Público-alvo <span class="req">*</span></label><input type="text" id="p-publico" class="form-input" placeholder="Ex: Mulheres 25-40, empreendedoras, classe B/C" /></div>
        <div class="field-group"><label class="field-label" for="p-referencias">Referências Criativas</label><textarea id="p-referencias" class="form-textarea" rows="2" placeholder="Links, marcas, estilos visuais de referência…"></textarea></div>
        <div class="field-group" style="padding-bottom:20px"><label class="field-label" for="p-porqueeu">Por que contratar você? <span class="req">*</span></label><textarea id="p-porqueeu" class="form-textarea" rows="4" placeholder="Seu diferencial, experiências e resultados anteriores…"></textarea></div>
      </div>`;

  } else {
    container.innerHTML = `
      <div class="form-section">
        <div class="form-section-hd"><span class="fs-icon">⚖️</span><div><div class="fs-title">Dados do Prestador</div><div class="fs-sub">Suas informações como prestador</div></div></div>
        <div class="field-group"><label class="field-label" for="c-prest-nome">Nome / Razão Social <span class="req">*</span></label><input type="text" id="c-prest-nome" class="form-input" placeholder="Seu nome ou empresa" /></div>
        <div class="field-group"><label class="field-label" for="c-prest-cpf">CPF / CNPJ <span class="req">*</span></label><input type="text" id="c-prest-cpf" class="form-input" placeholder="000.000.000-00" /></div>
        <div class="field-group" style="padding-bottom:20px"><label class="field-label" for="c-prest-end">Endereço <span class="req">*</span></label><input type="text" id="c-prest-end" class="form-input" placeholder="Rua, nº, bairro, cidade — UF" /></div>
      </div>
      <div class="form-section">
        <div class="form-section-hd"><span class="fs-icon">🤝</span><div><div class="fs-title">Dados do Contratante</div><div class="fs-sub">Informações do seu cliente</div></div></div>
        <div class="field-group"><label class="field-label" for="c-cont-nome">Nome / Razão Social <span class="req">*</span></label><input type="text" id="c-cont-nome" class="form-input" placeholder="Nome ou empresa do cliente" /></div>
        <div class="field-group"><label class="field-label" for="c-cont-cpf">CPF / CNPJ <span class="req">*</span></label><input type="text" id="c-cont-cpf" class="form-input" placeholder="000.000.000-00" /></div>
        <div class="field-group" style="padding-bottom:20px"><label class="field-label" for="c-cont-end">Endereço <span class="req">*</span></label><input type="text" id="c-cont-end" class="form-input" placeholder="Rua, nº, bairro, cidade — UF" /></div>
      </div>
      <div class="form-section">
        <div class="form-section-hd"><span class="fs-icon">📋</span><div><div class="fs-title">Condições do Contrato</div><div class="fs-sub">Prazos, foro e objeto do serviço</div></div></div>
        <div class="field-group"><label class="field-label" for="c-servico">Objeto do Serviço <span class="req">*</span></label><input type="text" id="c-servico" class="form-input" placeholder="Ex: Produção de vídeo institucional" /></div>
        <div class="field-group"><label class="field-label" for="c-valor">Valor Total (R$) <span class="req">*</span></label><input type="text" id="c-valor" class="form-input" placeholder="Ex: 3.500,00" /></div>
        <div class="field-group"><label class="field-label" for="c-inicio">Data de Início <span class="req">*</span></label><input type="date" id="c-inicio" class="form-input" /></div>
        <div class="field-group"><label class="field-label" for="c-entrega">Data de Entrega <span class="req">*</span></label><input type="date" id="c-entrega" class="form-input" /></div>
        <div class="field-group" style="padding-bottom:20px"><label class="field-label" for="c-foro">Foro de Eleição <span class="req">*</span></label><input type="text" id="c-foro" class="form-input" placeholder="Ex: Comarca de São Paulo — SP" /></div>
      </div>`;
  }
}

/* ═══════════════════════════════════════════
   FASE 3 — MOTOR DE INTELIGÊNCIA ARTIFICIAL
═══════════════════════════════════════════ */

function pv(fieldId, previewId, transform) {
  const field = document.getElementById(fieldId);
  const preview = document.getElementById(previewId);
  if (!field || !preview) return;

  const update = () => {
    const raw = field.value.trim();
    let val = raw || '—';
    if (transform) val = raw ? transform(raw) : '—';
    preview.textContent = val;
  };
  field.addEventListener('input', update);
  field.addEventListener('change', update);
}

pv('f-client', 'pv-client');
pv('f-type', 'pv-type');
pv('f-region', 'pv-region');
pv('f-size', 'pv-size');
pv('f-budget', 'pv-budget');
pv('f-style', 'pv-style');
pv('f-days', 'pv-days', v => `${v} diária${v == 1 ? '' : 's'}`);
pv('f-post', 'pv-post');
pv('f-deadline', 'pv-deadline', v => {
  try {
    const [yr, mo, dy] = v.split('-');
    return new Date(yr, mo - 1, dy).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return v; }
});

/* ═══════════════════════════════════════════
   FASE 3 — MOTOR DE INTELIGÊNCIA ARTIFICIAL
═══════════════════════════════════════════ */

/* ── Toast helper ── */
let toastWrap = null;
function showToast(msg, type = 'info', duration = 4000) {
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.appendChild(toastWrap);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  toastWrap.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* ── Preview UI helpers ── */
function showPreviewLoading() {
  const area = document.querySelector('.preview-scroll-area');
  if (area) {
    area.innerHTML = `
      <div class="ai-loading">
        <div class="ai-spinner"></div>
        <div class="ai-loading-title">Gerando com Gemini…</div>
        <div class="ai-loading-sub">A IA está redigindo seu documento profissional</div>
      </div>`;
  }
}

function showPreviewError(message) {
  const area = document.querySelector('.preview-scroll-area');
  if (area) {
    area.innerHTML = `
      <div class="ai-error">
        <div class="ai-error-icon">⚠️</div>
        <div class="ai-error-title">Erro na geração</div>
        <div class="ai-error-msg">${message}</div>
        <button class="ai-error-retry" onclick="gerarDocumentoAudiovisual(event)">Tentar novamente</button>
      </div>`;
  }
}

/* ── Gemini API call ── */
async function callGeminiAPI(prompt) {
  // TODO: INSERIR API KEY AQUI
  const API_KEY = 'AIzaSyBK8NrCB9TyCq4FCN4lavPrNf0dvSTMGZc';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  if (!API_KEY) {
    throw new Error('API Key não configurada. Abra app.js, localize "TODO: INSERIR API KEY AQUI" e insira sua chave gratuita do Google AI Studio.');
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Resposta vazia da IA. Tente novamente.');

  // Strip markdown fences if model included them
  return text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

/* ── Render AI result into preview ── */
function renderAIResult(html, { accentColor, logoSrc, hasLogo }) {
  const area = document.querySelector('.preview-scroll-area');
  if (!area) return;
  // Criar div #preview-documento que não possui CSS restritivo
  area.innerHTML = `
    <div class="a4-wrapper">
      <div id="preview-documento" style="width: 595px; min-height: 842px; background: #fff; box-shadow: 0 12px 60px rgba(0, 0, 0, .6); margin: 0 auto; overflow: hidden; position: relative;">
        ${html}
      </div>
    </div>
  `;
}

/* ── Contract base template ── */
const CONTRATO_TEMPLATE_BASE = `
<h2>CONTRATO DE PRESTAÇÃO DE SERVIÇOS AUDIOVISUAIS</h2>

<div class="contrato-parties">
  <div class="party-box">
    <h4>CONTRATADO</h4>
    <p><strong>[NOME DO PRESTADOR]</strong><br>CPF/CNPJ: [CPF/CNPJ]<br>Endereço: [ENDEREÇO]</p>
  </div>
  <div class="party-box">
    <h4>CONTRATANTE</h4>
    <p><strong>[NOME DO CONTRATANTE]</strong><br>CPF/CNPJ: [CPF/CNPJ]<br>Endereço: [ENDEREÇO]</p>
  </div>
</div>

<h3>CLÁUSULA 1ª — OBJETO</h3>
<p>Prestação de serviços audiovisuais conforme ANEXO I — ESCOPO DE SERVIÇOS.</p>
<h3>CLÁUSULA 2ª — PRAZO</h3>
<p>De [DATA DE INÍCIO] a [DATA DE ENTREGA], prorrogável mediante acordo escrito.</p>
<h3>CLÁUSULA 3ª — REMUNERAÇÃO</h3>
<p>Valor total: R$ [VALOR TOTAL]. Pagamento: 50% na assinatura + 50% na entrega aprovada.</p>
<h3>CLÁUSULA 4ª — REVISÕES</h3>
<p>Incluídas <strong>2 (duas) rodadas de revisão</strong>. Revisões adicionais: R$ [VALOR/REVISÃO] cada, via nova OS.</p>
<h3>CLÁUSULA 5ª — ARQUIVOS BRUTOS</h3>
<p>O footage bruto é de propriedade exclusiva do CONTRATADO e não será entregue, salvo negociação específica.</p>
<h3>CLÁUSULA 6ª — CANCELAMENTO E MULTA</h3>
<ul>
  <li>Mais de 15 dias de antecedência: perda do sinal (50%).</li>
  <li>Menos de 15 dias: 100% do valor contratado.</li>
  <li>Cancelamento no dia: 100% + 20% de multa.</li>
</ul>
<h3>CLÁUSULA 7ª — DIREITOS AUTORAIS E DE IMAGEM</h3>
<p>O CONTRATADO cede os direitos de uso do material para os fins do ANEXO I. Uso em mídias não previstas exige nova negociação.</p>
<h3>CLÁUSULA 8ª — PROPRIEDADE INTELECTUAL</h3>
<p>Conceito criativo, roteiro e trilha autoral permanecem como propriedade intelectual do CONTRATADO.</p>
<h3>CLÁUSULA 9ª — FORO</h3>
<p>Eleito o foro de [CIDADE/ESTADO]. Regido pela legislação brasileira.</p>
<h3>ANEXO I — ESCOPO DE SERVIÇOS</h3>
<p>[ESCOPO DETALHADO A SER PREENCHIDO PELA IA COM BASE NO BRIEFING]</p>
<p style="margin-top:32px">Local e data: [CIDADE], _____ de _____________ de _________.</p>
<p style="margin-top:24px">_______________________________<br><strong>CONTRATADO</strong></p>
<p style="margin-top:20px">_______________________________<br><strong>CONTRATANTE</strong></p>`;

/* ── Prompt builders ── */
function buildPromptOrcamento(b, accentColor, logoSrc, hasLogo) {
  const itemsText = b.items.map((it, i) => `${i + 1}. ${it.desc}: R$ ${it.valor || '[ ________ ]'}`).join('\n');
  const total = b.items.reduce((s, it) => {
    const n = parseFloat(String(it.valor).replace(/[^\d,]/g, '').replace(',', '.'));
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const totalFmt = total > 0 ? `R$ ${total.toFixed(2).replace('.', ',')}` : '[ ________ ]';
  const tone = total < 1500 ? 'Tom direto, simples e amigável, sem burocracia.' : 'Tom executivo, formal e preciso.';
  return `[PERSONA]: Atue como um UI/UX Designer de apresentações de alto nível e Gerente Financeiro especializado em produção audiovisual.
  
REGRA DE OURO: No retorne apenas texto. Retorne a estrutura completa do documento em HTML, utilizando Estilos Inline (style="") para criar um design único para cada projeto. Use conceitos de design editorial: tipografia variada, grids assimétricos, e blocos de cor modernos. Use fontes do Google Fonts (como Montserrat ou Playfair Display) importando via @import. Use a 'Cor Primária' (${accentColor}) para criar elementos de destaque (bordas finas, backgrounds de botões ou ícones). Crie seções com alturas diferentes para parecer um 'Pitch Deck' de cinema. ${hasLogo ? `Inclua a logo da produtora usando esta URL de imagem: ${logoSrc}` : ''}

REGRA ESTRUTURAL VITAL: Estruture o layout em blocos independentes usando a tag <section class='pdf-bloco'>. Cada seção deve conter um único assunto e não deve ser excessivamente longa para caber dentro de uma altura A4. Mantenha a estética premium, mas o código deve ser modular.

CLIENTE: ${b.client} | PAGAMENTO: ${b.pagamento} | VALIDADE: ${b.validade}
ITENS FORNECIDOS:
${itemsText}
TOTAL CALCULADO: ${totalFmt}
CONTEXTO: ${tone}

TAREFA: Redija e faça o design de um orçamento profissional de produção audiovisual.
Retorne APENAS HTML limpo (sem tags <html>, <head> ou <body> externas, apenas o conteúdo interno), com estilos inline exuberantes e modernos.`;
}

function buildPromptProposta(b, accentColor, logoSrc, hasLogo) {
  return `[PERSONA]: Atue como um UI/UX Designer de apresentações de alto nível e Diretor Criativo especializado em produção audiovisual.
  
REGRA DE OURO: No retorne apenas texto. Retorne a estrutura completa do documento em HTML, utilizando Estilos Inline (style="") para criar um design único para cada projeto. Use conceitos de design editorial: tipografia variada, grids assimétricos, e blocos de cor modernos. Use fontes do Google Fonts (como Montserrat ou Playfair Display) importando via @import. Use a 'Cor Primária' (${accentColor}) para criar elementos de destaque (bordas finas, backgrounds de botões ou ícones). Crie seções com alturas diferentes para parecer um 'Pitch Deck' de cinema. Crie uma 'Capa' ocupando a primeira página com a logo centralizada e o título em destaque. ${hasLogo ? `URL DA LOGO: ${logoSrc}` : ''}

REGRA ESTRUTURAL VITAL: Estruture o layout em blocos independentes usando a tag <section class='pdf-bloco'>. Cada seção deve conter um único assunto e não deve ser excessivamente longa para caber dentro de uma altura A4. Mantenha a estética premium, mas o código deve ser modular.

CLIENTE: ${b.client}
OBJETIVO DO VÍDEO: ${b.objetivo}
PÚBLICO-ALVO: ${b.publico}
REFERÊNCIAS CRIATIVAS: ${b.referencias || 'Não informadas'}
DIFERENCIAL DO FILMMAKER: ${b.porqueeu}

TAREFA: Crie uma Proposta Comercial em formato Pitch Deck focada em CONVERSÃO, com design visual impressionante.
Retorne APENAS HTML limpo (sem tags <html>, <head> ou <body> externas, apenas o conteúdo interno), com estilos inline.`;
}

function buildPromptContrato(b, accentColor, logoSrc, hasLogo) {
  const valorNum = parseFloat(String(b.valor).replace(/[^\d,]/g, '').replace(',', '.'));
  const tone = valorNum > 5000 ? 'Linguagem jurídica estritamente formal e executiva.' : 'Linguagem jurídica clara e acessível.';
  return `[PERSONA]: Atue como um UI/UX Designer de apresentações de alto nível e Advogado especialista em Direitos Autorais no Brasil.
  
REGRA DE OURO: No retorne apenas texto. Retorne a estrutura completa do documento em HTML, utilizando Estilos Inline (style="") para criar um design único para cada projeto. Use conceitos de design editorial: tipografia variada, grids assimétricos, e blocos de cor modernos. Use fontes do Google Fonts (como Montserrat ou Playfair Display) importando via @import. Use a 'Cor Primária' (${accentColor}) para criar elementos de destaque (bordas finas, backgrounds de botões ou ícones). Crie seções com alturas diferentes para parecer um 'Pitch Deck' de cinema. ${hasLogo ? `Inclua a logo da produtora usando esta URL de imagem: ${logoSrc}` : ''}

REGRA ESTRUTURAL VITAL: Estruture o layout em blocos independentes usando a tag <section class='pdf-bloco'>. Cada seção deve conter um único assunto e não deve ser excessivamente longa para caber dentro de uma altura A4. Mantenha a estética premium, mas o código deve ser modular.

TEMPLATE JURÍDICO BASE (Reescreva com design incrível):
${CONTRATO_TEMPLATE_BASE}

DADOS:
PRESTADOR: ${b.prestNome} | CPF/CNPJ: ${b.prestCpf} | Endereço: ${b.prestEnd}
CONTRATANTE: ${b.contNome} | CPF/CNPJ: ${b.contCpf} | Endereço: ${b.contEnd}
OBJETO: ${b.servico} | VALOR: R$ ${b.valor} | INÍCIO: ${b.inicio} | ENTREGA: ${b.entrega} | FORO: ${b.foro}
TOM: ${tone}

TAREFA: Preencha TODAS as variáveis e redija o ANEXO I — ESCOPO. Formate tudo como um documento com design moderno.
Retorne APENAS HTML limpo (sem tags <html>, <head> ou <body> externas, apenas o conteúdo interno), com estilos inline.`;
}

/* ── Main AI function ── */
async function gerarDocumentoAudiovisual(e) {
  if (e && e.preventDefault) e.preventDefault();

  const accentColor = document.getElementById('color-picker')?.value || '#00e5ff';
  const logoEl = document.getElementById('logo-preview-img');
  const hasLogo = logoEl && !logoEl.hidden && logoEl.src;
  const logoSrc = hasLogo ? logoEl.src : '';
  let b = {}, requiredIds = [], prompt;

  if (currentDoc === 'orcamento') {
    b = {
      client: document.getElementById('o-client')?.value?.trim() || '',
      pagamento: document.getElementById('o-pagamento')?.value,
      validade: document.getElementById('o-validade')?.value,
      items: orcamentoItems.filter(it => it.desc.trim()),
    };
    requiredIds = [['o-client', b.client], ['o-pagamento', b.pagamento], ['o-validade', b.validade]];
    if (!b.items.length) { showToast('Adicione pelo menos um item ao orçamento.', 'error'); return; }
    prompt = buildPromptOrcamento(b, accentColor, logoSrc, hasLogo);

  } else if (currentDoc === 'proposta') {
    b = {
      client: document.getElementById('p-client')?.value?.trim() || '',
      objetivo: document.getElementById('p-objetivo')?.value?.trim() || '',
      publico: document.getElementById('p-publico')?.value?.trim() || '',
      referencias: document.getElementById('p-referencias')?.value?.trim() || '',
      porqueeu: document.getElementById('p-porqueeu')?.value?.trim() || '',
    };
    requiredIds = [['p-client', b.client], ['p-objetivo', b.objetivo], ['p-publico', b.publico], ['p-porqueeu', b.porqueeu]];
    prompt = buildPromptProposta(b, accentColor, logoSrc, hasLogo);

  } else {
    b = {
      prestNome: document.getElementById('c-prest-nome')?.value?.trim() || '',
      prestCpf: document.getElementById('c-prest-cpf')?.value?.trim() || '',
      prestEnd: document.getElementById('c-prest-end')?.value?.trim() || '',
      contNome: document.getElementById('c-cont-nome')?.value?.trim() || '',
      contCpf: document.getElementById('c-cont-cpf')?.value?.trim() || '',
      contEnd: document.getElementById('c-cont-end')?.value?.trim() || '',
      servico: document.getElementById('c-servico')?.value?.trim() || '',
      valor: document.getElementById('c-valor')?.value?.trim() || '',
      inicio: document.getElementById('c-inicio')?.value,
      entrega: document.getElementById('c-entrega')?.value,
      foro: document.getElementById('c-foro')?.value?.trim() || '',
    };
    requiredIds = [
      ['c-prest-nome', b.prestNome], ['c-prest-cpf', b.prestCpf], ['c-prest-end', b.prestEnd],
      ['c-cont-nome', b.contNome], ['c-cont-cpf', b.contCpf], ['c-cont-end', b.contEnd],
      ['c-servico', b.servico], ['c-valor', b.valor],
      ['c-inicio', b.inicio], ['c-entrega', b.entrega], ['c-foro', b.foro],
    ];
    prompt = buildPromptContrato(b, accentColor, logoSrc, hasLogo);
  }

  let hasError = false;
  requiredIds.forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!val) {
      el?.classList.add('input-error');
      el?.addEventListener('input', () => el.classList.remove('input-error'), { once: true });
      hasError = true;
    }
  });
  if (hasError) { showToast('Preencha todos os campos obrigatórios (*)', 'error'); return; }

  const btn = document.getElementById('btn-generate');
  btn?.classList.add('loading');
  showPreviewLoading();
  try {
    const html = await callGeminiAPI(prompt);
    renderAIResult(html, { accentColor, logoSrc, hasLogo });
    showToast('Documento gerado com sucesso! ✓', 'success');
  } catch (err) {
    showPreviewError(err.message);
    showToast(err.message, 'error', 6000);
  } finally {
    btn?.classList.remove('loading');
  }
}
/* ── Bind generate button ── */
document.getElementById('btn-generate')?.addEventListener('click', gerarDocumentoAudiovisual);

/* ═══════════════════════════════════════════
   FASE 4 — EXPORTAÇÃO PARA PDF
═══════════════════════════════════════════ */
document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
  const element = document.getElementById('preview-documento') || document.querySelector('.a4-sheet');
  if (!element || element.querySelector('.preview-placeholder') || element.querySelector('.ai-loading') || element.querySelector('.ai-error')) {
    showToast('Gere um documento primeiro antes de exportar.', 'error');
    return;
  }

  // Fix de Renderização: Garantir que não haja rolagem cortando a captura
  window.scrollTo(0, 0);

  const btn = document.getElementById('btn-export-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span>Gerando PDF...</span>';
  btn.style.pointerEvents = 'none';

  let docType = document.getElementById('a4-doc-type')?.textContent || 'Documento';
  if (currentDoc === 'proposta') docType = 'Proposta_Comercial';
  const clientInputId = currentDoc === 'orcamento' ? 'o-client' : (currentDoc === 'proposta' ? 'p-client' : 'c-cont-nome');
  let clientName = document.getElementById(clientInputId)?.value.trim();
  if (!clientName) clientName = 'Cliente';

  const filename = `${docType.replace(/\s+/g, '_')}_${clientName.replace(/\s+/g, '_')}.pdf`;

  // 1. Clonar e fixar largura A4 (210mm) para que o layout se reorganize para papel
  const clone = element.cloneNode(true);
  clone.style.cssText = `
    width: 210mm !important;
    max-width: 210mm !important;
    min-height: auto !important;
    position: absolute !important;
    top: -99999px !important;
    left: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  `;

  // 3. CSS de quebra de página inteligente + 4. Preservar cores de fundo
  const styleObj = document.createElement('style');
  styleObj.innerHTML = `
    .pdf-bloco {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden;
    }
    h1, h2, h3, h4 {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    ::-webkit-scrollbar { display: none !important; }
  `;
  clone.appendChild(styleObj);
  document.body.appendChild(clone);

  // 2 + 5. Configuração html2pdf com escala, letterRendering e pagebreak avançado
  const opt = {
    margin: [10, 0, 10, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy', 'avoid-all'] }
  };

  html2pdf().set(opt).from(clone).save().then(() => {
    showToast('PDF exportado com sucesso! ✓', 'success');
  }).catch(err => {
    console.error(err);
    showToast('Erro ao exportar PDF.', 'error');
  }).finally(() => {
    btn.innerHTML = originalText;
    btn.style.pointerEvents = 'auto';
    if (clone.parentNode) clone.parentNode.removeChild(clone);
  });
});


/* ═══════════════════════════════════════════
   STATS COUNTER ANIMATION
═══════════════════════════════════════════ */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(eased * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsBar = document.querySelector('.stats-bar');
const statNums = document.querySelectorAll('.stat-number');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      statNums.forEach(el => animateCounter(el, parseInt(el.dataset.target, 10)));
      counterObs.disconnect();
    }
  });
}, { threshold: 0.4 });
if (statsBar) counterObs.observe(statsBar);

/* ── CARD PARALLAX (desktop) ── */
document.querySelectorAll('.doc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-10px) scale(1.016) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
