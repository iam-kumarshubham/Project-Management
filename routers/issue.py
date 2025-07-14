from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from schemas.issue import IssueCreate, IssueRead
from models.issue import Issue
from routers.user import get_current_user, get_session
from sqlmodel import select

router = APIRouter()

@router.post("/", response_model=IssueRead)
async def create_issue(
    issue_in: IssueCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    issue = Issue(**issue_in.dict())
    session.add(issue)
    await session.commit()
    await session.refresh(issue)
    return issue

@router.get("/project/{project_id}", response_model=list[IssueRead])
async def list_issues(
    project_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Issue).where(Issue.project_id == project_id))
    issues = result.scalars().all()
    return issues

@router.get("/{issue_id}", response_model=IssueRead)
async def get_issue(
    issue_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Issue).where(Issue.id == issue_id))
    issue = result.scalar_one_or_none()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    return issue

@router.put("/{issue_id}", response_model=IssueRead)
async def update_issue(
    issue_id: int,
    issue_in: IssueCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Issue).where(Issue.id == issue_id))
    issue = result.scalar_one_or_none()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    for key, value in issue_in.dict().items():
        setattr(issue, key, value)
    session.add(issue)
    await session.commit()
    await session.refresh(issue)
    return issue

@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_issue(
    issue_id: int,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user)
):
    result = await session.execute(select(Issue).where(Issue.id == issue_id))
    issue = result.scalar_one_or_none()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    await session.delete(issue)
    await session.commit()
