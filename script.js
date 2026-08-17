/* ==========================================================================
   GRUPO VEDA IN GLASS - INTERACTIVE LANDING PAGE & GOOGLE ADS TRACKING SCRIPT
   ========================================================================== */

// WhatsApp Sales Phone Number (Veda in Glass)
const WHATSAPP_NUMBER = "5519971260471";

// Google Apps Script Web App Endpoint (Substitua por sua URL pública do Web App do Google Sheets se gerada)
// Exemplo: https://script.google.com/macros/s/AKfycbx.../exec
const GOOGLE_SHEETS_WEBHOOK = "";

// State for Budget Simulator
let simState = {
    format: "reta",
    formatName: "Sacada Reta",
    length: 4.0,
    glassType: "Incolor (Mais Escolhido)"
};

// --------------------------------------------------------------------------
// 1. MODAL & LEAD FORM HANDLING (GOOGLE ADS CONVERSION + GOOGLE SHEETS)
// --------------------------------------------------------------------------

function openLeadModal(origem = 'Google Ads', defaultServico = null) {
    const overlay = document.getElementById('leadModalOverlay');
    const originInput = document.getElementById('leadOrigin');
    const servicoSelect = document.getElementById('leadServico');

    if (originInput) originInput.value = origem;
    if (defaultServico && servicoSelect) {
        servicoSelect.value = defaultServico;
    }

    if (overlay) {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeLeadModal() {
    const overlay = document.getElementById('leadModalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function closeLeadModalOnOverlay(event) {
    if (event.target.id === 'leadModalOverlay') {
        closeLeadModal();
    }
}

function maskPhone(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
        input.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
        input.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else {
        input.value = value;
    }
}

/**
 * Handles Form Submission:
 * 1. Triggers Google Ads Conversion Event
 * 2. Posts data to Google Sheets (if webhook configured)
 * 3. Redirects lead directly to WhatsApp with pre-filled details!
 */
async function submitLeadForm(event) {
    event.preventDefault();

    const btnSubmit = document.getElementById('btnSubmitLead');
    const btnText = document.getElementById('btnSubmitText');
    const nome = document.getElementById('leadNome').value.trim();
    const telefone = document.getElementById('leadTelefone').value.trim();
    const servico = document.getElementById('leadServico').value;
    const mensagem = document.getElementById('leadMensagem').value.trim();
    const origem = document.getElementById('leadOrigin').value || 'Google Ads';

    if (!nome || !telefone) return;

    // Loading State
    if (btnSubmit) btnSubmit.disabled = true;
    if (btnText) btnText.textContent = "ENVIANDO DADOS...";

    const payload = {
        data: new Date().toLocaleString('pt-BR'),
        nome: nome,
        telefone: telefone,
        servico: servico,
        mensagem: mensagem,
        origem: origem
    };

    // 1. Trigger Google Ads Conversion Event
    if (typeof gtag_report_conversion === 'function') {
        gtag_report_conversion();
    }

    // 2. Send payload to Google Sheets Web App (no-cors mode for Google Apps Script)
    if (GOOGLE_SHEETS_WEBHOOK) {
        try {
            await fetch(GOOGLE_SHEETS_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.error("Erro ao enviar dados para a planilha:", e);
        }
    }

    // 3. Open WhatsApp with formatted lead info for immediate closing
    const waText = `Olá, vim pelo anúncio do Google e solicitei um orçamento no site!\n` +
                   `👤 Nome: ${nome}\n` +
                   `📞 Telefone: ${telefone}\n` +
                   `🛠️ Serviço: ${servico}\n` +
                   (mensagem ? `📝 Obs: ${mensagem}\n` : '') +
                   `Aguardando atendimento!`;

    const encodedMsg = encodeURIComponent(waText);
    const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMsg}`;

    setTimeout(() => {
        if (btnSubmit) btnSubmit.disabled = false;
        if (btnText) btnText.textContent = "ENVIAR E RECEBER ORÇAMENTO";
        closeLeadModal();
        window.open(targetUrl, '_blank');
    }, 400);
}

/**
 * Legacy openWhatsApp wrapper now routes or falls back
 */
function openWhatsApp(origem = 'Google Ads', customMsg = null) {
    openLeadModal(origem);
}

// --------------------------------------------------------------------------
// 2. INTERACTIVE BUDGET SIMULATOR LOGIC
// --------------------------------------------------------------------------
function selectFormat(format, element) {
    simState.format = format;
    if (format === 'reta') simState.formatName = "Sacada Reta";
    if (format === 'l') simState.formatName = "Sacada em L";
    if (format === 'curva') simState.formatName = "Sacada Curva / U";

    // Update UI selected state
    document.querySelectorAll('.format-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
}

function goToStep(stepNumber) {
    document.getElementById('step1Content').classList.add('hidden');
    document.getElementById('step2Content').classList.add('hidden');
    document.getElementById('step3Content').classList.add('hidden');

    document.getElementById('step1Indicator').classList.remove('active');
    document.getElementById('step2Indicator').classList.remove('active');
    document.getElementById('step3Indicator').classList.remove('active');

    if (stepNumber === 1) {
        document.getElementById('step1Content').classList.remove('hidden');
        document.getElementById('step1Indicator').classList.add('active');
    } else if (stepNumber === 2) {
        document.getElementById('step2Content').classList.remove('hidden');
        document.getElementById('step2Indicator').classList.add('active');
        document.getElementById('step1Indicator').classList.add('active');
    } else if (stepNumber === 3) {
        calculateEstimate();
        document.getElementById('step3Content').classList.remove('hidden');
        document.getElementById('step3Indicator').classList.add('active');
        document.getElementById('step2Indicator').classList.add('active');
        document.getElementById('step1Indicator').classList.add('active');
    }
}

function calculateEstimate() {
    const compVal = parseFloat(document.getElementById('compInput').value) || 4.0;
    const glassVal = document.getElementById('glassType').value;

    simState.length = compVal;
    simState.glassType = glassVal;

    document.getElementById('resultTitle').textContent = `${simState.formatName} com ~${simState.length}m de comprimento (${simState.glassType})`;
}

function sendSimulatedBudget() {
    const detailMsg = `Simulação: ${simState.formatName}, ~${simState.length}m, Vidro ${simState.glassType}`;
    const obsField = document.getElementById('leadMensagem');
    if (obsField) obsField.value = detailMsg;
    openLeadModal('Simulador de Orçamento', 'Envidraçamento de Sacadas');
}

// --------------------------------------------------------------------------
// 3. INTERACTIVE BEFORE & AFTER SLIDER
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.ba-slider-container');
    const baAfter = document.getElementById('baAfter');
    const baHandle = document.getElementById('baHandle');

    if (sliderContainer && baAfter && baHandle) {
        let isDragging = false;

        const updateSlider = (x) => {
            const rect = sliderContainer.getBoundingClientRect();
            let position = x - rect.left;
            if (position < 0) position = 0;
            if (position > rect.width) position = rect.width;

            const percentage = (position / rect.width) * 100;
            baAfter.style.width = `${100 - percentage}%`;
            baHandle.style.left = `${position}px`;
        };

        const startDragging = () => { isDragging = true; };
        const stopDragging = () => { isDragging = false; };

        sliderContainer.addEventListener('mousedown', (e) => {
            startDragging();
            updateSlider(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) updateSlider(e.clientX);
        });

        window.addEventListener('mouseup', stopDragging);

        // Touch events for Mobile
        sliderContainer.addEventListener('touchstart', (e) => {
            startDragging();
            updateSlider(e.touches[0].clientX);
        });

        window.addEventListener('touchmove', (e) => {
            if (isDragging) updateSlider(e.touches[0].clientX);
        });

        window.addEventListener('touchend', stopDragging);
    }
});

// --------------------------------------------------------------------------
// 4. FAQ ACCORDION TOGGLE
// --------------------------------------------------------------------------
function toggleFaq(buttonElement) {
    const faqItem = buttonElement.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const arrow = item.querySelector('.faq-arrow');
        if (arrow) arrow.textContent = '+';
    });

    // Toggle current
    if (!isActive) {
        faqItem.classList.add('active');
        const arrow = buttonElement.querySelector('.faq-arrow');
        if (arrow) arrow.textContent = '–';
    }
}

// --------------------------------------------------------------------------
// 5. GSAP SPATIAL & SMOOTH ANIMATIONS
// --------------------------------------------------------------------------
window.addEventListener('load', () => {
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero entrance
        gsap.from('.hero-content > *', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });

        gsap.from('.hero-visual', {
            opacity: 0,
            scale: 0.9,
            duration: 1,
            delay: 0.3,
            ease: 'power3.out'
        });

        // Services entrance
        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 80%'
            },
            opacity: 0,
            y: 30,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }
});
