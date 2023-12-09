const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const markersLayer = L.layerGroup();
    markersLayer.addTo(map);

    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];

    const markerForm = document.getElementById('marker-form');
    const markerNameInput = document.getElementById('marker-name');
    //let editingMarker = null;

    // Отображение маркеров из localStorage
    savedMarkers.forEach(markerData => {
      const marker = createMarker(markerData);
      markersLayer.addLayer(marker);
    });

    // Добавление нового маркера
    function addMarker() {
      const markerName = markerNameInput.value;
      if (markerName !== '') {
        const newMarker = createMarker({ name: markerName });
        markersLayer.addLayer(newMarker);
        saveMarkers();
        markerNameInput.value = '';
      }
    }

    // Создание маркера
    function createMarker(markerData) {
      const marker = L.marker([markerData.lat || 51.5, markerData.lng || -0.09], { draggable: true });
      marker.bindPopup(markerData.name);

      marker.on('dragend', function (event) {
        const { lat, lng } = event.target.getLatLng();
        markerData.lat = lat;
        markerData.lng = lng;
        saveMarkers();
      });

      /*marker.on('click', function (event) {
        if (!editingMarker) {
          // Редактирование маркера при клике, если нет активного редактирования
          editingMarker = marker;
          markerNameInput.value = markerData.name;
          markersLayer.removeLayer(marker);
        } else {
          // Завершение редактирования
          editingMarker = null;
          addMarker();
        }
      });*/

      return marker;
    }

    function saveMarkers() {
      const markersData = markersLayer.getLayers().map(marker => {
        const { lat, lng } = marker.getLatLng();
        return { name: marker.getPopup().getContent(), lat, lng };
      });
      localStorage.setItem('markers', JSON.stringify(markersData));
    }