"use strict"

async function pegarEstados() {
    const response = await fetch("http://localhost:3030/v1/controle-estado/estado")
    const estados = await response.json();

    return estados
}

async function carregarEstados() {
    try {
        const selectEstados = document.getElementById("opcoes-estados")

        const estados = await pegarEstados()

        const extracaoEstados = estados.estado

        extracaoEstados.forEach((item) => {
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