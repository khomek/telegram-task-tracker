from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware 
from contextlib import asynccontextmanager
from database import engine, Base, get_db
from models import User, Task, Tag
from schemas import TaskCreate, Task as TaskSchema, UserCreate, User as UserSchema
from repository import TaskRepository
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List,Annotated

#Управление включением/выключением приложения
@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("БД готова")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers=["*"],
)

# узнаем имя пользователя(авторизация)
async def get_current_user(
    x_telegram_id: Annotated[int, Header()],
    session: AsyncSession = Depends(get_db)
) -> User:
    user = await TaskRepository.get_user(session, x_telegram_id)
    if not user:
        new_user_schema = UserCreate(username = 'tg_user', id = x_telegram_id)
        user_model = User(id=x_telegram_id, username = 'tg_user')
        session.add(user_model)
        await session.commit()
        await session.refresh(user_model)
        user = user_model
    return user

@app.post("/users", response_model = UserSchema)
async def create_user(
    user: UserCreate, 
    session: AsyncSession = Depends(get_db)
):
    return await TaskRepository.add_user(session, user)

@app.post("/tasks", response_model = TaskSchema)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(get_db),
    user:User = Depends(get_current_user)
):
    return await TaskRepository.add_task(session, task, user_id = user.id)
    # new_task = await TaskRepository.add_task(session, task)
    # return new_task

@app.get("/tasks", response_model = List[TaskSchema])
async def get_tasks(
    session: AsyncSession = Depends(get_db),
    user:User=Depends(get_current_user)
):
    tasks = await TaskRepository.get_tasks(session, user_id = user.id)
    return tasks