"""CLI para gerar conteúdo do Instagram.

Uso:
    python generate_content.py --days 7          # Gerar semana inteira
    python generate_content.py --single dica_ev  # Gerar 1 post
    python generate_content.py --single modelo_destaque --topic "BYD Dolphin Mini"
"""

import argparse
import json
from content_generator import generate_weekly_content, generate_single_post, save_posts_to_queue


def main():
    parser = argparse.ArgumentParser(description="Gerar conteúdo para Instagram do PBEV")
    parser.add_argument("--days", type=int, default=7, help="Dias de conteúdo a gerar")
    parser.add_argument("--single", type=str, help="Gerar 1 post (categoria)")
    parser.add_argument("--topic", type=str, help="Tópico específico (com --single)")
    parser.add_argument("--save", action="store_true", help="Salvar na fila de publicação")
    parser.add_argument("--dry-run", action="store_true", help="Apenas mostrar, não salvar")

    args = parser.parse_args()

    if args.single:
        print(f"\n⚡ Gerando 1 post [{args.single}]...\n")
        post = generate_single_post(args.single, args.topic)
        print(json.dumps(post, ensure_ascii=False, indent=2))

        if args.save and not args.dry_run:
            from datetime import datetime
            post["scheduled_at"] = datetime.now().isoformat()
            save_posts_to_queue([post])
            print("\n✅ Post salvo na fila!")
    else:
        print(f"\n⚡ Gerando conteúdo para {args.days} dias...\n")
        posts = generate_weekly_content()

        for i, post in enumerate(posts, 1):
            print(f"--- Post {i} [{post['category']}] ---")
            print(f"📅 {post['scheduled_at']}")
            print(f"📝 {post['caption'][:120]}...")
            print(f"#️⃣  {post['hashtags'][:80]}...")
            print()

        if args.save and not args.dry_run:
            count = save_posts_to_queue(posts)
            print(f"\n✅ {count} posts salvos na fila de publicação!")
        elif args.dry_run:
            print("🔍 Dry run — nada foi salvo.")
        else:
            print("💡 Use --save para salvar na fila de publicação.")


if __name__ == "__main__":
    main()
