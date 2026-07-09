import os
import stripe
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


def create_checkout_session(donation_id: int, amount: float, currency: str, donor_name: str, donor_email: str, donation_type: str, country: str):
    if not stripe.api_key:
        return {
            "checkout_url": "https://example.com/demo-checkout",
            "session_id": None,
            "mock": True,
            "message": "Stripe is not configured yet. Using demo mode.",
        }

    success_url = os.getenv("FRONTEND_SUCCESS_URL", "http://127.0.0.1:5500/frontend/donate.html")
    cancel_url = os.getenv("FRONTEND_CANCEL_URL", "http://127.0.0.1:5500/frontend/donate.html")

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": currency.lower(),
                "product_data": {
                    "name": f"HopeBridge {donation_type}",
                },
                "unit_amount": int(amount * 100),
            },
            "quantity": 1,
        }],
        customer_email=donor_email,
        metadata={
            "donation_id": str(donation_id),
            "donor_name": donor_name,
            "donation_type": donation_type,
            "country": country,
        },
        success_url=success_url,
        cancel_url=cancel_url,
    )

    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "mock": False,
    }
