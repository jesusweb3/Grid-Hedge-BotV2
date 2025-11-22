from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Any, Dict, Iterable, List

from app.models.instrument import Instrument

logger = logging.getLogger(__name__)

def _default_state() -> Dict[str, Any]:
    return {
        "instruments": [],
        "settings": {},
    }


class StateStorage:
    """Persist application state (settings, instruments) between restarts."""

    def __init__(self, path: Path | None = None) -> None:
        state_dir = Path.home() / ".grid_hedge_bot"
        state_path = state_dir / "state.json"
        self._path = path or state_path
        self._lock = asyncio.Lock()

    def _ensure_file(self) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        if not self._path.exists():
            initial = json.dumps(_default_state(), ensure_ascii=False, indent=2)
            self._path.write_text(initial, encoding="utf-8")

    def _read_state(self) -> Dict[str, Any]:
        self._ensure_file()
        try:
            raw_text = self._path.read_text(encoding="utf-8")
            payload = json.loads(raw_text)
            if not isinstance(payload, dict):
                raise ValueError("State file does not contain a JSON object")
        except json.JSONDecodeError as exc:
            logger.warning("State file is corrupted, resetting to defaults: %s", exc)
            backup_path = self._path.with_suffix(".bak")
            try:
                self._path.replace(backup_path)
            except OSError:
                logger.debug("Failed to move corrupted state file to backup")
            payload = _default_state()
            self._write_state(payload)
        except (OSError, ValueError) as exc:
            logger.warning("Failed to load state file, reinitialising: %s", exc)
            payload = _default_state()
            self._write_state(payload)

        instruments = payload.get("instruments") or []
        settings = payload.get("settings") or {}

        if not isinstance(instruments, list):
            instruments = []
        if not isinstance(settings, dict):
            settings = {}

        return {
            "instruments": instruments.copy(),
            "settings": settings.copy(),
        }

    def _write_state(self, state: Dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self._path.with_suffix(".tmp")
        data = json.dumps(state, ensure_ascii=False, indent=2)
        tmp_path.write_text(data, encoding="utf-8")
        tmp_path.replace(self._path)

    async def load_instruments(self) -> List[Instrument]:
        async with self._lock:
            state = self._read_state()

        instruments: List[Instrument] = []
        for item in state.get("instruments", []):
            if not isinstance(item, dict):
                continue
            try:
                instruments.append(Instrument(**item))
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("Failed to restore instrument from state: %s", exc)
        return instruments

    async def save_instruments(self, instruments: Iterable[Instrument]) -> None:
        serialized = [
            json.loads(instrument.model_dump_json(by_alias=False))
            for instrument in instruments
        ]
        async with self._lock:
            state = self._read_state()
            state["instruments"] = serialized
            self._write_state(state)

    async def load_settings(self) -> Dict[str, Any]:
        async with self._lock:
            state = self._read_state()
            settings = state.get("settings", {})
            return settings.copy() if isinstance(settings, dict) else {}

    async def save_settings(self, settings: Dict[str, Any]) -> None:
        async with self._lock:
            state = self._read_state()
            state["settings"] = dict(settings)
            self._write_state(state)


state_storage = StateStorage()


