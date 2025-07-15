from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.database import get_session
from backend.models.project import Project
from backend.models.user import User
from backend.schemas.project import ProjectCreate, ProjectRead
from backend.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=ProjectRead)
async def create_project(
    project_data: ProjectCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new project"""
    project = Project(
        name=project_data.name,
        description=project_data.description,
        owner_id=current_user.id
    )
    
    session.add(project)
    await session.commit()
    await session.refresh(project)
    
    return ProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    )

@router.get("/", response_model=List[ProjectRead])
async def get_projects(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all projects for the current user"""
    statement = select(Project).where(Project.owner_id == current_user.id)
    result = await session.exec(statement)
    projects = result.all()
    
    return [ProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    ) for project in projects]

@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific project"""
    statement = select(Project).where(
        Project.id == project_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    project = result.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return ProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    )

@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    project_data: ProjectCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a project"""
    statement = select(Project).where(
        Project.id == project_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    project = result.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    project.name = project_data.name
    project.description = project_data.description
    
    await session.commit()
    await session.refresh(project)
    
    return ProjectRead(
        id=project.id,
        name=project.name,
        description=project.description,
        owner_id=project.owner_id
    )

@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a project"""
    statement = select(Project).where(
        Project.id == project_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    project = result.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    await session.delete(project)
    await session.commit()
    
    return {"message": "Project deleted successfully"}
