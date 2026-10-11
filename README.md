# Halcyon

A holiday desk that asks twelve questions, then asks a language model to write three British Airways Holidays places and a reason for each. Eight questions are choices. Four are in your own words. There are no prices and no live fare search.

The server sends the answers to [OpenRouter](https://openrouter.ai) and returns the three places. The default model is `nvidia/nemotron-3-super-120b-a12b:free`, which runs on the free allowance for the key. Set `OPENROUTER_MODEL` to use another one. The key stays in the environment. It is not part of the Git repository, and the app does not download a model file.

## Run locally

```bash
npm install
cp .env.example .env.local
```

Put your OpenRouter key in `.env.local` as `OPENROUTER_API_KEY`, then:

```bash
npm run dev
```

Open the URL Next prints. One question is on screen at a time. A, B, and C choose an answer. The written questions take a sentence. Enter continues.

## Render

In the Render service, add an environment variable named `OPENROUTER_API_KEY`. A free Render instance can serve this. The shortlist is one short request. After the variable is saved, redeploy so the running service can see it. A WordPress page can show the Render URL in an iframe.
