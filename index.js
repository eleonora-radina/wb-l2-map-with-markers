//Определяем карту, координаты центра и начальный масштаб
const map = L.map('map').setView([55.755864, 37.617698], 13);

//Добавляем на нашу карту слой OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markersLayer = L.layerGroup();
markersLayer.addTo(map);

function setIconColor(iconColor) {
  return icon = new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

function deleteMarker(markerId) {
  const marker = markersLayer.getLayers().find(el => el._leaflet_id === markerId);
  markersLayer.removeLayer(marker);
  console.log(marker);
  saveMarkers();
  //map.removeLayer(marker);
}

function createPopupContent(name, type, description, markerId) {
  return `
    <strong>${name}</strong><br>
    Type: ${type}<br>
    Description: ${description}<br>
    <button onClick="deleteMarker(${markerId})" class="deleteBtn">Удалить</button>
  `;
}

function addMarker() {
  const markerName = document.getElementById('marker-name').value;
  const markerType = document.getElementById('marker-type').value;
  const markerDescription = document.getElementById('marker-description').value;
  const markerColor = document.getElementById('marker-color').value; // Добавлено получение выбранного цвета

  if (markerName) {
    const marker = L.marker(map.getCenter(), {
      draggable: true,
      icon: setIconColor(markerColor),
      iconColor: markerColor,
      name: markerName,
      type: markerType,
      description: markerDescription
    })
      .addTo(markersLayer);

    marker.bindPopup(createPopupContent(markerName, markerType, markerDescription, marker._leaflet_id));

    marker.on('dragend', function (event) {
      //const { lat, lng } = event.target.getLatLng();
      saveMarkers();
    });

    saveMarkers();
    clearForm();
  }
}

function saveMarkers() {
  const markersData = markersLayer.getLayers().map(marker => {
    const { lat, lng } = marker.getLatLng();
    return {
      //id: marker._leaflet_id,
      name: marker.options.name,
      type: marker.options.type,
      description: marker.options.description,
      iconColor: marker.options.iconColor,
      lat,
      lng,
    };
  });
  localStorage.setItem('markers', JSON.stringify(markersData));
}

function clearForm() {
  document.getElementById('marker-name').value = '';
  document.getElementById('marker-type').value = '';
  document.getElementById('marker-description').value = '';
}

const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
savedMarkers.forEach(markerData => {
  const marker = L.marker([markerData.lat, markerData.lng], {
    icon: setIconColor(markerData.iconColor),
    draggable: true,
    type: markerData.type,
    description: markerData.description,
    iconColor: markerData.iconColor,
    name: markerData.name,
  })
    .addTo(markersLayer);
    
  marker.bindPopup(createPopupContent(markerData.name, markerData.type, markerData.description, marker._leaflet_id));
  marker.on('dragend', function (event) {
    //const { lat, lng } = event.target.getLatLng();
    saveMarkers();
  });
});
