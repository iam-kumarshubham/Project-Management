from pydantic import BaseModel
from typing import Optional

class IssueCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee_id: Optional[int] = None
    project_id: int

class IssueRead(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    assignee_id: Optional[int]
    project_id: int
