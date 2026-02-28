// Geocode listing location text into GeoJSON Point coordinates.
const geocodeListingLocation = async (location, country) => {
    const query = [location, country]
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
        .join(", ");

    if (!query) return null;

    const endpoint =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(endpoint, {
            headers: {
                Accept: "application/json",
                // Nominatim asks for identifying user agent for server-side requests.
                "User-Agent": "YatraStay/1.0 (listing-geocoding)",
            },
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) return null;

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) return null;

        const latitude = Number(results[0].lat);
        const longitude = Number(results[0].lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

        return {
            type: "Point",
            // GeoJSON coordinates are [longitude, latitude].
            coordinates: [longitude, latitude],
        };
    } catch {
        // Keep listing flows working even if geocoding service is unavailable.
        return null;
    }
};

module.exports = { geocodeListingLocation };
