from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import create_session


def get_db() -> Generator[Session, None, None]:
    db = create_session()
    try:
        yield db
    finally:
        db.close()
