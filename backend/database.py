from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import settings

engine = create_async_engine(settings.DATABASE_URL_asyncpg, echo = True)

new_session = async_sessionmaker(engine, class_ = AsyncSession, expire_on_commit = False)

class Base(DeclarativeBase):
    pass

# генератор сессий
async def get_db():
    async with new_session() as session:
        yield session

