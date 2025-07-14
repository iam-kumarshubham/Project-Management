from sqlmodel import SQLModel, Field
from typing import Optional

class Issue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    status: str  # "To Do", "In Progress", "Done"
    priority: str  # "Low", "Medium", "High"
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id")
    project_id: int = Field(foreign_key="project.id")
