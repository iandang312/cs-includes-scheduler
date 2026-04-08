from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/scheduler"

    frontend_origin: str = "http://localhost:3000"
    session_secret: str = "dev-secret-change-me"
    session_cookie_name: str = "csinc_session"
    session_ttl_seconds: int = 60 * 60 * 24 * 7  # 7 days

    admin_emails: str = ""
    google_calendar_api_key: str = ""
    google_calendar_id: str = ""
    google_calendar_max_results: int = 12


settings = Settings()
