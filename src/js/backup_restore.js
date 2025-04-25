function criarBackupXML() {
    const materias = carregarMaterias();
    const aulas = carregarAulas();
    const questoes = carregarQuestoes();
    const opcoes = carregarOpcoes();
    const doc = document.implementation.createDocument('', '', null);
    const backup = doc.createElement('backup');
    materias.forEach(materia => {
        const materiaEl = doc.createElement('materia');
        materiaEl.setAttribute('id', materia.id);
        materiaEl.setAttribute('nome', materia.nome);
        const aulasDaMateria = aulas.filter(a => a.idmateria === materia.id);
        aulasDaMateria.forEach(aula => {
            const aulaEl = doc.createElement('aula');
            aulaEl.setAttribute('id', aula.id);
            aulaEl.setAttribute('idmateria', aula.idmateria);
            aulaEl.setAttribute('nome', aula.nome);
            const questoesDaAula = questoes.filter(q => q.idaula === aula.id);
            questoesDaAula.forEach(questao => {
                const questaoEl = doc.createElement('questao');
                questaoEl.setAttribute('id', questao.id);
                questaoEl.setAttribute('idaula', questao.idaula);
                questaoEl.setAttribute('enunciado', encodeXMLText(questao.enunciado));
                questaoEl.setAttribute('justificativa', encodeXMLText(questao.justificativa));
                const opcoesDaQuestao = opcoes.filter(o => o.idquestao === questao.id);
                opcoesDaQuestao.forEach(opcao => {
                    const opcaoEl = doc.createElement('opcao');
                    opcaoEl.setAttribute('id', opcao.id);
                    opcaoEl.setAttribute('idquestao', opcao.idquestao);
                    opcaoEl.setAttribute('correta', opcao.correta ? 'true' : 'false');
                    opcaoEl.setAttribute('texto', encodeXMLText(opcao.texto));
                    questaoEl.appendChild(opcaoEl);
                });
                aulaEl.appendChild(questaoEl);
            });
            materiaEl.appendChild(aulaEl);
        });
        backup.appendChild(materiaEl);
    });
    doc.appendChild(backup);
    const xmlString = new XMLSerializer().serializeToString(doc);
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const filename = `provas_backup_${timestamp}.xml`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function restaurarBackupXML() {
    const input = document.getElementById('inputRestoreXML');
    if (!input.files.length) return alert('Selecione um arquivo .xml');
    const conhecimento = 0;
    const qtde_vezes = 0;
    const qtde_acertos = 0;
    const percentual = 0;
    const reader = new FileReader();
    reader.onload = function (e) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(e.target.result, "application/xml");
        const materias = [];
        const aulas = [];
        const questoes = [];
        const opcoes = [];
        xml.querySelectorAll('materia').forEach(materiaEl => {
            const materia = {
                id: materiaEl.getAttribute('id'),
                nome: materiaEl.getAttribute('nome')
            };
            materias.push(materia);
            materiaEl.querySelectorAll('aula').forEach(aulaEl => {
                const aula = {
                    id: aulaEl.getAttribute('id'),
                    idmateria: aulaEl.getAttribute('idmateria'),
                    nome: aulaEl.getAttribute('nome')
                };
                aulas.push(aula);
                aulaEl.querySelectorAll('questao').forEach(questaoEl => {
                    const questao = {
                        id: questaoEl.getAttribute('id'),
                        idaula: questaoEl.getAttribute('idaula'),
                        enunciado: decodeXMLText(questaoEl.getAttribute('enunciado')),
                        justificativa: decodeXMLText(questaoEl.getAttribute('justificativa')),
                        conhecimento,
                        qtde_vezes,
                        qtde_acertos,
                        percentual
                    };
                    questoes.push(questao);
                    questaoEl.querySelectorAll('opcao').forEach(opcaoEl => {
                        const opcao = {
                            id: opcaoEl.getAttribute('id'),
                            idquestao: opcaoEl.getAttribute('idquestao'),
                            correta: opcaoEl.getAttribute('correta') === 'true',
                            texto: decodeXMLText(opcaoEl.getAttribute('texto'))
                        };
                        opcoes.push(opcao);
                    });
                });
            });
        });
        salvarMaterias(materias);
        salvarAulas(aulas);
        salvarQuestoes(questoes);
        salvarOpcoes(opcoes);
        alert('Backup restaurado com sucesso!');
        location.reload();
    };
    reader.readAsText(input.files[0]);
}

function encodeXMLText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '&#10;')
        .replace(/\r/g, '&#13;')
        .replace(/\t/g, '&#9;')
        .replace(/"/g, '&quot;');
}

function decodeXMLText(text) {
    return text
        .replace(/&#10;/g, '\n')
        .replace(/&#13;/g, '\r')
        .replace(/&#9;/g, '\t')
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
}
