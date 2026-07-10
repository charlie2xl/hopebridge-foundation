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