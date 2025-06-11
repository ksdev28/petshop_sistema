from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class AgendamentoServicoDetalhe(BaseModel):
    servico_id: int
    nome_servico: str
    preco_registrado: Decimal
    observacoes: Optional[str] = None

class AgendamentoBase(BaseModel):
    animal_id: int
    funcionario_id: Optional[int] = None
    data_hora_agendamento: datetime
    status: str = Field(..., max_length=50, pattern=r"^(Agendado|Confirmado|Cancelado|Concluído|Não Compareceu)$")
    observacoes: Optional[str] = None

class AgendamentoCreate(AgendamentoBase):
    servicos_ids: List[int] = Field(..., min_length=1)

class AgendamentoUpdate(BaseModel):
    animal_id: Optional[int] = None
    funcionario_id: Optional[int] = None
    data_hora_agendamento: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50, pattern=r"^(Agendado|Confirmado|Cancelado|Concluído|Não Compareceu)$")
    observacoes: Optional[str] = None
    servicos_ids: Optional[List[int]] = None

class AgendamentoInDBBase(AgendamentoBase):
    agendamento_id: int
    data_hora_criacao: datetime

    class Config:
        from_attributes = True

class Agendamento(AgendamentoInDBBase):
    animal_nome: Optional[str] = None
    cliente_nome: Optional[str] = None
    funcionario_nome: Optional[str] = None
    valor_total: Optional[Decimal] = None
    servicos: List[AgendamentoServicoDetalhe] = []

class AgendamentoSimple(AgendamentoInDBBase):
    animal_nome: Optional[str] = None
    cliente_nome: Optional[str] = None
    funcionario_nome: Optional[str] = None
    valor_total: Optional[Decimal] = None