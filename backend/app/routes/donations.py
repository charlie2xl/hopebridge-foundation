from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..services.payment import create_checkout_session
from ..services.email import send_donation_receipt

router = APIRouter(prefix="/donations", tags=["donations"])

COUNTRY_OPTIONS = [
    {"code": "NG", "name": "Nigeria", "currency": "ngn"},
    {"code": "US", "name": "United States", "currency": "usd"},
    {"code": "GB", "name": "United Kingdom", "currency": "gbp"},
    {"code": "KE", "name": "Kenya", "currency": "kes"},
    {"code": "ZA", "name": "South Africa", "currency": "zar"},
    {"code": "GH", "name": "Ghana", "currency": "ghs"},
    {"code": "EG", "name": "Egypt", "currency": "egp"},
    {"code": "ET", "name": "Ethiopia", "currency": "etb"},
    {"code": "CM", "name": "Cameroon", "currency": "xaf"},
    {"code": "CA", "name": "Canada", "currency": "cad"},
    {"code": "AU", "name": "Australia", "currency": "aud"},
    {"code": "DE", "name": "Germany", "currency": "eur"},
    {"code": "FR", "name": "France", "currency": "eur"},
    {"code": "NL", "name": "Netherlands", "currency": "eur"},
    {"code": "IE", "name": "Ireland", "currency": "eur"},
    {"code": "IN", "name": "India", "currency": "inr"},
    {"code": "AE", "name": "United Arab Emirates", "currency": "aed"},
    {"code": "JP", "name": "Japan", "currency": "jpy"},
]


@router.get("/countries", response_model=List[schemas.CountryOption])
def get_countries():
    return COUNTRY_OPTIONS


@router.post("/", response_model=schemas.DonationCheckoutOut, status_code=status.HTTP_201_CREATED)
def create_donation(payload: schemas.DonationCreate, db: Session = Depends(get_db)):
    country = next((item for item in COUNTRY_OPTIONS if item["code"].upper() == payload.country.upper()), None)
    if not country:
        raise HTTPException(status_code=400, detail="Unsupported country")

    donation = models.Donation(
        donor_name=payload.donor_name,
        donor_email=str(payload.donor_email),
        country=payload.country.upper(),
        amount=payload.amount,
        donation_type=payload.donation_type,
        payment_method=payload.payment_method,
        status="pending",
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    payment_result = create_checkout_session(
        donation_id=donation.id,
        amount=donation.amount,
        currency=country["currency"],
        donor_name=donation.donor_name,
        donor_email=donation.donor_email,
        donation_type=donation.donation_type,
        country=donation.country,
    )

    donation.stripe_payment_intent_id = payment_result.get("session_id")
    donation.status = "pending"
    db.commit()
    db.refresh(donation)

    send_donation_receipt(donation.donor_email, donation.donor_name, donation.amount)

    donation_payload = schemas.DonationOut.model_validate(donation)
    return {
        "donation": donation_payload,
        "checkout_url": payment_result.get("checkout_url"),
        "message": payment_result.get("message"),
    }


@router.get("/", response_model=List[schemas.DonationOut])
def list_donations(db: Session = Depends(get_db)):
    return db.query(models.Donation).order_by(models.Donation.created_at.desc()).all()
