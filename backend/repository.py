from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Task, User
from schemas import TaskCreate, UserCreate

class TaskRepository:

    @classmethod
    async def add_user(cls, session:AsyncSession, user: UserCreate) -> User:
        new_user = User(**user.model_dump())
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user

    @classmethod
    async def add_task(cls, session: AsyncSession, task: TaskCreate, user_id: int) -> Task:
        task_dict = task.model_dump()
        new_task = Task(**task_dict, user_id = user_id)
        session.add(new_task)
        await session.commit()
        await session.refresh(new_task)
        return new_task

    @classmethod
    async def get_tasks(cls, session:AsyncSession) -> list[Task]:
        query = select(Task)
        result = await session.execute(query)
        return result.scalars().all()
