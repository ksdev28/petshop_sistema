from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AnimalBase(BaseModel):
    cliente_id: int
    nome: str = Field(..., max_length=100)
    especie: str = Field(..., max_length=50)
    raca: Optional[str] = Field(None, max_length=50)
    data_nascimento: Optional[date] = None
    observacoes: Optional[str] = None

class AnimalCreate(AnimalBase):
    pass

class AnimalUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=100)
    especie: Optional[str] = Field(None, max_length=50)
    raca: Optional[str] = Field(None, max_length=50)
    data_nascimento: Optional[date] = None
    observacoes: Optional[str] = None
   

class AnimalInDB(AnimalBase):
    animal_id: int

    class Config:
        from_attributes = True

class Animal(AnimalInDB):
    pass


