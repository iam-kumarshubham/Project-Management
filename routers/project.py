from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from schemas.project import ProjectCreate, ProjectRead
from models.project import Project
from routers.user import get_current_user, get_session
from sqlmodel import select

router = APIRouter()

@router.post("/", response_model=ProjectRead)
async def create_project(
    project_in: ProjectCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    project = Project(
        name=project_in.name,
        description=project_in.description,
        owner_id=current_user.id
    )
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project

@router.get("/", response_model=list[ProjectRead])
async def list_projects(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Project).where(Project.owner_id == current_user.id))
    projects = result.scalars().all()
    return projects

@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project
