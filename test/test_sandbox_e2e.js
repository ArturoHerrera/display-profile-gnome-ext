import { DisplayManager } from '../src/displayManager.js';
import { Storage } from '../src/storage.js';
import system from 'system';

async function runE2ETests() {
    print('========================================');
    print('  INICIANDO PRUEBAS E2E (ASYNC DM + STORAGE)');
    print('========================================');

    const dm = new DisplayManager();
    const storage = new Storage();

    // 1. Test getMonitorsAsync
    print('\n[1/4] Probando dm.getMonitorsAsync()...');
    const monitors = await dm.getMonitorsAsync();
    print(`  Monitores detectados: ${monitors.length}`);
    if (monitors.length === 0) {
        throw new Error('No se detectaron monitores');
    }
    const mon = monitors[0];
    print(`  Primer monitor: ${mon.displayName} (${mon.connector})`);
    print(`  Modo actual: ${mon.currentMode.width}x${mon.currentMode.height} @ ${mon.currentMode.rate}Hz | Escala: ${mon.currentMode.scale}`);

    // 2. Test Storage save and retrieve
    print('\n[2/4] Probando almacenamiento de perfiles...');
    const testProfileName = 'E2E Test Profile';
    const testProfile = {
        name: testProfileName,
        width: mon.currentMode.width,
        height: mon.currentMode.height,
        rate: mon.currentMode.rate,
        vrr: mon.currentMode.vrr,
        scale: mon.currentMode.scale,
        transform: mon.currentMode.transform
    };
    const saved = storage.saveProfile(mon.hardwareId, mon.displayName, testProfile);
    print(`  Perfil guardado con ID: ${saved.id}`);

    const profiles = storage.getProfiles(mon.hardwareId);
    const found = profiles.find(p => p.id === saved.id);
    if (!found || found.name !== testProfileName) {
        throw new Error('El perfil guardado no se encontró en Storage');
    }
    print('  Verificación de lectura en Storage exitosa.');

    // 3. Test applyMonitorProfileAsync with verifyOnly=true
    print('\n[3/4] Probando dm.applyMonitorProfileAsync(verifyOnly=true)...');
    const verifySuccess = await dm.applyMonitorProfileAsync(mon.connector, found, true);
    print(`  dm.applyMonitorProfileAsync(verifyOnly=true) resultado: ${verifySuccess}`);
    if (!verifySuccess) {
        throw new Error('Fallo al verificar el perfil con Mutter');
    }

    // 4. Clean up test profile
    print('\n[4/4] Limpiando perfil de prueba...');
    const deleted = storage.deleteProfile(mon.hardwareId, saved.id);
    print(`  deleteProfile resultado: ${deleted}`);

    print('\n========================================');
    print('  ¡TODAS LAS PRUEBAS E2E PASARON CON ÉXITO!');
    print('========================================');
}

import GLib from 'gi://GLib';

const loop = new GLib.MainLoop(null, false);

runE2ETests().then(() => {
    loop.quit();
    system.exit(0);
}).catch(err => {
    print(`ERROR: ${err.message}\n${err.stack}`);
    loop.quit();
    system.exit(1);
});

loop.run();
