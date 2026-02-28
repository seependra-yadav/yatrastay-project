(() => {
    // Read map payload from show.ejs.
    const dataNode = document.getElementById("map-data");
    const mapNode = document.getElementById("listing-map");
    const statusNode = document.getElementById("map-status");

    if (!dataNode || !mapNode || typeof L === "undefined") return;

    let mapData;
    try {
        mapData = JSON.parse(dataNode.textContent);
    } catch (err) {
        if (statusNode) statusNode.textContent = "Map data could not be loaded.";
        return;
    }

    const coordinates = mapData?.geometry?.coordinates;
    const isValidCoordinates =
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        Number.isFinite(Number(coordinates[0])) &&
        Number.isFinite(Number(coordinates[1]));

    if (!isValidCoordinates) {
        if (statusNode) statusNode.textContent = "Map coordinates are not available for this listing.";
        return;
    }

    // GeoJSON stores [lng, lat], Leaflet expects [lat, lng].
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    const map = L.map(mapNode).setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    const popupTitle = mapData.title || "Listing location";
    const popupAddress = [mapData.location, mapData.country].filter(Boolean).join(", ");
    const popupText = popupAddress ? `${popupTitle}<br>${popupAddress}` : popupTitle;

    L.marker([latitude, longitude]).addTo(map).bindPopup(popupText).openPopup();
})();
