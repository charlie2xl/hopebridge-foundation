from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import donations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HopeBridge Donations API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(donations.router)


@app.get("/")
def read_root():
    return {"message": "HopeBridge donation API is running"}
