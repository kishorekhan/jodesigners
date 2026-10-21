import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // Preserve existing Todo model to prevent CloudFormation deletion
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Custom Tailoring Order Model
  CustomOrder: a
    .model({
      customerName: a.string().required(),
      phone: a.string(),
      category: a.string().required(),
      outfitType: a.string().required(),
      fabric: a.string(),
      status: a.string().required(),
      deliveryDate: a.string(),
      notes: a.string(),
      amount: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Measurement Record Model
  Measurement: a
    .model({
      clientName: a.string().required(),
      category: a.string().required(),
      bustChest: a.string(),
      waist: a.string(),
      hip: a.string(),
      shoulder: a.string(),
      length: a.string(),
      armHole: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Fabric & Embellishment Inventory Model
  FabricStock: a
    .model({
      materialName: a.string().required(),
      colorShade: a.string(),
      metersAvailable: a.string(),
      type: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Client Directory Model
  ClientProfile: a
    .model({
      fullName: a.string().required(),
      phone: a.string(),
      email: a.string(),
      preferredStyle: a.string(),
      address: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Category & Outfit Configuration Model for Admin Control
  OutfitConfig: a
    .model({
      category: a.string().required(), // e.g. "Women", "Kids", "Teens", "Bridal"
      outfitStyle: a.string().required(), // e.g. "Aari Work Blouse", "Pattu Pavadai"
      description: a.string(),
      basePrice: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Designer Portfolio Showcase Model for Website & Booking
  ShowcaseWork: a
    .model({
      title: a.string().required(),
      category: a.string().required(),
      outfitType: a.string(),
      description: a.string(),
      imageKey: a.string(),
      imageUrl: a.string().required(),
      fabricDetails: a.string(),
      tags: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
