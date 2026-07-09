from pydantic import BaseModel, EmailStr
from typing import Optional


class DonationCreate(BaseModel):
    donor_name: str
    donor_email: EmailStr
    country: str
    amount: float
    donation_type: str
    payment_method: str


class DonationOut(BaseModel):
    id: int
    donor_name: str
    donor_email: str
    country: str
    amount: float
    donation_type: str
    payment_method: str
    status: str
    stripe_payment_intent_id: Optional[str] = None

    class Config:
        from_attributes = True


class DonationCheckoutOut(BaseModel):
    donation: DonationOut
    checkout_url: Optional[str] = None
    message: Optional[str] = None


class CountryOption(BaseModel):
    code: str
    name: str
    currency: str
