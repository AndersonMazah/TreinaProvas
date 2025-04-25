let idQuestaoAtual = null;
let idOpcaoEmEdicao = null;

function abrirModalListaDeOpcoes(idQuestao, enunciado) {
    idQuestaoAtual = idQuestao;
    idOpcaoEmEdicao = null;
    document.getElementById('enunciadoSomenteLeitura').textContent = enunciado;
    document.getElementById('modalListaDeOpcoes').classList.remove('ocultar');
    listarOpcoesDaQuestao();
}

let ordemOpcaoAscendente = true;

function listarOpcoesDaQuestao() {
    const todasOpcoes = carregarOpcoes();
    const opcoes = todasOpcoes.filter(o => o.idquestao === idQuestaoAtual);
    const corpo = document.getElementById('corpoTabelaOpcoes');
    corpo.innerHTML = '';
    if (opcoes.length > 0) {
        document.getElementById('msgSemRegistroDeOpcao').classList.add('ocultar');
        opcoes.sort((a, b) => {
            return ordemOpcaoAscendente
                ? a.texto.localeCompare(b.texto)
                : b.texto.localeCompare(a.texto);
        });
        opcoes.forEach(o => {
            const tr = document.createElement('tr');
            const tdTexto = document.createElement('td');
            tdTexto.textContent = o.texto;
            tr.appendChild(tdTexto);
            const tdCorreta = document.createElement('td');
            tdCorreta.textContent = o.correta ? 'Correta' : 'Falsa';
            tdCorreta.style.color = o.correta ? 'green' : 'red';
            tr.appendChild(tdCorreta);
            const tdAcoes = document.createElement('td');
            tdAcoes.innerHTML = `<button onclick="abrirModalCadOpcao('${o.id}')">Editar</button>`;
            tr.appendChild(tdAcoes);
            corpo.appendChild(tr);
        });
    } else {
        document.getElementById('msgSemRegistroDeOpcao').classList.remove('ocultar');
    }
}

function ordenarOpcoes() {
    ordemOpcaoAscendente = !ordemOpcaoAscendente;
    listarOpcoesDaQuestao();
}

function fecharModalListaDeOpcoes() {
    document.getElementById('modalListaDeOpcoes').classList.add('ocultar');
    idQuestaoAtual = null;
}

function abrirModalCadOpcao(id = null) {
    const modal = document.getElementById('modalCadOpcao');
    const input = document.getElementById('textoOpcao');
    const chkCorreta = document.getElementById('corretaOpcao');
    const titulo = document.getElementById('modalTituloCadOpcao');
    if (id !== null) {
        const opcoes = carregarOpcoes();
        const opcao = opcoes.find(m => m.id === id);
        input.value = opcao.texto;
        chkCorreta.checked = opcao.correta;
        titulo.textContent = "Editar Opção";
        idOpcaoEmEdicao = id;
        document.getElementById('btnExcluirOpcao').classList.remove('ocultar');
    } else {
        input.value = "";
        chkCorreta.checked = false;
        titulo.textContent = "Nova Opção";
        idOpcaoEmEdicao = null;
        document.getElementById('btnExcluirOpcao').classList.add('ocultar');
    }
    modal.classList.remove('ocultar');
    input.focus();
}

function fecharModalCadOpcao() {
    document.getElementById('modalCadOpcao').classList.add('ocultar');
    idOpcaoEmEdicao = null;
    listarOpcoesDaQuestao();
}

function salvarOpcao() {
    const texto = document.getElementById('textoOpcao').value.trim();
    const correta = document.getElementById('corretaOpcao').checked;
    if (!texto) return;
    let opcoes = carregarOpcoes();
    if (idOpcaoEmEdicao === null) {
        const id = gerarUUID();
        opcoes.push({ id, idquestao: idQuestaoAtual, texto, correta });
    } else {
        const index = opcoes.findIndex(o => o.id === idOpcaoEmEdicao);
        if (index !== -1) {
            opcoes[index].texto = texto;
            opcoes[index].correta = correta;
        }
    }
    salvarOpcoes(opcoes);
    document.getElementById('textoOpcao').value = '';
    document.getElementById('corretaOpcao').checked = false;
    idOpcaoEmEdicao = null;
    fecharModalCadOpcao();
}

function abrirModalConfirmarExclusaoOpcao() {
    document.getElementById('modalConfirmarExclusaoOpcao').classList.remove('ocultar');
}

function fecharModalConfirmarExclusaoOpcao() {
    document.getElementById('modalConfirmarExclusaoOpcao').classList.add('ocultar');
}

function executarExclusaoOpcao() {
    let todasOpcoes = carregarOpcoes();
    todasOpcoes = todasOpcoes.filter(o => o.id !== idOpcaoEmEdicao);
    salvarOpcoes(todasOpcoes);
    fecharModalConfirmarExclusaoOpcao();
    fecharModalCadOpcao();
    listarOpcoesDaQuestao();
}
