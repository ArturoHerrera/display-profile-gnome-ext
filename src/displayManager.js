import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export class DisplayManager {
    constructor() {
        this._proxy = null;
        this._proxyPromise = null;
        this._signalId = null;
        this._cancellable = new Gio.Cancellable();
        this._onMonitorsChangedCallbacks = [];

        // Kick off asynchronous proxy initialization in the background.
        // Zero synchronous blocking operations occur in the constructor to keep
        // GNOME Shell extension enablement instantaneous (< 1ms).
        this._ensureProxyAsync().catch(e => {
            if (!this._cancellable?.is_cancelled()) {
                console.error(`[DisplayManager] Background proxy initialization failed: ${e}`);
            }
        });
    }

    _ensureProxyAsync() {
        if (this._proxy) {
            return Promise.resolve(this._proxy);
        }
        if (this._proxyPromise) {
            return this._proxyPromise;
        }

        this._proxyPromise = new Promise((resolve, reject) => {
            Gio.DBusProxy.new_for_bus(
                Gio.BusType.SESSION,
                Gio.DBusProxyFlags.NONE,
                null,
                'org.gnome.Mutter.DisplayConfig',
                '/org/gnome/Mutter/DisplayConfig',
                'org.gnome.Mutter.DisplayConfig',
                this._cancellable,
                (source, res) => {
                    try {
                        const proxy = Gio.DBusProxy.new_for_bus_finish(res);
                        this._proxy = proxy;

                        if (!this._signalId && !this._cancellable?.is_cancelled()) {
                            this._signalId = this._proxy.connect('g-signal', (p, sender, signalName) => {
                                if (signalName === 'MonitorsChanged') {
                                    for (const cb of this._onMonitorsChangedCallbacks) {
                                        try {
                                            cb();
                                        } catch (e) {
                                            console.error(`[DisplayManager] Error in MonitorsChanged callback: ${e}`);
                                        }
                                    }
                                }
                            });
                        }

                        resolve(this._proxy);
                    } catch (e) {
                        this._proxyPromise = null;
                        if (!this._cancellable?.is_cancelled()) {
                            console.error(`[DisplayManager] Failed to initialize Mutter DisplayConfig proxy: ${e}`);
                        }
                        reject(e);
                    }
                }
            );
        });

        return this._proxyPromise;
    }

    _initProxySync() {
        if (this._proxy) {
            return;
        }
        try {
            this._proxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SESSION,
                Gio.DBusProxyFlags.NONE,
                null,
                'org.gnome.Mutter.DisplayConfig',
                '/org/gnome/Mutter/DisplayConfig',
                'org.gnome.Mutter.DisplayConfig',
                null
            );

            if (!this._signalId) {
                this._signalId = this._proxy.connect('g-signal', (proxy, sender, signalName) => {
                    if (signalName === 'MonitorsChanged') {
                        for (const cb of this._onMonitorsChangedCallbacks) {
                            try {
                                cb();
                            } catch (e) {
                                console.error(`[DisplayManager] Error in MonitorsChanged callback: ${e}`);
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.error(`[DisplayManager] Failed to initialize Mutter DisplayConfig proxy sync: ${e}`);
        }
    }

    onMonitorsChanged(callback) {
        this._onMonitorsChangedCallbacks.push(callback);
    }

    async _callMethodAsync(method, params = null) {
        const proxy = await this._ensureProxyAsync();
        return new Promise((resolve, reject) => {
            proxy.call(method, params, Gio.DBusCallFlags.NONE, -1, this._cancellable, (p, res) => {
                try {
                    const reply = p.call_finish(res);
                    resolve(reply);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    // --- Asynchronous API (Safe for GNOME Shell in-process execution) ---

    async getCurrentStateAsync() {
        const res = await this._callMethodAsync('GetCurrentState', null);
        const [serial, monitors, logicalMonitors, properties] = res.deepUnpack();
        return { serial, monitors, logicalMonitors, properties };
    }

    async getMonitorsAsync() {
        const { monitors, logicalMonitors } = await this.getCurrentStateAsync();
        return this._parseMonitors(monitors, logicalMonitors);
    }

    async applyMonitorProfileAsync(targetConnector, profile, verifyOnly = false) {
        const { serial, monitors, logicalMonitors } = await this.getCurrentStateAsync();
        const newLogicalMonitors = this._buildNewLogicalMonitors(monitors, logicalMonitors, targetConnector, profile);

        const method = verifyOnly ? 0 : 2; // 0 = VERIFY, 2 = PERSISTENT
        const params = new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [
            serial,
            method,
            newLogicalMonitors,
            {}
        ]);

        await this._callMethodAsync('ApplyMonitorsConfig', params);
        return true;
    }

    // --- Synchronous API (Convenient for standalone CLI scripts) ---

    getCurrentState() {
        if (!this._proxy) {
            this._initProxySync();
        }
        const res = this._proxy.call_sync('GetCurrentState', null, Gio.DBusCallFlags.NONE, -1, null);
        const [serial, monitors, logicalMonitors, properties] = res.deepUnpack();
        return { serial, monitors, logicalMonitors, properties };
    }

    getMonitors() {
        const { monitors, logicalMonitors } = this.getCurrentState();
        return this._parseMonitors(monitors, logicalMonitors);
    }

    applyMonitorProfile(targetConnector, profile, verifyOnly = false) {
        const { serial, monitors, logicalMonitors } = this.getCurrentState();
        const newLogicalMonitors = this._buildNewLogicalMonitors(monitors, logicalMonitors, targetConnector, profile);

        const method = verifyOnly ? 0 : 2;
        const params = new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [
            serial,
            method,
            newLogicalMonitors,
            {}
        ]);

        this._proxy.call_sync('ApplyMonitorsConfig', params, Gio.DBusCallFlags.NONE, -1, null);
        return true;
    }

    // --- Internal Helpers ---

    _parseMonitors(monitors, logicalMonitors) {
        const result = [];
        const logicalMap = new Map();

        for (const lm of logicalMonitors) {
            const [x, y, scale, transform, primary, linkedMonitors] = lm;
            for (const [connector] of linkedMonitors) {
                logicalMap.set(connector, { x, y, scale, transform, primary });
            }
        }

        for (const mon of monitors) {
            const [spec, modes, props] = mon;
            const [connector, vendor, product, serialNum] = spec;
            const displayName = props['display-name'] ? props['display-name'].deepUnpack() : connector;
            const logical = logicalMap.get(connector) || null;

            let currentMode = null;
            const supportedScales = new Set();
            const parsedModes = [];

            for (const m of modes) {
                const [id, width, height, rate, prefScale, scales, modeProps] = m;
                const isCurrent = Boolean(modeProps['is-current']);
                const isVrr = modeProps['refresh-rate-mode'] ? modeProps['refresh-rate-mode'].deepUnpack() === 'variable' : false;

                for (const s of scales) {
                    supportedScales.add(Number(s));
                }

                const modeObj = {
                    id,
                    width,
                    height,
                    rate: Math.round(rate * 100) / 100,
                    exactRate: rate,
                    vrr: isVrr,
                    preferredScale: prefScale
                };

                parsedModes.push(modeObj);

                if (isCurrent) {
                    currentMode = {
                        ...modeObj,
                        scale: logical ? logical.scale : prefScale,
                        transform: logical ? logical.transform : 0,
                        primary: logical ? logical.primary : false
                    };
                }
            }

            result.push({
                connector,
                vendor,
                product,
                serialNum,
                hardwareId: `${connector}:${vendor}:${product}`,
                displayName,
                currentMode,
                logical,
                supportedScales: Array.from(supportedScales).sort((a, b) => a - b),
                modes: parsedModes
            });
        }

        return result;
    }

    _buildNewLogicalMonitors(monitors, logicalMonitors, targetConnector, profile) {
        const newLogicalMonitors = [];

        for (const lm of logicalMonitors) {
            const [x, y, scale, transform, primary, linkedMonitors] = lm;
            const monitorsForLM = [];

            for (const [connector] of linkedMonitors) {
                if (connector === targetConnector) {
                    const targetMon = monitors.find(m => m[0][0] === targetConnector);
                    if (!targetMon) {
                        throw new Error(`Monitor ${targetConnector} no encontrado en las salidas conectadas`);
                    }

                    const modes = targetMon[1];
                    let selectedModeId = null;

                    // 1. Coincidencia exacta: resolución, tasa y VRR
                    for (const m of modes) {
                        const [id, w, h, rate, , , modeProps] = m;
                        const isVrr = modeProps['refresh-rate-mode'] ? modeProps['refresh-rate-mode'].deepUnpack() === 'variable' : false;
                        if (w === profile.width && h === profile.height && Math.abs(rate - profile.rate) < 0.5 && isVrr === Boolean(profile.vrr)) {
                            selectedModeId = id;
                            break;
                        }
                    }

                    // 2. Coincidencia por resolución y tasa
                    if (!selectedModeId) {
                        for (const m of modes) {
                            const [id, w, h, rate] = m;
                            if (w === profile.width && h === profile.height && Math.abs(rate - profile.rate) < 0.5) {
                                selectedModeId = id;
                                break;
                            }
                        }
                    }

                    // 3. Coincidencia por resolución
                    if (!selectedModeId) {
                        for (const m of modes) {
                            const [id, w, h] = m;
                            if (w === profile.width && h === profile.height) {
                                selectedModeId = id;
                                break;
                            }
                        }
                    }

                    if (!selectedModeId) {
                        throw new Error(`La resolución ${profile.width}×${profile.height} no está soportada por el monitor ${targetConnector}`);
                    }

                    const targetScale = Number(profile.scale) || 1.0;
                    const targetTransform = typeof profile.transform === 'number' ? profile.transform : transform;
                    const targetPrimary = typeof profile.primary === 'boolean' ? profile.primary : primary;

                    monitorsForLM.push([connector, selectedModeId, {}]);
                    newLogicalMonitors.push([x, y, targetScale, targetTransform, targetPrimary, monitorsForLM]);
                } else {
                    const existingMon = monitors.find(m => m[0][0] === connector);
                    let currentModeId = null;
                    if (existingMon) {
                        for (const m of existingMon[1]) {
                            if (m[6]['is-current']) {
                                currentModeId = m[0];
                                break;
                            }
                        }
                    }
                    monitorsForLM.push([connector, currentModeId, {}]);
                    newLogicalMonitors.push([x, y, scale, transform, primary, monitorsForLM]);
                }
            }
        }

        return newLogicalMonitors;
    }

    destroy() {
        if (this._cancellable) {
            this._cancellable.cancel();
            this._cancellable = null;
        }
        if (this._signalId && this._proxy) {
            this._proxy.disconnect(this._signalId);
            this._signalId = null;
        }
        this._onMonitorsChangedCallbacks = [];
        this._proxy = null;
        this._proxyPromise = null;
    }
}
