from fastapi import APIRouter, Depends
from app.utils.security import get_current_user
from app.utils.ai import ask_gpt
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class AIRequest(BaseModel):
    prompt: str
    project_context: Optional[str] = None
    components: Optional[list] = None
    simulation_results: Optional[dict] = None

@router.post("/assistant", response_model=dict)
def ai_assistant(request: AIRequest, current_user=Depends(get_current_user)):
    # Compose prompt with context
    context = ""
    if request.project_context:
        context += f"Project context: {request.project_context}\n"
    if request.components:
        context += f"Available components: {request.components}\n"
    if request.simulation_results:
        context += f"Simulation results: {request.simulation_results}\n"
    full_prompt = context + request.prompt
    answer = ask_gpt(full_prompt)
    return {"answer": answer}

