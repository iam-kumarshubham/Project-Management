from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from backend.database import get_session
from backend.models.issue import Issue
from backend.models.project import Project
from backend.models.user import User
from backend.schemas.issue import IssueCreate, IssueRead
from backend.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=IssueRead)
async def create_issue(
    issue_data: IssueCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new issue"""
    # Verify project exists and user has access
    project_statement = select(Project).where(
        Project.id == issue_data.project_id,
        Project.owner_id == current_user.id
    )
    project_result = await session.exec(project_statement)
    project = project_result.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    issue = Issue(
        title=issue_data.title,
        description=issue_data.description,
        status=issue_data.status,
        priority=issue_data.priority,
        assignee_id=issue_data.assignee_id,
        project_id=issue_data.project_id
    )
    
    session.add(issue)
    await session.commit()
    await session.refresh(issue)
    
    return IssueRead(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        priority=issue.priority,
        assignee_id=issue.assignee_id,
        project_id=issue.project_id
    )

@router.get("/project/{project_id}", response_model=List[IssueRead])
async def get_issues_by_project(
    project_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all issues for a specific project"""
    # Verify project exists and user has access
    project_statement = select(Project).where(
        Project.id == project_id,
        Project.owner_id == current_user.id
    )
    project_result = await session.exec(project_statement)
    project = project_result.first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get issues for the project
    statement = select(Issue).where(Issue.project_id == project_id)
    result = await session.exec(statement)
    issues = result.all()
    
    return [IssueRead(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        priority=issue.priority,
        assignee_id=issue.assignee_id,
        project_id=issue.project_id
    ) for issue in issues]

@router.get("/{issue_id}", response_model=IssueRead)
async def get_issue(
    issue_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific issue"""
    # Get issue and verify user has access through project ownership
    statement = select(Issue, Project).join(Project).where(
        Issue.id == issue_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    issue_project = result.first()
    
    if not issue_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    issue = issue_project[0]
    
    return IssueRead(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        priority=issue.priority,
        assignee_id=issue.assignee_id,
        project_id=issue.project_id
    )

@router.put("/{issue_id}", response_model=IssueRead)
async def update_issue(
    issue_id: int,
    issue_data: IssueCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update an issue"""
    # Get issue and verify user has access through project ownership
    statement = select(Issue, Project).join(Project).where(
        Issue.id == issue_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    issue_project = result.first()
    
    if not issue_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    issue = issue_project[0]
    
    # Update issue fields
    issue.title = issue_data.title
    issue.description = issue_data.description
    issue.status = issue_data.status
    issue.priority = issue_data.priority
    issue.assignee_id = issue_data.assignee_id
    
    await session.commit()
    await session.refresh(issue)
    
    return IssueRead(
        id=issue.id,
        title=issue.title,
        description=issue.description,
        status=issue.status,
        priority=issue.priority,
        assignee_id=issue.assignee_id,
        project_id=issue.project_id
    )

@router.patch("/{issue_id}/status")
async def update_issue_status(
    issue_id: int,
    status_data: dict,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update just the status of an issue (for drag-and-drop)"""
    # Get issue and verify user has access through project ownership
    statement = select(Issue, Project).join(Project).where(
        Issue.id == issue_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    issue_project = result.first()
    
    if not issue_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    issue = issue_project[0]
    
    # Update only the status
    issue.status = status_data.get("status", issue.status)
    
    await session.commit()
    await session.refresh(issue)
    
    return {"message": "Issue status updated successfully"}

@router.delete("/{issue_id}")
async def delete_issue(
    issue_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete an issue"""
    # Get issue and verify user has access through project ownership
    statement = select(Issue, Project).join(Project).where(
        Issue.id == issue_id,
        Project.owner_id == current_user.id
    )
    result = await session.exec(statement)
    issue_project = result.first()
    
    if not issue_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    issue = issue_project[0]
    
    await session.delete(issue)
    await session.commit()
    
    return {"message": "Issue deleted successfully"}
