from typing import Any

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    def model_dump_camel(self, **kwargs: Any) -> dict[str, Any]:
        return self.model_dump(by_alias=True, **kwargs)

