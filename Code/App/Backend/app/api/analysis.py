from fastapi import APIRouter, HTTPException, Depends
from app.schemas.analysis import AnalysisResponse
from app.services.user_service import get_current_user
from app.services.movie_service import run_movie_analysis
from app.schemas.user import UserOut, UserRole

router = APIRouter()

@router.post("/run-analysis/{movie_id}", response_model=AnalysisResponse)
async def run_analysis_for_movie(movie_id: str, current_user: UserOut = Depends(get_current_user)):
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="Guest is not allowed to run analysis")
    
    analysis_result = run_movie_analysis(movie_id)
    if not analysis_result:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    return AnalysisResponse(**analysis_result)