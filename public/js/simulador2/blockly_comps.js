// public/js/simulador2/blockly_comps.js

Blockly.defineBlocksWithJsonArray([
  // Blocos de navegação que têm ações dentro (ex: LINE, CROSS R, etc)
  {
    "type": "navigation_block_actionable",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "NAV_TYPE",
        "options": [
          ["LINE", "LINE"],
          ["CROSS R", "CROSS_R"],
          ["CROSS L", "CROSS_L"],
          ["CROSS X", "CROSS_X"],
          ["PICK", "PICK"],
          ["DROP DIST", "DROP_DIST"]
        ]
      }
    ],
    "message1": "Action: %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210,
    "tooltip": "Navigation block with action",
    "helpUrl": ""
  },

  // Blocos START e STOP, sem sub-blocos
  {
    "type": "navigation_block_simple",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "NAV_TYPE",
        "options": [
          ["START", "START"],
          ["STOP", "STOP"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 210,
    "tooltip": "Navigation block without action",
    "helpUrl": ""
  },

  // Blocos de ação do ACCAC
  {
    "type": "action_block",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ACTION_TYPE",
        "options": [
          ["MOVE F", "MOVE_F"],
          ["MOVE BACK", "MOVE_BACK"],
          ["TURN L", "TURN_L"],
          ["TURN R", "TURN_R"],
          ["PICKUP BOX", "PICKUP_BOX"],
          ["DROP BOX", "DROP_BOX"],
          ["HALT", "HALT"],
          ["TURBO", "TURBO"]
        ]
      },
      {
        "type": "input_value",
        "name": "DURATION"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Robot action",
    "helpUrl": ""
  },

  //Bloco de duracao
  {
    "type": "duration_block",
    "message0": "for %1 milliseconds",
    "args0": [
      {
        "type": "field_number",
        "name": "MILLISECONDS",
        "value": 1,
        "min": 0.1,
        "max": 10000,
        "precision": 0.1
      }
    ],
    "output": "Number",
    "colour": 60,
    "tooltip": "Set duration in seconds",
    "helpUrl": ""
  }
]);
