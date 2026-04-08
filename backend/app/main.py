from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import admin, auth, events, me


def create_app() -> FastAPI:
    app = FastAPI(title="CS-INCLUDES Scheduler API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(me.router)
    app.include_router(events.router)
    app.include_router(admin.router)

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


app = create_app()

