async function buscar() {
    
const aceite = document.getElementById('aceiteLgpd');
if (aceite && !aceite.checked) {
    alert("Por favor, aceite o Termo de Consentimento para prosseguir com a busca.");
    return;
}

    const porte = document.getElementById('porte').value;
    const energia = document.getElementById('energia').value;
    const espaco = document.getElementById('espaco').value;
    const temperamento = document.getElementById('temperamento').value;
    const container = document.getElementById('resultados');

    container.innerHTML = `
        <div class="msg">
            O algoritmo está cruzando dados e buscando fotos aleatórias de cachorros...
        </div>
    `;

    try {
        const url = `https://elopet-1jq3.onrender.com/api/match?porte=${encodeURIComponent(porte)}&energia=${encodeURIComponent(energia)}&espaco=${encodeURIComponent(espaco)}&temperamento=${encodeURIComponent(temperamento)}`;
        const res = await fetch(url);

        if (!res.ok) {
            const erro = await res.json().catch(() => ({}));
            throw new Error(erro.error || 'Erro ao consultar o backend.');
        }

        const pets = await res.json();
        container.innerHTML = '';

        if (!pets.length) {
            container.innerHTML = `
                <div class="msg" style="color:#ef4444;">
                    Nenhum animal atende a essa combinação exata na planilha atual.
                </div>
            `;
            return;
        }

        for (const pet of pets) {
            let fotoUrl = "https://images.dog.ceo/breeds/terrier-irish/n02093991_403.jpg"; // fallback

            try {
                const imgRes = await fetch('https://dog.ceo/api/breeds/image/random');
                const imgDados = await imgRes.json();

                if (imgDados.status === "success") {
                    fotoUrl = imgDados.message;
                }
            } catch (erroImagem) {
                console.log("Não foi possível carregar imagem da API. Usando imagem padrão.");
            }

            // para evitar 'undefined' na tela
            const idade = pet.idade_estimada ?? pet.idade ?? 'Não informada';
            const vacinaStatus = pet.vacinado ?? pet.vacina ?? 'Não informado';

            const card = document.createElement('div');
            card.className = 'pet-card result-card';
            card.innerHTML = `
                <img src="${fotoUrl}" class="card-img" alt="Foto do cachorro ${pet.nome || 'Pet'}">
                
                <div class="card-content">
                    <div>
                        <h3>${pet.nome || 'Sem Nome'}</h3>
                        <p><b>Porte:</b> ${pet.porte || 'Não informado'}</p>
                        <p><b>Idade:</b> ${idade} ${isNaN(idade) ? '' : 'anos'}</p>
                        <p><b>Espaço necessário:</b> ${pet.espaco_necessario || pet.espaco || 'Não informado'}</p>
                        <p><b>Temperamento:</b> ${pet.temperamento || 'Não informado'}</p>
                        <p><b>Vacinado:</b> ${vacinaStatus}</p>
                    </div>

                    <button class="btn-adotar adopt-btn" onclick="adotar('${pet.nome}', '${pet.temperamento}', '${idade}')">
                        Efetivar Adoção
                    </button>
                </div>
            `;

            container.appendChild(card); 
        }

    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <div class="msg" style="color:#ef4444;">
                Erro na conexão com o backend: ${e.message}
            </div>
        `;
    }
}

function baixarModelo() {
    window.location.href = 'https://elopet-1jq3.onrender.com/api/download-modelo';
}

async function adotar(nome, temperamento, idade) {
    // gerar o documento oficial
    const adotante = prompt("Para gerar o certificado, digite seu Nome Completo:");
    if (!adotante) return;

    const adotanteCpf = prompt("Digite seu CPF:");
    if (!adotanteCpf) return;

    try {
        const response = await fetch('https://elopet-1jq3.onrender.com/api/adotar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adotante: adotante,
                adotanteCpf: adotanteCpf,
                petNome: nome,
                petIdade: idade
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao gerar certificado de adoção.');
        }

        // Recebe o PDF e download no navegador do usuário
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificado-${nome}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (erro) {
        alert("Falha ao gerar o certificado: " + erro.message);
    }
}
// Funções para Controle do Modal LGPD
function openLgpdModal() {
    const modal = document.getElementById('lgpdModal');
    if (modal) modal.classList.remove('hidden');
}

function closeLgpdModal() {
    const modal = document.getElementById('lgpdModal');
    if (modal) modal.classList.add('hidden');
}