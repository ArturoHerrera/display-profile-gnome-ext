import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export class Storage {
    constructor(customFilePath = null) {
        if (customFilePath) {
            this._filePath = customFilePath;
            this._configDir = GLib.path_get_dirname(customFilePath);
        } else {
            this._configDir = GLib.build_filenamev([GLib.get_user_config_dir(), 'display-profiles']);
            this._filePath = GLib.build_filenamev([this._configDir, 'profiles.json']);
        }
        this._file = Gio.File.new_for_path(this._filePath);
        this._dir = Gio.File.new_for_path(this._configDir);
        this._ensureDir();
    }

    _ensureDir() {
        try {
            this._dir.make_directory_with_parents(null);
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.EXISTS)) {
                console.error(`[DisplayProfiles Storage] Error creating directory ${this._configDir}: ${e}`);
            }
        }
    }

    // --- Asynchronous API (Safe for GNOME Shell main loop) ---

    loadAsync() {
        return new Promise((resolve) => {
            this._file.load_contents_async(null, (file, res) => {
                try {
                    const [ok, bytes] = file.load_contents_finish(res);
                    if (!ok || !bytes || bytes.length === 0) {
                        return resolve({ monitors: {} });
                    }
                    const text = new TextDecoder('utf-8').decode(bytes);
                    const parsed = JSON.parse(text);
                    resolve(parsed && typeof parsed === 'object' ? parsed : { monitors: {} });
                } catch (e) {
                    if (e.matches && e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
                        resolve({ monitors: {} });
                    } else {
                        console.error(`[DisplayProfiles Storage] Error loading async profiles: ${e}`);
                        resolve({ monitors: {} });
                    }
                }
            });
        });
    }

    saveAsync(data) {
        return new Promise((resolve, reject) => {
            this._ensureDir();
            try {
                const text = JSON.stringify(data, null, 2);
                const bytes = new GLib.Bytes(new TextEncoder().encode(text));
                this._file.replace_contents_bytes_async(
                    bytes,
                    null,
                    false,
                    Gio.FileCreateFlags.REPLACE_DESTINATION,
                    null,
                    (file, res) => {
                        try {
                            file.replace_contents_finish(res);
                            resolve(true);
                        } catch (e) {
                            console.error(`[DisplayProfiles Storage] Error saving async profiles: ${e}`);
                            reject(e);
                        }
                    }
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    async getProfilesAsync(hardwareId) {
        const data = await this.loadAsync();
        if (data.monitors && data.monitors[hardwareId]) {
            return data.monitors[hardwareId].profiles || [];
        }
        return [];
    }

    async getActiveProfileIdAsync(hardwareId) {
        const data = await this.loadAsync();
        if (data.monitors && data.monitors[hardwareId]) {
            return data.monitors[hardwareId].activeProfileId || null;
        }
        return null;
    }

    async saveProfileAsync(hardwareId, displayName, profile) {
        const data = await this.loadAsync();
        if (!data.monitors) {
            data.monitors = {};
        }
        if (!data.monitors[hardwareId]) {
            data.monitors[hardwareId] = {
                displayName,
                activeProfileId: null,
                profiles: []
            };
        }

        const monitorData = data.monitors[hardwareId];
        monitorData.displayName = displayName;

        if (!profile.id) {
            profile.id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        }

        const existingIndex = monitorData.profiles.findIndex(p => p.id === profile.id || p.name === profile.name);
        if (existingIndex >= 0) {
            profile.id = monitorData.profiles[existingIndex].id;
            monitorData.profiles[existingIndex] = profile;
        } else {
            monitorData.profiles.push(profile);
        }

        monitorData.activeProfileId = profile.id;
        await this.saveAsync(data);
        return profile;
    }

    async deleteProfileAsync(hardwareId, profileId) {
        const data = await this.loadAsync();
        if (!data.monitors || !data.monitors[hardwareId]) {
            return false;
        }

        const monitorData = data.monitors[hardwareId];
        const initialLength = monitorData.profiles.length;
        monitorData.profiles = monitorData.profiles.filter(p => p.id !== profileId);

        if (monitorData.activeProfileId === profileId) {
            monitorData.activeProfileId = null;
        }

        await this.saveAsync(data);
        return monitorData.profiles.length < initialLength;
    }

    // --- Synchronous Fallbacks (CLI compatibility) ---

    load() {
        try {
            if (!GLib.file_test(this._filePath, GLib.FileTest.EXISTS)) {
                return { monitors: {} };
            }
            const [ok, bytes] = GLib.file_get_contents(this._filePath);
            if (!ok) {
                return { monitors: {} };
            }
            const text = new TextDecoder('utf-8').decode(bytes);
            return JSON.parse(text);
        } catch (e) {
            console.error(`[DisplayProfiles Storage] Error loading profiles from ${this._filePath}: ${e}`);
            return { monitors: {} };
        }
    }

    save(data) {
        try {
            this._ensureDir();
            const text = JSON.stringify(data, null, 2);
            GLib.file_set_contents(this._filePath, text);
            return true;
        } catch (e) {
            console.error(`[DisplayProfiles Storage] Error saving profiles to ${this._filePath}: ${e}`);
            return false;
        }
    }

    getProfiles(hardwareId) {
        const data = this.load();
        if (data.monitors && data.monitors[hardwareId]) {
            return data.monitors[hardwareId].profiles || [];
        }
        return [];
    }

    getActiveProfileId(hardwareId) {
        const data = this.load();
        if (data.monitors && data.monitors[hardwareId]) {
            return data.monitors[hardwareId].activeProfileId || null;
        }
        return null;
    }

    saveProfile(hardwareId, displayName, profile) {
        const data = this.load();
        if (!data.monitors) {
            data.monitors = {};
        }
        if (!data.monitors[hardwareId]) {
            data.monitors[hardwareId] = {
                displayName,
                activeProfileId: null,
                profiles: []
            };
        }

        const monitorData = data.monitors[hardwareId];
        monitorData.displayName = displayName;

        if (!profile.id) {
            profile.id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        }

        const existingIndex = monitorData.profiles.findIndex(p => p.id === profile.id || p.name === profile.name);
        if (existingIndex >= 0) {
            profile.id = monitorData.profiles[existingIndex].id;
            monitorData.profiles[existingIndex] = profile;
        } else {
            monitorData.profiles.push(profile);
        }

        monitorData.activeProfileId = profile.id;
        this.save(data);
        return profile;
    }

    deleteProfile(hardwareId, profileId) {
        const data = this.load();
        if (!data.monitors || !data.monitors[hardwareId]) {
            return false;
        }

        const monitorData = data.monitors[hardwareId];
        const initialLength = monitorData.profiles.length;
        monitorData.profiles = monitorData.profiles.filter(p => p.id !== profileId);

        if (monitorData.activeProfileId === profileId) {
            monitorData.activeProfileId = null;
        }

        this.save(data);
        return monitorData.profiles.length < initialLength;
    }
}
