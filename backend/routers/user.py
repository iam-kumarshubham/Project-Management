from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.database import get_session
from backend.models.user import User
from backend.schemas.user import UserCreate, UserRead, UserLogin
from backend.auth import get_current_user
from core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    """Register a new user"""
    # Check if user already exists
    statement = select(User).where(
        (User.username == user_data.username) | (User.email == user_data.email)
    )
    result = await session.exec(statement)
    existing_user = result.first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserRead(
            id=user.id,
            username=user.username,
            email=user.email
        )
    }

@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, session: AsyncSession = Depends(get_session)):
    """Login user and return JWT token"""
    # Find user by username
    statement = select(User).where(User.username == user_data.username)
    result = await session.exec(statement)
    user = result.first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserRead(
            id=user.id,
            username=user.username,
            email=user.email
        )
    }

@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserRead(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email
    )

@router.get("/", response_model=List[UserRead])
async def get_users(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all users (protected route)"""
    statement = select(User)
    result = await session.exec(statement)
    users = result.all()
    
    return [UserRead(
        id=user.id,
        username=user.username,
        email=user.email
    ) for user in users]
