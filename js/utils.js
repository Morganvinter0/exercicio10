// ===== FUNÇÕES UTILITÁRIAS =====

export function formatarMoeda(valor) {
    return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

export function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function extrairNomesDosPlanos(planos) {
    return planos.map(plano => plano.nome.toUpperCase());
}