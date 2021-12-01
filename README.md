# Proposal [denoland/deno#12781](https://github.com/denoland/deno/issues/12781): deno-init
deno.jsonc generator

# Description

Related to #5040, we propose the `deno.json` config generator like `tsc --init` for `tsconfig.json`.

# Usage

```
$ deno install --allow-write --allow-net --name deno-init https://raw.githubusercontent.com/tani/deno-init/main/init.ts
$ deno-init
```

# Background

Because of the increasing configuration parameters, deno developers employed the configuration file `deno.json` to keep the configuration parameter for each project.

# Problem

As there exist many parameters, it is hard to know what parameter we can use.
In the close future, deno may have more options to tweak their behaviour.
We need to write a new configuration file from a scratch for each project.

# Solution

We already have a JSON Schema to validate a configuration file.
The schema file contains the default value information.
Thus, we can mechanically generate the default configuration file from this schema.

# Related work

We can see similar functions in the related project.

- `npm init` 
- `yarn init`
- `cargo init`
- `tsc --init`
- `eslint --init`

We also have the counterexample. `babel` does not provide a `init` command.

# Proof of Concept

```ts
function generate(schema: any): any {
  if ("default" in schema) {
    return schema.default;
  }
  if ("type" in schema) {
    switch (schema.type) {
      case "object":
        return Object.fromEntries(
          Object.entries(schema.properties).map(([key, value]) => {
            return [key, generate(value)];
          }),
        );
      case "array":
        return [];
    }
  }
}

const schemaUrl =
  "https://deno.land/x/deno@v1.16.1/cli/schemas/config-file.v1.json";
const response = await fetch(schemaUrl);
const schema = await response.json();
const configFile = "deno.json";
Deno.writeTextFile(configFile, JSON.stringify(generate(schema), null, 2));
```

```json
{
  "compilerOptions": {
    "allowJs": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "checkJs": false,
    "experimentalDecorators": true,
    "jsx": "react",
    "jsxFactory": "React.createElement",
    "jsxFragmentFactory": "React.Fragment",
    "jsxImportSource": "react",
    "keyofStringsOnly": false,
    "lib": [
      "deno.window"
    ],
    "noFallthroughCasesInSwitch": false,
    "noImplicitAny": true,
    "noImplicitReturns": false,
    "noImplicitThis": true,
    "noImplicitUseStrict": true,
    "noStrictGenericChecks": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noUncheckedIndexedAccess": false,
    "strict": true,
    "strictBindCallApply": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "strictNullChecks": true,
    "suppressExcessPropertyErrors": false,
    "suppressImplicitAnyIndexErrors": false
  },
  "lint": {
    "files": {
      "include": [],
      "exclude": []
    },
    "rules": {
      "tags": [],
      "exclude": [],
      "include": []
    }
  },
  "fmt": {
    "files": {
      "include": [],
      "exclude": []
    },
    "options": {
      "useTabs": false,
      "lineWidth": 80,
      "indentWidth": 2,
      "singleQuote": false,
      "proseWrap": "always"
    }
  }
}
```