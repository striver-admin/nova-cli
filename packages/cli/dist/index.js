// src/index.ts
import { program } from "commander";

// src/commands/create.ts
import { Command } from "commander";
var createCommand = new Command("create").argument("<app-name>", "Project name").description("Create a new project from template").action(() => {
});

// src/commands/list.ts
import { Command as Command2 } from "commander";
var listCommand = new Command2("list").description("List all available templates").action(() => {
});

// src/commands/info.ts
import { Command as Command3 } from "commander";
var infoCommand = new Command3("info").argument("<template>", "Template name").description("Show template details").action(() => {
});

// package.json
var package_default = {
  name: "nova-cli",
  version: "0.0.1",
  description: "Project scaffolding CLI for Vue and React",
  type: "module",
  bin: {
    nova: "./bin/nova-cli.js"
  },
  main: "./dist/index.js",
  scripts: {
    build: "tsup",
    dev: "tsup --watch",
    typecheck: "tsc --noEmit"
  },
  dependencies: {
    commander: "^12.0.0",
    "@inquirer/prompts": "^5.0.0",
    chalk: "^5.3.0",
    ora: "^8.0.0",
    execa: "^9.0.0",
    "fs-extra": "^11.2.0"
  },
  devDependencies: {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.11.0",
    tsup: "^8.0.0",
    typescript: "^5.4.0"
  },
  engines: {
    node: ">=18.0.0"
  }
};

// src/index.ts
program.name("nova-cli").description("Project scaffolding CLI for Vue and React").version(package_default.version);
program.addCommand(createCommand);
program.addCommand(listCommand);
program.addCommand(infoCommand);
program.parse();
//# sourceMappingURL=index.js.map