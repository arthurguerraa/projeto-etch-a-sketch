  // ---------- Configurações ----------
    const TAMANHO_PADRAO = 16;
    const TAMANHO_MAXIMO = 100;

    const elementoGrade = document.getElementById('grade');
    const botaoRedimensionar = document.getElementById('btn-redimensionar');
    const botaoLimpar = document.getElementById('btn-limpar');
    const inputCor = document.getElementById('input-cor');
    const chkAleatorio = document.getElementById('chk-aleatorio');
    const modoText = document.getElementById('modo-text');

    let tamanhoAtual = TAMANHO_PADRAO;

    // estado de desenho (true enquanto o botão do mouse estiver pressionado ou durante toque)
    let estaDesenhando = false;

    // modo de cores: true = aleatória, false = usar cor fixa (inputCor.value)
    let usarCorAleatoria = true;

    // ---------- Utilitários ----------
    // retorna uma string 'rgb(r, g, b)' aleatória
    function corAleatoria() {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    }

    // retorna a cor atual a ser usada (texto CSS), dependendo do modo
    function obterCorAtual() {
      if (usarCorAleatoria) {
        return corAleatoria();
      } else {
        // inputCor.value retorna cor em hexadecimal (#rrggbb) — é válido em style.backgroundColor
        return inputCor.value;
      }
    }

    // ---------- Funções principais ----------
    function criarGrade(tamanho) {
      // limpa grade antiga
      elementoGrade.innerHTML = '';

      // calcula tamanho utilizável do container para manter quadrados perfeitos
      const larguraContainer = elementoGrade.clientWidth;
      const alturaContainer = elementoGrade.clientHeight;
      const areaUsavel = Math.min(larguraContainer, alturaContainer);
      const tamanhoCelula = Math.floor(areaUsavel / tamanho);

      const total = tamanho * tamanho;
      for (let i = 0; i < total; i++) {
        const celula = document.createElement('div');
        celula.classList.add('celula');

        // define dimensões exatas (inline)
        celula.style.width = `${tamanhoCelula}px`;
        celula.style.height = `${tamanhoCelula}px`;

        // EVENTS: mouse / touch
        // mousedown inicia desenho e pinta a célula
        celula.addEventListener('mousedown', (e) => {
          if (e.button === 0) {
            estaDesenhando = true;
            pintarCelula(celula);
          }
        });

        // mouseenter pinta apenas se estiver no modo desenhar
        celula.addEventListener('mouseenter', () => {
          if (estaDesenhando) pintarCelula(celula);
        });

        // click pinta em cliques simples
        celula.addEventListener('click', () => {
          pintarCelula(celula);
        });

        // touchstart inicia desenho e pinta a célula
        celula.addEventListener('touchstart', (e) => {
          e.preventDefault();
          estaDesenhando = true;
          pintarCelula(celula);
        }, { passive: false });

        elementoGrade.appendChild(celula);
      }
    }

    // pinta uma célula usando a cor atual (aleatória ou escolhida)
    function pintarCelula(celula) {
      const cor = obterCorAtual();
      celula.style.backgroundColor = cor;
    }

    // limpa a grade (remove cor de fundo nas células)
    function limparGrade() {
      const celulas = elementoGrade.querySelectorAll('.celula');
      celulas.forEach(c => {
        c.style.backgroundColor = '';
      });
    }

    // pede o novo tamanho ao usuário, valida e recria a grade
    function pedirTamanhoERecriar() {
      let entrada = prompt(`Quantos quadrados por lado? (máx ${TAMANHO_MAXIMO})`, tamanhoAtual);
      if (entrada === null) return; // cancelou

      entrada = entrada.trim();
      if (entrada === '') {
        alert('Digite um número válido.');
        return;
      }

      const n = Number(entrada);
      if (Number.isNaN(n) || !Number.isInteger(n) || n <= 0) {
        alert('Digite um número inteiro positivo.');
        return;
      }

      if (n > TAMANHO_MAXIMO) {
        alert(`Escolha no máximo ${TAMANHO_MAXIMO}.`);
        return;
      }

      tamanhoAtual = n;
      criarGrade(tamanhoAtual);
    }

    // ---------- Controle de eventos globais para desenho ----------
    // soltar mouse em qualquer lugar para parar de desenhar
    document.addEventListener('mouseup', () => {
      estaDesenhando = false;
    });

    // se o mouse sair da janela, interrompe desenho
    window.addEventListener('mouseleave', () => {
      estaDesenhando = false;
    });

    // touchend também para o desenho
    document.addEventListener('touchend', () => {
      estaDesenhando = false;
    });

    // touchmove: pinta a célula sob o dedo enquanto move
    window.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      const alvo = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!alvo) return;

      if (alvo.classList && alvo.classList.contains('celula')) {
        pintarCelula(alvo);
      }

      // previne rolamento da página quando estiver desenhando dentro do grid
      if (elementoGrade.contains(alvo)) {
        e.preventDefault();
      }
    }, { passive: false });

    // ---------- UI: checkbox e input de cor ----------
    // atualiza modo quando checkbox muda
    chkAleatorio.addEventListener('change', () => {
      usarCorAleatoria = chkAleatorio.checked;
      modoText.textContent = usarCorAleatoria ? 'Aleatório' : 'Fixo';
    });

    // se o usuário alterar a cor no input, nada mais a fazer — ela será usada quando modo for fixo
    inputCor.addEventListener('change', () => {
      // opcional: mostrar a cor atual no console
      // console.log('Cor escolhida:', inputCor.value);
    });

    // ---------- Inicialização ----------
    document.addEventListener('DOMContentLoaded', () => {
      criarGrade(tamanhoAtual);
      console.log('Grade criada:', `${tamanhoAtual}x${tamanhoAtual}`);
      // inicializa texto de modo
      modoText.textContent = usarCorAleatoria ? 'Aleatório' : 'Fixo';
    });

    // ---------- Botões ----------
    botaoLimpar.addEventListener('click', () => {
      limparGrade();
    });

    botaoRedimensionar.addEventListener('click', () => {
      pedirTamanhoERecriar();
    });

    // recria a grade ao redimensionar a janela (debounce simples)
    let temporizadorRedimensionar = null;
    window.addEventListener('resize', () => {
      clearTimeout(temporizadorRedimensionar);
      temporizadorRedimensionar = setTimeout(() => {
        criarGrade(tamanhoAtual);
      }, 200);
    });