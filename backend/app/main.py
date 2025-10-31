from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from .config import settings
from .models import init_db
from .api import auth, questions, quizzes, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Initialize database on startup
    init_db()
    yield


# Create FastAPI application
app = FastAPI(
    title="Question Bank and Quiz System",
    description="A comprehensive system for managing questions and generating quizzes",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle global exceptions"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Question Bank API is running"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Question Bank and Quiz Generation System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Include API routers
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(quizzes.router)
app.include_router(users.router)


# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )