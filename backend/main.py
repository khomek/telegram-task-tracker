from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import engine, Base
from models import User, Task, Tag

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("БД готова")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return{
        "message": "Tables are created"
    }