/*      VARIAVEIS       */

var map;
var consultajson;
var ctx;
var ctxq;
var chart;
var icones = {};
var markerArray = [];
var tampop;
var markers;
var zoomrecente = [];
var dados = {};

var listainfra = [];
var listaprofissional = [];

const apinomes = {
  "enderecoantes" : "https://opencep.com/v1/",
  "enderecodepois" : "",
  "estado" : "uf",
  "cidade" : "localidade",
  "bairro" : "bairro",
  "ibge" : "ibge"
}

const mediaideb = {
  "br" : 5.6,
  "pr" : 6.5,
  "ce" : 6.5,
  "sc" : 6.2,
  "sp" : 6.2,
  "go" : 6.1,
  "es" : 6.1,
  "mg" : 6.1,
  "df" : 5.9,
  "mt" : 5.8,
  "rs" : 5.8,
  "al" : 5.7,
  "pi" : 5.7,
  "ac" : 5.7,
  "am" : 5.6,
  "ro" : 5.5,
  "rj" : 5.5,
  "to" : 5.4,
  "ro" : 5.4,
  "pb" : 5.3,
  "pe" : 5.3,
  "ms" : 5.3,
  "ma" : 5.1,
  "se" : 4.9,
  "ba" : 4.9,
  "rn" : 4.8,
  "ap" : 4.8,
  "pa" : 4.8
};

var mediaidebmunicipio = 0;


/*      FUNÇÕES       */

function conf(){
  pgindex();
}

function enulo(str){
  return (str === null) ? `` : str;
}


function consultacep(){
  let cep = document.getElementById(`index-cep`).value;
  if(cep !== ``){
    chamaget(`${apinomes.enderecoantes}${cep}${apinomes.enderecodepois}`,terconsultacep);
  }
  else {
    escreve(`Digite um número válido`,`index-span`);
  }

}

function terconsultacep(resp){
  if(JSON.parse(resp)){
    let txt = `<div class="corpo" >
    <div class="container" >
    <h1>Aguarde</h1>
        ${pgespera('var(--font-cor1)','var(--font-cor1)')}
    </div>
  </div>`;
  escreve(txt);
    consultajson = JSON.parse(resp);
    chamaget(`${endereco}jsoncidades/${trata2(consultajson[apinomes.estado])}-${trata2(consultajson[apinomes.cidade])}.json`,terchamajson);
  }
  else {
    escreve(`Digite um número válido`,`index-span`);
  }
}

function terchamajson(resp) {
    if(JSON.parse(resp)){
        let pdados = JSON.parse(resp);
        dados = pdados.dados;
        listainfra = [];
        escrevelista();
    }
    else{
        escreve(pgerro(`Não foi encontrado o endereço. Confira o CEP digitado e tente novamente!`));
    }

}

function escrevelista(){
  let txt = `<div class="container" >
  <h1>Consulta para ${consultajson[apinomes.cidade]} - ${consultajson[apinomes.estado]}</h1>
  <div class="corpo" id="div-estatisticas-municipio" style="border-bottom: 2px solid var(--font-cor2); margin-bottom: 15px;" ></div>
  <div class="corpo" >
    <div class="corpo" onchange="escrevelista2()" >
    <input type="checkbox" id="escolas-federal" checked >
    <label for="escolas-federal"> Federais</label> |
    <input type="checkbox" id="escolas-estadual" checked >
    <label for="escolas-estadual"> Estaduais</label> |
    <input type="checkbox" id="escolas-municipal" checked >
    <label for="escolas-municipal"> Municipais</label> |
    <input type="checkbox" id="escolas-particular" checked >
    <label for="escolas-particular"> Particulares</label>
    </div>
    <div class="corpo" id="div-mapa">
      <h2>Mapa</h2>
      <div id="map" class="corpo" style="height: 300px; margin-bottom: 30px;" ></div>
      <p>Ícones verdes mostram as escolas do bairro do CEP informado. Ícones vermelhos mostram as outras escolas do município.</p>
      <p>Nem todas escolas possuem georeferência cadastrada, de forma que o mapa omite algumas escolas. A lista completa segue abaixo.</p>
      <br></div>
    </div>
    <div class="corpo" >
      <h2>Lista</h2>
      <h3>Escolas no bairro do CEP consultados</h3>
      <div class="central" id="div-lista-escolas" ></div>
      <h3>Outras escolas no município</h3>
      <div class="central" id="div-lista-escolas-f" ></div>
    </div>
  </div>
  `;

  escreve(txt);
  tnpagina();

  let latp = -22.2443;
  let lonp = -45.7230;

  let qqcoisa = `${consultajson[apinomes.ibge]}05`;
  if(cidadesjs[qqcoisa]){
    tampop = parseInt(cidadesjs[`${consultajson[apinomes.ibge]}05`][`pop_2010`]);
    if(cidadesjs[`${consultajson[apinomes.ibge]}05`].lat !== 0 && cidadesjs[`${consultajson[apinomes.ibge]}05`].lon !== 0){
        latp = cidadesjs[`${consultajson[apinomes.ibge]}05`].lat;
        lonp = cidadesjs[`${consultajson[apinomes.ibge]}05`].lon;
    }
  }

  map = L.map('map').setView([latp, lonp], 12);

  icones['verde'] = L.icon({
   iconUrl: 'images/pin-verde.png',
   shadowUrl: 'images/sombra.png',

   iconSize:     [31, 44], // size of the icon
   shadowSize:   [36, 20], // size of the shadow
   iconAnchor:   [11, 34], // point of the icon which will correspond to marker's location
   shadowAnchor: [5, 5],  // the same for the shadow
   popupAnchor:  [-1, -38] // point from which the popup should open relative to the iconAnchor
 });

   icones['vermelho'] = L.icon({
     iconUrl: 'images/pin-vermelho.png',
     shadowUrl: 'images/sombra.png',

     iconSize:     [31, 44], // size of the icon
     shadowSize:   [36, 20], // size of the shadow
     iconAnchor:   [11, 34], // point of the icon which will correspond to marker's location
     shadowAnchor: [5, 5],  // the same for the shadow
     popupAnchor:  [-1, -38] // point from which the popup should open relative to the iconAnchor
 });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  markers = L.markerClusterGroup();

  escrevelista2();
}

function escrevelista2(){
  markers.clearLayers();

  let consultaescolas = [];

  if(document.getElementById(`escolas-federal`).checked){
    consultaescolas.push(`Federal`);
  }
  if(document.getElementById(`escolas-estadual`).checked){
    consultaescolas.push(`Estadual`);
  }
  if(document.getElementById(`escolas-municipal`).checked){
    consultaescolas.push(`Municipal`);
  }
  if(document.getElementById(`escolas-particular`).checked){
    consultaescolas.push(`Privada`);
  }

  let txtescolas = ``;
  let txtescolasf = ``;
  let bairrocep = trata(consultajson[apinomes.bairro]);

  let estmun = {
    "tamanho" : 0,
    "Federal" : 0,
    "Estadual" : 0,
    "Municipal" : 0,
    "Privada" : 0,
    "semagua" : 0,
    "semenergia" : 0,
    "semesgoto" : 0,
    "semideb" : 0,
    "semgeo" : 0
  };

  let contideb = 0;
  let somaideb = 0;


  for(let i in dados){
    for(let l in dados[i].LISTA_INFRAESTRUTURAS){
      if(listainfra.indexOf(dados[i].LISTA_INFRAESTRUTURAS[l]) === -1){
        listainfra.push(dados[i].LISTA_INFRAESTRUTURAS[l]);
      }
    }
    for(let l in dados[i].LISTA_PROFISSIONAIS){
      if(listaprofissional.indexOf(dados[i].LISTA_PROFISSIONAIS[l]) === -1){
        listaprofissional.push(dados[i].LISTA_PROFISSIONAIS[l]);
      }
    }
    estmun.tamanho++;
  //  if(estmun[dados[i].DEPENDENCIA]){
      estmun[dados[i].DEPENDENCIA] += 1;
//    }
    if(dados[i].ABASTECIMENTO_AGUA === `Não há abastecimento de água`){
      estmun.semagua++;
    }
    if(dados[i].ABASTECIMENTO_ENERGIA === `Não há energia elétrica`){
      estmun.semenergia++;
    }
    if(dados[i].ESGOTO === `Não há esgotamento sanitário` || dados[i].ESGOTO === `Não há tratamento de esgoto`){
      estmun.semesgoto++;
    }
    if (dados[i].IDEB_2023 !== null){
      let notanumeral = parseFloat(dados[i].IDEB_2023.replace(',','.'));
      if(!isNaN(notanumeral)){
        somaideb += notanumeral;
        contideb++;
      }
      else{
          if(dados[i].DEPENDENCIA !== `Privada`){
              estmun.semideb++;
          }
      }
    }
    else{
         if(dados[i].DEPENDENCIA !== `Privada`){
             estmun.semideb++;
         }
    }
      if(dados[i].NO_MUNICIPIO === `${consultajson[apinomes.cidade]}` && dados[i].SG_UF === `${consultajson[apinomes.estado]}` && trata(dados[i].NO_BAIRRO) === bairrocep) {
        if(consultaescolas.indexOf(dados[i].DEPENDENCIA) !== -1){
          txtescolas += `<a href="javascript:pgescola(${i})" class="bt-download-pq" style="color: #000000;" >${dados[i].NO_ENTIDADE}</a><br>`;
          if(dados[i].longitude !== null){
            let txtpopup = `<h1>${dados[i].NO_ENTIDADE}</h1>
            <p></p>
            <p><a href="javascript:pgescola(${i})" >Veja mais</a></p>
            `;
            let mvalendo = L.marker([dados[i].latitude, dados[i].longitude], {icon: icones['verde']});
            mvalendo.bindPopup(txtpopup);
            markers.addLayer(mvalendo);  
            zoomrecente = [dados[i].latitude, dados[i].longitude];
          }
        }
        if(dados[i].longitude === null){
            estmun.semgeo++;
        }
      }
      else {
       if(consultaescolas.indexOf(dados[i].DEPENDENCIA) !== -1){
         txtescolasf += `<a href="javascript:pgescola(${i})" class="bt-download-pq" style="color: #000000;" >${dados[i].NO_ENTIDADE}</a><br>`;
          if(dados[i].longitude !== null){
            let txtpopup = `<h1>${dados[i].NO_ENTIDADE}</h1>
            <p></p>
            <p><a href="javascript:pgescola(${i})" >Veja mais</a></p>
            `;
            let mvalendo = L.marker([dados[i].latitude, dados[i].longitude], {icon: icones['vermelho']});
            mvalendo.bindPopup(txtpopup);
            markers.addLayer(mvalendo); 
          }
      }
        if(dados[i].longitude === null){
            estmun.semgeo++;
        }
      }
    }

  if(txtescolas === ``) {
    txtescolas = `<h2>Desculpe! Não há escolas cadastradas na nossa base dados para o seu CEP.</h2>`;
  }
  if(txtescolasf === ``) {
    txtescolasf = `<h2>Desculpe! Não há escolas cadastradas na nossa base dados para o seu CEP.</h2>`;
  }

  map.addLayer(markers);
  map.setView(zoomrecente, 15);

  escreve(txtescolas,`div-lista-escolas`);
  escreve(txtescolasf,`div-lista-escolas-f`);

  mediaidebmunicipio = somaideb / contideb;

  let populacao = (tampop > 0) ? `${tampop} habitantes` : `Sem dados cadastrados`;

  let txtestatisticas = `<h2>Estatísticas do Município</h2>
    <p>População: <b>${populacao}</b>;</p>
    <p>Tem o total de <b>${estmun.tamanho}</b> escolas cadastradas na base dados, sendo:</p>
    <p>Escolas Federais: <b style="color: #497d83;" >${estmun[`Federal`]} (${escporcento(estmun[`Federal`],estmun.tamanho).toFixed(2)}%)</b> | Escolas Estaduais: <b style="color: #584983;" >${estmun[`Estadual`]} (${escporcento(estmun[`Estadual`],estmun.tamanho).toFixed(2)}%)</b> | Escolas Municipais: <b style="color: #498349;" >${estmun[`Municipal`]} (${escporcento(estmun[`Municipal`],estmun.tamanho).toFixed(2)}%)</b> | Escolas Particulares: <b style="color: #834949;" >${estmun[`Privada`]} (${escporcento(estmun[`Privada`],estmun.tamanho).toFixed(2)}%)</b>;</p>
    <div class="barra-escola-fundo-q" >
      <div class="barra-escola-display-q" style="background: #497d83; width: ${escporcento(estmun[`Federal`],estmun.tamanho)}%;" ></div>
      <div class="barra-escola-display-q" style="background: #584983; width: ${escporcento(estmun[`Estadual`],estmun.tamanho)}%;" ></div>
      <div class="barra-escola-display-q" style="background: #498349; width: ${escporcento(estmun[`Municipal`],estmun.tamanho)}%;" ></div>
      <div class="barra-escola-display-q" style="background: #834949; width: ${escporcento(estmun[`Privada`],estmun.tamanho)}%;" ></div>
    </div>
    <h3>IDEB</h3>
    <p>Média no IDEB: <b>${mediaidebmunicipio.toFixed(1)}</b>;</p>
    <p><b>${estmun.semideb}</b> escolas públicas estão sem as notas do IDEB cadastradas na base de dados.</p>
    <h3>Carências</h3>
    <p>Escolas Sem Energia Elétrica: <b>${estmun[`semenergia`]} (${escporcento(estmun[`semenergia`],estmun.tamanho).toFixed(2)}%)</b>;</p>
    <p>Escolas Sem Água Encanada: <b>${estmun[`semagua`]} (${escporcento(estmun[`semagua`],estmun.tamanho).toFixed(2)}%)</b>;</p>
    <p>Escolas Sem Rede de Esgoto: <b>${estmun[`semesgoto`]} (${escporcento(estmun[`semesgoto`],estmun.tamanho).toFixed(2)}%)</b>;</p>
    <br>
    <p>Escolas Sem Georeferenciamento cadastrado: <b>${estmun[`semgeo`]} (${escporcento(estmun[`semgeo`],estmun.tamanho).toFixed(2)}%)</b>;</p>
  `;

  escreve(txtestatisticas,`div-estatisticas-municipio`);
}

function escporcento(tam,total){
  return (tam === 0) ? 0 : ((tam / total) * 100);
}

/*      PÁGINAS       */

function pgteste(){

  let cont = 0;

  let txt = `dados = [
    `;

  for(let i in dados){
    if(dados[i].SG_UF === `SP`){
      if(cont !== 0) { txt += `, `; }
      txt += JSON.stringify(dados[i]);
      cont++;
    }
  }

  txt += `
];`;

escreve(txt);
}

function pgindex(){
  let txt = `<div class="container" style="margin-top: 3%;" >

    <h1> Para consultar as escolas da sua região insira o seu CEP na caixa de texto abaixo. </h1>
    <h2>Digite seu CEP (apenas números)</h2>
    <p><b>⚠️ - Por ora, apenas CEPs do estado de São Paulo estão cadastrados no sistema.</b></p>
    <input type="number" id="index-cep" class="blog-input-texto" ><br>
    <a href="javascript:consultacep()" class="bt-download-pq" style="color: #000000;" >Enviar</a>
    <span style="clor: #500000; font-size: 1.8em;" id="index-span" ></span>
    <h3> Fazendo a pesquisa você conseguirá acessar dados dos colegios da sua região, podendo também ter um comparativo dos seus índices em relação aos outros colegios. </h3>
  </div>`;

  escreve(txt);
  tnpagina();
}

function pgescola(i){

  let acessivel = (dados[i].TAXA_DE_ACESSIBILIDADE > 0) ? `Adaptada`: `Não adaptada`;

  let txtinfratem = ``;
  let txtinfrantem = ``;

  for(let infra in listainfra){
    if(dados[i].LISTA_INFRAESTRUTURAS.indexOf(listainfra[infra]) !== -1){
      txtinfratem += `<p>✅ <b>${listainfra[infra]}</b>;</p>`;
    }
    else{
      txtinfrantem += `<p>❌ <s style="opacity: .8;" >${listainfra[infra]}</s>;</p>`;
    }
  }

  let txtproftem = ``;
  let txtprofntem = ``;

  for(let prof in listaprofissional){
    if(dados[i].LISTA_PROFISSIONAIS.indexOf(listaprofissional[prof]) !== -1){
      txtproftem += `<p>✅ <b>${listaprofissional[prof]}</b>;</p>`;
    }
    else{
      txtprofntem += `<p>❌ <s style="opacity: .8;" >${listaprofissional[prof]}</s>;</p>`;
    }
  }

  let notainfra = (dados[i].LISTA_INFRAESTRUTURAS.length === 0) ? 0 : ((dados[i].LISTA_INFRAESTRUTURAS.length/listainfra.length) * 100);
  let notaprofissional = (dados[i].LISTA_PROFISSIONAIS.length === 0) ? 0 : ((dados[i].LISTA_PROFISSIONAIS.length/listaprofissional.length) * 100);

  let notaideb = ``;

  if (dados[i].IDEB_2023 !== null){
    let notanumeral = parseFloat(dados[i].IDEB_2023.replace(',','.'));
    if(!isNaN(notanumeral)){
      notaideb = `<div class="corpo" >
        <div class="celula-escola" >
          <h2>Nota IDEB</h2>
          <h3>Média escola: <span style="color: #497d83;" >${notanumeral}</span></h3>
          <div class="corpo" >
            <div class="barra-escola-fundo" >
              <div class="barra-escola-display" style="width: ${notanumeral * 10}%; background: #497d83;" ></div>
            </div>
          </div>
          <h3>Média do município: <span style="color: #498349;" >${mediaidebmunicipio.toFixed(1)}</span></h3>
          <div class="corpo" >
            <div class="barra-escola-fundo" >
              <div class="barra-escola-display" style="width: ${mediaidebmunicipio * 10}%; background: #498349;" ></div>
            </div>
          </div>
          <h3>Média do estado de ${dados[i].NO_UF}: <span style="color: #498349;" >${mediaideb[dados[i].SG_UF.toLowerCase()]}</span></h3>
          <div class="corpo" >
            <div class="barra-escola-fundo" >
              <div class="barra-escola-display" style="width: ${mediaideb[dados[i].SG_UF.toLowerCase()] * 10}%; background: #498349;" ></div>
            </div>
          </div>
          <h3>Média Brasil: <span style="color: #498349;" >${mediaideb['br']}</span></h3>
          <div class="corpo" >
            <div class="barra-escola-fundo" >
              <div class="barra-escola-display" style="width: ${mediaideb['br'] * 10}%; background: #498349;" ></div>
            </div>
          </div>
        </div>
      </div>`;
    }
  }

  let emojiagua = (dados[i].ABASTECIMENTO_AGUA === `Não há abastecimento de água`) ? `❌` : `✅`;
  let emojienergia = (dados[i].ABASTECIMENTO_ENERGIA === `Não há energia elétrica`) ? `❌` : `✅`;
  let emojiesgoto = (dados[i].ESGOTO === `Não há esgotamento sanitário` || dados[i].ESGOTO === `Não há tratamento de esgoto`) ? `❌` : `✅`;

  let txt = `<div class="container" >
    <button class="botao" onclick="escrevelista()" >
    Voltar</button>
    <h1>${enulo(dados[i].NO_ENTIDADE)}</h1>
    <h2>Endereço</h2>
    <p>${enulo(dados[i].DS_ENDERECO)} ${enulo(dados[i].NU_ENDERECO)} ${enulo(dados[i].DS_COMPLEMENTO)}, ${enulo(dados[i].NO_BAIRRO)}. ${enulo(dados[i].NO_MUNICIPIO)} - ${enulo(dados[i].SG_UF)};</p>
      <div id="map" class="corpo" style="height: 300px; margin-bottom: 30px;" ></div><br><br>
    <h2>Atributos</h2>
    <div class="corpo" >
      <div class="duplo" >
        <div class="celula-escola" id="div-acessibilidade" >
          <h3>Acessibilidade</h3>
          <svg viewBox="0 0 421, 403" style="width: 80%;" ><g
           id="g1"
           transform="translate(-69.575092,-492.83418)"><path
             id="path2"
             style="fill:#22d1fa;fill-opacity:1;stroke-width:3.77953"
             d="m 278.16406,557.83008 a 43.387115,43.387115 0 0 0 -43.38672,43.38672 43.387115,43.387115 0 0 0 43.38672,43.38672 43.387115,43.387115 0 0 0 43.38672,-43.38672 43.387115,43.387115 0 0 0 -43.38672,-43.38672 z M 96.761719,622.68164 a 17.305492,17.305492 0 0 0 -17.306641,17.30469 17.305492,17.305492 0 0 0 17.306641,17.30664 17.305492,17.305492 0 0 0 17.304691,-17.30664 17.305492,17.305492 0 0 0 -17.304691,-17.30469 z m 366.470701,0 a 17.305492,17.305492 0 0 0 -17.30664,17.30469 17.305492,17.305492 0 0 0 17.30664,17.30664 17.305492,17.305492 0 0 0 17.30469,-17.30664 17.305492,17.305492 0 0 0 -17.30469,-17.30469 z m -82.60937,219.89844 a 17.305492,17.305492 0 0 0 -17.30664,17.30664 17.305492,17.305492 0 0 0 17.30664,17.30469 17.305492,17.305492 0 0 0 17.30468,-17.30469 17.305492,17.305492 0 0 0 -17.30468,-17.30664 z m -203.32032,0.42773 a 17.305492,17.305492 0 0 0 -17.30664,17.30469 17.305492,17.305492 0 0 0 17.30664,17.30664 17.305492,17.305492 0 0 0 17.30469,-17.30664 17.305492,17.305492 0 0 0 -17.30469,-17.30469 z" /><path
             style="fill:var(--font-cor1)"
             d="m 258.73707,895.36038 c -12.43582,-1.08305 -42.7703,-8.72293 -48.01103,-12.0918 -0.95721,-0.61532 1.16874,-6.26088 4.3913,-11.66127 0.13564,-0.2273 4.63564,1.00483 10,2.73808 5.36436,1.73326 11.77838,3.44343 14.25338,3.80039 2.475,0.35696 5.175,0.98521 6,1.39611 0.825,0.41089 8.7,1.54041 17.5,2.51003 13.90012,1.53158 17.64053,1.60194 28.5,0.53609 18.06316,-1.77289 31.37016,-4.38817 43.12138,-8.47485 l 6.84356,-2.37995 3.01753,5.57128 c 1.65964,3.0642 3.01753,5.86586 3.01753,6.22591 0,0.70841 -3.11054,1.79558 -15.5,5.41743 -23.41478,6.84492 -45.7162,8.80036 -73.13365,6.41255 z m -92.36635,-9.96655 c -5.82955,-2.57212 -11.50945,-8.09803 -14.77375,-14.37323 -5.38833,-10.35837 -2.40304,-25.74754 6.51334,-33.57622 6.43491,-5.64992 11.46348,-7.25541 20.88395,-6.66769 6.544,0.40827 8.36285,0.22175 8.79399,-0.90177 0.29896,-0.77907 3.38774,-5.79 6.86395,-11.13541 3.47622,-5.3454 11.40808,-17.81891 17.62636,-27.71891 10.82008,-17.22645 18.76023,-29.63142 40.22105,-62.83773 10.84439,-16.77953 12.87111,-20.12161 12.87111,-21.22464 0,-0.77156 -3.62857,-1.39585 -10.75,-1.84951 -26.75637,-1.70448 -61.59138,-9.69355 -93.25,-21.38598 -14.74477,-5.44566 -16.03846,-5.96967 -26.83913,-10.87139 -4.03653,-1.83191 -7.51686,-3.33075 -7.73407,-3.33075 -0.21722,0 -3.11707,-1.31862 -6.44412,-2.93026 l -6.04919,-2.93027 -5.71674,2.52933 c -7.80491,3.45322 -15.056495,3.41176 -22.54081,-0.12889 -8.98273,-4.24951 -14.918709,-12.35087 -16.216177,-22.13167 -2.095672,-15.79794 8.950164,-30.43677 24.166212,-32.027 10.077865,-1.05324 15.796075,0.88081 22.538325,7.62306 8.34392,8.34392 10.45449,17.3228 7.28583,30.9957 -0.54073,2.33328 0.0418,2.77984 8.73525,6.69619 5.12304,2.30791 12.23962,5.3735 15.81462,6.81243 3.575,1.43893 7.85,3.22542 9.5,3.96997 5.65696,2.55267 33.99971,11.67434 45.5,14.64345 50.54226,13.04888 96.15124,13.02353 146.5,-0.0814 23.57769,-6.13688 44.07226,-13.16939 67,-22.99041 16.28646,-6.97624 19.08669,-8.59698 18.61085,-10.77169 -0.21403,-0.97819 -0.43601,-5.15352 -0.49329,-9.27852 -0.082,-5.90756 0.37154,-8.45547 2.13619,-12 5.97247,-11.9965 16.13971,-17.47086 29.51802,-15.89343 17.2812,2.03762 28.14067,20.97835 21.98318,38.34233 -1.10512,3.11639 -3.60639,6.81997 -6.75495,10.00191 -8.93949,9.03424 -20.24601,10.84369 -31.95664,5.11421 l -5.6064,-2.74296 -17.71848,7.65488 c -9.74516,4.21019 -19.51848,8.3494 -21.71848,9.19825 -2.2,0.84885 -5.04263,1.94827 -6.31696,2.44316 -3.82459,1.48528 -22.0972,7.51587 -31.18304,10.29147 -18.91377,5.7779 -50.08962,11.74713 -68.25,13.06779 -5.3625,0.38997 -9.75,1.13866 -9.75,1.66375 0,1.28003 7.40045,12.92211 30.5,47.98136 7.15,10.85188 15.54181,23.70118 18.64846,28.55399 3.10666,4.85281 11.31605,17.64341 18.24309,28.42355 l 12.59463,19.60025 7.25691,-0.46107 c 3.9913,-0.2536 9.10652,0.0392 11.36716,0.65065 5.10173,1.37991 12.53799,7.80503 16.15555,13.95881 2.39969,4.08207 2.7342,5.69101 2.7342,13.1511 0,7.08698 -0.4142,9.31106 -2.49163,13.37891 -6.6574,13.03594 -23.44441,19.4595 -35.29821,13.50687 -9.85964,-4.95123 -14.44708,-10.38101 -16.68288,-19.74615 -2.04528,-8.56712 -0.55555,-15.91586 5.04416,-24.88241 1.00807,-1.61418 0.33765,-3.19131 -4.60085,-10.82336 -10.52162,-16.26031 -12.10756,-18.731 -29.4852,-45.93386 -17.85919,-27.95669 -20.23284,-31.59756 -26.07775,-40 -1.91296,-2.75 -6.99391,-10.5125 -11.29099,-17.25 -4.29709,-6.7375 -8.14275,-12.25 -8.54592,-12.25 -0.40317,0 -4.91997,6.6375 -10.03734,14.75 -5.11737,8.1125 -10.06927,15.65 -11.00421,16.75 -0.93495,1.1 -8.5895,13.025 -17.01012,26.5 -8.42062,13.475 -18.02006,28.775 -21.33209,34 -3.31203,5.225 -7.4417,11.75 -9.17705,14.5 -1.73534,2.75 -4.99496,7.85999 -7.2436,11.35553 l -4.08842,6.35553 2.86607,4.51933 c 7.48936,11.80948 5.57065,26.65089 -4.70757,36.41359 -8.36455,7.94501 -19.42077,10.10423 -29.3364,5.72925 z M 184.12986,871.526 c 12.87569,-7.8504 7.55997,-27.0054 -7.49429,-27.0054 -5.67058,0 -10.05819,2.7659 -12.80077,8.06946 -6.31669,12.21513 8.55697,26.09274 20.29506,18.93594 z m 202.0307,0.0898 c 4.87372,-2.50221 7.59478,-7.27771 7.59478,-13.32896 0,-14.31388 -19.48635,-19.31738 -26.75595,-6.87011 -2.52834,4.32911 -2.46857,11.49462 0.12509,14.9973 5.03103,6.79428 12.14688,8.73875 19.03608,5.20177 z M 104.66494,652.83171 c 3.29796,-1.66208 6.44495,-6.46135 7.33867,-11.19175 0.85197,-4.50941 -2.54243,-11.48392 -6.87458,-14.12527 -3.87887,-2.36498 -9.752415,-2.56879 -14.107186,-0.48952 -7.620794,3.63869 -10.141958,14.36558 -5.115078,21.7633 1.394828,2.05267 2.632328,3.73891 2.75,3.74719 0.117672,0.008 2.013949,0.65281 4.213949,1.43229 4.19863,1.48761 7.152565,1.20303 11.794225,-1.13624 z m 364.71595,-0.56111 c 7.59539,-5.16938 10.06161,-13.48781 5.82813,-19.65805 -3.76876,-5.49293 -7.17494,-7.47657 -12.8383,-7.47657 -6.26638,0 -9.65404,2.30082 -12.88828,8.75337 -2.10624,4.20212 -2.25391,5.21331 -1.25042,8.56263 3.1005,10.34858 13.36699,15.11492 21.14887,9.81862 z m -57.51017,182.51624 c -1.65,-2.5634 -3.14487,-5.00659 -3.32194,-5.4293 -0.26747,-0.63853 3.04633,-4.67666 8.39188,-10.22617 3.00439,-3.11902 14.13854,-18.94125 18.36815,-26.10214 17.98461,-30.44858 26.9031,-63.00279 27.018,-98.62095 l 0.0439,-13.61232 5.56836,-0.65445 c 3.06259,-0.35995 5.98759,-0.39535 6.5,-0.0787 1.46446,0.90509 1.08942,24.91369 -0.61806,39.56481 -1.3092,11.23377 -4.26481,24.93636 -8.28124,38.39294 -5.02371,16.83137 -18.08123,42.22599 -30.26303,58.85641 -7.28531,9.94579 -18.09724,22.50499 -19.40603,22.54216 -0.55,0.0156 -2.35,-2.06892 -4,-4.63233 z M 136.4691,832.88526 c -24.4412,-27.21986 -41.791055,-61.88391 -49.104349,-98.1078 -2.643169,-13.09202 -4.369983,-34.64012 -3.694253,-46.09887 0.302997,-5.13811 0.696999,-9.46485 0.87556,-9.61499 0.178561,-0.15014 2.912157,0.21304 6.074657,0.80707 l 5.75,1.08005 v 12.36488 c 0,27.25666 6.075495,56.15221 16.619575,79.04413 1.85924,4.03653 3.38043,7.54789 3.38043,7.80302 0,1.10421 11.59672,20.42957 15.81676,26.35785 2.54486,3.575 7.50556,9.80482 11.02378,13.84404 7.08618,8.13556 7.07349,7.98786 1.29054,15.02062 l -2.76672,3.36466 z M 265.75291,655.48575 c -12.67591,-2.51105 -29.35431,-15.48419 -35.71952,-27.7841 -3.53043,-6.82209 -6.66267,-19.62157 -6.66267,-27.22614 0,-6.83033 2.99178,-18.28462 6.77924,-25.95491 7.24246,-14.66728 22.46973,-26.41753 37.66359,-29.06343 22.43469,-3.90683 43.11163,5.12611 55.92608,24.4319 6.32674,9.53163 8.10653,16.36183 8.11214,31.13153 0.007,18.79366 -3.18963,27.04564 -15.22108,39.29107 -6.9164,7.03941 -17.52739,13.18285 -25.74612,14.90622 -6.66052,1.39663 -18.78141,1.52582 -25.13166,0.26786 z m 31.11781,-17.32082 c 8.74801,-4.77325 13.53792,-9.34407 17.32633,-16.53384 11.58917,-21.99431 2.78905,-48.80382 -19.63412,-59.8152 -5.13467,-2.52149 -6.72067,-2.79529 -16.19221,-2.79529 -9.68224,0 -11.00623,0.24175 -17,3.1041 -23.51023,11.22738 -31.51871,41.4161 -16.82438,63.42103 4.84205,7.25104 11.76653,12.01264 23.82438,16.38279 0.825,0.29901 6,0.4339 11.5,0.29977 9.48483,-0.23132 10.36062,-0.44065 17,-4.06336 z M 437.37523,599.7706 c -9.53712,-18.17833 -31.92843,-44.13708 -49.50451,-57.39171 -7.68416,-5.79485 -20.98926,-14.25036 -25.5,-16.20549 -13.43421,-5.82289 -22.85247,-9.35488 -36.1641,-13.56208 -24.99054,-7.89836 -68.13931,-7.85655 -93.8359,0.0909 -37.18976,11.50211 -56.11919,22.55564 -80,46.71471 -12.57295,12.71945 -19.99456,22.18628 -28.54292,36.40867 -2.54378,4.23223 -4.84021,7.69496 -5.10317,7.69496 -2.0065,0 -10.62247,-3.53629 -10.99757,-4.51377 -0.61711,-1.60816 8.99804,-17.3993 17.92718,-29.44213 11.80351,-15.91956 39.27283,-41.64373 48.02024,-44.96949 1.32536,-0.5039 4.8367,-2.46686 7.80299,-4.36214 13.38311,-8.55101 33.65991,-17.18565 49.89325,-21.24649 46.37162,-11.60004 91.45013,-6.77459 133.5,14.29058 4.95,2.47973 11.25,5.92165 14,7.64871 2.75,1.72706 6.13994,3.6383 7.53321,4.2472 3.62641,1.58487 17.21455,12.50447 25.85266,20.77551 13.10064,12.54396 27.66681,31.50405 37.47809,48.78347 l 2.67516,4.71145 -5.36605,2.53855 c -2.95133,1.3962 -5.7734,2.53855 -6.27128,2.53855 -0.49787,0 -2.02665,-2.1375 -3.39728,-4.75 z"
             id="path1" /></g></svg><br></br><b>${acessivel}</b>
        </div>
      </div>
      <div class="duplo" >
        <div class="celula-escola" id="div-infra-basica" >
          <div class="corpo" >
            <h3>Infraestrutura Básica</h3>
          </div>
          <div class="corpo" >
            <table style="width: 100%" >
            <tr>
              <td>💧 Abastecimento de Água</td>
              <td>${emojiagua} ${dados[i].ABASTECIMENTO_AGUA}</td>
            </tr>
            <tr style="background: rgba(0,0,0,.2);" >
              <td>⚡ Abastecimento de Energia</td>
              <td>${emojienergia} ${dados[i].ABASTECIMENTO_ENERGIA}</td>
            </tr>
            <tr>
              <td>🚽 Esgoto</td>
              <td>${emojiesgoto} ${dados[i].ESGOTO}</td>
            </tr>
            <tr style="background: rgba(0,0,0,.2);" >
              <td>🏫 Imóvel</td>
              <td>${dados[i].PREDIO_ESCOLAR}</td>
            </tr>
            <tr>
                <td>⬆︎ Depêndencia</td>
                <td>${dados[i].DEPENDENCIA}</td>
              </tr>
              <tr style="background: rgba(0,0,0,.2);" >
                <td>💼 Atividade</td>
                <td>${dados[i].ATIVIDADE}</td>
              </tr>
              <tr>
                <td>🤝 Vínculos Públicos</td>
                <td>${dados[i].VÍNCULOS_PUBLICOS}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="corpo" >
      <div class="celula-escola" >
        <h3>Infraestrutura Extra<sup>*</sup></h3>
        <p>Infraestrutura: <b>${dados[i].LISTA_INFRAESTRUTURAS.length}/${listainfra.length}</b></p>
        <div class="corpo" >
          <div class="barra-escola-fundo" >
            <div class="barra-escola-display" style="width: ${notainfra}%; background: #498349;" ></div>
          </div>
        </div>
        ${txtinfratem}${txtinfrantem}
      </div>
    </div>
    <div class="corpo" >
      <div class="celula-escola" >
        <h3>Profissionais<sup>*</sup></h3>
        <p>Infraestrutura: <b>${dados[i].LISTA_PROFISSIONAIS.length}/${listaprofissional.length}</b></p>
        <div class="corpo" >
          <div class="barra-escola-fundo" >
            <div class="barra-escola-display" style="width: ${notaprofissional}%; background: #498349;" ></div>
          </div>
        </div>
        ${txtproftem}${txtprofntem}
      </div>
    </div>
    <p><sub>*- De acordo com os dados cadastrados no censo escolar de 2023.</sub></p>
    ${notaideb}
  </div>`;

  escreve(txt);
  tnpagina();

  if(dados[i].latitude !== null){
    map = L.map('map').setView([-22.2443, -45.7230], 12);

    icones['verde'] = L.icon({
     iconUrl: 'images/pin-verde.png',
     shadowUrl: 'images/sombra.png',

     iconSize:     [31, 44], // size of the icon
     shadowSize:   [36, 20], // size of the shadow
     iconAnchor:   [11, 34], // point of the icon which will correspond to marker's location
     shadowAnchor: [5, 5],  // the same for the shadow
     popupAnchor:  [-1, -38] // point from which the popup should open relative to the iconAnchor
   });

   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 19,
   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 }).addTo(map);

   L.marker([dados[i].latitude, dados[i].longitude], {icon: icones['verde']}).addTo(map);
     map.setView([dados[i].latitude, dados[i].longitude], 20);
  }
  else {
    document.getElementById('map').style.display = `none`;
  }

  let da = document.getElementById('div-acessibilidade');
 let dc = document.getElementById('div-infra-basica');

}

function pgsobre(){

  let txt = `<div class= "sobreNos"><h1> <p>No EduMapa, acreditamos que a transparência e o acesso à informação são fundamentais para a melhoria da educação pública. Nosso objetivo é fornecer uma visão clara e acessível sobre a situação estrutural e o desempenho acadêmico das escolas públicas em todo o país.
</p>
<p>
Com base em dados coletados de fontes governamentais, nossa plataforma oferece informações que ajudam familias, gestores, educadores e a sociedade a identificar desafios e buscar soluções.
</p>
<p>
Somos uma equipe comprometida com a educação, a inovação e o impacto social. Por meio de tecnologia e dados, buscamos promover um futuro onde todos os estudantes tenham acesso a escolas seguras, bem estruturadas e com ensino de qualidade.
</p>
<p>
Junte-se a nós nessa missão e faça parte da transformação da educação pública!
</h1></div>
<div class="corpo" >
    <div class="container" >
    <h2>Histórico</h2>
        <p><b>EduMapa</b> foi desenvolvido durante um hackathon em celebração ao <b>Aaron Swartz Day 2024</b>, realizado nos dias 16 e 17 de novembro de 2024 e promovido pelo <b><a href="https://institutoasw.org/"  target="_blank" rel="noopener noreferrer">Instituto Aaron Swartz</a></b> e a <b>Creative Commons BR</b> e co-organizado pelo <b><a href="https://inatel.br/"  target="_blank" rel="noopener noreferrer">Inatel</a></b>.</p>
    </div>
    <img src="${endereco}img/asd24.png" alt="imagem meramente ilustrativa sobre o Aaron Swartz Day 2024" >
</div>
<div class="container" >
    <h2>Time</h2>
    <img src="${endereco}img/time.jpeg" alt="imagem meramente ilustrativa sobre o Time" >
    <p>
        <ul style="display: inline-block;" >
            <li><b><a href="https://github.com/georgiacavallaro"  target="_blank" rel="noopener noreferrer">Georgia Cavallaro</a></b></li>
            <li><b><a href="https://github.com/vitortiz"  target="_blank" rel="noopener noreferrer">Vitor Ortiz</a></b></li>
            <li><b><a href="https://github.com/wantuelfer"  target="_blank" rel="noopener noreferrer">Wantu Fernandes</a></b></li>
            <li><b><a href="https://github.com/biancamds"  target="_blank" rel="noopener noreferrer">Bianca Santos</a></b></li>
            <li><b><a href="https://github.com/Vinicios00"  target="_blank" rel="noopener noreferrer">Vinicios Gimenez</a></b></li>
        </ul>
    </p>
</div>
`;

  escreve(txt);
  tnpagina();
}
