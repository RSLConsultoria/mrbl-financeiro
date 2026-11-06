// Aba Logs: quem fez o quê, quando e em que tela.
var TZ = 'America/Sao_Paulo';
function agora_() { return Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm"); }
function hoje_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }

var Logs = {
  registrar: function (por, tela, txt) {
    SpreadsheetApp.getActive().getSheetByName('Logs').appendRow([agora_(), por, tela, txt]);
  },
  // Mais recentes primeiro, 15 por página, com filtro por usuário e busca no texto.
  listar: function (d) {
    var porPagina = 15;
    var busca = String(d.busca || '').trim().toUpperCase();
    var lista = Db.todos('Logs').reverse().filter(function (x) {
      return (!d.usuario || x.por === d.usuario) && (!busca || String(x.txt).toUpperCase().indexOf(busca) >= 0);
    });
    var paginas = Math.max(1, Math.ceil(lista.length / porPagina));
    var pagina = Math.min(Math.max(0, Number(d.pagina) || 0), paginas - 1);
    return { itens: lista.slice(pagina * porPagina, pagina * porPagina + porPagina), total: lista.length, pagina: pagina, paginas: paginas };
  }
};
