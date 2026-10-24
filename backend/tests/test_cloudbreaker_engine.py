import pytest
import numpy as np

from app.cloudbreaker_engine import (
    compute_aoi_scl_metrics,
    compute_pixel_trust_matrix,
    rank_scene_for_use_case,
    SCL_CLASSES
)
from app.stac_service import STACService

def test_compute_aoi_scl_metrics_all_clear():
    # Synthetic array with 100% vegetation (class 4)
    scl = np.full((10, 10), 4, dtype=np.uint8)
    metrics = compute_aoi_scl_metrics(scl, use_case="general")
    
    assert metrics["usable_pct"] == 100.0
    assert metrics["valid_pixels"] == 100
    assert metrics["cirrus_share"] == 0.0
    assert metrics["shadow_share"] == 0.0
    assert metrics["cloud_share"] == 0.0

def test_compute_aoi_scl_metrics_mixed_scene():
    # 50 pixels vegetation (4), 30 pixels thin cirrus (10), 20 pixels shadow (3)
    scl = np.array([4] * 50 + [10] * 30 + [3] * 20, dtype=np.uint8).reshape((10, 10))
    metrics = compute_aoi_scl_metrics(scl, use_case="general")
    
    assert metrics["usable_pct"] == 50.0
    assert metrics["cirrus_share"] == 30.0
    assert metrics["shadow_share"] == 20.0
    assert metrics["cloud_share"] == 0.0

def test_compute_aoi_scl_metrics_excludes_no_data():
    # 20 pixels no-data (0), 80 pixels bare soil (5)
    scl = np.array([0] * 20 + [5] * 80, dtype=np.uint8).reshape((10, 10))
    metrics = compute_aoi_scl_metrics(scl, use_case="general")
    
    # Valid pixels = 80. Usable % = 80/80 = 100%
    assert metrics["valid_pixels"] == 80
    assert metrics["usable_pct"] == 100.0

def test_compute_pixel_trust_matrix_values():
    scl = np.array([0, 1, 3, 4, 8, 9, 10], dtype=np.uint8).reshape((1, 7))
    trust = compute_pixel_trust_matrix(scl, use_case="general")
    
    # 0 (no data) -> 0.0
    assert trust[0, 0] == 0.0
    # 1 (saturated) -> 0.0
    assert trust[0, 1] == 0.0
    # 3 (shadow) -> 0.15
    assert trust[0, 2] == 0.15
    # 4 (vegetation) -> 1.00
    assert trust[0, 3] == 1.00
    # 8 (medium cloud) -> 0.10
    assert trust[0, 4] == 0.10
    # 9 (high cloud) -> 0.00
    assert trust[0, 5] == 0.00
    # 10 (thin cirrus) -> 0.40
    assert trust[0, 6] == 0.40

def test_compute_pixel_trust_crop_monitoring_penalty():
    # Cirrus and shadow penalties are stronger for crop monitoring
    scl = np.array([10, 3], dtype=np.uint8).reshape((1, 2))
    trust = compute_pixel_trust_matrix(scl, use_case="crop_monitoring")
    
    assert trust[0, 0] == 0.30  # cirrus penalized from 0.40 to 0.30
    assert trust[0, 1] == 0.10  # shadow penalized from 0.15 to 0.10

def test_rank_scene_for_use_case_explainability():
    ranking = rank_scene_for_use_case(
        usable_pct=85.0,
        cirrus_share=8.0,
        shadow_share=4.0,
        cloud_share=3.0,
        scene_cloud_pct=55.0,  # 100km tile was cloudy, but AOI is clear
        days_from_target=2,
        use_case="crop_monitoring"
    )
    
    assert ranking["composite_score"] > 50.0
    assert "High AOI usability" in ranking["explanation"]
    assert "much clearer" in ranking["explanation"]

def test_method_blocking_s2cloudless_on_l2a():
    stac_srv = STACService()
    with pytest.raises(ValueError) as excinfo:
        stac_srv.analyze_aoi(
            scene_id="S2A_MSIL2A_TEST",
            bbox=[-122.45, 37.75, -122.38, 37.81],
            requested_method="s2cloudless"
        )
    assert "Method Incompatibility" in str(excinfo.value)
    assert "L1C top-of-atmosphere" in str(excinfo.value)
