from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_name = Column(String, nullable=False)
    donor_email = Column(String, nullable=False)
    country = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    donation_type = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    status = Column(String, default="pending")
    stripe_payment_intent_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
