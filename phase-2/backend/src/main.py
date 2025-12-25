"""
FastAPI application entry point.

This module initializes the FastAPI app with CORS middleware and health check endpoint.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.applications import FastAPI as FastAPIClass
from fastapi.middleware.asyncexitstack import AsyncExitStackMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.middleware.errors import ServerErrorMiddleware
from starlette.middleware.exceptions import ExceptionMiddleware

load_dotenv()

original_build = FastAPIClass.build_middleware_stack

def patched_build_middleware_stack(self):
    debug = self.debug
    error_handler = None
    exception_handlers = {}

    for key, value in self.exception_handlers.items():
        if key in (500, Exception):
            error_handler = value
        else:
            exception_handlers[key] = value

    middleware_list = (
        [Middleware(ServerErrorMiddleware, handler=error_handler, debug=debug)]
        + self.user_middleware
        + [
            Middleware(
                ExceptionMiddleware, handlers=exception_handlers, debug=debug
            ),
            Middleware(AsyncExitStackMiddleware),
        ]
    )

    app = self.router
    for m in reversed(middleware_list):
        if isinstance(m, Middleware):
            app = m.cls(app=app, **m.kwargs)
        else:
            cls, options = m
            app = cls(app=app, **options)
    return app

FastAPIClass.build_middleware_stack = patched_build_middleware_stack

CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",")]

app = FastAPI(
    title="Todo Backend API",
    description="FastAPI backend with JWT authentication and SQLModel ORM",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        dict: Status message indicating service is healthy
    """
    return {"status": "healthy"}


# Register routers
from src.api.routes import auth, tasks

app.include_router(auth.router)
app.include_router(tasks.router)
