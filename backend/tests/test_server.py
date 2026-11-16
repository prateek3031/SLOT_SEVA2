import importlib


def test_full_api_registers_doctor_routes(monkeypatch) -> None:
    monkeypatch.setenv("MONGO_URL", "mongodb://localhost:27017")
    monkeypatch.setenv("DB_NAME", "slotseva")
    server = importlib.import_module("server")

    try:
        paths = server.app.openapi()["paths"]
        assert "/api/doctors" in paths
        assert "/api/doctors/meta" in paths
        assert "/api/doctors/{doctor_id}" in paths
        assert "/api/doctors/{doctor_id}/slots" in paths
    finally:
        server.client.close()
