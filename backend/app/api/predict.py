from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
import io

from app.ml.local_model import predict_local
from app.ml.client import predict_nyckel
from app.ml.hybrid import hybrid_predict
from app.pricing.engine import estimate_price

router = APIRouter(tags=["Prediction"])

@router.get("/price")
def get_price(material: str, weight: float):
    price_data = estimate_price(material=material, weight=weight, confidence=1.0)
    return price_data


@router.post("/predict")
async def predict(
    image: UploadFile = File(...),
    weight: float = Form(...)
):
    # -----------------------------
    # READ IMAGE SAFELY
    # -----------------------------
    try:
        image_bytes = await image.read()
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    try:
        local_label, local_conf = predict_local(pil_img)
    except Exception as e:
        print("Local model failed:", e)
        raise HTTPException(
            status_code=500,
            detail="Local model prediction failed"
        )

    assist_label, assist_conf = predict_nyckel(image_bytes)

    final_label, final_conf, source = hybrid_predict(
        (local_label, local_conf),
        (assist_label, assist_conf),
    )

    if 0 < weight < 2:
        raise HTTPException(
            status_code=400, 
            detail="Minimum order weight is 2kg. Please collect more scrap before placing an order."
        )

    if weight <= 0:
        return {
            "material": final_label,
            "confidence": round(final_conf, 2),
            "prediction_source": source, 
        }

    # -----------------------------
    # PRICE ESTIMATION
    # -----------------------------
    try:
        price_data = estimate_price(
            material=final_label,
            weight=weight,
            confidence=final_conf,
        )
    except Exception as e:
        print("Pricing engine error:", e)
        raise HTTPException(
            status_code=500,
            detail="Price estimation failed"
        )

    # -----------------------------
    # FINAL RESPONSE
    # -----------------------------
    return {
        "material": final_label,
        "confidence": round(final_conf, 2),
        "prediction_source": source,
        "estimated_price": price_data["estimated_price"],
        "price_breakdown": price_data["breakdown"],
    }
