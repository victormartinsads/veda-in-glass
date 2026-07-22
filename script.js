/* ==========================================================================
   GRUPO VEDA IN GLASS - INTERACTIVE LANDING PAGE & GOOGLE ADS TRACKING SCRIPT
   ========================================================================== */

// WhatsApp Sales Phone Number (Veda in Glass)
const WHATSAPP_NUMBER = "5511999999999"; // Substituir com o número oficial de WhatsApp do Grupo Veda in Glass

// State for Budget Simulator
let simState = {
    format: "reta",
    formatName: "Sacada Reta",
    length: 4.0,
    glassType: "Incolor (Mais Escolhido)"
};

// --------------------------------------------------------------------------
// 1. WHATSAPP & GOOGLE ADS CONVERSION TRACKING
// --------------------------------------------------------------------------
/**
 * Opens WhatsApp with pre-filled message and triggers Google Ads Conversion
 * Conversion Label: Zop5CIC-ntIcEN7z4KJE
 * Conversion Code: AW-18326501854
 */
function openWhatsApp(origem = 'Site Geral', customMsg = null) {
    let message = customMsg;
    if (!message) {
        message = `Olá! Vi o anúncio do Grupo Veda in Glass no Google e gostaria de solicitar um orçamento para Envidraçamento de Sacadas / Serviços em Vidro (Origem: ${origem}).`;
    }

    const encodedMessage = encodeURIComponent(message);
    const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;

    // Call Google Ads conversion callback if gtag is loaded
    if (typeof gtag_report_conversion === 'function') {
        gtag_report_conversion(targetUrl);
    } else {
        window.open(targetUrl, '_blank');
    }
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
    const msg = `Olá! Fiz uma simulação de orçamento no site do Grupo Veda in Glass:\n` +
                `📐 Formato: ${simState.formatName}\n` +
                `📏 Comprimento estimado: ${simState.length} metros\n` +
                `🎨 Vidro desejado: ${simState.glassType}\n` +
                `Gostaria de saber os valores e agendar a medição técnica!`;

    openWhatsApp('Simulador de Orçamento', msg);
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
