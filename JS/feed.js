"use strict"

document.addEventListener('DOMContentLoaded', async() => {
    const containerUsuario = document.getElementById("usuario")

    const usuarioDados = JSON.parse(localStorage.getItem("dadosUsuario"))
    const nomeUsuarioExtraido = usuarioDados[0].nome
    const idUsuarioExtraido = usuarioDados[0].id_usuario

    const nomeUsuario = document.createElement("h1")
    nomeUsuario.textContent = nomeUsuarioExtraido

    const fotoUsuario = document.createElement("img")
    fotoUsuario.src = "../SRC/IMGS/FEED/profile-user.png"

    containerUsuario.appendChild(nomeUsuario)
    containerUsuario.appendChild(fotoUsuario)


    const ocorrencias = document.getElementById("ocorrencias")   

    const response = await fetch("http://localhost:8080/v1/controle-usuario/ocorrencias")

    const result = await response.json();

    async function validarCurtida(curtida) {
        const response = await fetch("http://localhost:8080/v1/controle-usuario/buscar-voto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(curtida)
        });

        if (response.status === 200) {
            const result = await response.json();
            return {
                estado: "on",
                id_voto: result.votes[0].id_voto
            };
        } else {
            return {
                estado: "off",
                id_voto: null
            };
        }
    }

    for (const item of result.ocorrencias) {
    const objetoCurtida = {
        id_usuario: idUsuarioExtraido,
        id_ocorrencia: item.id_ocorrencia
    }

    const statusCurtida = await validarCurtida(objetoCurtida);

    const imagemLike = statusCurtida.estado === "on" ? "likeon.png" : "likeoff.png";
    const idVoto = statusCurtida.id_voto;

    let quantidadeVotos = 0

    if (item.votos > 0){
        quantidadeVotos = item.votos
    }

    let quantidadeComentarios = 0

    if (item.comentarios){
        quantidadeComentarios = item.comentarios.length
    }

    ocorrencias.innerHTML +=
     `
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
                    <img 
                        src="../SRC/IMGS/FEED/${imagemLike}" 
                        alt="like" 
                        class="btn-like"
                        data-estado="${statusCurtida.estado}"
                        data-id-voto="${idVoto || ""}"
                        data-id-ocorrencia="${item.id_ocorrencia}"
                    >
                    <p>${quantidadeVotos}</p>
                    <img src="../SRC/IMGS/FEED/chat.png" alt="" class="btn-comentario">
                    <p>${quantidadeComentarios}</p>
                </div>
                <div class="descricao">
                    <p>${item.titulo}</p>
                    <span>${item.descricao}</span>
                </div>
            </div>
        </div>
    `;}

    document.querySelectorAll('.btn-comentario').forEach(botao => {
        botao.addEventListener('click', (e) => {
          // Sobe até o pai com classe 'ocorrencia'
          const ocorrencia = e.target.closest('.ocorrencia');
          if (!ocorrencia) return;
      
          const id = ocorrencia.id; // o id já está no atributo id da div ocorrencia
      
          buscarComentarios(id);
        });
      });
      
      function percorrerComentarios(comentarios) {
        if(comentarios){
            const containerComentarios = document.getElementById("containerComentariosPost")

            comentarios.reverse().forEach(item => {
                const dataCompleta = item.data_criacao
                const dataReformulada = dataCompleta.split("T")[0]

                containerComentarios.innerHTML += `
                <div class="comentario" id=${item.id_comentario}>
                    <div class="usuario">
                        <img src="../SRC/IMGS/FEED/plus.png" alt="">
                        <p>${item.usuario[0].nome}</p>
                    </div>
                    <span>${item.comentario}</span>
                    <h4>${dataReformulada}</h4>
                </div>`
            });
        }else{
            const containerComentarios = document.getElementById("containerComentariosPost")

            containerComentarios.innerHTML += `<h6>Parece que essse post ainda não tem comentários</h6>`
      
        }
      }

    function getDataAtual() {
        const hoje = new Date();

        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses vão de 0 a 11
        const dia = String(hoje.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }

      async function enviarComentario(result) {
        const comentario = document.getElementById("inputComentario").value

        const usuarioDados = JSON.parse(localStorage.getItem("dadosUsuario"))
        const idExtraido = usuarioDados[0].id_usuario

        const data = getDataAtual()

        if (comentario){
            const objeto = {
                comentario: comentario,
                data_criacao: data,
                id_ocorrencia: result[0].id_ocorrencia,
                id_usuario: idExtraido
            }

            const response = await fetch("http://localhost:8080/v1/controle-usuario/comentario-ocorrencias", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(objeto)
            })

            if (response.status === 201){
                alert("comentario feito com sucesso")

                const novaOcorrencia = await fetch(`http://localhost:8080/v1/controle-usuario/ocorrencias/${result[0].id_ocorrencia}`);
                const novaResult = await novaOcorrencia.json();
                const comentariosAtualizados = novaResult.ocorrencias[0].comentarios;

                const container = document.getElementById("containerComentariosPost")
                container.innerHTML = "" // limpa os comentários antigos

                percorrerComentarios(comentariosAtualizados);
            }else {
                alert("não foi possível comentar")
            }

        }else {
            alert("cara vai enviar nada mesmo?")
        }
      }

      function criarTelaComentario(result){
        document.querySelector("main").classList.add("blur");
        const body = document.getElementById("body")

        const containerComentarios = document.createElement("div")
        containerComentarios.className = "containerComentarios"
        containerComentarios.id = "containerComentarios"

        const botaoFechar = document.createElement("h5")
        botaoFechar.textContent = "X"
        botaoFechar.className = "botaoFecharComentario"

        const containerFoto = document.createElement("div")
        containerFoto.className = "containerFotoOcorrencia"
        containerFoto.id = "containerFotoOcorrencia"

        const fotoOcorrencia = document.createElement("img")
        fotoOcorrencia.src = result[0].midia[0].url

        const containerLateralComentarios = document.createElement("div")
        containerLateralComentarios.className = "containerLateralComentarios"
        containerLateralComentarios.id = "containerLateralComentarios"

        const dadosPost = document.createElement("div")
        dadosPost.className = "dadosPost"
        dadosPost.id = "dadosPost"

        const dadosUsuario = document.createElement("div")
        dadosUsuario.className = "dadosUsuarioPost"
        dadosUsuario.id = "dadosUsuarioPost"

        const fotoUsuarioPost = document.createElement("img")
        fotoUsuarioPost.src = "../SRC/IMGS/FEED/profile-user.png"

        const nomeUsuarioPost = document.createElement("h2")
        nomeUsuarioPost.textContent = result[0].usuario[0].nome

        const descricaoPost = document.createElement("p")
        descricaoPost.textContent = result[0].descricao

        const footerComentarios = document.createElement("div")
        footerComentarios.className = "footerTelaComentarios"

        const like = document.createElement("img")
        like.src = "../SRC/IMGS/FEED/profile-user.png"

        const containerInputComentario = document.createElement("div")
        containerInputComentario.className = "containerComentar"

        const inputComentario = document.createElement("input")
        inputComentario.placeholder = "Comente algo..."
        inputComentario.id = "inputComentario"

        const botaoEnviar = document.createElement("img")
        botaoEnviar.src = "../SRC/IMGS/FEED/send.png"
        botaoEnviar.id = "botaoEnviarComentario"

        const containerComentariosPost = document.createElement("div")
        containerComentariosPost.className = "containerComentariosPost"
        containerComentariosPost.id = "containerComentariosPost"

        const linhaDivisoria = document.createElement("hr")

        const comentariosTitulo = document.createElement("h3")
        comentariosTitulo.textContent = "Comentários"

        containerFoto.appendChild(fotoOcorrencia)

        dadosUsuario.appendChild(fotoUsuarioPost)
        dadosUsuario.appendChild(nomeUsuarioPost)

        dadosPost.appendChild(dadosUsuario)
        dadosPost.appendChild(descricaoPost)

        containerInputComentario.appendChild(inputComentario)
        containerInputComentario.appendChild(botaoEnviar)

        containerComentariosPost.appendChild(comentariosTitulo)

        footerComentarios.appendChild(like)
        footerComentarios.appendChild(containerInputComentario)

        containerLateralComentarios.appendChild(dadosPost)
        containerLateralComentarios.appendChild(linhaDivisoria)
        containerLateralComentarios.appendChild(containerComentariosPost)
        containerLateralComentarios.appendChild(footerComentarios)

        containerComentarios.appendChild(containerFoto)
        containerComentarios.appendChild(containerLateralComentarios)
        containerComentarios.appendChild(botaoFechar)

        body.appendChild(containerComentarios)

        percorrerComentarios(result[0].comentarios)

        document.getElementById("botaoEnviarComentario")
            .addEventListener("click", () => enviarComentario(result));

        botaoFechar.addEventListener("click", async() => {
            containerComentarios.remove();
            await recarregarOcorrencias()
            document.querySelector("main").classList.remove("blur");
});
      }

      async function buscarComentarios(id) {
        // Aqui você faz o fetch para buscar os comentários desse id
        console.log(`Buscando comentários da ocorrência ${id}`);
        // fetch(`/comentarios/${id}`) ...

        const ocorrencia = await fetch(`http://localhost:8080/v1/controle-usuario/ocorrencias/${id}`);
        const ocorrenciaResult = await ocorrencia.json();
        const ocorrenciaExtract = ocorrenciaResult.ocorrencias

        criarTelaComentario(ocorrenciaExtract)
      }

      function aplicarEventosComentario() {
            document.querySelectorAll('.btn-comentario').forEach(botao => {
                botao.addEventListener('click', async (e) => {
                    const ocorrencia = e.target.closest('.ocorrencia');
                    if (!ocorrencia) return;

                    const id = ocorrencia.id;
                    await buscarComentarios(id);
                });
            });
        }

      async function recarregarOcorrencias() {

        const main = document.querySelector('main');
        const scrollTop = main.scrollTop;

        // Congela o scroll da página
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        ocorrencias.innerHTML = "";
        const response = await fetch("http://localhost:8080/v1/controle-usuario/ocorrencias");
        const result = await response.json();

        for (const item of result.ocorrencias) {
            const objetoCurtida = {
                id_usuario: idUsuarioExtraido,
                id_ocorrencia: item.id_ocorrencia
            }

            const statusCurtida = await validarCurtida(objetoCurtida);
            const imagemLike = statusCurtida.estado === "on" ? "likeon.png" : "likeoff.png";
            const idVoto = statusCurtida.id_voto;

            let quantidadeVotos = 0

            if (item.votos > 0){
                quantidadeVotos = item.votos
            }

            let quantidadeComentarios = 0

            if (item.comentarios){
                quantidadeComentarios = item.comentarios.length
            }

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
                            <img 
                                src="../SRC/IMGS/FEED/${imagemLike}" 
                                alt="like" 
                                class="btn-like"
                                data-estado="${statusCurtida.estado}"
                                data-id-voto="${idVoto || ""}"
                                data-id-ocorrencia="${item.id_ocorrencia}"
                            >
                            <p>${quantidadeVotos}</p>
                            <img src="../SRC/IMGS/FEED/chat.png" alt="" class="btn-comentario">
                            <p>${quantidadeComentarios}</p>
                        </div>
                        <div class="descricao">
                            <p>${item.titulo}</p>
                            <span>${item.descricao}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        aplicarEventosComentario();

        setTimeout(() => {
            main.scrollTop = scrollTop;  // volta para a posição anterior do main
        }, 0);
    }

      document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("btn-like")) {
            const btn = event.target;
            const estadoAtual = btn.dataset.estado;
            const idOcorrencia = btn.dataset.idOcorrencia;
            const idVoto = btn.dataset.idVoto;

            if (estadoAtual === "off") {
                const objeto = {
                    id_usuario: idUsuarioExtraido,
                    id_ocorrencia: idOcorrencia,
                    data_voto: getDataAtual()
                };

                const response = await fetch("http://localhost:8080/v1/controle-usuario/voto", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(objeto)
                });

                if (response.status === 201) {
                    recarregarOcorrencias();
                } else {
                    alert("Erro ao curtir");
                }
            } else if (estadoAtual === "on" && idVoto) {
                const response = await fetch(`http://localhost:8080/v1/controle-usuario/voto/${idVoto}`, {
                    method: "DELETE"
                });

                if (response.status === 200) {
                    recarregarOcorrencias();
                } else {
                    alert("Erro ao descurtir");
                }
            }
        }
    });

});

