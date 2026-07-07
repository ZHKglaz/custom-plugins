/*
 * Vencord, a Discord client mod
 * Plugin: CustomBackground
 *
 * Injects a user-supplied image or video as a full-client background layer.
 */

import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";

const STYLE_ID = "vc-custom-background-style";
const CONTAINER_ID = "vc-custom-background-container";

function isVideoUrl(url: string) {
    return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

const settings = definePluginSettings({
    backgroundUrl: {
        type: OptionType.STRING,
        description: "URL of the image or video to use as the client background",
        default: "",
        onChange: () => applyBackground()
    },
    opacity: {
        type: OptionType.SLIDER,
        description: "Opacity of the app UI over the background (0 = fully see-through, 1 = opaque)",
        markers: [0, 0.25, 0.5, 0.75, 1],
        default: 0.85,
        stickToMarkers: false,
        onChange: () => applyBackground()
    },
    blur: {
        type: OptionType.SLIDER,
        description: "Background blur in pixels",
        markers: [0, 2, 4, 8, 16],
        default: 0,
        stickToMarkers: false,
        onChange: () => applyBackground()
    }
});

function removeExisting() {
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CONTAINER_ID)?.remove();
}

function applyBackground() {
    removeExisting();

    const { backgroundUrl, opacity, blur } = settings.store;
    if (!backgroundUrl) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
        #${CONTAINER_ID} {
            position: fixed;
            inset: 0;
            z-index: -1;
            overflow: hidden;
            filter: blur(${blur}px);
        }
        #${CONTAINER_ID} img,
        #${CONTAINER_ID} video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Dim/translucent-ize the standard app backgrounds so the custom one shows through */
        .bg_a4bb4d, .container_a4d4d9, .app_ea3aa2, .container_c48ade {
            background-color: transparent !important;
        }
        .base_ef0ff5, .chat_a7d7fa {
            background-color: rgba(0, 0, 0, ${opacity}) !important;
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement("div");
    container.id = CONTAINER_ID;

    if (isVideoUrl(backgroundUrl)) {
        const video = document.createElement("video");
        video.src = backgroundUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        container.appendChild(video);
    } else {
        const img = document.createElement("img");
        img.src = backgroundUrl;
        container.appendChild(img);
    }

    document.body.appendChild(container);
}

export default definePlugin({
    name: "CustomBackground",
    description: "Set a custom image or video as the Discord client background",
    authors: [Devs.Ven],
    settings,

    start() {
        applyBackground();
    },

    stop() {
        removeExisting();
    }
});
