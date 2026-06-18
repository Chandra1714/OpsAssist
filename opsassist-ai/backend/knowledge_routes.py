from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import auth, database, models, schemas
from .models import User

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.KnowledgeBaseItemRead)
def create_knowledge_item(
    request: schemas.KnowledgeBaseItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    item = models.KnowledgeBaseItem(
        title=request.title,
        content=request.content,
        tags=request.tags,
        user_id=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/", response_model=list[schemas.KnowledgeBaseItemRead])
def list_knowledge_items(
    query: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    query_builder = db.query(models.KnowledgeBaseItem).filter(models.KnowledgeBaseItem.user_id == current_user.id)
    if query:
        search = f"%{query}%"
        query_builder = query_builder.filter(
            models.KnowledgeBaseItem.title.ilike(search)
            | models.KnowledgeBaseItem.content.ilike(search)
            | models.KnowledgeBaseItem.tags.ilike(search)
        )
    return query_builder.order_by(models.KnowledgeBaseItem.created_at.desc()).all()


@router.get("/{item_id}", response_model=schemas.KnowledgeBaseItemRead)
def get_knowledge_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    item = (
        db.query(models.KnowledgeBaseItem)
        .filter(models.KnowledgeBaseItem.id == item_id)
        .filter(models.KnowledgeBaseItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge item not found")
    return item
