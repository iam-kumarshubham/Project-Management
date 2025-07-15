from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.routers import user
from routers import project, issue
from backend.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    await create_db_and_tables()
    yield
    # Cleanup on shutdown (if needed)

app = FastAPI(
    title="Project Management API",
    description="A full-stack project management tool with Kanban boards",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router, prefix="/api/auth", tags=["authentication"])
app.include_router(project.router, prefix="/api/projects", tags=["projects"])
app.include_router(issue.router, prefix="/api/issues", tags=["issues"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Project Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
