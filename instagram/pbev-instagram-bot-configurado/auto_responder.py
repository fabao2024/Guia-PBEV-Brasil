"""Auto responder for Instagram DMs and comments."""

import datetime
import logging
import re
import unicodedata

from google import genai
from google.genai import types

from config import get_settings
from database import ConversationLog, get_session
from ev_knowledge import get_consultor_system_context
from image_generator import _find_matching_vehicles
from publisher import DMDeliveryDisabled, InstagramPublisher

logger = logging.getLogger(__name__)

MAX_COMMENT_LENGTH = 300
MAX_DM_LENGTH = 500

SPAM_KEYWORDS = [
    "ganhe dinheiro",
    "renda extra",
    "clique no link",
    "sigam",
    "promocao imperdivel",
    "promoção imperdível",
    "curso gratis",
    "curso grátis",
    "dm pra saber",
]

COMMENT_EV_KEYWORDS = [
    "eletrico",
    "bateria",
    "autonomia",
    "recarga",
    "carregador",
    "byd",
    "tesla",
    "gwm",
    "volvo",
    "nissan leaf",
    "preco",
    "custo",
    "economia",
    "tco",
    "quanto custa",
    "vale a pena",
    "compensa",
]

COMMENT_PRICE_KEYWORDS = [
    "valor",
    "valores",
    "preco",
    "custa",
    "custar",
    "caro",
    "cara",
    "caros",
    "caras",
    "absurdo",
    "surreal",
    "inviavel",
]

COMMENT_MARKET_KEYWORDS = [
    "chines",
    "chinesa",
    "chineses",
    "concorrencia",
    "mercado",
]


class AutoResponder:
    """Generate and send automatic replies for DMs and comments."""

    def __init__(self):
        self.settings = get_settings()
        self.client = genai.Client(api_key=self.settings.gemini_api_key)
        self.publisher = InstagramPublisher()
        self.dm_delivery_disabled_reason: str | None = None
        self.dm_disabled_log_emitted = False

    async def handle_comment(self, comment_id: str, text: str, user_id: str, media_id: str):
        """Process a comment and reply when relevant."""
        if self._is_spam(text):
            self._log_conversation(
                ig_user_id=user_id,
                message_type="comment",
                incoming_text=text,
                response_text=None,
                media_id=media_id,
                responded=False,
                status_reason="spam",
            )
            logger.info("Spam detectado de %s, ignorando.", user_id)
            return

        if self._was_comment_recently_answered(user_id=user_id, text=text, media_id=media_id):
            self._log_conversation(
                ig_user_id=user_id,
                message_type="comment",
                incoming_text=text,
                response_text=None,
                media_id=media_id,
                responded=False,
                status_reason="duplicate",
            )
            logger.info("Comentario %s parece duplicado; resposta ignorada.", comment_id)
            return

        comment_reason = self._comment_response_reason(text)
        if not comment_reason:
            self._log_conversation(
                ig_user_id=user_id,
                message_type="comment",
                incoming_text=text,
                response_text=None,
                media_id=media_id,
                responded=False,
                status_reason="not_relevant",
            )
            logger.info("Comentario de %s nao requer resposta automatica.", user_id)
            return

        response = self._generate_response(
            message=text,
            message_type="comment",
            max_length=MAX_COMMENT_LENGTH,
        )

        if not response:
            self._log_conversation(
                ig_user_id=user_id,
                message_type="comment",
                incoming_text=text,
                response_text=None,
                media_id=media_id,
                responded=False,
                status_reason="generation_failed",
            )
            return

        try:
            await self.publisher.reply_to_comment(comment_id, response)
        except Exception as e:
            self._log_conversation(
                ig_user_id=user_id,
                message_type="comment",
                incoming_text=text,
                response_text=response,
                media_id=media_id,
                responded=False,
                status_reason="reply_failed",
            )
            logger.error("Falha ao responder comentario de %s: %s", user_id, e)
            return

        self._log_conversation(
            ig_user_id=user_id,
            message_type="comment",
            incoming_text=text,
            response_text=response,
            media_id=media_id,
            responded=True,
            status_reason=comment_reason,
        )
        logger.info("Respondido comentario de %s", user_id)

    async def handle_dm(self, sender_id: str, text: str):
        """Process a DM and try to reply."""
        if self.dm_delivery_disabled_reason:
            self.dm_disabled_log_emitted = True
            self._log_conversation(
                ig_user_id=sender_id,
                message_type="dm",
                incoming_text=text,
                response_text=None,
                responded=False,
                status_reason="dm_delivery_disabled",
            )
            return

        if self._is_spam(text):
            logger.info("Spam DM de %s, ignorando.", sender_id)
            return

        history = self._get_recent_history(sender_id, limit=5)
        response = self._generate_response(
            message=text,
            message_type="dm",
            max_length=MAX_DM_LENGTH,
            conversation_history=history,
        )

        if not response:
            return

        try:
            await self.publisher.send_dm(sender_id, response)
        except DMDeliveryDisabled as e:
            self.dm_delivery_disabled_reason = str(e)
            logger.error("Desabilitando respostas de DM ate reinicio: %s", e)
            self._log_conversation(
                ig_user_id=sender_id,
                message_type="dm",
                incoming_text=text,
                response_text=response,
                responded=False,
                status_reason="dm_delivery_disabled",
            )
            return
        except Exception as e:
            logger.error("Falha ao responder DM de %s: %s", sender_id, e)
            self._log_conversation(
                ig_user_id=sender_id,
                message_type="dm",
                incoming_text=text,
                response_text=response,
                responded=False,
                status_reason="dm_reply_failed",
            )
            return

        self._log_conversation(
            ig_user_id=sender_id,
            message_type="dm",
            incoming_text=text,
            response_text=response,
            responded=True,
            status_reason="replied",
        )
        logger.info("Respondido DM de %s", sender_id)

    def _generate_response(
        self,
        message: str,
        message_type: str = "dm",
        max_length: int = 500,
        conversation_history: list[dict] | None = None,
    ) -> str | None:
        """Generate a reply with Gemini and truncate to the target length."""
        response_language = self._detect_response_language(message)
        language_guidance = {
            "en": "Respond in English because the user wrote in English.",
            "es": "Responde en español porque el usuario escribió en español.",
        }.get(response_language, "Responda em português do Brasil, porque o usuário escreveu em português.")
        system = f"""{get_consultor_system_context(message_type=message_type, max_length=max_length, response_language=response_language)}

REGRAS ADICIONAIS PARA RESPOSTAS AUTOMATICAS NO INSTAGRAM:
- {language_guidance}
- Se for comentario, seja ainda mais conciso e direto
- Sempre cite explicitamente o Guia PBEV ou guiapbev.cloud quando orientar o usuario para a plataforma
- Se nao souber a resposta, direcione explicitamente ao Guia PBEV: guiapbev.cloud
- Nao responda a spam, propaganda ou mensagens ofensivas
- Se a mensagem for um simples emoji ou "👏", responda com agradecimento breve
"""

        config = types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.7,
            max_output_tokens=512,
        )

        history = []
        if conversation_history:
            for entry in conversation_history:
                history.append(types.Content(
                    role="user", parts=[types.Part(text=entry["incoming"])]
                ))
                if entry.get("response"):
                    history.append(types.Content(
                        role="model", parts=[types.Part(text=entry["response"])]
                    ))

        try:
            chat = self.client.chats.create(
                model=self.settings.gemini_model,
                config=config,
                history=history,
            )
            response = chat.send_message(message)
            text = response.text.strip()
            text = self._ensure_platform_reference(
                text=text,
                response_language=response_language,
                message_type=message_type,
                max_length=max_length,
            )

            return text
        except Exception as e:
            logger.error("Erro ao gerar resposta: %s", e)
            return None

    def _ensure_platform_reference(
        self,
        text: str,
        response_language: str,
        message_type: str,
        max_length: int,
    ) -> str:
        """Garante citacao explicita ao Guia PBEV sem estourar o limite."""
        cleaned = (text or "").strip()
        if not cleaned:
            return cleaned

        if self._mentions_platform(cleaned):
            return self._truncate_response(cleaned, max_length)

        suffix = self._platform_suffix(response_language, message_type)
        base = cleaned.rstrip(" .!?\n")
        if len(base) + len(suffix) <= max_length:
            return base + suffix

        available = max_length - len(suffix)
        if available <= 0:
            return self._truncate_response(suffix.strip(), max_length)

        truncated_base = self._truncate_response(base, available).rstrip(" .!?")
        return (truncated_base + suffix)[:max_length]

    def _mentions_platform(self, text: str) -> bool:
        normalized = (text or "").lower()
        return (
            "guiapbev.cloud" in normalized
            or "guia pbev" in normalized
            or "guia pbev brasil" in normalized
        )

    def _platform_suffix(self, response_language: str, message_type: str) -> str:
        if response_language == "en":
            return " See Guia PBEV: guiapbev.cloud"
        if response_language == "es":
            return " Ver Guia PBEV: guiapbev.cloud"
        if message_type == "comment":
            return " Veja no Guia PBEV: guiapbev.cloud"
        return " Confira no Guia PBEV: guiapbev.cloud"

    def _truncate_response(self, text: str, max_length: int) -> str:
        cleaned = (text or "").strip()
        if len(cleaned) <= max_length:
            return cleaned
        if max_length <= 3:
            return cleaned[:max_length]
        return cleaned[: max_length - 3].rsplit(" ", 1)[0] + "..."

    def _detect_response_language(self, text: str) -> str:
        """Detecta ingles/espanhol basicos para responder no mesmo idioma; padrao pt-BR."""
        normalized = (text or "").strip().lower()
        if not normalized:
            return "pt-BR"

        english_signals = [
            "what is",
            "what's",
            "range",
            "price",
            "cost",
            "how much",
            "compare",
            "charging",
            "battery",
            "worth it",
            "does it",
            "can i",
            "which one",
        ]
        spanish_signals = [
            "cuál es",
            "cual es",
            "autonomía",
            "autonomia",
            "precio",
            "cuánto",
            "cuanto",
            "batería",
            "bateria",
            "carga",
            "vale la pena",
            "comparar",
        ]
        if any(signal in normalized for signal in english_signals):
            return "en"
        if any(signal in normalized for signal in spanish_signals):
            return "es"

        tokens = set(re.findall(r"[a-zA-Z']+", normalized))
        english_tokens = {
            "what", "is", "the", "range", "price", "cost", "how", "much", "does", "compare",
            "battery", "charging", "worth", "it", "which", "one", "can", "i", "for", "with",
        }
        spanish_tokens = {
            "cual", "cuanto", "precio", "autonomia", "bateria", "carga", "comparar",
            "vale", "pena", "carro", "electrico", "como", "con", "para", "que", "el",
        }
        portuguese_tokens = {
            "qual", "quanto", "preco", "preço", "autonomia", "recarga", "bateria", "vale", "pena",
            "compensa", "carro", "eletrico", "elétrico", "como", "com", "para",
        }

        english_score = len(tokens & english_tokens)
        spanish_score = len(tokens & spanish_tokens)
        portuguese_score = len(tokens & portuguese_tokens)
        if english_score > max(spanish_score, portuguese_score) and english_score >= 2:
            return "en"
        if spanish_score > max(english_score, portuguese_score) and spanish_score >= 2:
            return "es"
        return "pt-BR"

    def _should_respond_to_comment(self, text: str) -> bool:
        """Determine whether a comment deserves an automatic reply."""
        text_lower = text.lower().strip()

        if "?" in text_lower:
            return True

        if "@guiapbevbrasil" in text_lower or "@guiapbev" in text_lower:
            return True

        ev_keywords = [
            "elétrico",
            "eletrico",
            "bateria",
            "autonomia",
            "recarga",
            "carregador",
            "byd",
            "tesla",
            "gwm",
            "volvo",
            "nissan leaf",
            "preço",
            "preco",
            "custo",
            "economia",
            "tco",
            "quanto custa",
            "vale a pena",
            "compensa",
        ]
        if any(kw in text_lower for kw in ev_keywords):
            return True

        # Comentarios curtos com nome de modelo tambem devem acionar resposta.
        if _find_matching_vehicles(text, limit=1):
            return True

        tokens = re.findall(r"[\w\-]+", text_lower)
        if len(tokens) <= 3 and any(char.isdigit() for char in text_lower):
            return True

        return False

    def _is_spam(self, text: str) -> bool:
        """Detect spammy messages."""
        normalized = self._normalize_text(text)
        return any(self._normalize_text(kw) in normalized for kw in SPAM_KEYWORDS)

    def _comment_response_reason(self, text: str) -> str | None:
        """Return the reason that makes a comment eligible for auto-reply."""
        normalized = self._normalize_text(text)
        tokens = re.findall(r"[\w\-]+", normalized)

        if "?" in normalized:
            return "question"

        if "@guiapbevbrasil" in normalized or "@guiapbev" in normalized:
            return "mention"

        if any(kw in normalized for kw in COMMENT_EV_KEYWORDS):
            return "ev_keyword"

        price_matches = [kw for kw in COMMENT_PRICE_KEYWORDS if kw in normalized]
        market_matches = [kw for kw in COMMENT_MARKET_KEYWORDS if kw in normalized]
        if "nao tem como pagar" in normalized:
            return "market_opinion"
        if price_matches and market_matches:
            return "market_opinion"
        if len(price_matches) >= 2:
            return "price_opinion"
        if price_matches and len(tokens) >= 4:
            return "price_opinion"

        # Comentarios curtos com nome de modelo tambem devem acionar resposta.
        if _find_matching_vehicles(text, limit=1):
            return "catalog_match"

        if len(tokens) <= 3 and any(char.isdigit() for char in normalized):
            return "short_numeric"

        return None

    def _normalize_text(self, text: str) -> str:
        """Normalize text for accent-insensitive keyword matching."""
        normalized = unicodedata.normalize("NFKD", (text or "").lower().strip())
        return "".join(char for char in normalized if not unicodedata.combining(char))

    def _should_respond_to_comment(self, text: str) -> bool:
        """Determine whether a comment deserves an automatic reply."""
        return self._comment_response_reason(text) is not None

    def _get_recent_history(self, user_id: str, limit: int = 5) -> list[dict]:
        """Load recent DM history for context."""
        session = get_session()
        logs = (
            session.query(ConversationLog)
            .filter_by(ig_user_id=user_id, message_type="dm")
            .order_by(ConversationLog.created_at.desc())
            .limit(limit)
            .all()
        )
        session.close()

        return [
            {"incoming": log.incoming_text, "response": log.response_text}
            for log in reversed(logs)
        ]

    def _was_comment_recently_answered(self, user_id: str, text: str, media_id: str | None) -> bool:
        """Evita responder ao mesmo comentario varias vezes por retry/reentrega do webhook."""
        session = get_session()
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=3)
        existing = (
            session.query(ConversationLog)
            .filter(
                ConversationLog.ig_user_id == user_id,
                ConversationLog.message_type == "comment",
                ConversationLog.incoming_text == text,
                ConversationLog.media_id == media_id,
                ConversationLog.responded == True,
                ConversationLog.created_at >= cutoff,
            )
            .first()
        )
        session.close()
        return existing is not None

    def _log_conversation(
        self,
        ig_user_id: str,
        message_type: str,
        incoming_text: str,
        response_text: str | None,
        media_id: str | None = None,
        responded: bool = True,
        status_reason: str | None = None,
    ):
        """Persist a DM or comment interaction."""
        session = get_session()
        log = ConversationLog(
            ig_user_id=ig_user_id,
            message_type=message_type,
            incoming_text=incoming_text,
            response_text=response_text,
            media_id=media_id,
            responded=responded,
            status_reason=status_reason,
        )
        session.add(log)
        session.commit()
        session.close()
