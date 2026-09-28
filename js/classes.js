export class Plano {
    constructor(nome, preco, minutos) {
        this.nome = nome;
        this.preco = preco;
        this.minutos = minutos;
    }
}

export class CatalogoPlanos {
    constructor() {
        this.VALOR_MINIMO = 1.00;
        this.lista = [
            new Plano('Full', 3.00, 120),
            new Plano('Estrela', 1.75, 60),
            new Plano('Básico', 1.00, 30)
        ];
    }

    encontrarPorValor(valor) {
        try {
            if (valor < this.VALOR_MINIMO) return null;
            return this.lista.find(p => valor >= p.preco);
        } catch (erro) {
            // Captura falhas estruturais na busca do array
            console.error("Erro interno ao buscar plano com find():", erro);
            return null;
        }
    }
}

export class Saldo {
    constructor(chaveStorage) {
        this.chaveStorage = chaveStorage;
        this.valor = parseFloat(localStorage.getItem(this.chaveStorage)) || 0;
    }

    depositar(quantia) {
        this.valor += quantia;
        this._persistir();
    }

    debitar(quantia) {
        if (quantia > this.valor) throw new Error('Saldo insuficiente.');
        this.valor -= quantia;
        this._persistir();
    }

    formatado() {
        return this.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    _persistir() {
        localStorage.setItem(this.chaveStorage, this.valor);
    }
}

export class Cronometro {
    constructor(chaveStorage, aoAtualizar, aoFinalizar) {
        this.chaveStorage = chaveStorage;
        this.aoAtualizar = aoAtualizar;   
        this.aoFinalizar = aoFinalizar;   
        this.intervaloId = null;
    }
 
    iniciar(minutos) {
        const fimSalvo = parseInt(localStorage.getItem(this.chaveStorage), 10);
        const agora = Date.now();
        let novoFim;

        // Se já existe um cronômetro ativo e o tempo restante for válido, soma a partir dele
        if (!isNaN(fimSalvo) && fimSalvo > agora) {
            novoFim = fimSalvo + (minutos * 60 * 1000);
        } else {
            // Caso contrário, inicia a contagem do zero a partir do momento atual
            novoFim = agora + (minutos * 60 * 1000);
        }

        localStorage.setItem(this.chaveStorage, novoFim);
        this._rodar(novoFim);
    }
 
    _rodar(fimTimestamp) {
        if (this.intervaloId) clearInterval(this.intervaloId);
        const atualizar = () => {
            const restanteMs = fimTimestamp - Date.now();
            if (restanteMs <= 0) {
                clearInterval(this.intervaloId);
                this.intervaloId = null;
                localStorage.removeItem(this.chaveStorage);
                this.aoFinalizar();
                return;
            }
            this.aoAtualizar(Math.ceil(restanteMs / 1000));
        };
        atualizar();
        this.intervaloId = setInterval(atualizar, 1000);
    }

    static formatarTempo(totalSegundos) {
        const min = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
        const seg = String(totalSegundos % 60).padStart(2, '0');
        return `${min}:${seg}`;
    }
}
