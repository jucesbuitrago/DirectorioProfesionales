from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr


class ProfessionalProfileIn(BaseModel):
    nombre_completo: str
    profesion_principal: str
    ciudad: Optional[str] = None
    barrio: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    descripcion_breve: Optional[str] = None


class ProfessionalProfileOut(ProfessionalProfileIn):
    id: str
    profesion_normalizada: Optional[str] = None
    ciudad_normalizada: Optional[str] = None
    vector_store_file_id: Optional[str] = None


def prof_to_out(p: Optional[Any]) -> Optional[ProfessionalProfileOut]:
    if not p:
        return None
    return ProfessionalProfileOut(
        id=p.id,
        nombre_completo=p.nombre_completo,
        profesion_principal=p.profesion_principal,
        ciudad=p.ciudad,
        barrio=p.barrio,
        telefono=p.telefono,
        email=p.email,
        descripcion_breve=p.descripcion_breve,
        profesion_normalizada=p.profesion_normalizada,
        ciudad_normalizada=p.ciudad_normalizada,
        vector_store_file_id=p.vector_store_file_id,
    )


def build_prof_json_for_vector_store(p: Any, user_id: str) -> Dict[str, Any]:
    """
    Construye una estructura JSON consistente para almacenar en el Vector Store por profesional.
    """
    payload: Dict[str, Any] = {
        "user_id": user_id,
        "prof_id": p.id,
        "nombre_completo": p.nombre_completo,
        "profesion_principal": p.profesion_principal,
        "ciudad": p.ciudad,
        "barrio": p.barrio,
        "telefono": p.telefono,
        "email": p.email,
        "descripcion_breve": p.descripcion_breve,
        # Campos normalizados para mejorar recuperación
        "profesion_normalizada": p.profesion_normalizada,
        "ciudad_normalizada": p.ciudad_normalizada,
        "source": "registro",
    }
    return payload