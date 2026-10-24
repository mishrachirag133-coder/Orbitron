"""
Cloud Breaker Core GIS & Radiometric Intelligence Engine.
Computes AOI-bounded usable pixel share, SCL class distributions,
per-pixel trust matrices (0 to 1), and use-case specific rankings.
"""

import io
import base64
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
from PIL import Image

# Sentinel-2 SCL (Scene Classification Layer) Specification
SCL_CLASSES = {
    0: {"name": "No Data", "color": (0, 0, 0, 0), "category": "nodata"},
    1: {"name": "Saturated or Defective", "color": (255, 0, 0, 220), "category": "defect"},
    2: {"name": "Dark Area (Shadow Candidate)", "color": (55, 65, 81, 230), "category": "dark"},
    3: {"name": "Cloud Shadow", "color": (124, 58, 237, 230), "category": "shadow"},
    4: {"name": "Vegetation", "color": (16, 185, 129, 230), "category": "clear"},
    5: {"name": "Bare Soil", "color": (217, 119, 6, 230), "category": "clear"},
    6: {"name": "Water", "color": (2, 132, 199, 230), "category": "clear"},
    7: {"name": "Unclassified", "color": (156, 163, 175, 200), "category": "unclassified"},
    8: {"name": "Cloud Medium Probability", "color": (147, 197, 253, 230), "category": "cloud"},
    9: {"name": "Cloud High Probability", "color": (255, 255, 255, 255), "category": "cloud"},
    10: {"name": "Thin Cirrus", "color": (251, 191, 36, 230), "category": "cirrus"},
    11: {"name": "Snow / Ice", "color": (207, 250, 254, 230), "category": "snow"},
}

def compute_aoi_scl_metrics(scl_array: np.ndarray, use_case: str = "general") -> Dict[str, Any]:
    """
    Computes genuine pixel metrics inside the AOI window (excluding No Data).
    """
    total_pixels = scl_array.size
    valid_mask = scl_array != 0
    valid_pixels = int(np.sum(valid_mask))

    if valid_pixels == 0:
        return {
            "usable_pct": 0.0,
            "valid_pixels": 0,
            "total_pixels": total_pixels,
            "cirrus_share": 0.0,
            "shadow_share": 0.0,
            "cloud_share": 0.0,
            "class_distribution": {str(k): 0.0 for k in range(12)},
            "class_counts": {str(k): 0 for k in range(12)},
        }

    # Count occurrences of each SCL class
    counts = {}
    percentages = {}
    for c in range(12):
        cnt = int(np.sum(scl_array == c))
        counts[str(c)] = cnt
        percentages[str(c)] = round((cnt / valid_pixels) * 100.0, 2)

    # Clear pixels definition based on use case
    if use_case == "crop_monitoring":
        # Target: vegetation (4) & bare soil (5). Water (6) is clear but not crop.
        clear_count = counts.get("4", 0) + counts.get("5", 0) + counts.get("6", 0)
    elif use_case == "flood_response":
        # Target: water bodies (6), bare soil (5), vegetation (4). Snow (11) can mislead.
        clear_count = counts.get("4", 0) + counts.get("5", 0) + counts.get("6", 0)
    else:  # general
        # Clear land/water surface: 4, 5, 6, plus snow/ice 11
        clear_count = counts.get("4", 0) + counts.get("5", 0) + counts.get("6", 0) + counts.get("11", 0)

    usable_pct = round((clear_count / valid_pixels) * 100.0, 2)
    cirrus_share = percentages.get("10", 0.0)
    shadow_share = percentages.get("3", 0.0)
    cloud_share = round(percentages.get("8", 0.0) + percentages.get("9", 0.0), 2)

    return {
        "usable_pct": usable_pct,
        "valid_pixels": valid_pixels,
        "total_pixels": total_pixels,
        "cirrus_share": cirrus_share,
        "shadow_share": shadow_share,
        "cloud_share": cloud_share,
        "class_distribution": percentages,
        "class_counts": counts,
    }

def compute_pixel_trust_matrix(scl_array: np.ndarray, use_case: str = "general") -> np.ndarray:
    """
    Computes a per-pixel trust score between 0.0 and 1.0 based on SCL physics and the use case.
    """
    trust = np.zeros(scl_array.shape, dtype=np.float32)

    # Base trust mapping
    base_mapping = {
        0: 0.0,    # No Data
        1: 0.0,    # Saturated / Defective
        2: 0.55,   # Dark Area (candidate shadow or steep topography)
        3: 0.15,   # Cloud Shadow (severe low radiance degradation)
        4: 1.00,   # Clear Vegetation
        5: 1.00,   # Clear Bare Soil
        6: 1.00,   # Clear Water
        7: 0.70,   # Unclassified
        8: 0.10,   # Cloud Medium Probability
        9: 0.00,   # Cloud High Probability
        10: 0.40,  # Thin Cirrus (partially transparent veil)
        11: 0.90,  # Snow / Ice
    }

    if use_case == "crop_monitoring":
        # Snow and cirrus are penalized more harshly in crop vegetative index calculations
        base_mapping[10] = 0.30
        base_mapping[11] = 0.20
        base_mapping[3] = 0.10
    elif use_case == "flood_response":
        # Cloud shadows severely mimic water bodies in SAR and optical segmentation
        base_mapping[3] = 0.05
        base_mapping[2] = 0.30
        base_mapping[10] = 0.45

    for c, val in base_mapping.items():
        trust[scl_array == c] = val

    return np.clip(trust, 0.0, 1.0)

def rank_scene_for_use_case(
    usable_pct: float,
    cirrus_share: float,
    shadow_share: float,
    cloud_share: float,
    scene_cloud_pct: float,
    days_from_target: int,
    use_case: str = "general"
) -> Dict[str, Any]:
    """
    Calculates explainable ranking score (0 to 100) and Plain English justification.
    """
    # Weights vary by mission objective
    if use_case == "crop_monitoring":
        w_usable = 0.65
        w_cirrus = 0.15
        w_shadow = 0.10
        w_date = 0.10
    elif use_case == "flood_response":
        # Timeliness and shadow avoidance are paramount
        w_usable = 0.50
        w_cirrus = 0.10
        w_shadow = 0.20
        w_date = 0.20
    else:  # general
        w_usable = 0.60
        w_cirrus = 0.15
        w_shadow = 0.15
        w_date = 0.10

    # Max date penalty capped at 30 days
    date_score = max(0.0, 100.0 - min(days_from_target * 5.0, 100.0))
    
    # Negative penalty components
    cirrus_penalty = cirrus_share * 0.8
    shadow_penalty = shadow_share * 1.2
    
    raw_score = (
        (w_usable * usable_pct)
        - (w_cirrus * cirrus_penalty)
        - (w_shadow * shadow_penalty)
        + (w_date * (date_score / 100.0) * 10)
    )
    
    composite_score = round(float(np.clip(raw_score, 0.0, 100.0)), 1)
    
    # Explainable justification
    parts = []
    if usable_pct >= 80:
        parts.append(f"High AOI usability ({usable_pct}%)")
    elif usable_pct >= 50:
        parts.append(f"Moderate AOI usability ({usable_pct}%)")
    else:
        parts.append(f"Severely obstructed AOI ({usable_pct}% clear)")

    if cirrus_share > 15:
        parts.append(f"attenuated by {cirrus_share}% thin cirrus veil")
    if shadow_share > 8:
        parts.append(f"diminished by {shadow_share}% cloud shadows")
    if days_from_target > 0:
        parts.append(f"{days_from_target}d from target date")

    # Contrast with scene-level tile cloud %
    diff = round(usable_pct - (100.0 - scene_cloud_pct), 1)
    if abs(diff) > 15:
        if usable_pct > (100.0 - scene_cloud_pct):
            parts.append(f"AOI is much clearer (+{diff}%) than the 100km tile average ({scene_cloud_pct}% cloud)")
        else:
            parts.append(f"AOI is more clouded than the tile average ({scene_cloud_pct}% cloud)")

    explanation = "; ".join(parts) + "."

    return {
        "composite_score": composite_score,
        "usable_pct": usable_pct,
        "cirrus_share": cirrus_share,
        "shadow_share": shadow_share,
        "cloud_share": cloud_share,
        "days_from_target": days_from_target,
        "date_score": round(date_score, 1),
        "explanation": explanation,
        "weights": {
            "usable": w_usable,
            "cirrus": w_cirrus,
            "shadow": w_shadow,
            "timeliness": w_date
        }
    }

def convert_scl_to_rgba_png(scl_array: np.ndarray) -> str:
    """
    Renders SCL categorical array to PNG base64 data-URL.
    """
    h, w = scl_array.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    for c, info in SCL_CLASSES.items():
        mask = scl_array == c
        rgba[mask] = info["color"]

    img = Image.fromarray(rgba, mode="RGBA")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

def convert_trust_to_rgba_png(trust_array: np.ndarray) -> str:
    """
    Renders continuous 0.0-1.0 trust matrix to color-mapped RGBA PNG.
    High trust (1.0) = Emerald, Medium = Amber, Low/Cloud = Rose, 0 = Transparent.
    """
    h, w = trust_array.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    # Color ramp:
    # 0.85 - 1.00: Emerald green
    m_high = trust_array >= 0.85
    rgba[m_high] = (16, 185, 129, 230)

    # 0.65 - 0.84: Light green / cyan
    m_med_high = (trust_array >= 0.65) & (trust_array < 0.85)
    rgba[m_med_high] = (52, 211, 153, 220)

    # 0.35 - 0.64: Amber / Yellow (cirrus / dark area)
    m_med = (trust_array >= 0.35) & (trust_array < 0.65)
    rgba[m_med] = (245, 158, 11, 230)

    # 0.12 - 0.34: Purple (shadows)
    m_shadow = (trust_array >= 0.12) & (trust_array < 0.35)
    rgba[m_shadow] = (139, 92, 246, 230)

    # 0.01 - 0.11: Rose / Red (dense clouds)
    m_cloud = (trust_array > 0.0) & (trust_array < 0.12)
    rgba[m_cloud] = (239, 68, 68, 230)

    # 0.0: Fully transparent (No Data)
    rgba[trust_array == 0.0] = (0, 0, 0, 0)

    img = Image.fromarray(rgba, mode="RGBA")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

def convert_rgb_to_png(rgb_array: np.ndarray) -> str:
    """
    Converts 3-band RGB NumPy array (shape 3, H, W or H, W, 3) to PNG data-URL.
    """
    if rgb_array.shape[0] == 3 and len(rgb_array.shape) == 3:
        # Transpose from (3, H, W) to (H, W, 3)
        rgb_array = np.transpose(rgb_array, (1, 2, 0))

    # Normalize uint8 if necessary
    if rgb_array.dtype != np.uint8:
        # Scale if max > 255 (e.g. 10000 reflectance)
        max_val = np.percentile(rgb_array[rgb_array > 0], 98) if np.any(rgb_array > 0) else 1.0
        scaled = np.clip((rgb_array / max_val) * 255.0, 0, 255).astype(np.uint8)
        img = Image.fromarray(scaled, mode="RGB")
    else:
        img = Image.fromarray(rgb_array, mode="RGB")

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    return "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")
