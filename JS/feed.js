"use strict"

document.addEventListener('DOMContentLoaded', async() => {
    const ocorrencias = document.getElementById("ocorrencias")

    const response = await fetch("http://localhost:8080/v1/controle-usuario/ocorrencias")

    const result = await response.json();

    result.ocorrencias.forEach(item => {
        ocorrencias.innerHTML += `
            <div class="ocorrencia" id="${item.id_ocorrencia}">
                <div class="headerOcorrencia">
                    <div class="usuario">
                        <img src="../SRC/IMGS/FEED/plus.png" alt="">
                        <h1>${item.usuario[0].nome}</h1>
                    </div>
                    <div class="enderecoOcorrencia">
                        <h1>${item.endereco[0].logradouro}, ${item.endereco[0].cidade} - ${item.endereco[0].estado}</h1>
                    </div>
                </div>
                <div class="mainOcorrencia">
                    <img src=${item.midia[0].url} alt="imagem da ocorrencia">
                </div>
                <div class="footerOcorrencia">
                    <div class="icones">
                        <img src="../SRC/IMGS/FEED/plus.png" alt="">
                        <img src="../SRC/IMGS/FEED/plus.png" alt="">
                    </div>
                    <div class="descricao">
                        <p>${item.titulo}</p>
                        <span>${item.descricao}</span>
                    </div>
                </div>
            </div>
        `     
    });
});