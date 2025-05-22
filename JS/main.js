"use strict"

async function pegarEstados() {
    const response = await fetch("gi n trabalha e n passou o link do get dos estados")
    const estados = await response.json();

    return estados
}

async function carregarEstados() {
    try {
        const selectEstados = document.getElementById("opcoes-estados")

        const estados = await pegarEstados()

        //ordena alfabeticamente
        estados.sort((a, b) => a.nome.localeCompare(b.nome)); 

        estados.forEach((item) => {
            const optionEstado = document.createElement("option")
            optionEstado.value = item.sigla
            optionEstado.textContent = item.nome

            selectEstados.appendChild(optionEstado)
        });
    } catch (error) {
        console.error('Erro ao carregar estados:', error);
        alert('Não foi possível carregar os estados.');
    }
}

window.addEventListener("DOMContentLoaded", carregarEstados)