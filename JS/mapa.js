"use strict"

document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([-23.5505, -46.6333], 13); // São Paulo
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    function criarFormulario(lat, lng){
        L.marker([lat, lng]).addTo(map)
    }

    localizarUsuario(map)

    map.on("click", function(e){
    const {lat, lng} = e.latlng
    console.log("Clicou em:", lat.toFixed(6), lng.toFixed(6))
    criarFormulario(lat, lng)
})
});

function localizarUsuario(map){
    if (!navigator.geolocation){
        console.warn("Geolocalização não suportada pelo navegador.")
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const {latitude, longitude} = position.coords
            map.setView([latitude, longitude], 16)
        },
        (error) => {
            console.warn("Erro ao obter a localização:", error.message)
        }
    )
}

