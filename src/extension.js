import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import { DisplayManager } from './displayManager.js';
import { Storage } from './storage.js';

const ProfileSaveDialog = GObject.registerClass(
class ProfileSaveDialog extends ModalDialog.ModalDialog {
    _init(monitor, onSave) {
        super._init();
        this._monitor = monitor;
        this._onSave = onSave;
        this._activateSignalId = null;

        const content = new St.BoxLayout({
            vertical: true,
            style: 'padding: 16px; min-width: 340px; spacing: 10px;'
        });

        const title = new St.Label({
            text: _('Save Display Profile'),
            style: 'font-weight: bold; font-size: 1.15em;'
        });
        content.add_child(title);

        const cur = monitor.currentMode;
        const detailsText = `${monitor.displayName || monitor.connector}\n` +
            `${cur.width} × ${cur.height} (${cur.rate} Hz${cur.vrr ? ' VRR' : ''})\n` +
            `${_('UI Scale: %d%%').format(Math.round(cur.scale * 100))}`;

        const details = new St.Label({
            text: detailsText,
            style: 'color: #9a9996; font-size: 0.9em; line-height: 1.4;'
        });
        content.add_child(details);

        this._entry = new St.Entry({
            hint_text: _('Profile name (e.g. Work 4K, Gaming 1440p)'),
            can_focus: true,
            style: 'margin-top: 10px; min-width: 300px;'
        });
        content.add_child(this._entry);

        this.contentLayout.add_child(content);

        this.addButton({
            label: _('Cancel'),
            action: () => this.close(),
            key: Clutter.KEY_Escape
        });

        this.addButton({
            label: _('Save'),
            action: () => {
                const name = this._entry.get_text().trim();
                if (name.length > 0) {
                    this._onSave(name);
                    this.close();
                }
            },
            isDefault: true
        });

        this._activateSignalId = this._entry.clutter_text.connect('activate', () => {
            const name = this._entry.get_text().trim();
            if (name.length > 0) {
                this._onSave(name);
                this.close();
            }
        });
    }

    close() {
        if (this._activateSignalId && this._entry?.clutter_text) {
            this._entry.clutter_text.disconnect(this._activateSignalId);
            this._activateSignalId = null;
        }
        super.close();
        this.destroy();
    }

    destroy() {
        if (this._activateSignalId && this._entry?.clutter_text) {
            this._entry.clutter_text.disconnect(this._activateSignalId);
            this._activateSignalId = null;
        }
        super.destroy();
    }
});

const DisplayIndicator = GObject.registerClass(
class DisplayIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, _('Display Profile Manager'));
        this._extension = extension;
        this._displayManager = new DisplayManager();
        this._storage = new Storage();
        this._isLoading = false;
        this._activeDialog = null;

        const icon = new St.Icon({
            icon_name: 'video-display-symbolic',
            style_class: 'system-status-icon'
        });
        this.add_child(icon);

        const placeholder = new PopupMenu.PopupMenuItem(_('Loading profiles...'));
        placeholder.setSensitive(false);
        this.menu.addMenuItem(placeholder);

        this._displayManager.onMonitorsChanged(() => {
            if (this.menu.isOpen) {
                this._refreshMenuAsync().catch(err => {
                    console.error(`[DisplayProfiles] Error updating on monitors change: ${err}`);
                });
            }
        });

        this._openStateChangedId = this.menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen) {
                this._refreshMenuAsync().catch(err => {
                    console.error(`[DisplayProfiles] Error refreshing menu: ${err}`);
                });
            }
        });
    }

    async _refreshMenuAsync() {
        if (this._isLoading) {
            return;
        }
        this._isLoading = true;

        try {
            const monitors = await this._displayManager.getMonitorsAsync();
            this.menu.removeAll();

            if (!monitors || monitors.length === 0) {
                const emptyItem = new PopupMenu.PopupMenuItem(_('No displays detected'));
                emptyItem.setSensitive(false);
                this.menu.addMenuItem(emptyItem);
                return;
            }

            if (monitors.length === 1) {
                await this._buildSingleMonitorMenu(monitors[0]);
            } else {
                await this._buildMultiMonitorMenu(monitors);
            }

            // Global Preferences Footer
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            const prefsItem = new PopupMenu.PopupMenuItem(_('Preferences...'));
            prefsItem.connect('activate', () => {
                this._extension.openPreferences();
            });
            this.menu.addMenuItem(prefsItem);
        } catch (e) {
            console.error(`[DisplayProfiles] Error retrieving monitors asynchronously: ${e}`);
            this.menu.removeAll();
            const errItem = new PopupMenu.PopupMenuItem(_('Error loading displays'));
            errItem.setSensitive(false);
            this.menu.addMenuItem(errItem);
        } finally {
            this._isLoading = false;
        }
    }

    async _buildSingleMonitorMenu(mon) {
        const cur = mon.currentMode;

        // Header
        const headerText = `${mon.displayName || mon.connector}`;
        const subText = `${cur.width}×${cur.height} @ ${cur.rate}Hz | ${Math.round(cur.scale * 100)}%`;
        const headerItem = new PopupMenu.PopupMenuItem(`${headerText}  (${subText})`);
        headerItem.setSensitive(false);
        this.menu.addMenuItem(headerItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Saved profiles
        const profiles = await this._storage.getProfilesAsync(mon.hardwareId);
        if (profiles.length === 0) {
            const noProfiles = new PopupMenu.PopupMenuItem(_('No saved profiles'));
            noProfiles.setSensitive(false);
            this.menu.addMenuItem(noProfiles);
        } else {
            for (const prof of profiles) {
                const isCurrent = (
                    cur.width === prof.width &&
                    cur.height === prof.height &&
                    Math.abs(cur.scale - prof.scale) < 0.05
                );

                const itemText = `${prof.name}   [${prof.width}×${prof.height} | ${Math.round(prof.scale * 100)}%]`;
                const item = new PopupMenu.PopupMenuItem(itemText);

                if (isCurrent) {
                    item.setOrnament(PopupMenu.Ornament.DOT);
                }

                item.connect('activate', () => {
                    this._displayManager.applyMonitorProfileAsync(mon.connector, prof)
                        .then(async () => {
                            await this._refreshMenuAsync();
                        })
                        .catch(e => {
                            console.error(`[DisplayProfiles] Failed to apply profile ${prof.name}: ${e}`);
                            Main.notify(_('Error applying profile'), `${e.message}`);
                        });
                });

                this.menu.addMenuItem(item);
            }
        }

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Action: Save Current Configuration
        const saveItem = new PopupMenu.PopupMenuItem(_('Save current configuration...'));
        saveItem.connect('activate', () => {
            this._openSaveDialog(mon, cur);
        });
        this.menu.addMenuItem(saveItem);

        // Action: Delete profile submenu if any exist
        if (profiles.length > 0) {
            const manageSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Delete a profile...'));
            for (const prof of profiles) {
                const delItem = new PopupMenu.PopupMenuItem(_('Delete "%s"').format(prof.name));
                delItem.connect('activate', () => {
                    this._storage.deleteProfileAsync(mon.hardwareId, prof.id)
                        .then(async () => {
                            await this._refreshMenuAsync();
                            Main.notify(_('Profile deleted'), _('Profile "%s" deleted').format(prof.name));
                        })
                        .catch(console.error);
                });
                manageSubMenu.menu.addMenuItem(delItem);
            }
            this.menu.addMenuItem(manageSubMenu);
        }
    }

    async _buildMultiMonitorMenu(monitors) {
        for (const mon of monitors) {
            const cur = mon.currentMode;
            const subMenuTitle = `${mon.displayName || mon.connector} (${cur.width}×${cur.height} | ${Math.round(cur.scale * 100)}%)`;
            const monitorSubMenu = new PopupMenu.PopupSubMenuMenuItem(subMenuTitle);

            const profiles = await this._storage.getProfilesAsync(mon.hardwareId);
            if (profiles.length === 0) {
                const noProfiles = new PopupMenu.PopupMenuItem(_('No saved profiles'));
                noProfiles.setSensitive(false);
                monitorSubMenu.menu.addMenuItem(noProfiles);
            } else {
                for (const prof of profiles) {
                    const isCurrent = (
                        cur.width === prof.width &&
                        cur.height === prof.height &&
                        Math.abs(cur.scale - prof.scale) < 0.05
                    );

                    const itemText = `${prof.name}   [${prof.width}×${prof.height} | ${Math.round(prof.scale * 100)}%]`;
                    const item = new PopupMenu.PopupMenuItem(itemText);
                    if (isCurrent) {
                        item.setOrnament(PopupMenu.Ornament.DOT);
                    }

                    item.connect('activate', () => {
                        this._displayManager.applyMonitorProfileAsync(mon.connector, prof)
                            .then(async () => {
                                await this._refreshMenuAsync();
                            })
                            .catch(e => {
                                console.error(`[DisplayProfiles] Failed to apply profile ${prof.name}: ${e}`);
                                Main.notify(_('Error applying profile'), `${e.message}`);
                            });
                    });

                    monitorSubMenu.menu.addMenuItem(item);
                }
            }

            monitorSubMenu.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            const saveItem = new PopupMenu.PopupMenuItem(_('Save current configuration...'));
            saveItem.connect('activate', () => {
                this._openSaveDialog(mon, cur);
            });
            monitorSubMenu.menu.addMenuItem(saveItem);

            if (profiles.length > 0) {
                const deleteSubMenu = new PopupMenu.PopupSubMenuMenuItem(_('Delete a profile...'));
                for (const prof of profiles) {
                    const delItem = new PopupMenu.PopupMenuItem(_('Delete "%s"').format(prof.name));
                    delItem.connect('activate', () => {
                        this._storage.deleteProfileAsync(mon.hardwareId, prof.id)
                            .then(async () => {
                                await this._refreshMenuAsync();
                                Main.notify(_('Profile deleted'), _('Profile "%s" deleted').format(prof.name));
                            })
                            .catch(console.error);
                    });
                    deleteSubMenu.menu.addMenuItem(delItem);
                }
                monitorSubMenu.menu.addMenuItem(deleteSubMenu);
            }

            this.menu.addMenuItem(monitorSubMenu);
        }
    }

    _openSaveDialog(mon, cur) {
        if (this._activeDialog) {
            this._activeDialog.destroy();
            this._activeDialog = null;
        }

        const dialog = new ProfileSaveDialog(mon, (profileName) => {
            const newProfile = {
                name: profileName,
                width: cur.width,
                height: cur.height,
                rate: cur.rate,
                vrr: cur.vrr,
                scale: cur.scale,
                transform: cur.transform
            };
            this._storage.saveProfileAsync(mon.hardwareId, mon.displayName, newProfile)
                .then(async () => {
                    await this._refreshMenuAsync();
                    Main.notify(_('Profile saved'), _('Profile "%s" saved').format(profileName));
                })
                .catch(console.error);
        });

        this._activeDialog = dialog;
        dialog.connect('destroy', () => {
            if (this._activeDialog === dialog) {
                this._activeDialog = null;
            }
        });
        dialog.open();
    }

    destroy() {
        if (this._openStateChangedId) {
            this.menu.disconnect(this._openStateChangedId);
            this._openStateChangedId = null;
        }

        if (this._activeDialog) {
            this._activeDialog.destroy();
            this._activeDialog = null;
        }

        if (this._displayManager) {
            this._displayManager.destroy();
            this._displayManager = null;
        }

        super.destroy();
    }
});

export default class DisplayProfileExtension extends Extension {
    enable() {
        console.log(`[DisplayProfiles] Extension ${this.uuid} enabled`);
        this._indicator = new DisplayIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        console.log(`[DisplayProfiles] Extension ${this.uuid} disabled`);
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
