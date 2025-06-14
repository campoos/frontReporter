"use strict"

document.addEventListener('DOMContentLoaded', async() => {
    const containerUsuario = document.getElementById("usuario")

    const usuarioDados = JSON.parse(localStorage.getItem("dadosUsuario"))
    const nomeUsuarioExtraido = usuarioDados[0].nome

    const nomeUsuario = document.createElement("h1")
    nomeUsuario.textContent = nomeUsuarioExtraido

    const fotoUsuario = document.createElement("img")
    fotoUsuario.src = "../SRC/IMGS/FEED/profile-user.png"

    containerUsuario.appendChild(nomeUsuario)
    containerUsuario.appendChild(fotoUsuario)


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
                        <img src="../SRC/IMGS/FEED/chat.png" alt="" class="btn-comentario">
                    </div>
                    <div class="descricao">
                        <p>${item.titulo}</p>
                        <span>${item.descricao}</span>
                    </div>
                </div>
            </div>
        `     
    });

    document.querySelectorAll('.btn-comentario').forEach(botao => {
        botao.addEventListener('click', (e) => {
          // Sobe até o pai com classe 'ocorrencia'
          const ocorrencia = e.target.closest('.ocorrencia');
          if (!ocorrencia) return;
      
          const id = ocorrencia.id; // o id já está no atributo id da div ocorrencia
      
          buscarComentarios(id);
        });
      });

      function criarTelaComentario(result){
        const body = document.getElementById("body")

        const containerComentarios = document.createElement("div")
        containerComentarios.className = "containerComentarios"
        containerComentarios.id = "containerComentarios"

        body.appendChild(containerComentarios)
      }

      async function buscarComentarios(id) {
        // Aqui você faz o fetch para buscar os comentários desse id
        console.log(`Buscando comentários da ocorrência ${id}`);
        // fetch(`/comentarios/${id}`) ...

        const ocorrencia = await fetch(`http://localhost:8080/v1/controle-usuario/ocorrencias/${id}`);
        const ocorrenciaResult = await ocorrencia.json();
        const ocorrenciaExtract = ocorrenciaResult.ocorrencias

        console.log(ocorrenciaExtract)

        criarTelaComentario(ocorrenciaExtract)
      }
});

