function preencherSelectMateriaTelaAula() {
    const select = document.getElementById('selectMateriaTelaAula');
    select.innerHTML = '';
    const materias = carregarMaterias();
    materias.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.nome;
        select.appendChild(option);
    });
    listarAulasDaMateria();
}

let ordemAulaAscendente = true;

function listarAulasDaMateria() {
    const idmateria = document.getElementById('selectMateriaTelaAula').value;
    const aulas = carregarAulas();
    const filtrados = aulas.filter(c => c.idmateria === idmateria);
    const tbody = document.getElementById('corpoTabelaAulas');
    tbody.innerHTML = '';
    if (filtrados.length > 0) {
        document.getElementById('msgSemRegistroDeAula').classList.add('ocultar');
        filtrados.sort((a, b) => {
            return ordemAulaAscendente
                ? a.nome.localeCompare(b.nome)
                : b.nome.localeCompare(a.nome);
        });
        filtrados.forEach(c => {
            const tr = document.createElement('tr');
            const tdNome = document.createElement('td');
            tdNome.textContent = c.nome;
            tr.appendChild(tdNome);
            const tdAcoes = document.createElement('td');
            tdAcoes.innerHTML = `<button onclick="abrirModalAula('${c.id}')">Editar</button>`;
            tr.appendChild(tdAcoes);
            tbody.appendChild(tr);
        });
    } else {
        document.getElementById('msgSemRegistroDeAula').classList.remove('ocultar');
    }
}

function ordenarAulas() {
    ordemAulaAscendente = !ordemAulaAscendente;
    listarAulasDaMateria();
}

let idAulaEmEdicao = null;

function abrirModalAula(id = null) {
    const modal = document.getElementById('modalAula');
    const input = document.getElementById('inputModalAula');
    const titulo = document.getElementById('modalTituloAula');
    if (id !== null) {
        const aulas = carregarAulas();
        const aula = aulas.find(c => c.id === id);
        input.value = aula.nome;
        titulo.textContent = "Editar Aula";
        idAulaEmEdicao = id;
        document.getElementById('btnExcluirAula').classList.remove('ocultar');
    } else {
        input.value = "";
        titulo.textContent = "Nova Aula";
        idAulaEmEdicao = null;
        document.getElementById('btnExcluirAula').classList.add('ocultar');
    }
    modal.classList.remove('ocultar');
    input.focus();
}

function fecharModalAula() {
    document.getElementById('modalAula').classList.add('ocultar');
    idAulaEmEdicao = null;
}

function salvarAula() {
    const input = document.getElementById('inputModalAula');
    const nome = input.value.trim();
    const idmateria = document.getElementById('selectMateriaTelaAula').value;
    if (!nome) return;
    let aulas = carregarAulas();
    if (idAulaEmEdicao === null) {
        const id = gerarUUID();
        aulas.push({ id, nome, idmateria });
    } else {
        const index = aulas.findIndex(c => c.id === idAulaEmEdicao);
        if (index !== -1) {
            aulas[index].nome = nome;
        }
    }
    salvarAulas(aulas);
    fecharModalAula();
    listarAulasDaMateria();
    verificarSeHabilitaMenuCadQuestao();
}

function abrirModalConfirmarExclusaoAula() {
    document.getElementById('modalConfirmarExclusaoAula').classList.remove('ocultar');
}

function fecharModalConfirmarExclusaoAula() {
    document.getElementById('modalConfirmarExclusaoAula').classList.add('ocultar');
}

function executarExclusaoAula() {
    const questoes = carregarQuestoes();
    const questoesDoAula = questoes.filter(c => c.idaula === idAulaEmEdicao);
    if (questoesDoAula.length > 0) {
        alert("Esta Aula possui questões associadas e não pode ser excluído.");
        return;
    }
    let aulas = carregarAulas();
    aulas = aulas.filter(m => m.id !== idAulaEmEdicao);
    salvarAulas(aulas);
    fecharModalConfirmarExclusaoAula();
    fecharModalAula();
    listarAulasDaMateria();
    verificarSeHabilitaMenuCadQuestao();
}
