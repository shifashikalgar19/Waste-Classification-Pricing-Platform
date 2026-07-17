def confidence_factor(confidence: float) -> float:
    if confidence >= 0.85:
        return 1.05
    elif confidence >= 0.7:
        return 1.0
    elif confidence >= 0.55:
        return 0.9
    else:
        return 0.75


def weight_slab_factor(weight):
    if weight < 5:
        return 0.90        # small quantity penalty
    elif weight < 10:
        return 1.02        # slight penalty
    elif weight < 20:
        return 1.04        # small bonus
    elif weight < 50:
        return 1.06        # bulk bonus
    return 1.12            # very large bulk



def impurity_penalty(material: str) -> float:
    if material in ["plastic", "rubber", "glass", "wood"]:
        return 0.85
    return 1.0


def market_factor() -> float:
    # Stable market factor for consistency
    return 1.0
