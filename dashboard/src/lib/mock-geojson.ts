// Simplified GeoJSON for demo purposes.
// Represents main regions of Belo Horizonte.
// In production, this would be fetched from an API or loaded from a static file.

export const MOCK_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Centro-Sul",
                "density": 1500, // High density
                "description": "Alta concentração de serviços e comércio."
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-43.945, -19.925],
                        [-43.930, -19.925],
                        [-43.930, -19.940],
                        [-43.945, -19.940],
                        [-43.945, -19.925]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Pampulha",
                "density": 450, // Medium density
                "description": "Região turística e universitária."
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-43.980, -19.860],
                        [-43.950, -19.860],
                        [-43.950, -19.890],
                        [-43.980, -19.890],
                        [-43.980, -19.860]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Barreiro",
                "density": 800, // Medium-High density
                "description": "Importante polo industrial e comercial."
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-44.030, -19.960],
                        [-44.000, -19.960],
                        [-44.000, -19.990],
                        [-44.030, -19.990],
                        [-44.030, -19.960]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Venda Nova",
                "density": 300, // Low density
                "description": "Área residencial com comércio local forte."
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-43.960, -19.830],
                        [-43.930, -19.830],
                        [-43.930, -19.850],
                        [-43.960, -19.850],
                        [-43.960, -19.830]
                    ]
                ]
            }
        }
    ]
}
