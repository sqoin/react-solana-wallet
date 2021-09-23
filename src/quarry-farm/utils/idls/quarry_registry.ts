import { generateErrorMap } from "@saberhq/anchor-contrib";

export type QuarryRegistryIDL = {
  version: "0.0.0";
  name: "quarry_registry";
  instructions: [
    {
      name: "newRegistry";
      accounts: [
        {
          name: "rewarder";
          isMut: false;
          isSigner: false;
        },
        {
          name: "registry";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "maxQuarries";
          type: "u16";
        },
        {
          name: "bump";
          type: "u8";
        }
      ];
    },
    {
      name: "syncQuarry";
      accounts: [
        {
          name: "quarry";
          isMut: false;
          isSigner: false;
        },
        {
          name: "registry";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "Registry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "rewarder";
            type: "publicKey";
          },
          {
            name: "tokens";
            type: {
              vec: "publicKey";
            };
          }
        ];
      };
    }
  ];
};
export const QuarryRegistryJSON: QuarryRegistryIDL = {
  version: "0.0.0",
  name: "quarry_registry",
  instructions: [
    {
      name: "newRegistry",
      accounts: [
        {
          name: "rewarder",
          isMut: false,
          isSigner: false,
        },
        {
          name: "registry",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "maxQuarries",
          type: "u16",
        },
        {
          name: "bump",
          type: "u8",
        },
      ],
    },
    {
      name: "syncQuarry",
      accounts: [
        {
          name: "quarry",
          isMut: false,
          isSigner: false,
        },
        {
          name: "registry",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Registry",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "rewarder",
            type: "publicKey",
          },
          {
            name: "tokens",
            type: {
              vec: "publicKey",
            },
          },
        ],
      },
    },
  ],
};
export const QuarryRegistryErrors = generateErrorMap(QuarryRegistryJSON);
