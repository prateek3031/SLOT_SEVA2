from fastapi.testclient import TestClient
from pymongo.errors import PyMongoError

from app import main


def test_health_endpoint() -> None:
    with TestClient(main.app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_endpoint_when_mongodb_is_available(monkeypatch) -> None:
    class FakeAdmin:
        async def command(self, name: str) -> dict[str, int]:
            assert name == "ping"
            return {"ok": 1}

    class FakeMongoClient:
        admin = FakeAdmin()

        def __getitem__(self, name: str) -> object:
            return object()

        async def close(self) -> None:
            pass

    monkeypatch.setattr(main, "AsyncMongoClient", lambda uri: FakeMongoClient())

    with TestClient(main.app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready"}


def test_readiness_endpoint_when_mongodb_is_unavailable(monkeypatch) -> None:
    class FakeAdmin:
        async def command(self, name: str) -> None:
            raise PyMongoError("database unavailable")

    class FakeMongoClient:
        admin = FakeAdmin()

        def __getitem__(self, name: str) -> object:
            return object()

        async def close(self) -> None:
            pass

    monkeypatch.setattr(main, "AsyncMongoClient", lambda uri: FakeMongoClient())

    with TestClient(main.app) as client:
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"detail": "MongoDB is unavailable"}
