/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game.json`.
 */
export type Game = {
  "address": "294LgZBjjo3nbpWF7qxXxK6Wk3dTVtV2vEL9aziZ92To",
  "metadata": {
    "name": "game",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "newGame",
      "discriminator": [
        211,
        13,
        182,
        128,
        71,
        187,
        248,
        202
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "gameVault",
          "writable": true,
          "address": "2Z43jM1KjKk18o7BeYydoVRv5UV73LxGFigwK21aynPd"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "timeframe",
          "type": "u64"
        },
        {
          "name": "betAmount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "settleGame",
      "discriminator": [
        96,
        54,
        24,
        189,
        239,
        198,
        86,
        29
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true
        },
        {
          "name": "gameResult",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  114,
                  101,
                  115,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "gameVault",
          "writable": true,
          "signer": true,
          "address": "2Z43jM1KjKk18o7BeYydoVRv5UV73LxGFigwK21aynPd"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "result",
          "type": "bool"
        },
        {
          "name": "amountWon",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    },
    {
      "name": "gameResult",
      "discriminator": [
        154,
        160,
        133,
        130,
        0,
        179,
        92,
        10
      ]
    }
  ],
  "events": [
    {
      "name": "gameCreated",
      "discriminator": [
        218,
        25,
        150,
        94,
        177,
        112,
        96,
        2
      ]
    },
    {
      "name": "gameSettled",
      "discriminator": [
        63,
        109,
        128,
        85,
        229,
        63,
        167,
        176
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "settlerNotGameVault",
      "msg": "The game should be settled by the game vault"
    },
    {
      "code": 6001,
      "name": "invalidTimeframe",
      "msg": "The timeframe should be at least 60 seconds"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "u64"
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "player",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "gameResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u64"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "result",
            "type": "bool"
          },
          {
            "name": "amountWon",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "result",
            "type": "bool"
          },
          {
            "name": "amountWon",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
