import { getSchema } from "@aws/dynamodb-data-mapper";
import { DocumentType, ListType, Schema, SchemaType, SetType, TupleType, MapType } from "@aws/dynamodb-data-marshaller";
import { JSONSchema7 } from "json-schema";

export function generateJsonSchema(object: any): JSONSchema7 {
  try {
    const schema = getSchema(object);
    return new Generator().iterate(schema);
  } catch (e) {
    return {};
  }
}

export function generateJsonSchemaArray(object: any): JSONSchema7 {
  return {
    type: "array",
    items: generateJsonSchema(object)
  };
}

class Generator {
  document(doc: DocumentType | TupleType): JSONSchema7 {
    const jsonSchema: JSONSchema7 = {
      type: "object",
      properties: {}
    };

    for (const key in doc.members) {
      jsonSchema.properties![key] = this.process(doc.members[key]);
    }

    return jsonSchema;
  }

  list(doc: ListType): JSONSchema7 {
    if (doc.memberType.type === "Document") {
      return {
        type: "array",
        items: this.document(doc.memberType)
      };
    }

    return {
      type: "array"
    };
  }

  set(doc: SetType | MapType): JSONSchema7 {
    return this.process({
      type: doc.memberType
    } as SchemaType);
  }

  private process(item: SchemaType): JSONSchema7 {
    switch (item.type) {
      case "Any":
      case "String":
      case "Hash":
      case "Custom":
        return {
          type: "string"
        };
      case "Date":
      case "Number":
        return {
          type: "number"
        };
      case "Collection":
        return {
          type: "array"
        };
      case "Document":
      case "Tuple":
        return this.document(item);
      case "List":
        return this.list(item);
      case "Map":
      case "Set":
        return this.set(item);
      case "Boolean":
        return {
          type: "boolean"
        };
      case "Binary": // JSON doesn't support binary...
      case "Null":
        return {
          type: "null"
        };
      default:
        throw Error("No json convert implementation for requested type");
    }
  }

  iterate(doc: Schema): JSONSchema7 {
    const jsonSchema: JSONSchema7 = {
      type: "object",
      properties: {}
    };

    for (const key in doc) {
      const item = doc[key];
      jsonSchema.properties![key] = this.process(item);
    }
    return jsonSchema;
  }
}
