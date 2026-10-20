import { Job } from '../types/job';

export const INITIAL_MOCK_JOBS: Job[] = [
  {
    job_id: 'job-cx-88219-sentinel',
    s3_key: 'uploads/2026/10/S2B_MSIL2A_20261014T184931_N0500_R113_T10SEG.tif',
    filename: 'S2B_MSIL2A_SanFrancisco_T10SEG.tif',
    sensor: 'Sentinel-2',
    engine: 'deep',
    created_at: '2026-10-19T14:32:10Z',
    updated_at: '2026-10-19T14:33:45Z',
    file_size_mb: 482.4,
    status: 'done',
    duration_seconds: 95,
    rgb_preview_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1600&q=80',
    mask_url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1600&q=80',
    bounds: {
      location_name: 'San Francisco Bay & Silicon Valley, California, USA',
      crs: 'EPSG:32610 (UTM Zone 10N)',
      resolution_m: 10,
      center: [37.7749, -122.4194],
      bbox: [-122.54, 37.68, -122.25, 37.89],
      coordinates: [
        [-122.54, 37.68],
        [-122.25, 37.68],
        [-122.25, 37.89],
        [-122.54, 37.89],
        [-122.54, 37.68],
      ]
    },
    report: {
      clarityscore: 87.4,
      usable_land_percentage: 84.6,
      cirrus_attenuation_factor: 0.14,
      shadow_impact_score: 6.2,
      downstream_usability_rating: {
        ndvi: 92.5,
        building_seg: 88.0,
        change_detection: 94.2
      },
      class_distribution: {
        clear: 78.4,
        thick_cloud: 9.3,
        thin_cirrus: 7.8,
        shadow: 4.5
      },
      per_band: [
        { band: 'B1 (Coastal)', snr: 34.2, degradation: 14.8 },
        { band: 'B2 (Blue)', snr: 41.5, degradation: 12.3 },
        { band: 'B3 (Green)', snr: 46.1, degradation: 8.7 },
        { band: 'B4 (Red)', snr: 49.8, degradation: 6.1 },
        { band: 'B5 (RedEdge-1)', snr: 51.2, degradation: 5.4 },
        { band: 'B6 (RedEdge-2)', snr: 52.8, degradation: 4.9 },
        { band: 'B7 (RedEdge-3)', snr: 53.6, degradation: 4.6 },
        { band: 'B8 (NIR-Broad)', snr: 55.4, degradation: 4.1 },
        { band: 'B8A (NIR-Narrow)', snr: 54.9, degradation: 4.3 },
        { band: 'B9 (Cirrus)', snr: 22.8, degradation: 38.5 },
        { band: 'B11 (SWIR-1)', snr: 48.3, degradation: 7.2 },
        { band: 'B12 (SWIR-2)', snr: 45.6, degradation: 8.9 }
      ]
    }
  },
  {
    job_id: 'job-cx-88220-landsat',
    s3_key: 'uploads/2026/10/LC09_L1TP_227063_20261012_02_T1.tif',
    filename: 'LC09_Amazonas_Basin_227063.tif',
    sensor: 'Landsat-8/9',
    engine: 'deep',
    created_at: '2026-10-19T11:15:00Z',
    updated_at: '2026-10-19T11:17:30Z',
    file_size_mb: 890.1,
    status: 'done',
    duration_seconds: 150,
    rgb_preview_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    mask_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    bounds: {
      location_name: 'Manaus Tropical Rain Forest, Amazonas, Brazil',
      crs: 'EPSG:32720 (UTM Zone 20S)',
      resolution_m: 30,
      center: [-3.1190, -60.0217],
      bbox: [-60.25, -3.25, -59.85, -3.0],
      coordinates: [
        [-60.25, -3.25],
        [-59.85, -3.25],
        [-59.85, -3.0],
        [-60.25, -3.0],
        [-60.25, -3.25]
      ]
    },
    report: {
      clarityscore: 52.8,
      usable_land_percentage: 49.3,
      cirrus_attenuation_factor: 0.42,
      shadow_impact_score: 21.6,
      downstream_usability_rating: {
        ndvi: 58.0,
        building_seg: 34.5,
        change_detection: 62.0
      },
      class_distribution: {
        clear: 44.1,
        thick_cloud: 36.4,
        thin_cirrus: 11.2,
        shadow: 8.3
      },
      per_band: [
        { band: 'B1 (Coastal)', snr: 21.4, degradation: 42.1 },
        { band: 'B2 (Blue)', snr: 24.8, degradation: 36.9 },
        { band: 'B3 (Green)', snr: 31.0, degradation: 28.4 },
        { band: 'B4 (Red)', snr: 35.7, degradation: 22.0 },
        { band: 'B5 (NIR)', snr: 38.2, degradation: 19.5 },
        { band: 'B6 (SWIR-1)', snr: 33.1, degradation: 26.2 },
        { band: 'B7 (SWIR-2)', snr: 29.8, degradation: 31.4 },
        { band: 'B9 (Cirrus)', snr: 12.0, degradation: 72.8 }
      ]
    }
  },
  {
    job_id: 'job-cx-88221-planet',
    s3_key: 'uploads/2026/10/20261018_014210_psscene_analytic_sr.tif',
    filename: 'Tokyo_Harbor_Port_SuperDove_PSScene.tif',
    sensor: 'PlanetScope',
    engine: 'fast',
    created_at: '2026-10-20T03:40:12Z',
    updated_at: '2026-10-20T03:40:48Z',
    file_size_mb: 215.8,
    status: 'done',
    duration_seconds: 36,
    rgb_preview_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    mask_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    bounds: {
      location_name: 'Tokyo Bay Port & Odaiba Waterfront, Japan',
      crs: 'EPSG:32654 (UTM Zone 54N)',
      resolution_m: 3,
      center: [35.6762, 139.6503],
      bbox: [139.55, 35.60, 139.85, 35.75],
      coordinates: [
        [139.55, 35.60],
        [139.85, 35.60],
        [139.85, 35.75],
        [139.55, 35.75],
        [139.55, 35.60]
      ]
    },
    report: {
      clarityscore: 96.1,
      usable_land_percentage: 97.4,
      cirrus_attenuation_factor: 0.04,
      shadow_impact_score: 1.8,
      downstream_usability_rating: {
        ndvi: 95.0,
        building_seg: 98.4,
        change_detection: 97.1
      },
      class_distribution: {
        clear: 94.8,
        thick_cloud: 1.2,
        thin_cirrus: 2.6,
        shadow: 1.4
      },
      per_band: [
        { band: 'Coastal Blue', snr: 44.5, degradation: 4.8 },
        { band: 'Blue', snr: 52.1, degradation: 3.2 },
        { band: 'Green-I', snr: 56.4, degradation: 2.1 },
        { band: 'Green-II', snr: 57.0, degradation: 2.0 },
        { band: 'Yellow', snr: 55.8, degradation: 2.4 },
        { band: 'Red', snr: 58.2, degradation: 1.8 },
        { band: 'Red Edge', snr: 59.1, degradation: 1.5 },
        { band: 'NIR', snr: 61.3, degradation: 1.2 }
      ]
    }
  },
  {
    job_id: 'job-cx-88222-alps',
    s3_key: 'uploads/2026/10/S2A_MSIL2A_MontBlanc_Alps_SnowMask.tif',
    filename: 'MontBlanc_Glacier_Alps_S2A.tif',
    sensor: 'Sentinel-2',
    engine: 'deep',
    created_at: '2026-10-20T05:10:00Z',
    updated_at: '2026-10-20T05:12:15Z',
    file_size_mb: 512.0,
    status: 'running',
    progress: 74,
    duration_seconds: 135,
    bounds: {
      location_name: 'Mont Blanc Massif & Chamonix Valley, French Alps',
      crs: 'EPSG:32632 (UTM Zone 32N)',
      resolution_m: 10,
      center: [45.8326, 6.8652],
      bbox: [6.75, 45.75, 7.05, 45.95],
      coordinates: [
        [6.75, 45.75],
        [7.05, 45.75],
        [7.05, 45.95],
        [6.75, 45.95],
        [6.75, 45.75]
      ]
    }
  },
  {
    job_id: 'job-cx-88223-sahara',
    s3_key: 'uploads/2026/10/LC08_Richat_Structure_Mauritania.tif',
    filename: 'Richat_Eye_of_the_Sahara_LC08.tif',
    sensor: 'Landsat-8/9',
    engine: 'fast',
    created_at: '2026-10-20T06:01:20Z',
    status: 'pending',
    progress: 15,
    file_size_mb: 640.2,
    bounds: {
      location_name: 'Richat Structure (Eye of Sahara), Mauritania',
      crs: 'EPSG:32629 (UTM Zone 29N)',
      resolution_m: 30,
      center: [21.1269, -11.4016],
      bbox: [-11.60, 20.95, -11.20, 21.30],
      coordinates: [
        [-11.60, 20.95],
        [-11.20, 20.95],
        [-11.20, 21.30],
        [-11.60, 21.30],
        [-11.60, 20.95]
      ]
    }
  },
  {
    job_id: 'job-cx-88224-worldview',
    s3_key: 'uploads/2026/10/WV03_Dubai_Palm_Jumeirah_Submeter.tif',
    filename: 'WV03_Dubai_Palm_Jumeirah.tif',
    sensor: 'WorldView-3',
    engine: 'deep',
    created_at: '2026-10-18T18:22:04Z',
    updated_at: '2026-10-18T18:24:40Z',
    file_size_mb: 1240.0,
    status: 'done',
    duration_seconds: 156,
    rgb_preview_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
    mask_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    bounds: {
      location_name: 'Palm Jumeirah & Marina, Dubai, UAE',
      crs: 'EPSG:32640 (UTM Zone 40N)',
      resolution_m: 0.3,
      center: [25.1124, 55.1390],
      bbox: [55.08, 25.07, 55.20, 25.16],
      coordinates: [
        [55.08, 25.07],
        [55.20, 25.07],
        [55.20, 25.16],
        [55.08, 25.16],
        [55.08, 25.07]
      ]
    },
    report: {
      clarityscore: 93.8,
      usable_land_percentage: 95.1,
      cirrus_attenuation_factor: 0.08,
      shadow_impact_score: 3.4,
      downstream_usability_rating: {
        ndvi: 82.0,
        building_seg: 96.5,
        change_detection: 95.0
      },
      class_distribution: {
        clear: 91.2,
        thick_cloud: 1.8,
        thin_cirrus: 4.5,
        shadow: 2.5
      },
      per_band: [
        { band: 'Coastal', snr: 48.0, degradation: 6.2 },
        { band: 'Blue', snr: 55.2, degradation: 4.1 },
        { band: 'Green', snr: 59.4, degradation: 2.8 },
        { band: 'Yellow', snr: 61.0, degradation: 2.2 },
        { band: 'Red', snr: 63.8, degradation: 1.9 },
        { band: 'Red Edge', snr: 62.5, degradation: 2.0 },
        { band: 'NIR-1', snr: 65.1, degradation: 1.5 },
        { band: 'NIR-2', snr: 64.0, degradation: 1.7 }
      ]
    }
  }
];

export const PRESET_SAMPLE_SCENES = [
  {
    id: 'scene-sf',
    title: 'San Francisco Bay Marine Cirrus & Fog',
    sensor: 'Sentinel-2',
    engine: 'deep' as const,
    size_mb: 482.4,
    description: 'Multi-layer marine stratocumulus mixed with high-altitude cirrus veil over complex urban-coastal terrain.',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=400&q=80',
    expectedClarity: 87.4
  },
  {
    id: 'scene-amazon',
    title: 'Amazon Basin Tropical Cumulus Cluster',
    sensor: 'Landsat-8/9',
    engine: 'deep' as const,
    size_mb: 890.1,
    description: 'Convective cloud towers with sharp cloud cast shadows over dense canopy and river systems in Amazonas.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    expectedClarity: 52.8
  },
  {
    id: 'scene-tokyo',
    title: 'Tokyo Metropolitan Clear Sky & Thin Haze',
    sensor: 'PlanetScope',
    engine: 'fast' as const,
    size_mb: 215.8,
    description: 'Ultra-high-resolution 3m 8-band SuperDove capture with minimal aerosol interference over Tokyo Bay.',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
    expectedClarity: 96.1
  },
  {
    id: 'scene-dubai',
    title: 'Dubai Coastal Desert & WorldView-3 Submeter',
    sensor: 'WorldView-3',
    engine: 'deep' as const,
    size_mb: 1240.0,
    description: 'Sub-meter 30cm commercial imagery with sharp structural boundaries and desert aerosol scattering.',
    thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80',
    expectedClarity: 93.8
  }
];
