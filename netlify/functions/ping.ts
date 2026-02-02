
export default async () => {
    return new Response("Pong!", { status: 200 });
};

export const config = {
    path: "/ping"
};
