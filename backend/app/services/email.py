import os
from dotenv import load_dotenv

load_dotenv()


def send_donation_receipt(email: str, donor_name: str, amount: float):
    print(f"[EMAIL] Receipt would be sent to {email} for {donor_name} amount {amount}")
    return {"sent": False, "message": "Email service not configured yet."}
