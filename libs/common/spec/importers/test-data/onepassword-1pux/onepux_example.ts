import { ExportData } from "@bitwarden/common/importers/onepassword/types/onepassword-1pux-importer-types";

export const OnePuxExampleFile: ExportData = {
  accounts: [
    {
      attrs: {
        accountName: "Wendy Appleseed",
        name: "Wendy Appleseed",
        avatar: "profile-pic.png",
        email: "wendy.c.appleseed@gmail.com",
        uuid: "D4RI47B7BJDT25C2LWA7LEJLHZ",
        domain: "https://my.1password.com/",
      },
      vaults: [
        {
          attrs: {
            uuid: "rr3lr6c2opoggvrete23q72ahi",
            desc: "",
            avatar: "pic.png",
            name: "Personal",
            type: "P",
          },
          items: [
            {
              uuid: "fkruyzrldvizuqlnavfj3gltfe",
              favIndex: 1,
              createdAt: 1614298956,
              updatedAt: 1635346445,
              trashed: false,
              categoryUuid: "001",
              details: {
                loginFields: [
                  {
                    value: "most-secure-password-ever!",
                    id: "",
                    name: "password",
                    fieldType: "P",
                    designation: "password",
                  },
                ],
                notesPlain: "This is a note. *bold*! _italic_!",
                sections: [
                  {
                    title: "Security",
                    name: "Section_oazxddhvftfknycbbmh5ntwfa4",
                    fields: [
                      {
                        title: "PIN",
                        id: "CCEF647B399604E8F6Q6C8C3W31AFD407",
                        value: {
                          concealed: "12345",
                        },
                        indexAtSource: 0,
                        guarded: false,
                        multiline: false,
                        dontGenerate: false,
                        inputTraits: {
                          keyboard: "default",
                          correction: "default",
                          capitalization: "default",
                        },
                      },
                      {
                        title: "What was the model of your first car?",
                        id: "2m2qomuycejnfkrg534xznu22y",
                        value: {
                          concealed: "Corolla 878",
                        },
                        indexAtSource: 0,
                        guarded: false,
                        multiline: false,
                        dontGenerate: false,
                        inputTraits: {
                          keyboard: "default",
                          correction: "default",
                          capitalization: "default",
                        },
                      },
                      {
                        title: null,
                        id: "brrpwptxbxr3x7rj4mxxw6ixai",
                        value: {
                          concealed: "beastborn1",
                        },
                        indexAtSource: 0,
                        guarded: false,
                        multiline: false,
                        dontGenerate: false,
                        inputTraits: {
                          keyboard: "default",
                          correction: "default",
                          capitalization: "default",
                        },
                      },
                      {
                        title: "",
                        id: "mm67c5aacgyk2ozl4goqmhriva",
                        value: {
                          concealed: "test 4tone",
                        },
                        indexAtSource: 0,
                        guarded: false,
                        multiline: false,
                        dontGenerate: false,
                        inputTraits: {
                          keyboard: "default",
                          correction: "default",
                          capitalization: "default",
                        },
                      },
                    ],
                  },
                ],
                passwordHistory: [
                  {
                    value: "12345password",
                    time: 1458322355,
                  },
                ],
              },
              overview: {
                subtitle: "",
                urls: [
                  {
                    label: "",
                    url: "https://www.dropbox.com/",
                  },
                ],
                title: "Dropbox",
                url: "https://www.dropbox.com/",
                ps: 100,
                pbe: 86.13621,
                pgrng: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
