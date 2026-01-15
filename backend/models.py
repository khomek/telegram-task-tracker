from sqlalchemy import ForeignKey, text, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import List, Optional
from database import Base
from sqlalchemy import Table, Column, Integer

tasks_and_tags_table = Table(
    "tasks_and_tags", 
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id"), primary_key = True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key = True)
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key = True)
    username: Mapped[Optional[str]] = mapped_column()

    # связь один ко многим : у одного юзера много задач
    tasks: Mapped[List["Task"]] = relationship(back_populates = "user")

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key = True)
    title: Mapped[str] = mapped_column()
    description: Mapped[Optional[str]] = mapped_column()
    is_completed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(server_default = text("TIMEZONE('utc', now())"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # связь один ко многим: у одного юзера много задач
    user: Mapped["User"] = relationship(back_populates = "tasks")

    # связь много ко многим через вспомогательную таблицу: у задачи может быть много тегов
    tags: Mapped[List["Tag"]] = relationship(
        secondary = tasks_and_tags_table, 
        back_populates = "tasks",
        lazy = "selectin"
    )

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key = True)
    title: Mapped[str] = mapped_column(unique = True)

    #Связь много ко многим: тег может применяться ко многим задачам
    tasks: Mapped[List["Task"]] = relationship(
        secondary = tasks_and_tags_table,
        back_populates = "tags",
        lazy = "selectin"
    )