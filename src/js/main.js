function exibirTela(telaNome) {
    document.querySelectorAll('.tela').forEach(section => {
        section.classList.remove('tela_ativa');
    });
    document.getElementById(telaNome).classList.add('tela_ativa');
    if (telaNome === 'telaCadMateria') listarMaterias();
    if (telaNome === 'telaCadAula') preencherSelectMateriaTelaAula();
    if (telaNome === 'telaCadQuestao') preencherSelectMateriaTelaQuestao();
    if (telaNome === 'telaProvaSelecionar') preencherSelectMateriaTelaProva();
    if (telaNome === 'telaProvaExecutar') configurarTelaParaProva();
    if (telaNome === 'telaProvaResultado') exibirResultadoDaProva();
}

function gerarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function carregarEntidade(nome) {
    return JSON.parse(localStorage.getItem(nome)) || [];
}
function salvarEntidade(nome, dados) {
    localStorage.setItem(nome, JSON.stringify(dados));
}

function carregarMaterias() {
    return carregarEntidade('materias');
}
function salvarMaterias(dados) {
    salvarEntidade('materias', dados);
}

function carregarAulas() {
    return carregarEntidade('aulas');
}
function salvarAulas(dados) {
    salvarEntidade('aulas', dados);
}

function carregarQuestoes() {
    return carregarEntidade('questoes');
}
function salvarQuestoes(dados) {
    salvarEntidade('questoes', dados);
}

function carregarOpcoes() {
    return carregarEntidade('opcoes');
}
function salvarOpcoes(dados) {
    salvarEntidade('opcoes', dados);
}
