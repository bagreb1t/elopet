async function buscar() {
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

            // Tratamento das propriedades para evitar 'undefined' na tela
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

            container.appendChild(card); // Inserção única mantida
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
    window.location.href = 'http://localhost:3000/api/download-modelo';
}