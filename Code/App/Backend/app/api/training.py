from fastapi import APIRouter, HTTPException, Depends, UploadFile, Form, File
from typing import Optional
from app.services.training_service import train_model, get_all_models, set_model_in_use, delete_model
from app.schemas.training import TrainingInput, TrainingResult
from app.services.user_service import get_current_user
from app.schemas.user import UserOut, UserRole
from app.schemas.training import PredictInput, PredictResult
from app.services.training_service import predict_review
import os
import shutil

router = APIRouter()

from fastapi import Form

@router.post("/train", response_model=TrainingResult)
async def train_new_model(
    model_name: str = Form(...),
    algorithm: str = Form(...),
    alpha: Optional[str] = Form(None),  # Optional alpha parameter
    dataset: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != UserRole.DATA_SCIENTIST:
        raise HTTPException(status_code=403, detail="Only data scientists can train models")
    
    # Handle empty string for alpha and convert to float if valid
    if alpha == "" or alpha is None:
        alpha = None
    else:
        try:
            alpha = float(alpha)
        except ValueError:
            raise HTTPException(status_code=400, detail="Alpha must be a valid number")

    # Validate that alpha is greater than 0 if provided
    if alpha is not None and alpha <= 0:
        raise HTTPException(status_code=400, detail="Alpha must be greater than 0")
    
    # Save uploaded dataset to a temporary file
    try:
        temp_dir = "temp"
        os.makedirs(temp_dir, exist_ok=True)  # Ensure the 'temp' directory exists
        dataset_path = os.path.join(temp_dir, dataset.filename)

        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset.file, f)

        # Train the model
        training_input = TrainingInput(
            model_name=model_name,
            algorithm=algorithm,
            alpha=alpha
        )
        result = train_model(training_input, dataset_path)
    finally:
        os.remove(dataset_path)  # Clean up temporary file

    return result

@router.get("/models", response_model=list[TrainingResult])
async def list_models(current_user: UserOut = Depends(get_current_user)):
    if current_user.role != UserRole.DATA_SCIENTIST:
        raise HTTPException(status_code=403, detail="Only data scientists can view models")
    return get_all_models()

@router.post("/models/{model_name}/in-use")
async def choose_model_in_use(model_name: str, current_user: UserOut = Depends(get_current_user)):
    if current_user.role != UserRole.DATA_SCIENTIST:
        raise HTTPException(status_code=403, detail="Only data scientists can choose models")
    set_model_in_use(model_name)
    return {"message": f"Model '{model_name}' is now in use"}

@router.delete("/models/{model_name}")
async def remove_model(model_name: str, current_user: UserOut = Depends(get_current_user)):
    if current_user.role != UserRole.DATA_SCIENTIST:
        raise HTTPException(status_code=403, detail="Only data scientists can delete models")
    delete_model(model_name)
    return {"message": f"Model '{model_name}' has been deleted"}

@router.post("/predict", response_model=PredictResult)
async def predict_sentiment(
    predict_input: PredictInput,
    current_user: UserOut = Depends(get_current_user)
):
    if current_user.role != UserRole.DATA_SCIENTIST:
        raise HTTPException(status_code=403, detail="Only data scientists can use the predict feature")

    try:
        result = predict_review(predict_input.review)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))