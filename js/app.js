import { CatalogoPlanos, Saldo, Cronometro } from './classes.js';
import { formatarMoeda, normalizarTexto, extrairNomesDosPlanos } from './utils.js';

class Estacionamento {
    constructor() {
        try {
            this.catalogo = new CatalogoPlanos();
            this.planoAtivo = null; 
            this.saldo = new Saldo('saldoEstacionamento');
            this.cronometro = new Cronometro('estacionamentoFim', s => this.els.tempoCorrido.textContent = Cronometro.formatarTempo(s), () => this.els.tempoCorrido.textContent = 'Tempo esgotado!');
            this._mapearEConfigurar();
            this._exibirMetricasNoConsole();
        } catch (erro) {
            console.error("Falha crítica ao inicializar a classe Estacionamento:", erro);
        }
    }

    _mapearEConfigurar() {
        try {
            this.els = {
                saldo: document.getElementById('saldo'), 
                iptValor: document.getElementById('iptdepositar'),
                btnDeposito: document.getElementById('btndeposito'), 
                btnCalcular: document.getElementById('btncalcular'),
                tempoCorrido: document.getElementById('tempoCorrido')
            };
            this.botoesPlano = {};
            
            this.els.btnDeposito.onclick = () => this._depositar();
            this.els.btnCalcular.onclick = () => this._calcular();

            this.catalogo.lista.forEach(p => {
                const btn = document.getElementById(normalizarTexto(p.nome));
                if (btn) {
                    this.botoesPlano[p.nome] = btn;
                    btn.onclick = () => this._selecionarPlano(p);
                }
            });
            
            this.els.saldo.textContent = `Saldo: ${this.saldo.formatado()}`;
            if (!this.cronometro.retomarSeExistir()) this.els.tempoCorrido.textContent = '00:00';
        } catch (erro) {
            console.error("Erro ao mapear os elementos do DOM ou vincular eventos:", erro);
        }
    }

    _exibirMetricasNoConsole() {
        try {
            const nomesDisponiveis = extrairNomesDosPlanos(this.catalogo.lista);
            console.log("Planos carregados no sistema (Gerados com MAP):", nomesDisponiveis);

            const somaPrecos = this.catalogo.lista.reduce((acumulador, plano) => acumulador + plano.preco, 0);
            const mediaPreco = somaPrecos / this.catalogo.lista.length;
            
            console.log(`Média de preço dos planos disponíveis (Calculada com REDUCE): ${formatarMoeda(mediaPreco)}`);
        } catch (erro) {
            console.error("Erro ao processar métricas de arrays:", erro);
        }
    }

    _selecionarPlano(p) {
        const mesmo = this.planoAtivo === p;
        Object.values(this.botoesPlano).forEach(b => b?.classList.remove('selecionado'));
        this.planoAtivo = mesmo ? null : p;
        if (!mesmo) this.botoesPlano[p.nome]?.classList.add('selecionado');
        this.els.iptValor.value = '';
    }

    _depositar() {
        const v = parseFloat(this.els.iptValor.value);
        if (isNaN(v) || v <= 0) return alert('Digite um valor válido para depositar.');
        this.saldo.depositar(v);
        this.els.saldo.textContent = `Saldo: ${this.saldo.formatado()}`;
        this.els.iptValor.value = '';
    }

    _calcular() {
        if (this.planoAtivo) return this._efetivarCompra(this.planoAtivo, this.planoAtivo.preco);
        const v = parseFloat(this.els.iptValor.value);
        if (isNaN(v) || v <= 0) return alert('Selecione um plano ou digite um valor.');
        
        const plano = this.catalogo.encontrarPorValor(v);
        if (!plano) return alert(`Mínimo para estacionar é ${formatarMoeda(this.catalogo.VALOR_MINIMO)}.`);
        this._efetivarCompra(plano, v);
    }

    _efetivarCompra(p, v) {
        try { 
            this.saldo.debitar(p.preco); 
        } catch (erro) { 
            console.error("Tentativa de compra barrada por regra de negócio:", erro.message);
            return alert(`Saldo insuficiente. Requer ${formatarMoeda(p.preco)}.`); 
        }

        this.els.saldo.textContent = `Saldo: ${this.saldo.formatado()}`;
        const troco = v - p.preco;
        alert(`Plano ${p.nome} ativado!\nTempo: ${p.minutos} min${troco > 0 ? `\nTroco: \${formatarMoeda(troco)}` : ''}`);
        this.cronometro.iniciar(p.minutos);
        this._selecionarPlano(this.planoAtivo);
    }
}

try {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new Estacionamento());
    } else {
        new Estacionamento();
    }
} catch (erro) {
    console.error("Erro fatal no escopo de carregamento global:", erro);
}