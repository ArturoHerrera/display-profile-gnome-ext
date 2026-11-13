/*
 * Display Profile Manager
 * Copyright (C) 2026 Arturo Herrera
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { Storage } from './storage.js';

const _debug = false;
function logError(msg) {
    if (_debug) {
        console.error(msg);
    }
}

export default class DisplayProfilesPreferences extends ExtensionPreferences {
    async fillPreferencesWindow(window) {
        window.set_default_size(680, 500);

        const storage = new Storage();
        const profilesPage = new Adw.PreferencesPage({
            title: _('Profiles'),
            icon_name: 'video-display-symbolic'
        });
        window.add(profilesPage);

        let data;
        try {
            data = await storage.loadAsync();
        } catch (e) {
            logError(`[DisplayProfiles Prefs] Failed to load profiles: ${e}`);
            data = { monitors: {} };
        }

        const monitors = data.monitors || {};
        const monitorKeys = Object.keys(monitors);

        if (monitorKeys.length === 0) {
            const emptyGroup = new Adw.PreferencesGroup({
                title: _('Saved Profiles')
            });
            const emptyRow = new Adw.ActionRow({
                title: _('No saved profiles found'),
                subtitle: _('Use the top bar menu to save your current display configuration.')
            });
            emptyGroup.add(emptyRow);
            profilesPage.add(emptyGroup);
        } else {
            for (const hwId of monitorKeys) {
                const monData = monitors[hwId];
                const profiles = monData.profiles || [];

                const group = new Adw.PreferencesGroup({
                    title: monData.displayName || hwId,
                    description: hwId
                });

                if (profiles.length === 0) {
                    const noProfRow = new Adw.ActionRow({
                        title: _('No saved profiles for this monitor')
                    });
                    group.add(noProfRow);
                } else {
                    for (const prof of profiles) {
                        const row = new Adw.ActionRow({
                            title: prof.name,
                            subtitle: `${prof.width} × ${prof.height} @ ${prof.rate} Hz | ${Math.round(prof.scale * 100)}%`
                        });

                        const deleteButton = new Gtk.Button({
                            icon_name: 'user-trash-symbolic',
                            valign: Gtk.Align.CENTER,
                            css_classes: ['flat', 'destructive-action'],
                            tooltip_text: _('Delete Profile')
                        });

                        deleteButton.connect('clicked', async () => {
                            deleteButton.set_sensitive(false);
                            try {
                                await storage.deleteProfileAsync(hwId, prof.id);
                                group.remove(row);
                            } catch (err) {
                                logError(`[DisplayProfiles Prefs] Error deleting profile: ${err}`);
                                deleteButton.set_sensitive(true);
                            }
                        });

                        row.add_suffix(deleteButton);
                        group.add(row);
                    }
                }

                profilesPage.add(group);
            }
        }

        // About / Credits Page
        const aboutPage = new Adw.PreferencesPage({
            title: _('About'),
            icon_name: 'help-about-symbolic'
        });
        window.add(aboutPage);

        const aboutGroup = new Adw.PreferencesGroup({
            title: _('Display Profile Manager'),
            description: _('Manage and switch display resolution, UI scaling, refresh rate, and orientation per monitor instantly.')
        });
        aboutPage.add(aboutGroup);

        const egoVersion = this.metadata?.version ?? 3;
        const versionRow = new Adw.ActionRow({
            title: _('Version'),
            subtitle: `1.0.2 (EGO v${egoVersion})`
        });
        aboutGroup.add(versionRow);

        const authorRow = new Adw.ActionRow({
            title: _('Author & Credits'),
            subtitle: 'Arturo Herrera'
        });
        aboutGroup.add(authorRow);

        const licenseRow = new Adw.ActionRow({
            title: _('License'),
            subtitle: 'GNU General Public License v3.0 or later (GPL-3.0-or-later)'
        });
        aboutGroup.add(licenseRow);

        const repoUrl = this.metadata?.url || 'https://github.com/ArturoHerrera/display-profile-gnome-ext';
        const githubRow = new Adw.ActionRow({
            title: _('GitHub Repository'),
            subtitle: repoUrl,
            activatable: true
        });

        const linkButton = new Gtk.Button({
            icon_name: 'adw-external-link-symbolic',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
            tooltip_text: _('Open in browser')
        });

        const openRepo = () => {
            try {
                Gio.AppInfo.launch_default_for_uri(repoUrl, null);
            } catch (err) {
                logError(`[DisplayProfiles Prefs] Error opening URL: ${err}`);
            }
        };

        linkButton.connect('clicked', openRepo);
        githubRow.connect('activated', openRepo);
        githubRow.add_suffix(linkButton);

        aboutGroup.add(githubRow);
    }
}
