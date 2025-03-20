LAUNCHER CONFIGURATION

The file "config.json" is used for configuring the launcher's behavior.

--------------------------------------------------------------------------------------------------------------------------------

"discordRpc": You are able to change clientId, stateText, largeImage etc. Those will effect the Discord Rich Presence status.
"servers": Servers section is used for adding/removing servers. This section is an array, which means you can add or remove servers from it. The structure of server is important and should be followed strictly. Each server should have a unique profile name, name can be changed but profile name should not be changed. This is the example structure of server:
"""
{
    "icon": "", // Icon for the server. Must be a valid URL or you can use "/images/logo.png" for using the default logo.
    "title": "", // Title for the server. Must be a valid string.
    "profile": "", // Unique identifier for the server. This name determines the folder name in the /root/profiles/ directory.
    "description": "", // Description for the server. Must be a valid string.
    "version": "", // Version for the server. Must be a valid string.
    "ip": "", // IP address of the server for direct connection. Must be a valid IP address.
    "port": 0, // Port of the server for direct connection. Must be a valid port.
    "minecraft": {
        "version": "", // Minecraft version for the server. Must be a valid string.
        // loader field can be deleted for launching vanilla versions.
        "loader": {
            "type": "fabric", // Loader type for the server. It can be "fabric", "forge", or "quilt".
            "version": "" // Loader version for the server. Must be a valid string. If loader version is wrong launch might throw an error.
        },
        "exclude": [] // Array of excluded files/folders for the server. Must be a valid array and must not contain any duplicate entries. Everything in the array must be a valid string.
    },
    "videoUrl": "" // Video URL for the server. Must be a valid URL.
    "optionalMods": [] // This field is used for determining which mods are optional. If mod is not present in the list, it won't be optional and users won't be able to delete/modify that mod.
}
"""
"version": "" // Version field defines the launcher version. When we need to update the launcher, we increase the version number by semver standards.
"website": "" // Website field defines the website URL for the server. Must be a valid URL.

Other fields are necessary for launcher update sequence. You need to contact with us again for launcher update and we will configure
those values when launcher will be updated.

--------------------------------------------------------------------------------------------------------------------------------

The file "news.json" is used for adding/removing news to the launcher.

--------------------------------------------------------------------------------------------------------------------------------

The entire file is an array so we can add/remove news to the launcher. The structure of the file is as follows:

"""
{
  "link": "", // This must be a valid URL. It changes the clickable button link of the news card.
  "lore": "", // This must be a valid string. This is basically short description of the news.
  "image": "", // This must be a valid URL.
  "title": "" // This must be a valid string.
}
"""

--------------------------------------------------------------------------------------------------------------------------------
