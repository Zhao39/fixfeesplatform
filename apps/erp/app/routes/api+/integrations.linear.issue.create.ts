import { ActionFunction } from "@vercel/remix";

export const action: ActionFunction = async ({ request }) => {
   const data = await request.formData();
   console.log("Creating Linear issue with data:", Object.fromEntries(data));
	return new Response("Linear issue created");
};
