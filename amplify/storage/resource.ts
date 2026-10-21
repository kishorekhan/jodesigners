import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "joDesignersWorkUploads",
  access: (allow) => ({
    "work-showcase/*": [
      allow.authenticated.to(["read", "write", "delete"]),
      allow.groups(["admin", "customer"]).to(["read", "write", "delete"]),
      allow.guest.to(["read", "write"]),
    ],
  }),
});
