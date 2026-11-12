import { DisplayManager } from '../src/displayManager.js';
import { Storage } from '../src/storage.js';
import system from 'system';
import GLib from 'gi://GLib';

async function runE2ETests() {
    print('========================================');
    print('  INICIANDO PRUEBAS E2E (ASYNC DM + STORAGE)');
    print('========================================');

    const dm = new DisplayManager();
    const storage = new Storage();

    // 1. Test getMonitorsAsync
    print('\n[1/5] Probando dm.getMonitorsAsync()...');
    const monitors = await dm.getMonitorsAsync();
    print(`  Monitores detectados: ${monitors.length}`);
    if (monitors.length === 0) {
        throw new Error('No se detectaron monitores');
    }
    const mon = monitors[0];
    print(`  Primer monitor: ${mon.displayName} (${mon.connector})`);
    print(`  Modo actual: ${mon.currentMode.width}x${mon.currentMode.height} @ ${mon.currentMode.rate}Hz | Escala: ${mon.currentMode.scale}`);

    // 2. Test Async Storage save and retrieve
    print('\n[2/5] Probando almacenamiento asíncrono de perfiles...');
    const testProfileName = 'E2E Async Test Profile';
    const testProfile = {
        name: testProfileName,
        width: mon.currentMode.width,
        height: mon.currentMode.height,
        rate: mon.currentMode.rate,
        vrr: mon.currentMode.vrr,
        scale: mon.currentMode.scale,
        transform: mon.currentMode.transform
    };
    const saved = await storage.saveProfileAsync(mon.hardwareId, mon.displayName, testProfile);
    print(`  Perfil asíncrono guardado con ID: ${saved.id}`);

    const profiles = await storage.getProfilesAsync(mon.hardwareId);
    const found = profiles.find(p => p.id === saved.id);
    if (!found || found.name !== testProfileName) {
        throw new Error('El perfil guardado no se encontró en Storage asíncrono');
    }
    print('  Verificación de lectura en Storage asíncrono exitosa.');

    // 3. Test applyMonitorProfileAsync with verifyOnly=true
    print('\n[3/5] Probando dm.applyMonitorProfileAsync(verifyOnly=true)...');
    const verifySuccess = await dm.applyMonitorProfileAsync(mon.connector, found, true);
    print(`  dm.applyMonitorProfileAsync(verifyOnly=true) resultado: ${verifySuccess}`);
    if (!verifySuccess) {
        throw new Error('Fallo al verificar el perfil con Mutter');
    }

    // 4. Clean up test profile asynchronously
    print('\n[4/5] Limpiando perfil de prueba asíncronamente...');
    const deleted = await storage.deleteProfileAsync(mon.hardwareId, saved.id);
    print(`  deleteProfileAsync resultado: ${deleted}`);
    if (!deleted) {
        throw new Error('Fallo al eliminar el perfil en Storage asíncrono');
    }

    // 5. Test DisplayManager lifecycle & teardown
    print('\n[5/5] Probando ciclo de vida y limpieza de DisplayManager...');
    dm.destroy();
    if (dm._proxy !== null || dm._signalId !== null) {
        throw new Error('DisplayManager no limpió las señales o el proxy adecuadamente');
    }
    print('  DisplayManager.destroy() ejecutado limpiamente.');

    print('\n========================================');
    print('  ¡TODAS LAS PRUEBAS E2E PASARON CON ÉXITO!');
    print('========================================');
}

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
