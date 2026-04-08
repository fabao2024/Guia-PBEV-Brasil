"""SQLite database models for post queue and conversation tracking."""

import datetime
import logging
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker

from config import get_settings

Base = declarative_base()
logger = logging.getLogger(__name__)


class ScheduledPost(Base):
    """Posts agendados para publicação."""
    __tablename__ = "scheduled_posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    caption = Column(Text, nullable=False)
    hashtags = Column(Text, default="")
    image_url = Column(String(500), nullable=True)  # URL pública da imagem
    image_path = Column(String(500), nullable=True)  # Path local (backup)
    scheduled_at = Column(DateTime, nullable=False)
    published = Column(Boolean, default=False)
    published_at = Column(DateTime, nullable=True)
    ig_media_id = Column(String(100), nullable=True)  # ID retornado pela API
    post_type = Column(String(50), default="image")  # image, carousel, reel
    category = Column(String(100), default="geral")  # modelo, comparativo, dica, tco, noticia
    text_provider = Column(String(50), nullable=True)
    text_model = Column(String(100), nullable=True)
    text_input_tokens = Column(Integer, nullable=True)
    text_output_tokens = Column(Integer, nullable=True)
    text_total_tokens = Column(Integer, nullable=True)
    text_cost_source = Column(String(50), nullable=True)
    text_cost_usd = Column(Float, nullable=True)
    image_provider = Column(String(50), nullable=True)
    image_model = Column(String(100), nullable=True)
    ai_image_used = Column(Boolean, default=False)
    image_cost_source = Column(String(50), nullable=True)
    image_cost_usd = Column(Float, nullable=True)
    total_cost_usd = Column(Float, nullable=True)
    cost_estimate_complete = Column(Boolean, default=False)
    cost_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        status = "✅" if self.published else "⏳"
        return f"<Post {self.id} {status} [{self.category}] {self.scheduled_at}>"


class ConversationLog(Base):
    """Log de conversas (DMs e comentários) para contexto."""
    __tablename__ = "conversation_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ig_user_id = Column(String(100), nullable=False)
    ig_username = Column(String(100), nullable=True)
    message_type = Column(String(20), default="dm")  # dm, comment
    incoming_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)
    media_id = Column(String(100), nullable=True)  # p/ comentários
    responded = Column(Boolean, default=False)
    status_reason = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ContentIdea(Base):
    """Ideias de conteúdo geradas pelo Claude."""
    __tablename__ = "content_ideas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    topic = Column(String(200), nullable=False)
    caption = Column(Text, nullable=False)
    hashtags = Column(Text, default="")
    category = Column(String(100), default="geral")
    image_prompt = Column(Text, nullable=True)  # Prompt p/ gerar imagem
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class GenerationEvent(Base):
    """Eventos de geracao de texto/imagem para rastrear custo real de tentativa."""
    __tablename__ = "generation_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheduled_post_id = Column(Integer, nullable=True)
    event_type = Column(String(20), nullable=False)  # text, image
    provider = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    source = Column(String(100), nullable=True)  # weekly_queue, reset_post, preview, manual...
    status = Column(String(20), default="success")  # success, failed
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    estimated_cost_usd = Column(Float, nullable=True)
    cost_source = Column(String(50), nullable=True)
    prompt_excerpt = Column(Text, nullable=True)
    response_excerpt = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


# --- Database setup ---

def get_engine():
    settings = get_settings()
    return create_engine(settings.database_url, echo=False)


def get_session():
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()


def init_db():
    """Create all tables."""
    engine = get_engine()
    Base.metadata.create_all(engine)
    _migrate_scheduled_posts_cost_columns(engine)
    _migrate_conversation_logs_columns(engine)
    logger.debug("Database initialized.")


def _migrate_scheduled_posts_cost_columns(engine):
    """Adiciona colunas novas em bases SQLite existentes sem usar Alembic."""
    expected_columns = {
        "text_provider": "VARCHAR(50)",
        "text_model": "VARCHAR(100)",
        "text_input_tokens": "INTEGER",
        "text_output_tokens": "INTEGER",
        "text_total_tokens": "INTEGER",
        "text_cost_source": "VARCHAR(50)",
        "text_cost_usd": "FLOAT",
        "image_provider": "VARCHAR(50)",
        "image_model": "VARCHAR(100)",
        "ai_image_used": "BOOLEAN DEFAULT 0",
        "image_cost_source": "VARCHAR(50)",
        "image_cost_usd": "FLOAT",
        "total_cost_usd": "FLOAT",
        "cost_estimate_complete": "BOOLEAN DEFAULT 0",
        "cost_updated_at": "DATETIME",
    }

    with engine.begin() as conn:
        rows = conn.exec_driver_sql("PRAGMA table_info(scheduled_posts)").fetchall()
        existing = {row[1] for row in rows}
        for column_name, ddl in expected_columns.items():
            if column_name in existing:
                continue
            conn.exec_driver_sql(f"ALTER TABLE scheduled_posts ADD COLUMN {column_name} {ddl}")


def _migrate_conversation_logs_columns(engine):
    """Adiciona colunas novas em conversation_logs sem usar Alembic."""
    expected_columns = {
        "status_reason": "VARCHAR(100)",
    }

    with engine.begin() as conn:
        rows = conn.exec_driver_sql("PRAGMA table_info(conversation_logs)").fetchall()
        existing = {row[1] for row in rows}
        for column_name, ddl in expected_columns.items():
            if column_name in existing:
                continue
            conn.exec_driver_sql(f"ALTER TABLE conversation_logs ADD COLUMN {column_name} {ddl}")


if __name__ == "__main__":
    init_db()
