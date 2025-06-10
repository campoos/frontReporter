"use strict"

//token sas
//sp=rwd&st=2025-06-02T01:10:28Z&se=2025-07-01T09:10:28Z&sv=2024-11-04&sr=c&sig=1%2BCu0taa%2F8a4GMPdZKZlGIItkBXWK2c4lFPRGUEaiTQ%3D

//url de sas
//https://ocorrenciasimagens.blob.core.windows.net/imagens?sp=rwd&st=2025-06-02T01:10:28Z&se=2025-07-01T09:10:28Z&sv=2024-11-04&sr=c&sig=1%2BCu0taa%2F8a4GMPdZKZlGIItkBXWK2c4lFPRGUEaiTQ%3D

let cepDigitadoManualmente = null;

document.addEventListener('DOMContentLoaded', async() => {
    const categorias = document.getElementById("categoria")

    const response = await fetch("http://10.107.134.4:8080/v1/controle-usuario/categoria")

    const result = await response.json();

    result.categorias.forEach(item => {
        let categoria = document.createElement("option")
        categoria.value = item.id_categoria
        categoria.textContent = item.nome_categoria

        categorias.appendChild(categoria)
    });
});

function getDataAtual() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // meses vão de 0 a 11
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
}

async function getDadosEndereco(endereco) {
    if (!endereco.logradouro || !endereco.bairro || !endereco.cidade || !endereco.estado) {
        alert("Por favor, preencha todos os campos de endereço corretamente.");
        return null;
    }   
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`;
    console.log(url)

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'olho_bairro/1.0 (joaosantos20071009@gmail.com)'
            }
        });

        const data = await response.json();

        if (data.length === 0) {
            throw new Error("Endereço não encontrado.");
        }

        const resultado = data[0];

        // Extrair partes normalizadas do endereço
        const address = resultado.address || {};

        const logradouro = address.road || endereco.logradouro;
        const bairro     = address.suburb || address.neighbourhood || endereco.bairro;
        const cidade     = address.city || address.town || address.village || endereco.cidade;
        const estado     = address.state || endereco.estado;

        const latitude  = parseFloat(parseFloat(resultado.lat).toFixed(6));
        const longitude = parseFloat(parseFloat(resultado.lon).toFixed(6));

        const cepMatch = resultado.display_name.match(/\b\d{5}-\d{3}\b/);
        const cep = cepMatch ? cepMatch[0] : null;

        // Retorna já o objeto completo, com os campos normalizados
        return {
            logradouro: logradouro,
            bairro: bairro,
            cidade: cidade,
            estado: estado,
            cep: cep,
            latitude: latitude,
            longitude: longitude
        };
    } catch (error) {
        console.error(error);
        alert(error);
        return null;
    }
}

async function cadastrarEndereco(endereco) {
    try {
        const objetoEndereco = {
            logradouro : endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            cep: cepDigitadoManualmente || endereco.cep,
            longitude: endereco.longitude,
            latitude: endereco.latitude
        }
        
        const response = await fetch("http://10.107.134.4:8080/v1/controle-usuario/endereco", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(objetoEndereco)
        })

        const result = await response.json()

        if (result.status_code == 200){
            return result
        }
        else {
            return result.status_code
        }
        
    } catch (error) {
        
    }
}

async function capturarDados(){
    const titulo = document.getElementById("titulo").value
    const descricao = document.getElementById("descricao").value
    const data = getDataAtual()

    const usuario = JSON.parse(localStorage.getItem("dadosUsuario"))
    const idUsuario = usuario[0].id_usuario

    const status = 1
    const categoria = document.getElementById("categoria").value

    const logradouro = document.getElementById("logradouro").value
    const bairro     = document.getElementById("bairro").value
    const estado     = document.getElementById("estado").value
    const cidade     = document.getElementById("cidade").value

    const dadosEndereco = {
        logradouro: logradouro,
        bairro: bairro,
        estado: estado,
        cidade: cidade
    }

    const dadosCadastroEndereco = await getDadosEndereco(dadosEndereco)

    const enderecoCadastrado = await cadastrarEndereco(dadosCadastroEndereco)

    const idEndereco = enderecoCadastrado.result[0].id_endereco

    const dadosCompleto = {
        titulo: titulo,
        descricao: descricao,
        data_criacao: data,
        id_usuario: idUsuario,
        id_endereco: idEndereco,
        id_categoria: categoria,
        id_status: status
    }

    return dadosCompleto
}

async function uploadImagem(){
    const usuario = JSON.parse(localStorage.getItem("dadosUsuario"));
    const idUsuario = usuario[0].id_usuario;

    const ocorrencia = JSON.parse(localStorage.getItem("dadosOcorrencia"));
    const idOcorrencia = ocorrencia[0].id_ocorrencia;

    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Nenhuma imagem selecionada para upload.")
        console.warn("Nenhuma imagem selecionada para upload.");
        return;
    }

    // Nome do arquivo no Blob Storage (pode acrescentar timestamp pra evitar conflito)
    const nomeArquivo = `${Date.now()}_${file.name}`;

    // URL base do Blob Storage com SAS token
    const blobUrlBase = "https://ocorrenciasimagens.blob.core.windows.net/imagens";
    const sasToken = "sp=rwd&st=2025-06-02T01:10:28Z&se=2025-07-01T09:10:28Z&sv=2024-11-04&sr=c&sig=1%2BCu0taa%2F8a4GMPdZKZlGIItkBXWK2c4lFPRGUEaiTQ%3D";

    const uploadUrl = `${blobUrlBase}/${encodeURIComponent(nomeArquivo)}?${sasToken}`;

    try {
        // Faz upload com PUT direto para Azure Blob
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error(`Erro no upload do arquivo: ${uploadResponse.statusText}`);
        }

        // Após upload, montar URL pública para acesso (geralmente mesma URL sem query SAS para leitura, ou com, depende do acesso)
        // Aqui vamos manter a URL com SAS para garantir acesso
        const urlPublica = uploadUrl;

        // Montar objeto para enviar ao backend
        const dadosMidia = {
            nome_arquivo: nomeArquivo,
            url: urlPublica,
            tamanho: file.size,
            id_ocorrencia: idOcorrencia,
            id_usuario: idUsuario
        };

        // Enviar dados para o backend
        const backendResponse = await fetch("http://10.107.134.4:8080/v1/controle-usuario/midias", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosMidia)
        });

        const backendResult = await backendResponse.json();

        if (backendResult.status_code !== 200) {
            throw new Error("Erro ao salvar dados da mídia no banco.");
        }

        alert("Ocorrencia registrada com sucesso")
        window.location.href = "../PAGES/mapa.html"
    } catch (error) {
        console.error("Falha no upload da imagem:", error);
        alert("Falha ao fazer upload da imagem. Tente novamente.");
    }
}

async function cadastroOcorrencia(event){
    try {
        event.preventDefault()

        const dadosOcorrencia = await capturarDados()

        const response = await fetch("http://10.107.134.4:8080/v1/controle-usuario/ocorrencias", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dadosOcorrencia)
        })

        const result = await response.json()

        if (result.status_code == 201){
            console.log(result.result)
            localStorage.setItem("dadosOcorrencia", JSON.stringify(result.result))
            await uploadImagem()
        }
        else {
            alert("Não foi possível registrar sua ocorrencia")
        }
    } catch (error) {
        return "deu merda registrando"
    }
}

function fecharTelaCEP(event) {
    event.preventDefault()

    const main = document.getElementById("main")
    const containerCEP = document.getElementById("containerCEP")

    main.removeChild(containerCEP)
}

async function preencherDadosCEP(event) {
    event.preventDefault();

    const cepInput = document.getElementById("inputCEP");
    const cep = cepInput.value.replace(/[^\d-]/g, '');
    cepDigitadoManualmente = cep

    const buttonCEP = document.getElementById("buttonEnviarCEP");

    // Verifica se já existe uma mensagem de erro e remove
    const erroAnterior = document.getElementById("erroCEP");
    if (erroAnterior) erroAnterior.remove();

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            throw new Error("CEP não encontrado.");
        }

        // Preenche os campos com os dados retornados
        document.getElementById("logradouro").value = data.logradouro || '';
        document.getElementById("bairro").value = data.bairro || '';
        document.getElementById("cidade").value = data.localidade || '';
        document.getElementById("estado").value = data.estado || '';

        fecharTelaCEP(event); // Fecha a tela do CEP

    } catch (error) {
        const erroMsg = document.createElement("p");
        erroMsg.textContent = "Erro: CEP inválido ou não encontrado.";
        erroMsg.style.color = "red";
        erroMsg.style.marginTop = "10px";
        erroMsg.id = "erroCEP";

        buttonCEP.parentElement.appendChild(erroMsg);
    }
}

function telaCEP(){
    const main = document.getElementById("main")

    const container =  document.createElement("div")
    container.className = "containerCEP"
    container.id = "containerCEP"

    const formContainer =  document.createElement("form")
    formContainer.className = "formCEP"
    formContainer.action = ""

    const botaoVoltar = document.createElement("h1")
    botaoVoltar.textContent = "←"
    botaoVoltar.id = "botaoVoltarCEP"

    const inputCep = document.createElement("input")
    inputCep.placeholder = "Digite seu CEP"
    inputCep.id = "inputCEP"

    const buttonEnviarCEP = document.createElement("button")
    buttonEnviarCEP.textContent = "enviar CEP"
    buttonEnviarCEP.id = "buttonEnviarCEP"

    formContainer.appendChild(inputCep)
    formContainer.appendChild(buttonEnviarCEP)

    container.appendChild(botaoVoltar)
    container.appendChild(formContainer)

    main.appendChild(container)

    document.getElementById("buttonEnviarCEP")
    .addEventListener("click", preencherDadosCEP)

    document.getElementById("botaoVoltarCEP")
    .addEventListener("click", fecharTelaCEP)
}

document.getElementById("buttonRegistro")
    .addEventListener("click", cadastroOcorrencia)

document.getElementById("buttonCEP")
.addEventListener("click", telaCEP)