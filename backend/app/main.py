import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, bill_types, health, spots
from app.core.config import settings


def _init_sentry() -> None:
    """Sentry を初期化する。DSN 未設定時は何もしない（開発・テストでは無効）。"""
    if not settings.SENTRY_DSN:
        return
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        send_default_pii=False,  # ユーザー個人情報は送らない
    )


def create_app() -> FastAPI:
    _init_sentry()
    app = FastAPI(title=settings.PROJECT_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(spots.router)
    app.include_router(bill_types.router)

    @app.get("/sentry-debug", include_in_schema=False)
    def sentry_debug() -> None:
        """Sentry 疎通確認用。意図的に例外を発生させる（動作確認後に削除する）。"""
        raise RuntimeError("Sentry test error (via /sentry-debug)")

    return app


app = create_app()
