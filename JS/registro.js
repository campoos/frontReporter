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

        const emailValidacao = {
            email: dadosRegistro.email
        }

        const response1 = await fetch("http://10.107.134.3:8080/v1/controle-usuario/usuario/email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(emailValidacao)
        })

        const resultEmail = await response1.json()

        if(resultEmail.status == true){
            alert("email já cadastrado")
        }else{
            
            const response2 = await fetch("http://10.107.134.3:8080/v1/controle-usuario/usuario", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dadosRegistro)
            })

            const result = await response2.json()

            console.log(response2)

            if (response2.status === 201){
                alert("Cadastro realizado com sucesso")
                window.location.href = "../index.html"
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

    


