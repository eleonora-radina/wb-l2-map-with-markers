// определяем карту, координаты центра и начальный масштаб
const map = L.map('map').setView([55.755864, 37.617698], 13);

// слой OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// группы слоев для показа на карте (весь и с фильтром)
const markersLayer = L.layerGroup();
const markersLayerFilter = L.layerGroup();
markersLayer.addTo(map);

// установка картинки на маркер в зависимости от цвета
function setIcon(iconColor) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// найти маркер по айди
function findMarkerById(markerId) {
  return markersLayer.getLayers().find(el => el._leaflet_id === markerId);
}

// попап для маркера
function createPopupContent(name, type, description, markerId) {
  return `
    <strong>${name}</strong><br>
    Тип: ${type}<br>
    Описание: ${description}<br>
    <button onClick="editMarker(${markerId})" class="deleteBtn">Редактировать</button>
    <button onClick="deleteMarker(${markerId})" class="deleteBtn">Удалить</button>
  `;
}

// добавить маркер на карту
function addMarker() {
  const markerName = document.getElementById('marker-name').value;
  const markerType = document.getElementById('marker-type').value;
  const markerDescription = document.getElementById('marker-description').value;
  const markerColor = document.getElementById('marker-color').value;

  if (markerName) {
    const marker = L.marker(map.getCenter(), {
      draggable: true,
      icon: setIcon(markerColor),
      iconColor: markerColor,
      name: markerName,
      type: markerType,
      description: markerDescription
    })
      .addTo(markersLayer);

    marker.bindPopup(createPopupContent(markerName, markerType, markerDescription, marker._leaflet_id));
    marker.on('dragend', saveMarkers);

    saveMarkers();
    clearForm();
  }
}

// удалить маркер
function deleteMarker(markerId) {
  const marker = findMarkerById(markerId);
  if (marker) {
    markersLayer.removeLayer(marker);
    saveMarkers();
  }
}

// редактирование информации о маркере
function editMarker(markerId) {
  const marker = findMarkerById(markerId);
  showEditContainer();

  const editButton = document.getElementById("edit-button");

  const markerEditedName = document.getElementById('edit-marker-name');
  const markerEditedType = document.getElementById('edit-marker-type');
  const markerEditedDescription = document.getElementById('edit-marker-description');
  const markerEditedColor = document.getElementById('edit-marker-color');

  markerEditedName.value = marker.options.name;
  markerEditedType.value = marker.options.type;
  markerEditedDescription.value = marker.options.description;
  markerEditedColor.value = marker.options.iconColor;

  function editFunction() {
    marker.setIcon(setIcon(markerEditedColor.value));
    marker.bindPopup(createPopupContent(markerEditedName.value, markerEditedType.value, markerEditedDescription.value, marker._leaflet_id));

    marker.options.name = markerEditedName.value;
    marker.options.iconColor = markerEditedColor.value;
    marker.options.type = markerEditedType.value;
    marker.options.description = markerEditedDescription.value;

    saveMarkers();
    clearEditForm();
    hideEditContainer();
    editButton.removeEventListener("click", editFunction);
  }

  editButton.addEventListener("click", editFunction);
}

// сохранение маркеров в локалсторадж
function saveMarkers() {
  const markersData = markersLayer.getLayers().map(marker => {
    const { lat, lng } = marker.getLatLng();
    return {
      name: marker.options.name,
      type: marker.options.type,
      description: marker.options.description,
      iconColor: marker.options.iconColor,
      lat,
      lng
    };
  });
  localStorage.setItem('markers', JSON.stringify(markersData));
}

// добавление маркеров из локалсторадж
const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
savedMarkers.forEach(markerData => {
  const marker = L.marker([markerData.lat, markerData.lng], {
    icon: setIcon(markerData.iconColor),
    draggable: true,
    type: markerData.type,
    description: markerData.description,
    iconColor: markerData.iconColor,
    name: markerData.name,
  })
    .addTo(markersLayer);

  marker.bindPopup(createPopupContent(markerData.name, markerData.type, markerData.description, marker._leaflet_id));
  marker.on('dragend', saveMarkers);
});

// фильтрация маркеров по тексту в описании
function filterMarkersByDescription(searchText) {
  markersLayerFilter.removeFrom(map);
  markersLayerFilter.clearLayers();
  markersLayer.removeFrom(map);

  const filteredMarkers = markersLayer.getLayers().filter(marker => {
    const description = marker.options.description.toLowerCase();
    return description.includes(searchText.toLowerCase());
  });

  filteredMarkers.forEach(filteredMarker => {
    filteredMarker.addTo(markersLayerFilter);
  });

  markersLayerFilter.addTo(map);

  console.log(markersLayer, markersLayerFilter);
}

// обработчик события для кнопки поиска
function searchMarkers() {
  const searchText = document.getElementById('search-text').value;
  filterMarkersByDescription(searchText);
}

// сброс поиска
function resetSearch() {
  markersLayer.addTo(map);
  document.getElementById('search-text').value = "";
  console.log(markersLayer, markersLayerFilter);
}

// показать блок с редактированием 
function showEditContainer() {
  const editContainer = document.querySelector(".container_edit");
  const addContainer = document.querySelector(".container_add");
  const map = document.getElementById("map");

  editContainer.style.display = "block";
  addContainer.style.pointerEvents = 'none';
  map.style.pointerEvents = 'none';
  addContainer.style.opacity = '0.6';
  map.style.opacity = '0.6';
}

// скрыть блок с редактированием 
function hideEditContainer() {
  const editContainer = document.querySelector(".container_edit");
  const addContainer = document.querySelector(".container_add");
  const map = document.getElementById("map");

  editContainer.style.display = "none";
  addContainer.style.pointerEvents = 'auto';
  map.style.pointerEvents = 'auto';
  addContainer.style.opacity = '1';
  map.style.opacity = '1';
}

// очистки форм
function clearForm() {
  document.getElementById('marker-name').value = '';
  document.getElementById('marker-type').value = '';
  document.getElementById('marker-description').value = '';
}

function clearEditForm() {
  document.getElementById('edit-marker-name').value = '';
  document.getElementById('edit-marker-type').value = '';
  document.getElementById('edit-marker-description').value = '';
}