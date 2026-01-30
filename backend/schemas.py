from pydantic import BaseModel
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
    tags: Optional[List[str]] = []
    
class Task(TaskBase):
    id: int
    status: str
    user_id: int
    tags: List[Tag] =[]
    
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

