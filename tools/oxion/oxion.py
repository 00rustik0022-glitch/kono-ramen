#!/usr/bin/env python3
"""Помощники с oxionai.com: список моделей и запрос к любой из них.

Ключ берётся из переменной окружения OXION_API_KEY (задаётся в настройках окружения сессии).
  oxion.py models
  oxion.py ask <модель> "промпт" [--system "..."] [--max-tokens N]
  echo "промпт" | oxion.py ask <модель>
"""
import argparse, json, os, sys, urllib.request, urllib.error

BASE = os.environ.get("OXION_BASE_URL", "https://oxionai.com/v1").rstrip("/")


def call(path, payload=None):
    key = os.environ.get("OXION_API_KEY")
    if not key:
        sys.exit("Нет OXION_API_KEY: добавь ключ в переменные окружения сессии.")
    headers = {"Authorization": f"Bearer {key}", "x-api-key": key,
               "anthropic-version": "2023-06-01", "Content-Type": "application/json"}
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(BASE + path, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {"_http": e.code, "_body": e.read().decode(errors="replace")}


def ask(model, prompt, system, max_tokens):
    msgs = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": prompt}]
    r = call("/chat/completions", {"model": model, "messages": msgs, "max_tokens": max_tokens})
    if "_http" in r and r["_http"] in (404, 405):  # шлюз только с Anthropic-форматом
        body = {"model": model, "max_tokens": max_tokens, "messages": [{"role": "user", "content": prompt}]}
        if system:
            body["system"] = system
        r = call("/messages", body)
    if "_http" in r:
        sys.exit(f"Ошибка {r['_http']}: {r['_body']}")
    if "choices" in r:
        return r["choices"][0]["message"]["content"]
    if "content" in r:
        return "".join(b.get("text", "") for b in r["content"])
    return json.dumps(r, ensure_ascii=False, indent=2)


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("models")
    a = sub.add_parser("ask")
    a.add_argument("model")
    a.add_argument("prompt", nargs="?")
    a.add_argument("--system")
    a.add_argument("--max-tokens", type=int, default=4096)
    args = p.parse_args()
    if args.cmd == "models":
        r = call("/models")
        if "_http" in r:
            sys.exit(f"Ошибка {r['_http']}: {r['_body']}")
        for m in r.get("data", []):
            print(m.get("id"))
    else:
        prompt = args.prompt if args.prompt is not None else sys.stdin.read()
        print(ask(args.model, prompt, args.system, args.max_tokens))


if __name__ == "__main__":
    main()
