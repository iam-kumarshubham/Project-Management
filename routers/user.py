from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from schemas.user import UserCreate, UserRead, UserLogin
from services.user_service import create_user, login_user
from models.user import User
from sqlmodel import select
from core.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

async def get_session():
    from sqlmodel import create_engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    import os
    engine = create_engine(os.getenv("DATABASE_URL"), echo=True, future=True)
    async with AsyncSession(engine) as session:
        yield session

@router.post("/signup", response_model=UserRead)
async def signup(user_in: UserCreate, session: AsyncSession = Depends(get_session)):
    user = await create_user(session, user_in)
    return UserRead(id=user.id, username=user.username, email=user.email)

@router.post("/login")
async def login(user_in: UserLogin, session: AsyncSession = Depends(get_session)):
    result = await login_user(session, user_in)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token, user = result
    return {"access_token": token, "token_type": "bearer", "user": UserRead(id=user.id, username=user.username, email=user.email)}

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)) -> Optional[User]:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = int(payload.get("sub"))
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
