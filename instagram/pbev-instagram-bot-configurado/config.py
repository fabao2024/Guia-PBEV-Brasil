"""Configuration and environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Google Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash-lite"  # Mesmo modelo do EletriBrasil
    zai_api_key: str = ""

    # Meta / Instagram
    meta_app_id: str = ""
    meta_app_secret: str = ""
    meta_access_token: str = ""
    instagram_business_account_id: str = ""
    facebook_page_id: str = ""
    facebook_page_access_token: str = ""

    # Webhook
    webhook_verify_token: str = "pbev_webhook_secret_2024"
    webhook_url: str = "https://bot.guiapbev.cloud/webhook"

    # App
    host: str = "0.0.0.0"
    port: int = 8001
    database_url: str = "sqlite:///pbev_instagram.db"
    log_level: str = "INFO"

    # Plausible Analytics
    plausible_api_key: str = ""
    plausible_domain: str = "guiapbev.cloud"

    # Content
    default_hashtags: str = "#veiculoeletrico,#carroeletrico,#mobilidadeeletrica,#EVBrasil,#GuiaPBEV"
    site_url: str = "https://guiapbev.cloud"  # legado
    public_site_url: str = ""
    image_base_url: str = ""
    image_fallback_url: str = ""
    posting_timezone: str = "America/Sao_Paulo"
    enable_ai_image_generation: bool = True
    image_generation_provider: str = "gemini"
    image_generation_model: str = "gemini-3.1-flash-image-preview"
    image_generation_size: str = "1280x1280"
    cost_fx_brl: float = 5.70
    market_news_source_urls: str = ""

    @property
    def public_site_base_url(self) -> str:
        return (self.public_site_url or self.site_url).rstrip("/")

    @property
    def image_host_base_url(self) -> str:
        return (self.image_base_url or self.site_url).rstrip("/")

    @property
    def image_fallback_base_url(self) -> str:
        return (self.image_fallback_url or "").rstrip("/")

    @property
    def webhook_base_url(self) -> str:
        url = (self.webhook_url or "").rstrip("/")
        if url.endswith("/webhook"):
            return url[:-len("/webhook")]
        return url

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
