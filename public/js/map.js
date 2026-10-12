mapboxgl.accessToken = mapToken;

if (listingData.coordinates) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listingData.coordinates,
    zoom: 10,
  });

  map.addControl(new mapboxgl.NavigationControl());

  const popupContent = document.createElement("div");
  const heading = document.createElement("h4");
  heading.textContent = listingData.title;
  const note = document.createElement("p");
  note.textContent = "Exact location provided after booking";
  popupContent.append(heading, note);

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listingData.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
    .addTo(map);
} else {
  document.getElementById("map").innerHTML =
    "<p class='text-muted'>Map unavailable for this listing.</p>";
}
