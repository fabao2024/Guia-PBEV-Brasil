"""CLI para publicação manual e testes.

Uso:
    python publish.py --test                           # Testar conexão com Meta API
    python publish.py --post 5                         # Publicar post #5 da fila
    python publish.py --now "Legenda aqui" --image URL # Publicar imediatamente
    python publish.py --generate-and-post dica_ev      # Gerar + criar imagem + publicar
"""

import argparse
import asyncio
import json
import logging
from datetime import datetime, timedelta

from database import get_session, ScheduledPost, init_db
from publisher import InstagramPublisher
from content_generator import generate_single_post
from image_generator import generate_and_host_post_image

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def _caption_headline(text: str | None) -> str:
    return (text or "").splitlines()[0].strip().lower()


def find_recent_duplicate(
    caption: str,
    image_url: str,
    hours: int = 24,
    exclude_post_id: int | None = None,
):
    session = get_session()
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    recent_posts = (
        session.query(ScheduledPost)
        .filter(
            ScheduledPost.published == True,
            ScheduledPost.published_at != None,
            ScheduledPost.published_at >= cutoff,
        )
        .all()
    )

    headline = _caption_headline(caption)
    for post in recent_posts:
        if exclude_post_id and post.id == exclude_post_id:
            continue
        same_image = bool(image_url) and image_url == post.image_url
        same_headline = headline and headline == _caption_headline(post.caption)
        if same_image or same_headline:
            session.close()
            return post

    session.close()
    return None


def record_manual_publication(
    caption: str,
    image_url: str,
    hashtags: str = "",
    category: str = "manual",
    image_path: str | None = None,
    media_id: str | None = None,
):
    """Registra publicacao manual no banco para auditoria."""
    session = get_session()
    post = ScheduledPost(
        caption=caption,
        hashtags=hashtags,
        image_url=image_url,
        image_path=image_path,
        scheduled_at=datetime.utcnow(),
        published=True,
        published_at=datetime.utcnow(),
        ig_media_id=media_id,
        category=category,
        post_type="image",
    )
    session.add(post)
    session.commit()
    session.close()


async def test_connection():
    """Testa conexão com a Meta Graph API."""
    import httpx
    from config import get_settings

    settings = get_settings()
    print("🔍 Testando conexão com Meta Graph API...\n")

    async with httpx.AsyncClient(timeout=15) as client:
        # Test 1: Verificar token
        resp = await client.get(
            "https://graph.facebook.com/v21.0/me",
            params={"access_token": settings.meta_access_token},
        )

        if resp.status_code == 200:
            data = resp.json()
            print(f"✅ Token válido — Page: {data.get('name', 'N/A')} (ID: {data.get('id')})")
        else:
            print(f"❌ Token inválido: {resp.status_code} — {resp.text}")
            return

        # Test 2: Verificar Instagram Business Account
        resp2 = await client.get(
            f"https://graph.facebook.com/v21.0/{settings.instagram_business_account_id}",
            params={
                "access_token": settings.meta_access_token,
                "fields": "username,name,followers_count,media_count",
            },
        )

        if resp2.status_code == 200:
            ig_data = resp2.json()
            print(f"✅ Instagram conectado:")
            print(f"   @{ig_data.get('username', 'N/A')}")
            print(f"   Seguidores: {ig_data.get('followers_count', 'N/A')}")
            print(f"   Posts: {ig_data.get('media_count', 'N/A')}")
        else:
            print(f"❌ Erro ao verificar Instagram: {resp2.status_code}")
            print(f"   {resp2.text}")

        # Test 3: Verificar permissões
        resp3 = await client.get(
            "https://graph.facebook.com/v21.0/me/permissions",
            params={"access_token": settings.meta_access_token},
        )

        if resp3.status_code == 200:
            perms = resp3.json().get("data", [])
            required = {"instagram_basic", "instagram_content_publish",
                        "instagram_manage_comments", "pages_show_list"}
            granted = {p["permission"] for p in perms if p["status"] == "granted"}
            missing = required - granted

            print(f"\n📋 Permissões:")
            for perm in sorted(required):
                status = "✅" if perm in granted else "❌"
                print(f"   {status} {perm}")

            if missing:
                print(f"\n⚠️ Permissões faltando: {', '.join(missing)}")
            else:
                print(f"\n✅ Todas as permissões necessárias estão ativas!")

    print("\n🏁 Teste concluído.")


async def publish_from_queue(post_id: int):
    """Publica um post específico da fila."""
    session = get_session()
    post = session.query(ScheduledPost).filter_by(id=post_id).first()

    if not post:
        print(f"❌ Post #{post_id} não encontrado.")
        return

    if post.published:
        print(f"⚠️ Post #{post_id} já foi publicado em {post.published_at}.")
        return

    if not post.image_url:
        print(f"❌ Post #{post_id} não tem imagem. Use manage_queue.py --add-image primeiro.")
        return

    print(f"📤 Publicando post #{post_id}...")
    print(f"   Categoria: {post.category}")
    print(f"   Legenda: {post.caption[:100]}...")
    print(f"   Imagem: {post.image_url}")

    duplicate = find_recent_duplicate(post.caption, post.image_url or "", exclude_post_id=post.id)
    if duplicate:
        print(
            f"⚠️ Duplicata detectada do post #{duplicate.id} "
            f"(publicado em {duplicate.published_at}). Publicação abortada."
        )
        session.close()
        return

    publisher = InstagramPublisher()
    try:
        result = await publisher.publish_image_post(
            image_url=post.image_url,
            caption=post.caption,
            hashtags=post.hashtags,
        )
        from datetime import datetime
        post.published = True
        post.published_at = datetime.utcnow()
        post.ig_media_id = result["media_id"]
        session.commit()
        print(f"\n✅ Publicado! Media ID: {result['media_id']}")

    except Exception as e:
        print(f"\n❌ Erro: {e}")
    finally:
        session.close()


async def publish_now(
    caption: str,
    image_url: str,
    hashtags: str = "",
    category: str = "manual",
    image_path: str | None = None,
):
    """Publica imediatamente (sem fila)."""
    duplicate = find_recent_duplicate(caption, image_url)
    if duplicate:
        print(
            f"⚠️ Duplicata detectada do post #{duplicate.id} "
            f"(publicado em {duplicate.published_at}). Publicação abortada."
        )
        return None

    print(f"📤 Publicando agora...")
    publisher = InstagramPublisher()

    try:
        result = await publisher.publish_image_post(
            image_url=image_url,
            caption=caption,
            hashtags=hashtags,
        )
        record_manual_publication(
            caption=caption,
            image_url=image_url,
            hashtags=hashtags,
            category=category,
            image_path=image_path,
            media_id=result.get("media_id"),
        )
        print(f"✅ Publicado! Media ID: {result['media_id']}")
        return result
    except Exception as e:
        print(f"❌ Erro: {e}")
        return None


async def generate_and_post(category: str, topic: str | None = None):
    """Pipeline completo: gerar conteúdo → criar imagem → publicar."""
    print(f"\n⚡ Pipeline completo para [{category}]...\n")

    # Step 1: Gerar conteúdo
    print("1️⃣ Gerando conteúdo com Gemini API...")
    post_data = generate_single_post(category, topic)
    print(f"   Caption: {post_data['caption'][:80]}...")
    print(f"   Hashtags: {post_data['hashtags'][:60]}...")

    # Step 2: Gerar imagem
    print("\n2️⃣ Gerando imagem...")
    image_path, image_url = generate_and_host_post_image(
        caption=post_data["caption"],
        category=category,
        subtitle=post_data.get("image_prompt", ""),
        source_vehicles=post_data.get("source_vehicles"),
    )
    print(f"   Imagem: {image_path}")

    # Step 3: Upload para hosting
    print("\n3️⃣ Fazendo upload da imagem...")
    print(f"   URL: {image_url}")

    # Step 4: Confirmar publicação
    print(f"\n📋 Resumo:")
    print(f"   Categoria: {category}")
    print(f"   Headline: {post_data['caption'].splitlines()[0][:60]}")
    print(f"   Imagem URL: {image_url}")
    print(f"\nDigite 'publicar' para confirmar a publicacao agora: ", end="")

    confirm = input().strip().lower()
    if confirm != "publicar":
        print("❌ Publicação cancelada. Post salvo na fila.")
        from content_generator import save_posts_to_queue
        post_data["scheduled_at"] = datetime.now().isoformat()
        post_data["image_url"] = image_url
        post_data["image_path"] = image_path
        save_posts_to_queue([post_data])
        return

    # Step 5: Publicar
    print("\n4️⃣ Publicando no Instagram...")
    await publish_now(
        caption=post_data["caption"],
        image_url=image_url,
        hashtags=post_data["hashtags"],
        category=category,
        image_path=image_path,
    )


def main():
    parser = argparse.ArgumentParser(description="Publicar posts do PBEV no Instagram")
    parser.add_argument("--test", action="store_true", help="Testar conexão com Meta API")
    parser.add_argument("--post", type=int, metavar="ID", help="Publicar post da fila por ID")
    parser.add_argument("--now", type=str, metavar="CAPTION", help="Publicar imediatamente")
    parser.add_argument("--image", type=str, help="URL da imagem (com --now)")
    parser.add_argument("--hashtags", type=str, default="", help="Hashtags (com --now)")
    parser.add_argument("--generate-and-post", type=str, metavar="CATEGORY",
                        help="Pipeline completo: gerar + imagem + publicar")
    parser.add_argument("--topic", type=str, help="Tópico específico (com --generate-and-post)")

    args = parser.parse_args()
    init_db()

    if args.test:
        asyncio.run(test_connection())
    elif args.post:
        asyncio.run(publish_from_queue(args.post))
    elif args.now:
        if not args.image:
            print("❌ --image é obrigatório com --now")
            return
        asyncio.run(publish_now(args.now, args.image, args.hashtags))
    elif args.generate_and_post:
        asyncio.run(generate_and_post(args.generate_and_post, args.topic))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
