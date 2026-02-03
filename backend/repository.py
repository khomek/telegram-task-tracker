from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models import Task, User, Tag
from schemas import TaskCreate, UserCreate
from datetime import date

class TaskRepository:

    @classmethod
    async def add_user(cls, session: AsyncSession, user: UserCreate) -> User:
        new_user = User(**user.model_dump())
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user

    @classmethod
    async def get_user(cls, session: AsyncSession, user_id: int) -> User | None:
        query = select(User).where(User.id == user_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def add_task(cls, session: AsyncSession, task: TaskCreate, user_id: int) -> Task:
        data = task.model_dump()
        
        raw_tags = data.pop("tags", []) or []
        
        tag_names = set([t.strip() for t in raw_tags if t.strip()])
        
        tags_to_attach = []
        if tag_names:
            for name in tag_names:
                query = select(Tag).where(Tag.title == name)
                result = await session.execute(query)
                tag_obj = result.scalar_one_or_none()
                
                if not tag_obj:
                    tag_obj = Tag(title=name)
                    session.add(tag_obj)
                
                tags_to_attach.append(tag_obj)
        
        new_task = Task(**data, user_id=user_id, tags=tags_to_attach)
        
        session.add(new_task)
        await session.commit()
        query = (
            select(Task)
            .options(selectinload(Task.tags)) 
            .where(Task.id == new_task.id)
        )
        result = await session.execute(query)
        
        return result.scalar_one()

    @classmethod
    async def get_tasks(cls, session: AsyncSession, user_id: int, date_filter:date=None) -> list[Task]:
        
        query = (
            select(Task)
            .options(selectinload(Task.tags))
            .where(Task.user_id == user_id)
        )
        if date_filter:
            query = query.where(Task.due_date == date_filter)
        result = await session.execute(query)
        return result.scalars().all()

    @classmethod
    async def update_task_status(cls, session: AsyncSession, task_id: int, new_status: str) -> Task | None:
        
        query = select(Task).where(Task.id == task_id).options(selectinload(Task.tags))
        result = await session.execute(query)
        task = result.scalar_one_or_none()
        
        if task:
            task.status = new_status
            await session.commit()
            return task
        return None

    @classmethod
    async def delete_task(cls, session: AsyncSession, task_id: int) -> bool:
        query = select(Task).where(Task.id == task_id)
        result = await session.execute(query)
        task = result.scalar_one_or_none()

        if task:
            await session.delete(task)
            await session.commit()
            return True
        return False