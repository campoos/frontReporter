"use strict"

document.addEventListener('DOMContentLoaded', async() => {
    const categorias = document.getElementById("categoria")

    const response = await fetch("http://192.168.0.103:8080/v1/controle-usuario/categoria")

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
    const enderecoCompleto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.cidade}, ${endereco.estado}, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`;

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
        console.error("Erro ao buscar coordenadas:", error);
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
            cep: endereco.cep,
            longitude: endereco.longitude,
            latitude: endereco.latitude
        }
        
        const response = await fetch("http://192.168.0.103:8080/v1/controle-usuario/endereco", {
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

async function cadastroOcorrencia(event){
    try {
        event.preventDefault()

        const dadosOcorrencia = await capturarDados()

        const response = await fetch("http://192.168.0.103:8080/v1/controle-usuario/ocorrencias", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dadosOcorrencia)
        })

        const result = await response.json()

        if (result.status_code == 201){
            localStorage.setItem("dadosOcorrencia", JSON.stringify(result.result))
            alert("Ocorrencia registrada com sucesso")
            window.location.href = "./PAGES/mapa.html"
        }
        else {
            alert("Não foi possível registrar sua ocorrencia")
        }
    } catch (error) {
        return "deu merda registrando"
    }
}

document.getElementById("buttonRegistro")
    .addEventListener("click", cadastroOcorrencia)