// Counter
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const update = () => {
        const target = +counter.dataset.target;
        const current = +counter.innerText;

        const increment = target / 100;

        if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(update, 20);
        } else {
            counter.innerText = target.toLocaleString() + "+";
        }
    };

    update();
});

// Sticky Header
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
    if (header) {
        header.classList.toggle("sticky", window.scrollY > 80);
    }
});

// Mobile Menu
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

const closeMenu = () => {
    if (!navLinks || !menuBtn) return;

    navLinks.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");

    const icon = menuBtn.querySelector("i");
    if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-xmark");
    }
};

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        const isActive = navLinks.classList.toggle("active");
        menuBtn.setAttribute("aria-expanded", String(isActive));

        const icon = menuBtn.querySelector("i");

        if (icon) {
            icon.classList.toggle("fa-bars", !isActive);
            icon.classList.toggle("fa-xmark", isActive);
        }
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    document.addEventListener("click", event => {
        const clickInsideNav = navLinks.contains(event.target);
        const clickOnToggle = menuBtn.contains(event.target);

        if (!clickInsideNav && !clickOnToggle && navLinks.classList.contains("active")) {
            closeMenu();
        }
    });
}

// Reusable entry animations for design-system components
const fadeElements = document.querySelectorAll(".fade-up, .fade-in, .zoom, .slide-left, .slide-right");

if ("IntersectionObserver" in window && fadeElements.length) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    fadeElements.forEach(element => observer.observe(element));
} else {
    fadeElements.forEach(element => element.classList.add("is-visible"));
}

// Donation modal
const donationCards = document.querySelectorAll(".donation-card");
const paymentModal = document.getElementById("paymentModal");
const donationPanel = document.getElementById("donationPanel");
const paymentTitle = document.getElementById("paymentTitle");
const paymentDescription = document.getElementById("paymentDescription");
const donationTypeInput = document.getElementById("donationType");
const paymentForm = document.getElementById("paymentForm");
const paymentSuccess = document.getElementById("paymentSuccess");
const donorCountrySelect = document.getElementById("donorCountry");
const donorAmountInput = document.getElementById("donationAmount");
const donorNameInput = document.getElementById("donorName");
const donorEmailInput = document.getElementById("donorEmail");
const paymentMethodSelect = document.getElementById("paymentMethod");

const API_BASE_URL = "http://127.0.0.1:8000";

const showDonationPanel = () => {
    if (!donationPanel) return;

    donationPanel.hidden = false;
    donationPanel.setAttribute("aria-hidden", "false");
    donationPanel.scrollIntoView({ behavior: "smooth", block: "center" });
};

const loadCountries = async () => {
    if (!donorCountrySelect) return;

    const fallbackCountries = [
        { code: "NG", name: "Nigeria" },
        { code: "US", name: "United States" },
        { code: "GB", name: "United Kingdom" },
        { code: "KE", name: "Kenya" },
        { code: "ZA", name: "South Africa" },
        { code: "GH", name: "Ghana" },
        { code: "EG", name: "Egypt" },
        { code: "CA", name: "Canada" },
        { code: "AU", name: "Australia" },
        { code: "DE", name: "Germany" },
        { code: "FR", name: "France" },
        { code: "IN", name: "India" },
        { code: "AE", name: "United Arab Emirates" },
        { code: "JP", name: "Japan" },
    ];

    try {
        const response = await fetch(`${API_BASE_URL}/donations/countries`);
        const countries = await response.json();

        donorCountrySelect.innerHTML = "";
        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country.code;
            option.textContent = `${country.name} (${country.code})`;
            donorCountrySelect.appendChild(option);
        });
    } catch (error) {
        donorCountrySelect.innerHTML = "";
        fallbackCountries.forEach(country => {
            const option = document.createElement("option");
            option.value = country.code;
            option.textContent = `${country.name} (${country.code})`;
            donorCountrySelect.appendChild(option);
        });
    }
};

const openPaymentModal = donationType => {
    if (!paymentModal || !paymentTitle || !paymentDescription || !donationTypeInput) return;

    paymentModal.classList.add("active");
    paymentModal.setAttribute("aria-hidden", "false");
    paymentTitle.textContent = `Donate ${donationType}`;
    paymentDescription.textContent = `Support HopeBridge through ${donationType.toLowerCase()}.`;
    donationTypeInput.value = donationType;
    paymentForm.hidden = false;
    paymentSuccess.hidden = true;
};

const closePaymentModal = () => {
    if (!paymentModal) return;

    paymentModal.classList.remove("active");
    paymentModal.setAttribute("aria-hidden", "true");
};

if (paymentModal) {
    loadCountries();

    document.querySelectorAll("[data-open-donation-panel], .donate-btn").forEach(trigger => {
        trigger.addEventListener("click", event => {
            if (trigger.matches("a[href='#donationPanel']")) {
                event.preventDefault();
            }

            showDonationPanel();
        });
    });

    donationCards.forEach(card => {
        const trigger = card.querySelector(".donate-btn");

        if (trigger) {
            trigger.addEventListener("click", () => {
                openPaymentModal(card.dataset.donationType || "General Support");
            });
        }
    });

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closePaymentModal);
    });

    paymentModal.addEventListener("click", event => {
        if (event.target === paymentModal) {
            closePaymentModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closePaymentModal();
        }
    });

    if (paymentForm) {
        paymentForm.addEventListener("submit", async event => {
            event.preventDefault();

            const payload = {
                donor_name: donorNameInput.value.trim(),
                donor_email: donorEmailInput.value.trim(),
                country: donorCountrySelect.value,
                amount: Number(donorAmountInput.value),
                donation_type: donationTypeInput.value,
                payment_method: paymentMethodSelect.value,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/donations/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.detail || "Donation could not be submitted.");
                }

                if (result.checkout_url) {
                    window.location.href = result.checkout_url;
                    return;
                }

                paymentForm.hidden = true;
                paymentSuccess.hidden = false;
                paymentSuccess.querySelector("p").textContent = `Thank you, ${payload.donor_name}. Your donation for ${payload.donation_type.toLowerCase()} was received successfully.`;
            } catch (error) {
                paymentSuccess.hidden = false;
                paymentForm.hidden = true;
                paymentSuccess.querySelector("h4").textContent = "Donation could not be completed";
                paymentSuccess.querySelector("p").textContent = error.message;
            }
        });
    }

    // (No fade-in observer — restored to previous script state)
}

    /* Donation UI behavior: presets, currency, Flutterwave trigger, recent donors animation */
    (function () {
        const currencySelect = document.getElementById('currencySelect');
        const presets = document.querySelectorAll('.preset');
        const customAmount = document.getElementById('customAmount');
        const flutterwaveBtn = document.getElementById('flutterwaveBtn');
        const campaignSelect = document.getElementById('campaignSelect');
        const donorName = document.getElementById('donorNameField');
        const donorEmail = document.getElementById('donorEmailField');
        const anonymous = document.getElementById('anonymous');
        const messageField = document.getElementById('message');

        if (!currencySelect) return;

        const currencyData = {
            NGN: { symbol: '₦', rate: 1, presets: [2500,5000,10000,50000] },
            USD: { symbol: '$', rate: 0.0013, presets: [5,10,25,100] },
            EUR: { symbol: '€', rate: 0.0012, presets: [5,10,20,80] },
            GBP: { symbol: '£', rate: 0.0010, presets: [4,8,20,70] },
            CAD: { symbol: 'C$', rate: 0.0017, presets: [6,12,30,120] },
        };

        function formatAmount(value, currency) {
            const data = currencyData[currency] || currencyData.NGN;
            const display = (data.rate === 1) ? `${data.symbol}${Number(value).toLocaleString()}` : `${data.symbol}${Number(value).toLocaleString()}`;
            return display;
        }

        function updatePresets(currency) {
            const data = currencyData[currency] || currencyData.NGN;
            presets.forEach((btn, i) => {
                const val = data.presets[i];
                btn.dataset.value = Math.round(val / data.rate);
                btn.innerText = formatAmount(val, currency);
                btn.classList.remove('active');
            });
            if (presets[0]) presets[0].classList.add('active');
            // Set custom amount default
            customAmount.value = presets[0] ? presets[0].dataset.value : '';
        }

        currencySelect.addEventListener('change', (e) => {
            updatePresets(e.target.value);
        });

        presets.forEach(btn => {
            btn.addEventListener('click', () => {
                presets.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                customAmount.value = btn.dataset.value;
            });
        });

        if (customAmount) {
            customAmount.addEventListener('input', () => {
                presets.forEach(b => b.classList.remove('active'));
            });
        }

        // Flutterwave button: send to backend to create checkout link
        if (flutterwaveBtn) {
            flutterwaveBtn.addEventListener('click', async () => {
                const currency = currencySelect.value || 'NGN';
                const amount = Number(customAmount.value) || 0;
                if (!amount || amount <= 0) {
                    alert('Please enter a valid donation amount.');
                    return;
                }

                const payload = {
                    donor_name: donorName.value || 'Anonymous',
                    donor_email: donorEmail.value || '',
                    currency,
                    amount: Math.round(amount),
                    campaign: campaignSelect.value,
                    frequency: document.querySelector('input[name="frequency"]:checked')?.value || 'one',
                    anonymous: anonymous.checked,
                    message: messageField.value || '',
                };

                try {
                    flutterwaveBtn.disabled = true;
                    flutterwaveBtn.innerText = 'Processing...';

                    const resp = await fetch(`${API_BASE_URL}/donations/flutterwave/checkout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });

                    const data = await resp.json();
                    if (resp.ok && data.checkout_url) {
                        window.location.href = data.checkout_url;
                        return;
                    }

                    throw new Error(data.detail || 'Unable to create checkout.');
                } catch (err) {
                    alert(err.message || 'Donation could not be started.');
                } finally {
                    flutterwaveBtn.disabled = false;
                    flutterwaveBtn.innerText = 'Donate Securely with Flutterwave';
                }
            });
        }

        // Initialize presets with default currency
        updatePresets(currencySelect.value || 'NGN');

        // subtle animation for recent donors
        const recent = document.querySelectorAll('.recent-donors li');
        recent.forEach((item, i) => {
            item.style.opacity = 0;
            setTimeout(() => { item.style.transition = 'opacity .6s ease, transform .6s ease'; item.style.opacity = 1; item.style.transform = 'translateY(0)'; }, 200 * i + 300);
        });
    })();