"use strict"

document.addEventListener('DOMContentLoaded', async () => {

    async function getOcorrencias(){
        try {
            const ocorrencias = await fetch("http://10.107.134.3:8080/v1/controle-usuario/ocorrencias")
            const ocorrenciasResult = await ocorrencias.json()
    
            ocorrenciasResult.ocorrencias.forEach(async item => {
                console.log(item)
    
                const imagem = await fetch(`http://10.107.134.3:8080/v1/controle-usuario/midias-ocorrencias/${item.id_ocorrencia}`)
                const imagemResult = await imagem.json()
                
                const objetoOcorrencia =  
                `<div style="max-width: 250px;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #333;">${item.titulo}</h3>
                    <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${item.descricao}</p>
                    <img src="${imagemResult.midia[0].url}" alt="Imagem da ocorrência" style="width: 100%; height: auto; border-radius: 6px; margin-top: 5px;">
                </div>`
    
                const latitude  = parseFloat(item.endereco[0].latitude);
                const longitude = parseFloat(item.endereco[0].longitude);
            
    
                L.marker([latitude, longitude]).addTo(map)
                .bindPopup(objetoOcorrencia)
            });
        } catch (error) {
            console.log("deu merda colocando os pin")
        }
    }

    getOcorrencias()
    
    //dados da ocorrencia
    const ocorrencia = JSON.parse(localStorage.getItem("dadosOcorrencia"));
  
    const idEndereco = ocorrencia[0].id_endereco;

    const response = await fetch(`http://10.107.134.3:8080/v1/controle-usuario/endereco/${idEndereco}`)

    //dados do endereço
    const result = await response.json();

    const latitude  = parseFloat(result.enderecos[0].latitude);
    const longitude = parseFloat(result.enderecos[0].longitude);

    const map = L.map('map').setView([latitude, longitude], 17); // São Paulo
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const idOcorrencia = ocorrencia[0].id_ocorrencia;
    const imagem = await fetch(`http://10.107.134.3:8080/v1/controle-usuario/midias-ocorrencias/${idOcorrencia}`)
    const imagemResult = await imagem.json()

    const objetoOcorrencia =  
    `<div style="max-width: 250px;">
        <h3 style="margin: 0; font-size: 1.1rem; color: #333;">${ocorrencia[0].titulo}</h3>
        <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${ocorrencia[0].descricao}</p>
        <img src="${imagemResult.midia[0].url}" alt="Imagem da ocorrência" style="width: 100%; height: auto; border-radius: 6px; margin-top: 5px;">
    </div>`
    

    L.marker([latitude, longitude]).addTo(map)
        .bindPopup(objetoOcorrencia)
        .openPopup();

    

    // function criarFormulario(lat, lng){
    //     L.marker([lat, lng]).addTo(map)
    // }

    // //localizarUsuario(map)

    // map.on("click", function(e){
    // const {lat, lng} = e.latlng
    // console.log("Clicou em:", lat.toFixed(6), lng.toFixed(6))
    // criarFormulario(lat, lng)
// })


    const ocorrenciasFeed = document.getElementById("ocorrencias")
    const responseFeed = await fetch("http://10.107.134.3:8080/v1/controle-usuario/ocorrencias")
    const resultFeed = await responseFeed.json()

    resultFeed.ocorrenciasFeed.forEach(item => {
        ocorrenciasFeed.innerHTML += `
            <div class="ocorrencia" id="${item.id_ocorrencia}">
                <div class="headerOcorrencia">
                    <div class="usuario">
                        <img>
                    </div>
                </div>
            </div>
        `
    })
});



// function localizarUsuario(map){
//     if (!navigator.geolocation){
//         console.warn("Geolocalização não suportada pelo navegador.")
//         return
//     }

//     navigator.geolocation.getCurrentPosition(
//         (position) => {
//             const {latitude, longitude} = position.coords
//             map.setView([latitude, longitude], 16)
//         },
//         (error) => {
//             console.warn("Erro ao obter a localização:", error.message)
//         }
//     )
// }

