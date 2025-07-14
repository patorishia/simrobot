// public/js/simulador2/blockly_logic.js

class blockly_logic{
  constructor(nomeFileName){
    this.workspace = null;
    this.prevBlock = null;
    this.nomeFile = null;
    this.robo = null;
    this.nomeFileName = nomeFileName;

  }

  initBlockly(toolboxID,blocklyDivID,roboObj) {
    this.robo = roboObj;
    const toolbox = document.getElementById(toolboxID);
    this.workspace = Blockly.inject(blocklyDivID, {
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
  executarPrograma() {
    let block = this.workspace.getTopBlocks(true)[0];
    if (!block) {
      alert("Add blocks to execute!");
      return;
    }

    this.robo.reset();

    this.executeBlockRecursive(block);
  }

  //Funcao para salvar os blocos do blockly em JSON
  salvarBlocos(){
    //Cria JSON
    const state = Blockly.serialization.workspaces.save(this.workspace);
    const jsonString = JSON.stringify(state,null,2);

    //Cria metadados para fabricar ficheiro
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    console.log("salvar")
    //Cria objeto de pagina para descarregar ficheiro
    const a = document.createElement("a");
    a.href = url;
    this.nomeFileFunc();
    a.download = this.nomeFile+".json";
    a.click();

    //Depois de download, purga ligacao 
    URL.revokeObjectURL(url);
  }

  //Funcao para carregar os blocos do blockly
  carregarBlocos(inputJSON){
    
    //Recebe ficheiro do user
    const file = document.getElementById(inputJSON).files[0];
    if (!file) return;
    
    //Processa dados do ficheiro
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      Blockly.serialization.workspaces.load(json, this.workspace);
    };

    reader.readAsText(file);
  }

  //Funcao para receber nome dado pelo utilizador
  nomeFileFunc(){
    this.nomeFile = document.getElementById(this.nomeFileName).value;
  }

async executeBlockRecursive(block) {
  if (!block) return;

  switch (block.type) {
    case 'navigation_block_actionable':
      // Navegação com ações internas
      const navTypeActionable = block.getFieldValue('NAV_TYPE');
      const actionBlocks = block.getInputTargetBlock('DO');
      var checkDireita = this.robo.pathFinder("direita");
      var checkFrente = this.robo.pathFinder("frente");
      var checkEsquerda = this.robo.pathFinder("esquerda");
      var checkTras =  this.robo.pathFinder("tras");
      var duration = 0;

      //console.log(block.getChildren())

      if (actionBlocks) {
        const actionType = actionBlocks.getFieldValue('ACTION_TYPE');
        if(actionType=='HALT' || actionType=='TURBO'){
          duration = actionBlocks.getInputTargetBlock('DURATION').getFieldValue('MILLISECONDS');
        }

        switch (navTypeActionable){
          case 'LINE':
            if(actionType=='MOVE_F'){
              if (checkFrente!==undefined && this.prevBlock != null && this.prevBlock.getChildren()!=[]){
                if(this.prevBlock.getFieldValue('NAV_TYPE')!='LINE' || this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')!='MOVE_F'){
                    await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                }
              }else{
                console.log("No line ahead!")
              }
            }else if(actionType=='MOVE_BACK'){
              if (checkTras!==undefined && this.prevBlock != null && this.prevBlock.getChildren()!=[]){
                if(this.prevBlock.getFieldValue('NAV_TYPE')!='LINE' || this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')!='MOVE_BACK'){
                    await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                }
              }else{
                console.log("No line behind!")
              }
            }else{
              console.log("Lines can't turn")
            }
            break;

          case 'CROSS_R':
            if (actionType=='HALT'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }else if (actionType=='TURBO'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }
            if (checkDireita!==undefined && checkEsquerda===undefined){
              if(actionType!='MOVE_F' && actionType!='MOVE_BACK'){
                await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              }
            }else{
              //Verifica se nao ha um crossR, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while((checkFrente!==undefined && checkDireita===undefined && this.prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')
                   ||
                   (checkFrente!==undefined && checkDireita!==undefined && checkEsquerda!==undefined &&  this.prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')){
                console.log("cross R loop ping")
                await this.actionBlockMethod(this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'),duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                checkDireita = this.robo.pathFinder("direita");
                checkFrente = this.robo.pathFinder("frente");
                checkEsquerda = this.robo.pathFinder("esquerda"); 
                checkTras =  this.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossR quando o loop parar, e caso sim, faz a acao
              if(checkDireita!==undefined && checkEsquerda===undefined){
                if(actionType!='MOVE_F'){
                  await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                }
              }else{
                console.log("No line to the right!")
              }
            }
            break;

          case 'CROSS_L':
            if (actionType=='HALT'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }else if (actionType=='TURBO'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }
            if (checkEsquerda!==undefined && checkDireita===undefined){
              if(actionType!='MOVE_F' && actionType!='MOVE_BACK'){
                await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              }
            }else{
              //Verifica se nao ha um crossL, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while((checkFrente!==undefined && checkEsquerda===undefined && this.prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')
                   ||
                   (checkFrente!==undefined && checkEsquerda!==undefined && checkDireita!==undefined &&  prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')){
                console.log("cross L loop ping")
                await this.actionBlockMethod(this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'),duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                checkDireita = this.robo.pathFinder("direita");
                checkFrente = this.robo.pathFinder("frente");
                checkEsquerda = this.robo.pathFinder("esquerda"); 
                checkTras =  this.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossL quando o loop parar, e caso sim, faz a acao
              if(checkEsquerda!==undefined && checkDireita===undefined){
                if(actionType!='MOVE_F' && actionType!='MOVE_BACK'){
                  await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                }
              }else{
                console.log("No line to the left!")
              }
            }
            break;

          case 'CROSS_X':
            if (actionType=='HALT'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }else if (actionType=='TURBO'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              break;
            }
            if (checkDireita!==undefined && checkEsquerda!==undefined){
              if(actionType!='MOVE_F' && actionType!='MOVE_BACK'){
                await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
              }
              
            }else{
              //Verifica se nao ha um crossX, e caso nao, roda em loop o comando de andar em frente se nao o encontrar
              while((checkFrente!==undefined && checkEsquerda!==undefined && checkDireita===undefined && this.prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')
                   ||
                   (checkFrente!==undefined && checkEsquerda===undefined && checkDireita!==undefined &&  this.prevBlock!=null &&
                   this.prevBlock.getFieldValue('NAV_TYPE')=='LINE' && this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE')=='MOVE_F')){
                console.log("cross X loop ping")
                await this.actionBlockMethod(this.prevBlock.getInputTargetBlock('DO').getFieldValue('ACTION_TYPE'),duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                checkDireita = this.robo.pathFinder("direita");
                checkFrente = this.robo.pathFinder("frente");
                checkEsquerda = this.robo.pathFinder("esquerda"); 
                checkTras =  this.robo.pathFinder("tras");
              }
              //Verifica se finalmente encontrou o crossX quando o loop parar, e caso sim, faz a acao
              if(checkEsquerda!==undefined && checkDireita!==undefined){
                if(actionType!="MOVE_F" && actionType!='MOVE_BACK'){
                  await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
                }
              }else{
                console.log("No line to make cross!")
              }
            }
            break;

          case 'PICK':
            if(actionType=='PICKUP_BOX' || actionType=='DROP_BOX'){
              await this.actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras);
            }else{
              console.log("Este bloco so pode pegar ou largar a caixa");
            }
            break;

          case 'DROP_DIST':

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
      // Podes aqui adicionar alguma lógica especial para START/STOP, se quiseres
      break;

    case 'action_block':
      
      break;

    default:
      console.warn("Unknown block type:", block.type);
  }

  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    this.prevBlock = block;
    await this.executeBlockRecursive(nextBlock);
  }
}

async actionBlockMethod(actionType,duration,checkDireita,checkFrente,checkEsquerda,checkTras){
  switch (actionType) {
    case 'MOVE_F':
      await this.robo.moveForward(checkFrente);
      break;

    case 'MOVE_BACK':
      await this.robo.moveBackward(checkTras)
      break;

    case 'TURN_L':
      await this.robo.turnLeft();
      while(this.robo.pathFinder("frente")===undefined){
        await this.robo.turnLeft();
      }
      break;

    case 'TURN_R':
      await this.robo.turnRight();
      while(this.robo.pathFinder("frente")===undefined){
        await this.robo.turnRight();
      }
      break;

    case 'PICKUP_BOX':
      await this.robo.pickUpBox();
      
      break;

    case 'DROP_BOX':
      await this.robo.dropBox();
      
      break;
    
    case 'HALT':
      await this.robo.halt(duration);
      
      break;

    case 'TURBO':
      await this.robo.turbo(duration);
      
      break;

    default:
      console.warn("Unknown action:", actionType);
  }
}

  updateRobo(roboNovo){
    this.robo = roboNovo;
  }
}

// expõe globalmente
window.blockly_logic = blockly_logic;