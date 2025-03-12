import { fetch } from "@tauri-apps/plugin-http";

export const jsonRequest = async<T>(url: string, method: string, body?: any): Promise<{ data: T, request: Response }> => {
    console.log(url);
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    let data;

    try {
        data = await response.json();
    } catch (error) {
        console.error(error);
    }

    return { data: data as T, request: response };
}