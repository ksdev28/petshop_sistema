from pydantic import BaseModel, Field, condecimal
from typing import Optional

class ServicoBase(BaseModel):
    nome: str = Field(..., max_length=150)
    descricao: Optional[str] = None
    preco: condecimal(max_digits=10, decimal_places=2) = Field(..., ge=0)
    duracao_estimada_minutos: int = Field(..., gt=0)

class ServicoCreate(ServicoBase):
    pass

class ServicoUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=150)
    descricao: Optional[str] = None
    preco: Optional[condecimal(max_digits=10, decimal_places=2)] = Field(None, ge=0)
    duracao_estimada_minutos: Optional[int] = Field(None, gt=0)

class ServicoInDB(ServicoBase):
    servico_id: int

    class Config:
        from_attributes = True

class Servico(ServicoInDB):
    pass

