let provaAtual = {
    questoes: [],
    indexAtual: 0,
    tempoRestante: 0,
    timerId: null,
    modo_estudo: false
};

function preencherSelectMateriaTelaProva() {
    document.getElementById('telaProvaSelecionarMarcarTodos').checked = false;
    const select = document.getElementById('selectMateriaTelaProva');
    select.innerHTML = '';
    const materias = carregarMaterias();
    materias.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = m.nome;
        select.appendChild(option);
    });
    carregarAulasParaProva();
}

function carregarAulasParaProva() {
    const idMateria = document.getElementById('selectMateriaTelaProva').value;
    const ignorarDominadas = document.getElementById('filtroIgnorarDominadas').checked;
    const apenasMaisErros = document.getElementById('filtroMaisErros').checked;
    const aulas = carregarAulas();
    const questoes = carregarQuestoes();
    const aulasFiltradas = aulas.filter(a => a.idmateria === idMateria);
    const corpo = document.getElementById('corpoTabelaAulasProva');
    corpo.innerHTML = '';
    let temAulaComQuestoes = false;
    aulasFiltradas.forEach(aula => {
        let questoesDaAula = questoes.filter(q => q.idaula === aula.id);
        if (ignorarDominadas) {
            questoesDaAula = questoesDaAula.filter(q => q.conhecimento < 3);
        }
        if (apenasMaisErros) {
            const menorNivel = Math.min(...questoesDaAula.map(q => q.conhecimento));
            questoesDaAula = questoesDaAula.filter(q => q.conhecimento === menorNivel);
        }
        if (questoesDaAula.length > 0) {
            temAulaComQuestoes = true;
            const tr = document.createElement('tr');
            const tdCheck = document.createElement('td');
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.onchange = verificarHabilitarBotaoProva;
            tdCheck.appendChild(check);
            const tdNome = document.createElement('td');
            tdNome.textContent = aula.nome;
            const tdQtd = document.createElement('td');
            tdQtd.textContent = questoesDaAula.length;
            tr.appendChild(tdCheck);
            tr.appendChild(tdNome);
            tr.appendChild(tdQtd);
            corpo.appendChild(tr);
        }
    });
    const tabela = document.getElementById('tabelaAulasProva');
    tabela.classList.toggle('ocultar', !temAulaComQuestoes);
    verificarHabilitarBotaoProva();
}

function marcarDesmarcarTodos(checkbox) {
    const checkboxes = document.querySelectorAll('#corpoTabelaAulasProva input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    verificarHabilitarBotaoProva();
}

function verificarHabilitarBotaoProva() {
    const selecionados = document.querySelectorAll('#corpoTabelaAulasProva input[type="checkbox"]:checked');
    document.getElementById('btnIniciarProva').disabled = selecionados.length === 0;
}

function iniciarProva() {
    const idMateria = document.getElementById('selectMateriaTelaProva').value;
    const ignorarDominadas = document.getElementById('filtroIgnorarDominadas').checked;
    const apenasMaisErros = document.getElementById('filtroMaisErros').checked;
    provaAtual.modo_estudo = document.getElementById('filtroModoEstudo').checked;
    const todasAulas = carregarAulas();
    const aulas = todasAulas.filter(a => a.idmateria === idMateria);
    const questoes = carregarQuestoes();
    const opcoes = carregarOpcoes();
    const checkboxes = document.querySelectorAll('#corpoTabelaAulasProva input[type="checkbox"]');
    const aulasSelecionadas = aulas.filter((aula, i) => checkboxes[i] && checkboxes[i].checked);
    let todasQuestoes = [];
    aulasSelecionadas.forEach(aula => {
        let qs = questoes.filter(q => q.idaula === aula.id);
        if (ignorarDominadas) {
            qs = qs.filter(q => q.conhecimento < 3);
        }
        if (apenasMaisErros) {
            const menor = Math.min(...qs.map(q => q.conhecimento));
            qs = qs.filter(q => q.conhecimento === menor);
        }
        qs.forEach(q => {
            const opcoesQ = opcoes.filter(o => o.idquestao === q.id);
            todasQuestoes.push({
                ...q,
                opcoes: embaralharArray(opcoesQ),
                respostaUsuario: []
            });
        });
    });
    if (todasQuestoes.length === 0) {
        alert("Não há questões disponíveis para a prova.");
        return;
    }
    provaAtual.questoes = embaralharArray(todasQuestoes);
    provaAtual.indexAtual = 0;
    provaAtual.tempoRestante = provaAtual.modo_estudo ? null : provaAtual.questoes.length * 90; // 1m30s por questão
    exibirTela('telaProvaExecutar');
    exibirQuestaoAtual();
    if (!provaAtual.modo_estudo) {
        document.getElementById('cronometroProva').classList.remove('ocultar');
        iniciarCronometro();
    }
    else {
        document.getElementById('cronometroProva').classList.add('ocultar');
    }
}

function embaralharArray(arr) {
    return arr
        .map(valor => ({ valor, ordem: Math.random() }))
        .sort((a, b) => a.ordem - b.ordem)
        .map(obj => obj.valor);
}

function exibirQuestaoAtual() {
    const q = provaAtual.questoes[provaAtual.indexAtual];
    const container = document.getElementById('blocoQuestaoProva');
    container.innerHTML = `<p><strong>${provaAtual.indexAtual + 1}.</strong> ${q.enunciado}</p>`;
    q.opcoes.forEach((op, idx) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `op${idx}`;
        checkbox.checked = q.respostaUsuario.includes(op.id);
        checkbox.onchange = () => {
            if (checkbox.checked) {
                q.respostaUsuario.push(op.id);
            } else {
                q.respostaUsuario = q.respostaUsuario.filter(i => i !== op.id);
            }
        };
        const label = document.createElement('label');
        label.setAttribute('for', `op${idx}`);
        label.textContent = op.texto;
        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
    document.getElementById('btnAnterior').disabled = provaAtual.indexAtual === 0;
    document.getElementById('btnProximo').disabled = provaAtual.indexAtual === provaAtual.questoes.length - 1;
    document.getElementById('blocoBotaoCorreta').classList.toggle('ocultar', !provaAtual.modo_estudo);
    document.getElementById('justificativaProva')?.remove();
    provaAtual.exibirCorreta = false;
    document.querySelector('#blocoBotaoCorreta button').textContent = 'Exibir opção correta';
}

function navegarQuestao(direcao) {
    provaAtual.indexAtual += direcao;
    exibirQuestaoAtual();
}

function iniciarCronometro() {
    const cron = document.getElementById('cronometroProva');
    provaAtual.timerId = setInterval(() => {
        provaAtual.tempoRestante--;
        const min = String(Math.floor(provaAtual.tempoRestante / 60)).padStart(2, '0');
        const seg = String(provaAtual.tempoRestante % 60).padStart(2, '0');
        cron.textContent = `Tempo restante: ${min}:${seg}`;

        if (provaAtual.tempoRestante <= 0) {
            clearInterval(provaAtual.timerId);
            encerrarProva(true);
        }
    }, 1000);
}

let resultadoProva = {
    aprovado: false,
    total: 0,
    acertos: 0,
    percentual: 0,
    tempoGasto: ""
};

function encerrarProva(isEncerrouTempo = false) {
    if (!isEncerrouTempo) {
        if (!confirm("Deseja realmente encerrar a prova?")) return;
    }
    clearInterval(provaAtual.timerId);
    const questoes = carregarQuestoes();
    const opcoes = carregarOpcoes();
    let total = 0;
    let acertos = 0;
    provaAtual.questoes.forEach(q => {
        total++;
        const opcoesReais = opcoes.filter(o => o.idquestao === q.id);
        const corretas = opcoesReais.filter(o => o.correta).map(o => o.id).sort();
        const marcadas = (q.respostaUsuario || []).slice().sort();
        const acertou = JSON.stringify(corretas) === JSON.stringify(marcadas);
        const qLocal = questoes.find(qx => qx.id === q.id);
        if (qLocal && !provaAtual.modo_estudo) {
            qLocal.qtde_vezes++;
            if (acertou) {
                qLocal.qtde_acertos++;
                if (qLocal.conhecimento < 3) qLocal.conhecimento++;
            } else {
                qLocal.conhecimento = 0;
            }
            qLocal.percentual = Math.round((qLocal.qtde_acertos / qLocal.qtde_vezes) * 100);
        }
        if (acertou) acertos++;
    });
    salvarQuestoes(questoes);
    const percentual = Math.round((acertos / total) * 100);
    const aprovado = percentual >= 70;
    const tempoGasto = calcularTempoGasto();
    resultadoProva.aprovado = aprovado;
    resultadoProva.total = total;
    resultadoProva.acertos = acertos;
    resultadoProva.percentual = percentual;
    resultadoProva.tempoGasto = tempoGasto;
    exibirTela('telaProvaResultado');
}

function calcularTempoGasto() {
    const totalTempo = provaAtual.questoes.length * 90;
    const usado = provaAtual.tempoRestante !== null ? (totalTempo - provaAtual.tempoRestante) : 0;
    const min = String(Math.floor(usado / 60)).padStart(2, '0');
    const seg = String(usado % 60).padStart(2, '0');
    return `${min}:${seg}`;
}

function configurarTelaParaProva() {
    document.getElementById('menuCadastro').classList.add('ocultar');
    document.getElementById('bntMenuProva').classList.add('ocultar');
}

function exibirResultadoDaProva() {
    document.getElementById('menuCadastro').classList.remove('ocultar');
    document.getElementById('bntMenuProva').classList.remove('ocultar');
    const resultadoDiv = document.getElementById('resultadoProva');
    const texto = `
    <h3>${resultadoProva.aprovado ? '✅ Você foi <span style="color:green">APROVADO</span>!' : '❌ Você foi <span style="color:red">REPROVADO</span>'}</h3>
    <p><strong>Total de questões:</strong> ${resultadoProva.total}</p>
    <p><strong>Acertos:</strong> ${resultadoProva.acertos}</p>
    <p><strong>Erros:</strong> ${resultadoProva.total - resultadoProva.acertos}</p>
    <p><strong>Percentual:</strong> ${resultadoProva.percentual}%</p>
    <p><strong>Tempo gasto:</strong> ${resultadoProva.tempoGasto}</p>
  `;
    resultadoDiv.innerHTML = texto;
}

function alternarCorreta() {
    const q = provaAtual.questoes[provaAtual.indexAtual];
    const opcoesDivs = document.querySelectorAll('#blocoQuestaoProva div');
    if (!provaAtual.exibirCorreta) {
        q.opcoes.forEach((op, idx) => {
            if (op.correta) {
                opcoesDivs[idx].classList.add('opcao-correta');
            }
        });
        const refDiv = document.createElement('div');
        refDiv.id = 'justificativaProva';
        refDiv.className = 'justificativa-prova';
        refDiv.innerHTML = `<strong>Justificativa:</strong><br>${q.justificativa || 'Sem justificativa cadastrada.'}`;
        document.getElementById('blocoQuestaoProva').appendChild(refDiv);
        document.querySelector('#blocoBotaoCorreta button').textContent = 'Ocultar opção correta';
        provaAtual.exibirCorreta = true;
    } else {
        q.opcoes.forEach((_, idx) => opcoesDivs[idx].classList.remove('opcao-correta'));
        document.getElementById('justificativaProva')?.remove();
        document.querySelector('#blocoBotaoCorreta button').textContent = 'Exibir opção correta';
        provaAtual.exibirCorreta = false;
    }
}
