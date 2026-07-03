import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

export async function requireUser() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new Error("Não autorizado. Você precisa estar logado.");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUser.id),
  });

  if (existingUser) {
    return existingUser;
  }

  // Insert on the fly if it doesn't exist
  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email;

  const [newUser] = await db.insert(users).values({
    id: clerkUser.id,
    email,
    name,
  }).returning();

  return newUser;
}
