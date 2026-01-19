from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from database import engine, Base, get_db
from models import User, Task, Tag
from schemas import TaskCreate, Task as TaskSchema, UserCreate, User as UserSchema
from repository import TaskRepository
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

#Управление включением/выключением приложения
@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("БД готова")
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/users", response_model = UserSchema)
async def create_user(
    user: UserCreate, 
    session: AsyncSession = Depends(get_db)
):
    return await TaskRepository.add_user(session, user)

@app.post("/tasks", response_model = TaskSchema)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(get_db)
):
    return await TaskRepository.add_task(session, task, user_id = 1)
    # new_task = await TaskRepository.add_task(session, task)
    # return new_task

@app.get("/tasks", response_model = List[TaskSchema])
async def get_tasks(
    session: AsyncSession = Depends(get_db)
):
    tasks = await TaskRepository.get_tasks(session)
    return tasks