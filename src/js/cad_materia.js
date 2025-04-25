let ordemMateriaAscendente = true;

function listarMaterias() {
    const materias = carregarMaterias();
    const tbody = document.getElementById('corpoTabelaMaterias');
    tbody.innerHTML = '';
    if (materias.length > 0) {
        document.getElementById('msgSemRegistroDeMateria').classList.add('ocultar');
        materias.sort((a, b) => {
            return ordemMateriaAscendente
                ? a.nome.localeCompare(b.nome)
                : b.nome.localeCompare(a.nome);
        });
        materias.forEach(m => {
            const tr = document.createElement('tr');
            const tdNome = document.createElement('td');
            tdNome.textContent = m.nome;
            tr.appendChild(tdNome);
            const tdAcoes = document.createElement('td');
            tdAcoes.innerHTML = `<button onclick="abrirModalMateria('${m.id}')">Editar</button>`;
            tr.appendChild(tdAcoes);
            tbody.appendChild(tr);
        });
    } else {
        document.getElementById('msgSemRegistroDeMateria').classList.remove('ocultar');
    }
}

function ordenarMaterias() {
    ordemMateriaAscendente = !ordemMateriaAscendente;
    listarMaterias();
}

let idMateriaEmEdicao = null;

function abrirModalMateria(id = null) {
    const modal = document.getElementById('modalMateria');
    const input = document.getElementById('inputModalMateria');
    const titulo = document.getElementById('modalTituloMateria');
    if (id !== null) {
        const materias = carregarMaterias();
        const materia = materias.find(m => m.id === id);
        input.value = materia.nome;
        titulo.textContent = "Editar Matéria";
        idMateriaEmEdicao = id;
        document.getElementById('btnExcluirMateria').classList.remove('ocultar');
    } else {
        input.value = "";
        titulo.textContent = "Nova Matéria";
        idMateriaEmEdicao = null;
        document.getElementById('btnExcluirMateria').classList.add('ocultar');
    }
    modal.classList.remove('ocultar');
    input.focus();
}

function fecharModalMateria() {
    document.getElementById('modalMateria').classList.add('ocultar');
    idMateriaEmEdicao = null;
}

function salvarMateria() {
    const input = document.getElementById('inputModalMateria');
    const nome = input.value.trim();
    if (!nome) return;
    let materias = carregarMaterias();
    if (idMateriaEmEdicao === null) {
        const id = gerarUUID();
        materias.push({ id, nome });
    } else {
        const index = materias.findIndex(m => m.id === idMateriaEmEdicao);
        if (index !== -1) {
            materias[index].nome = nome;
        }
    }
    salvarMaterias(materias);
    fecharModalMateria();
    listarMaterias();
    verificarSeHabilitaMenuCadAula();
}

function abrirModalConfirmarExclusaoMateria() {
    document.getElementById('modalConfirmarExclusaoMateria').classList.remove('ocultar');
}

function fecharModalConfirmarExclusaoMateria() {
    document.getElementById('modalConfirmarExclusaoMateria').classList.add('ocultar');
}

function executarExclusaoMateria() {
    const aulas = carregarAulas();
    const aulasDaMateria = aulas.filter(c => c.idmateria === idMateriaEmEdicao);
    if (aulasDaMateria.length > 0) {
        alert("Esta Matéria possui Aulas associadas e não pode ser excluída.");
        return;
    }
    let materias = carregarMaterias();
    materias = materias.filter(m => m.id !== idMateriaEmEdicao);
    salvarMaterias(materias);
    fecharModalConfirmarExclusaoMateria();
    fecharModalMateria();
    listarMaterias();
    verificarSeHabilitaMenuCadAula();
}
