from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.user import User
from core.security import get_password_hash, verify_password, create_access_token
from schemas.user import UserCreate, UserLogin

async def create_user(session: AsyncSession, user_in: UserCreate):
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def authenticate_user(session: AsyncSession, username: str, password: str):
    result = await session.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def login_user(session: AsyncSession, user_in: UserLogin):
    user = await authenticate_user(session, user_in.username, user_in.password)
    if not user:
        return None
    token = create_access_token({"sub": str(user.id)})
    return token, user
