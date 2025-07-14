from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, projects, issues

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(issues.router)
