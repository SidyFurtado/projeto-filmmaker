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

/* ── Main AI function ── */
async function gerarDocumentoAudiovisual() {
  const accentColor = document.getElementById('color-picker')?.value || '#00e5ff';
  const logoEl = document.getElementById('logo-preview-img');
  const hasLogo = logoEl && !logoEl.hidden && logoEl.src;
  const logoSrc = hasLogo ? logoEl.src : '';
  let b = {}, requiredIds = [], prompt;

  if (currentDoc === 'orcamento') {
    b = {
      client: document.getElementById('o-client')?.value.trim(),
      pagamento: document.getElementById('o-pagamento')?.value,
      validade: document.getElementById('o-validade')?.value,
      items: orcamentoItems.filter(it => it.desc.trim()),
    };
    requiredIds = [['o-client', b.client], ['o-pagamento', b.pagamento], ['o-validade', b.validade]];
    if (!b.items.length) { showToast('Adicione pelo menos um item ao orçamento.', 'error'); return; }
    prompt = buildPromptOrcamento(b, accentColor, logoSrc, hasLogo);

  } else if (currentDoc === 'proposta') {
    b = {
      client: document.getElementById('p-client')?.value.trim(),
      objetivo: document.getElementById('p-objetivo')?.value.trim(),
      publico: document.getElementById('p-publico')?.value.trim(),
      referencias: document.getElementById('p-referencias')?.value.trim(),
      porqueeu: document.getElementById('p-porqueeu')?.value.trim(),
    };
    requiredIds = [['p-client', b.client], ['p-objetivo', b.objetivo], ['p-publico', b.publico], ['p-porqueeu', b.porqueeu]];
    prompt = buildPromptProposta(b, accentColor, logoSrc, hasLogo);

  } else {
    b = {
      prestNome: document.getElementById('c-prest-nome')?.value.trim(),
      prestCpf: document.getElementById('c-prest-cpf')?.value.trim(),
      prestEnd: document.getElementById('c-prest-end')?.value.trim(),
      contNome: document.getElementById('c-cont-nome')?.value.trim(),
      contCpf: document.getElementById('c-cont-cpf')?.value.trim(),
      contEnd: document.getElementById('c-cont-end')?.value.trim(),
      servico: document.getElementById('c-servico')?.value.trim(),
      valor: document.getElementById('c-valor')?.value.trim(),
      inicio: document.getElementById('c-inicio')?.value,
      entrega: document.getElementById('c-entrega')?.value,
      foro: document.getElementById('c-foro')?.value.trim(),
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
