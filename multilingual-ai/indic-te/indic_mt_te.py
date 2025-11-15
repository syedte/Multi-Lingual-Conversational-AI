from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI(title="Indic Telugu MT")

# Smaller NLLB model (≈600M params) – good quality, CPU friendly
MODEL_ID = "facebook/nllb-200-distilled-600M"
SRC = "eng_Latn"
TGT = "tel_Telu"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)
model.eval()
torch.set_num_threads(1)

class Req(BaseModel):
    q: str
    source: str = "en"
    target: str = "te"

@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_ID}

@app.post("/translate")
def translate(req: Req):
    text = req.q.strip()
    if not text:
        return {"translated": ""}
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(TGT)
        )
    out = tokenizer.batch_decode(tokens, skip_special_tokens=True)[0]
    return {"translated": out}