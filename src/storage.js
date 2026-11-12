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
        this._ensureDir();
    }

    _ensureDir() {
        try {
            GLib.mkdir_with_parents(this._configDir, 0o755);
        } catch (e) {
            console.error(`[DisplayProfiles Storage] Error creating directory ${this._configDir}: ${e}`);
        }
    }

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

        // Generate ID if missing
        if (!profile.id) {
            profile.id = 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        }

        // Check if profile with same ID or name already exists
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

    setActiveProfileId(hardwareId, profileId) {
        const data = this.load();
        if (!data.monitors || !data.monitors[hardwareId]) {
            return false;
        }
        data.monitors[hardwareId].activeProfileId = profileId;
        this.save(data);
        return true;
    }
}
