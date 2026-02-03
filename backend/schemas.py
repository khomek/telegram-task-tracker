from datetime import date 
from pydantic import BaseModel, Field
from typing import Optional, List

class TagBase(BaseModel):
    title: str

class Tag(TagBase):
    id:int
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    tags: Optional[List[str]] = Field(default_factory = list)
    due_date: Optional[date] = None

class Task(TaskBase):
    id: int
    status: str
    user_id: int
    tags: List[Tag] =Field(default_factory=list)
    due_date: Optional[date] = None
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    # List[Task] = []

    class Config:
        from_attributes = True

