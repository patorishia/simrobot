let workspace;
let prevBlock = null;
let nomeFile;

function initBlockly() {
  const toolbox = document.getElementById('toolbox');
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    collapse: true,
    comments: true,
    disable: false,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'https://unpkg.com/blockly/media/',
    sounds: true,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    }
  });
}

// Função para executar comandos baseados nos blocos gerados
function executarPrograma() {
  let block = workspace.getTopBlocks(true)[0];
  if (!block) {
    alert("Add blocks to execute!");
    return;
  }
  console.log("🚩 window.robo dentro do executarPrograma:", window.robo);
  if (window.robo) {
    console.log("🚩 window.robo.start:", window.robo.start);
  } else {
    console.warn("⚠️ window.robo está undefined dentro do executarPrograma!");
  }

  window.robo.reset();

  executeBlockRecursive(block);
}

//Funcao para guardar os blocos do blockly em JSON
function guardarBlocos() {
  //Cria JSON
  const state = Blockly.serialization.workspaces.save(workspace);
  const jsonString = JSON.stringify(state, null, 2);

  //Cria metadados para fabricar ficheiro
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  //Cria objeto de pagina para descarregar ficheiro
  const a = document.createElement("a");
  a.href = url;
  nomeFileFunc();
  a.download = nomeFile + ".json";
  a.click();

  //Depois de download, purga ligacao 
  URL.revokeObjectURL(url);
}

//Funcao para carregar os blocos do blockly
function carregarBlocos() {
  //Recebe ficheiro do user
  const file = document.getElementById("inputJSON").files[0];
  if (!file) return;

  //Processa dados do ficheiro
  const reader = new FileReader();
  reader.onload = function (event) {
    const json = JSON.parse(event.target.result);
    Blockly.serialization.workspaces.load(json, workspace);
  };
  reader.readAsText(file);
}

async function executeBlockRecursive(block) {
  if (!block) return;

  switch (block.type) {
    case 'navigation_block_actionable':
      // Navegação com ações internas
      const navTypeActionable = block.getFieldValue('NAV_TYPE');
      const actionBlocks = block.getInputTargetBlock('DO');
      var checkDireita = window.robo.pathFinder("direita");
      var checkFrente = window.robo.pathFinder("frente");
      var checkEsquerda = window.robo.pathFinder("esquerda");
      var checkTras = window.robo.pathFinder("tras");

      //console.log(block.getChildren())

      if (actionBlocks) {
        const actionType = actionBlocks.getFieldValue('ACTION_TYPE');
        const duration = Number(actionBlocks.getFieldValue('DURATION'));
        switch (navTypeActionable) {
          case 'LINE':
            if (actionType == 'MOVE_F') {
              if (checkFrente !== undefined && prevBlock != null && prevBlock.getChildren() != []) {
                if (prevBlock.getFieldValue('NAV_TYPE') != 'LINE' || prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') != 'MOVE_F') {
                  await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                }
              } else {
                console.log("No line ahead!")
              }
            } else if (actionType == 'MOVE_BACK') {
              if (checkTras !== undefined && prevBlock != null && prevBlock.getChildren() != []) {
                if (prevBlock.getFieldValue('NAV_TYPE') != 'LINE' || prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') != 'MOVE_BACK') {
                  await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                }
              } else {
                console.log("No line behind!")
              }
            } else {
              console.log("Lines can't turn")
            }
            break;

          case 'CROSS_R':
            if (checkDireita !== undefined && checkEsquerda === undefined) {
              if (actionType != 'MOVE_F' && actionType != 'MOVE_BACK') {
                await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
              }
            } else {
              //Verifica se nao ha um crossR, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while ((checkFrente !== undefined && checkDireita === undefined && prevBlock != null &&
                prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')
                ||
                (checkFrente !== undefined && checkDireita !== undefined && checkEsquerda !== undefined && prevBlock != null &&
                  prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')) {
                console.log("cross R loop ping")
                await actionBlockMethod(prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'), duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                checkDireita = window.robo.pathFinder("direita");
                checkFrente = window.robo.pathFinder("frente");
                checkEsquerda = window.robo.pathFinder("esquerda");
                checkTras = window.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossR quando o loop parar, e caso sim, faz a acao
              if (checkDireita !== undefined && checkEsquerda === undefined) {
                if (actionType != 'MOVE_F') {
                  await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                }
              } else {
                console.log("No line to the right!")
              }
            }
            break;

          case 'CROSS_L':
            if (checkEsquerda !== undefined && checkDireita === undefined) {
              if (actionType != 'MOVE_F' && actionType != 'MOVE_BACK') {
                await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
              }
            } else {
              //Verifica se nao ha um crossL, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while ((checkFrente !== undefined && checkEsquerda === undefined && prevBlock != null &&
                prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')
                ||
                (checkFrente !== undefined && checkEsquerda !== undefined && checkDireita !== undefined && prevBlock != null &&
                  prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')) {
                console.log("cross L loop ping")
                await actionBlockMethod(prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'), duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                checkDireita = window.robo.pathFinder("direita");
                checkFrente = window.robo.pathFinder("frente");
                checkEsquerda = window.robo.pathFinder("esquerda");
                checkTras = window.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossL quando o loop parar, e caso sim, faz a acao
              if (checkEsquerda !== undefined && checkDireita === undefined) {
                if (actionType != 'MOVE_F' && actionType != 'MOVE_BACK') {
                  await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                }
              } else {
                console.log("No line to the left!")
              }
            }
            break;

          case 'CROSS_X':
            if (checkDireita !== undefined && checkEsquerda !== undefined) {
              if (actionType != 'MOVE_F' && actionType != 'MOVE_BACK') {
                await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
              }

            } else {
              //Verifica se nao ha um crossX, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while ((checkFrente !== undefined && checkEsquerda !== undefined && checkDireita === undefined && prevBlock != null &&
                prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')
                ||
                (checkFrente !== undefined && checkEsquerda === undefined && checkDireita !== undefined && prevBlock != null &&
                  prevBlock.getFieldValue('NAV_TYPE') == 'LINE' && prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE') == 'MOVE_F')) {
                console.log("cross X loop ping")
                await actionBlockMethod(prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'), duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                checkDireita = window.robo.pathFinder("direita");
                checkFrente = window.robo.pathFinder("frente");
                checkEsquerda = window.robo.pathFinder("esquerda");
                checkTras = window.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossX quando o loop parar, e caso sim, faz a acao
              if (checkEsquerda !== undefined && checkDireita !== undefined) {
                if (actionType != "MOVE_F" && actionType != 'MOVE_BACK') {
                  await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
                }
              } else {
                console.log("No line to make cross!")
              }
            }
            break;

          case 'PICK':
            if (actionType == 'PICKUP_BOX' || actionType == 'DROP_BOX') {
              await actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras);
            }
            break;

          case 'DROP_DIST':

            break;

          case 'HALT':

            break;

          default:
            console.log("Navigation actionable type has a critical error:", navTypeActionable);
        }

      }
      console.log("Navigation actionable type:", navTypeActionable);
      break;

    case 'navigation_block_simple':
      // Navegação sem ações internas (START, STOP)
      const navTypeSimple = block.getFieldValue('NAV_TYPE');
      console.log("Navigation simple type:", navTypeSimple);
      break;

    case 'action_block':

      break;

    default:
      console.warn("Unknown block type:", block.type);
  }

  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    prevBlock = block;
    await executeBlockRecursive(nextBlock);
  }
}

async function actionBlockMethod(actionType, duration, checkDireita, checkFrente, checkEsquerda, checkTras) {
  switch (actionType) {
    case 'MOVE_F':
      await window.robo.moveForward(checkFrente);
      break;

    case 'MOVE_BACK':
      await window.robo.moveBackward(checkTras)
      break;

    case 'TURN_L':
      await window.robo.turnLeft();
      while (window.robo.pathFinder("frente") === undefined) {
        await window.robo.turnLeft();
      }
      break;

    case 'TURN_R':
      await window.robo.turnRight();
      while (window.robo.pathFinder("frente") === undefined) {
        await window.robo.turnRight();
      }
      break;

    case 'PICKUP_BOX':
      await window.robo.pickUpBox();

      break;

    case 'DROP_BOX':
      if (window.robo.dropBox) {
        await window.robo.dropBox();
      } else {
        console.warn("dropBox not implemented");
      }
      break;

    default:
      console.warn("Unknown action:", actionType);
  }
}

//Funcao para receber nome dado pelo utilizador
function nomeFileFunc() {
  nomeFile = document.getElementById("nomeFile").value;
}