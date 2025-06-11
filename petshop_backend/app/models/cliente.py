from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ClienteBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    telefone: str = Field(..., max_length=20)
    email: EmailStr
    endereco: Optional[str] = Field(None, max_length=500)

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    telefone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    endereco: Optional[str] = Field(None, max_length=500)

class ClienteInDB(ClienteBase):
    cliente_id: int
    data_cadastro: datetime

    class Config:
        from_attributes = True 

class Cliente(ClienteInDB):
    pass

