import { fetch } from "@tauri-apps/plugin-http";
import { setActivity } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps } from "tauri-plugin-drpc/activity";

export const jsonRequest = async<T>(url: string, method: string, body?: any): Promise<{ data: T, request: Response }> => {
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

export const initializeDiscordState = async () => {
    const activity = new Activity()
        .setAssets(new Assets().setLargeImage("logo"))
        .setTimestamps(new Timestamps(Date.now()))
    
    await setActivity(activity);
}