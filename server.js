const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function lerDados() {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
}

function salvarDados(dados) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2), 'utf8');
}

app.get('/api/hinos', (req, res) => {
    try {
        const dados = lerDados();
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao ler dados.' });
    }
});

app.post('/api/hinos', (req, res) => {
    try {
        const { senha, titulo, tom, letra, cifraAtiva } = req.body;
        if (senha !== 'seusandro') {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }
        if (!titulo || !letra) {
            return res.status(400).json({ error: 'Título e letra são obrigatórios.' });
        }

        const dados = lerDados();
        const novoId = dados.length > 0 ? Math.max(...dados.map(h => h.id)) + 1 : 1;

        const novoHino = {
            id: novoId,
            titulo: titulo.trim(),
            tom: tom ? tom.trim() : '',
            letra: letra.trim(),
            cifraAtiva: !!cifraAtiva
        };

        dados.push(novoHino);
        salvarDados(dados);
        res.status(201).json(novoHino);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar novo louvor.' });
    }
});

app.put('/api/hinos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { senha, titulo, tom, letra, cifraAtiva } = req.body;

        if (senha !== 'seusandro') {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        const dados = lerDados();
        const index = dados.findIndex(h => h.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Louvor não encontrado.' });
        }

        dados[index] = {
            id: id,
            titulo: titulo ? titulo.trim() : dados[index].titulo,
            tom: tom !== undefined ? tom.trim() : dados[index].tom,
            letra: letra ? letra.trim() : dados[index].letra,
            cifraAtiva: cifraAtiva !== undefined ? !!cifraAtiva : dados[index].cifraAtiva
        };

        salvarDados(dados);
        res.json(dados[index]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar louvor.' });
    }
});

app.delete('/api/hinos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { senha } = req.body;

        if (senha !== 'seusandro') {
            return res.status(401).json({ error: 'Senha incorreta.' });
        }

        let dados = lerDados();
        const existe = dados.some(h => h.id === id);

        if (!existe) {
            return res.status(404).json({ error: 'Louvor não encontrado.' });
        }

        dados = dados.filter(h => h.id !== id);
        salvarDados(dados);
        res.json({ message: 'Louvor excluído com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir louvor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
