"use strict"

function pegarDados(){
    const nome  = document.getElementById("nome").value 
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    const objeto = {
        nome: nome,
        email: email,
        senha: senha
    }

    return objeto
}

async function cadastrarUsuario(event){
    try {
        event.preventDefault()

        const dadosRegistro = pegarDados()

        if(!dadosRegistro.nome || !dadosRegistro.email || !dadosRegistro.senha){
            return alert("preencha todos os dados!")
        }

        const response = await fetch(`http://seu-backend.com/api/usuarios/validar-email?email=${encodeURIComponent(dadosRegistro.email)}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        })

        const resultEmail = await response.json()

        if(resultEmail){
            alert("email já cadastrado")
        }else{
            
            const response = await fetch("link da gi para registrar os dados", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dadosRegistro)
            })

            const result = await response.json()

            if (result.status === 201 || result.message === "SUCCESS_CREATED_ITEM"){
                alert("Cadastro realizado com sucesso")
                window.location.href = "../PAGES/feed.html"
            }else {
                alert("Erro ao cadastrar usuário: " + result.message)
            }
        }
    } catch (error) {
        alert("erro ao cadastrar o usuário")
        console.error("erro ao cadastrar o usuário", error)
    }
}

document.getElementById("buttonRegistrar")
    .addEventListener("click", cadastrarUsuario)

    


