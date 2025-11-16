import { clerkClient } from "@clerk/nextjs/server";

// 🟩 authAdmin → Check karta hai ki user Admin hai ya nahi
const authAdmin = async (userId) => {
  try {
    // 🔹 Agar userId hi nahi mila → user admin ho hi nahi sakta
    if (!userId) return false;

    // 🔹 Clerk ka client initialize kar rahe hain
    const client = await clerkClient();

    // 🔹 Clerk ke database se user ki details fetch kar rahe hain
    const user = await client.users.getUser(userId);

    // 🔹 ENV ke andar stored admin emails ko array me convert kar diya
    //    Example: "admin1@gmail.com,admin2@gmail.com"
    const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];

    // 🔹 Check karte hain ki user ka email adminEmails list me hai ya nahi
    return adminEmails.includes(user.emailAddresses[0].emailAddress);

  } catch (error) {
    console.error(error);

    // 🔻 Agar error aaya (Clerk issue ya server issue) → false return karenge
    return false;
  }
};

export default authAdmin;
