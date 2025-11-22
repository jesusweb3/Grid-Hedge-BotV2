from __future__ import annotations

import hashlib
import hmac
from typing import Final

# NOTE: Update this password before distributing the application.
_ADMIN_PASSWORD: Final[str] = "123"
_ADMIN_PASSWORD_HASH: Final[str] = hashlib.sha256(_ADMIN_PASSWORD.encode("utf-8")).hexdigest()


def verify_admin_password(password: str) -> bool:
    candidate = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(candidate, _ADMIN_PASSWORD_HASH)


