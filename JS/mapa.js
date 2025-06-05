"use strict"

document.addEventListener('DOMContentLoaded', async () => {

    // Função para obter localização inicial
    async function obterLocalizacaoInicial() {
        const ocorrencia = JSON.parse(localStorage.getItem("dadosOcorrencia"));

        if (ocorrencia && ocorrencia.length > 0) {
            try {
                const idEndereco = ocorrencia[0].id_endereco;
                const response = await fetch(`http://localhost:8080/v1/controle-usuario/endereco/${idEndereco}`);
                const result = await response.json();
                const latitude = parseFloat(result.enderecos[0].latitude);
                const longitude = parseFloat(result.enderecos[0].longitude);
                return { latitude, longitude, ocorrencia };
            } catch (erro) {
                console.warn("Erro ao buscar endereço da ocorrência:", erro);
            }
        }

        // Tenta pegar localização do usuário
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            ocorrencia: null
                        });
                    },
                    (error) => {
                        console.warn("Erro ao obter localização:", error.message);
                        // fallback para São Paulo
                        resolve({ latitude: -23.5505, longitude: -46.6333, ocorrencia: null });
                    }
                );
            } else {
                console.warn("Geolocalização não suportada. Usando localização padrão.");
                resolve({ latitude: -23.5505, longitude: -46.6333, ocorrencia: null });
            }
        });
    }

    // Chamar função principal
    const { latitude, longitude, ocorrencia } = await obterLocalizacaoInicial();

    // Criar mapa
    const map = L.map('map').setView([latitude, longitude], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Se houver ocorrência no localStorage, adicionar marcador
    if (ocorrencia) {
        const idOcorrencia = ocorrencia[0].id_ocorrencia;
        const imagem = await fetch(`http://localhost:8080/v1/controle-usuario/midias-ocorrencias/${idOcorrencia}`);
        const imagemResult = await imagem.json();

        const objetoOcorrencia = `
            <div style="max-width: 400px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: #333;">${ocorrencia[0].titulo}</h3>
                <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${ocorrencia[0].descricao}</p>
                <img src="${imagemResult.midia[0].url}" alt="Imagem da ocorrência" style="width: 100%; height: auto; border-radius: 6px; margin-top: 5px;">
            </div>
        `;

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(objetoOcorrencia)
            .openPopup();

        localStorage.removeItem("dadosOcorrencia");
    }

    // Carregar todas as ocorrências com pins
    async function getOcorrencias() {
        try {
            const ocorrencias = await fetch("http://localhost:8080/v1/controle-usuario/ocorrencias");
            const ocorrenciasResult = await ocorrencias.json();

            ocorrenciasResult.ocorrencias.forEach(async item => {
                const imagem = await fetch(`http://localhost:8080/v1/controle-usuario/midias-ocorrencias/${item.id_ocorrencia}`);
                const imagemResult = await imagem.json();

                const objetoOcorrencia = `
                    <div style="max-width: 250px;">
                        <h3 style="margin: 0; font-size: 1.1rem; color: #333;">${item.titulo}</h3>
                        <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${item.descricao}</p>
                        <img src="${imagemResult.midia[0].url}" alt="Imagem da ocorrência" style="width: 100%; height: auto; border-radius: 6px; margin-top: 5px;">
                    </div>
                `;

                const latitude = parseFloat(item.endereco[0].latitude);
                const longitude = parseFloat(item.endereco[0].longitude);

                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup(objetoOcorrencia);
            });
        } catch (error) {
            console.log("Erro ao adicionar pins de ocorrências:", error);
        }
    }

    await getOcorrencias();

    // Popular feed lateral com ocorrências
    const ocorrenciasFeed = document.getElementById("ocorrencias");
    const responseFeed = await fetch("http://localhost:8080/v1/controle-usuario/ocorrencias");
    const resultFeed = await responseFeed.json();

    resultFeed.ocorrenciasFeed.forEach(item => {
        ocorrenciasFeed.innerHTML += `
            <div class="ocorrencia" id="${item.id_ocorrencia}">
                <div class="headerOcorrencia">
                    <div class="usuario">
                        <img>
                    </div>
                </div>
            </div>
        `;
    });

});
