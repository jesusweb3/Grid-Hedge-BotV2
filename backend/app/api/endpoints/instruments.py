from __future__ import annotations

from pydantic import ValidationError

from fastapi import APIRouter, HTTPException, Response, status

from app.models.instrument import Instrument, InstrumentCreate, InstrumentUpdate
from app.repositories.instrument_store import instrument_store

router = APIRouter()


@router.get("/", response_model=list[Instrument])
async def list_instruments() -> list[Instrument]:
    return await instrument_store.list()


@router.post("/", response_model=Instrument, status_code=status.HTTP_201_CREATED)
async def create_instrument(payload: InstrumentCreate) -> Instrument:
    try:
        return await instrument_store.create(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc


@router.patch("/{symbol}", response_model=Instrument)
async def update_instrument(symbol: str, payload: InstrumentUpdate) -> Instrument:
    try:
        return await instrument_store.update(symbol, payload)
    except ValueError as exc:
        message = str(exc)
        status_code = status.HTTP_404_NOT_FOUND if "not found" in message.lower() else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=message) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.errors()) from exc


@router.delete(
    "/{symbol}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_instrument(symbol: str) -> Response:
    await instrument_store.delete(symbol)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

