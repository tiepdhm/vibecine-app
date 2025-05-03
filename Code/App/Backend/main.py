from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.users import router as user_router
from app.api.movies import router as movie_router
from app.api.reviews import router as review_router
from app.api.analysis import router as analysis_router
from app.api.training import router as training_router
from app.api.admin import router as admin_router

app = FastAPI()

origins = ["*"] # Hien tai la cho tat ca cac domain, co the thay lai bang danh sach domain cua frontend

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/users")
app.include_router(movie_router, prefix="/api/movies")
app.include_router(review_router, prefix="/api/reviews")
app.include_router(analysis_router, prefix="/api/analysis")
app.include_router(training_router, prefix="/api/training")
app.include_router(admin_router, prefix="/api/admin")

@app.get("/")
async def root():
    return {"message": "Welcome to Movie Review App"}