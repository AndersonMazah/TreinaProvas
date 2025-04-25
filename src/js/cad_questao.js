function preencherSelectMateriaTelaQuestao() {
    const select = document.getElementById('selectMateriaTelaQuestao');
    select.innerHTML = '';
    const materias = carregarMaterias();
    materias.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.nome;
        select.appendChild(option);
    });
    preencherSelectAulaTelaQuestao();
}

function preencherSelectAulaTelaQuestao() {
    const idMateria = document.getElementById('selectMateriaTelaQuestao').value;
    const aulas = carregarAulas();
    const questoesDaMateria = aulas.filter(c => c.idmateria === idMateria);
    const select = document.getElementById('selectAulaTelaQuestao');
    select.innerHTML = '';
    if (questoesDaMateria.length > 0) {
        document.getElementById('idBtnNovoTelaQuestao').classList.remove('desabilitar');
        document.getElementById('selectAulaTelaQuestao').classList.remove('desabilitar');
        questoesDaMateria.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nome;
            select.appendChild(opt);
        });
    } else {
        document.getElementById('idBtnNovoTelaQuestao').classList.add('desabilitar');
        document.getElementById('selectAulaTelaQuestao').classList.add('desabilitar');
    }
    listarQuestoesDoAula();
}

let ordemQuestaoAscendente = true;

function listarQuestoesDoAula() {
    const idaula = document.getElementById('selectAulaTelaQuestao').value;
    const questoes = carregarQuestoes();
    const filtradas = questoes.filter(q => q.idaula === idaula);
    const tbody = document.getElementById('corpoTabelaQuestoes');
    tbody.innerHTML = '';
    if (filtradas.length > 0) {
        document.getElementById('msgSemRegistroDeQuestao').classList.add('ocultar');
        filtradas.sort((a, b) => {
            return ordemQuestaoAscendente
                ? a.enunciado.localeCompare(b.enunciado)
                : b.enunciado.localeCompare(a.enunciado);
        });
        filtradas.forEach(q => {
            const tr = document.createElement('tr');
            const tdEnunciado = document.createElement('td');
            tdEnunciado.innerHTML = `<strong>${q.enunciado}</strong><br/><em>${q.justificativa}</em>`;
            tr.appendChild(tdEnunciado);
            const tdAcoes = document.createElement('td');
            tdAcoes.innerHTML = `
            <button onclick="abrirModalQuestao('${q.id}')">Editar</button>
            <button onclick="abrirModalListaDeOpcoes('${q.id}','${q.enunciado}')">Opções</button>
            `;
            tr.appendChild(tdAcoes);
            tbody.appendChild(tr);
        });
    } else {
        document.getElementById('msgSemRegistroDeQuestao').classList.remove('ocultar');
    }
}

function ordenarQuestoes() {
    ordemQuestaoAscendente = !ordemQuestaoAscendente;
    listarQuestoesDoAula();
}

let idQuestaoEmEdicao = null;

function abrirModalQuestao(id = null) {
    const modal = document.getElementById('modalQuestao');
    const inputEnunciado = document.getElementById('inputModalQuestaoEnunciado');
    const inputJustificativa = document.getElementById('inputModalQuestaoJustificativa');
    const titulo = document.getElementById('modalTituloQuestao');
    if (id !== null) {
        const questoes = carregarQuestoes();
        const questao = questoes.find(q => q.id === id);
        inputEnunciado.value = questao.enunciado;
        inputJustificativa.value = questao.justificativa;
        titulo.textContent = "Editar Questão";
        idQuestaoEmEdicao = id;
        document.getElementById('btnExcluirQuestao').classList.remove('ocultar');
    } else {
        inputEnunciado.value = "";
        inputJustificativa.value = "";
        titulo.textContent = "Nova Questão";
        idQuestaoEmEdicao = null;
        document.getElementById('btnExcluirQuestao').classList.add('ocultar');
    }
    modal.classList.remove('ocultar');
    inputEnunciado.focus();
}

function fecharModalQuestao() {
    document.getElementById('modalQuestao').classList.add('ocultar');
    idQuestaoEmEdicao = null;
}

function salvarModalQuestao() {
    const enunciado = document.getElementById('inputModalQuestaoEnunciado').value.trim();
    const justificativa = document.getElementById('inputModalQuestaoJustificativa').value.trim();
    const idaula = document.getElementById('selectAulaTelaQuestao').value;
    if (!enunciado) return;
    let questoes = carregarQuestoes();
    if (idQuestaoEmEdicao === null) {
        const id = gerarUUID();
        const conhecimento = 0;
        const qtde_vezes = 0;
        const qtde_acertos = 0;
        const percentual = 0;
        questoes.push({ id, idaula, enunciado, justificativa, conhecimento, qtde_vezes, qtde_acertos, percentual });
    } else {
        const index = questoes.findIndex(q => q.id === idQuestaoEmEdicao);
        if (index !== -1) {
            questoes[index].enunciado = enunciado;
            questoes[index].justificativa = justificativa;
        }
    }
    salvarQuestoes(questoes);
    fecharModalQuestao();
    listarQuestoesDoAula();
    verificarSeHabilitaMenuProva();
}

function abrirModalConfirmarExclusaoQuestao() {
    document.getElementById('modalConfirmarExclusaoQuestao').classList.remove('ocultar');
}

function fecharModalConfirmarExclusaoQuestao() {
    document.getElementById('modalConfirmarExclusaoQuestao').classList.add('ocultar');
}

function executarExclusaoQuestao() {
    const opcoes = carregarOpcoes();
    const opcoesDaQuestao = opcoes.filter(o => o.idquestao === idQuestaoEmEdicao);
    if (opcoesDaQuestao.length > 0) {
        alert("Esta questão possui opções associadas e não pode ser excluída.");
        return;
    }
    let questoes = carregarQuestoes();
    questoes = questoes.filter(m => m.id !== idQuestaoEmEdicao);
    salvarQuestoes(questoes);
    fecharModalConfirmarExclusaoQuestao();
    fecharModalQuestao();
    listarQuestoesDoAula();
    verificarSeHabilitaMenuProva();
}
