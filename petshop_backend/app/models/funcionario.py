from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

class FuncionarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    cargo: str = Field(..., max_length=100)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    data_contratacao: date
    ativo: bool = True

class FuncionarioCreate(FuncionarioBase):
    pass

class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    cargo: Optional[str] = Field(None, max_length=100)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    data_contratacao: Optional[date] = None
    ativo: Optional[bool] = None

class FuncionarioInDB(FuncionarioBase):
    funcionario_id: int

    class Config:
        from_attributes = True

class Funcionario(FuncionarioInDB):
    pass

