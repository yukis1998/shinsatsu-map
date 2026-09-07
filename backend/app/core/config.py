from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """アプリ設定。環境変数（または .env）から読み込む。"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "新札マップ API"

    # DB 接続文字列。docker-compose では db サービスを指す。
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@db:5432/shinsatsu"

    # CORS 許可オリジン（カンマ区切り）。フロント(Next.js)からのアクセス用。
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"

    # 認証（#8 以降で使用）
    SECRET_KEY: str = "dev-secret-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        """SQLAlchemy 用に正規化した接続 URL。

        Render/Heroku の Postgres は ``postgres://`` 形式を渡してくるが、
        SQLAlchemy 2.0 は ``postgresql+psycopg2://`` を要求するため変換する。
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg2://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url


settings = Settings()
