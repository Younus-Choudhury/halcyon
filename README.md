# Halcyon

A holiday desk that asks twelve questions, then asks a language model to write three British Airways Holidays places and a reason for each. Eight questions are choices. Four are in your own words. The model reads those answers on the server. There are no prices and no live fare search.

The model is Qwen2.5 1.5B Instruct, running locally through `@huggingface/transformers`. The first shortlist after install downloads the model into the transformers cache and can take a short while. Later shortlists reuse it.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Next prints. One question is on screen at a time. A, B, and C choose an answer. The written questions take a sentence. Enter continues.
