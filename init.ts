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
  `https://deno.land/x/deno@v${Deno.version.deno}/cli/schemas/config-file.v1.json`;
const { default: schema } = await import(schemaUrl, { assert: { type: "json" } });
const configFile = "deno.json"
Deno.writeTextFile(configFile, JSON.stringify(generate(schema), null, 2));
