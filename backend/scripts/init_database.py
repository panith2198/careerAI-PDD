import argparse
import asyncio
from pathlib import Path

from sqlalchemy import text

from app.core.database import engine


def split_sql(sql: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []

    for raw_line in sql.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("--"):
            continue
        if line.upper().startswith("CREATE DATABASE ") or line.upper().startswith("USE "):
            continue

        current.append(raw_line)
        if line.endswith(";"):
            statement = "\n".join(current).strip().rstrip(";")
            if statement:
                statements.append(statement)
            current = []

    tail = "\n".join(current).strip()
    if tail:
        statements.append(tail)

    return statements


async def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize the configured CareerAI MySQL database.")
    parser.add_argument(
        "--schema",
        default=str(Path(__file__).resolve().parents[1] / "database" / "schema.sql"),
        help="Path to schema.sql inside the container.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Required because the schema drops and recreates tables.",
    )
    args = parser.parse_args()

    if not args.force:
        raise SystemExit("Refusing to run without --force because this drops and recreates tables.")

    schema_path = Path(args.schema)
    if not schema_path.exists():
        raise SystemExit(f"Schema file not found: {schema_path}")

    statements = split_sql(schema_path.read_text(encoding="utf-8"))
    async with engine.begin() as conn:
        for statement in statements:
            await conn.execute(text(statement))

    print(f"Initialized database with {len(statements)} SQL statements.")


if __name__ == "__main__":
    asyncio.run(main())
