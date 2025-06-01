"use strict"

function pegarDados(){
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    const objeto = {
        email: email,
        senha: senha
    }

    return objeto
}


async function fazerLogin(event){
    try {
        event.preventDefault()

        const dadosLogin = pegarDados()

        if(!dadosLogin.email || !dadosLogin.senha){
            return alert("preencha todos os dados!")
        }

            const response = await fetch("http://192.168.0.103:8080/v1/controle-usuario/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dadosLogin)
        })

        const result = await response.json()

         if (response.status === 200){
            localStorage.setItem("dadosUsuario", JSON.stringify(result.users))

            alert("Login realizado com sucesso")
            window.location.href = "./PAGES/feed.html"
        }else {
            alert("Não foi possível realizar o login")
        } 
    } catch (error) {
        alert("erro ao fazer login")
        console.error("erro ao logar", error)
    }
}

document.getElementById("buttonLogin")
    .addEventListener("click", fazerLogin)