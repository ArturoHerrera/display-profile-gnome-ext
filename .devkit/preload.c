#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <spawn.h>
#include <unistd.h>
#include <fcntl.h>

static const char *devkit_override = NULL;

static void init_override(void) {
    if (!devkit_override) {
        devkit_override = getenv("MUTTER_DEVKIT_PATH");
    }
}

int execve(const char *pathname, char *const argv[], char *const envp[]) {
    static int (*real_execve)(const char *, char *const[], char *const[]) = NULL;
    if (!real_execve) real_execve = dlsym(RTLD_NEXT, "execve");
    init_override();
    if (devkit_override && pathname && strcmp(pathname, "/usr/libexec/mutter-devkit") == 0) {
        fprintf(stderr, "[sandbox-preload] Redirecting execve: %s -> %s\n", pathname, devkit_override);
        pathname = devkit_override;
    }
    return real_execve(pathname, argv, envp);
}

int execv(const char *pathname, char *const argv[]) {
    static int (*real_execv)(const char *, char *const[]) = NULL;
    if (!real_execv) real_execv = dlsym(RTLD_NEXT, "execv");
    init_override();
    if (devkit_override && pathname && strcmp(pathname, "/usr/libexec/mutter-devkit") == 0) {
        fprintf(stderr, "[sandbox-preload] Redirecting execv: %s -> %s\n", pathname, devkit_override);
        pathname = devkit_override;
    }
    return real_execv(pathname, argv);
}

int posix_spawn(pid_t *pid, const char *path, const posix_spawn_file_actions_t *file_actions,
                const posix_spawnattr_t *attrp, char *const argv[], char *const envp[]) {
    static int (*real_posix_spawn)(pid_t *, const char *, const posix_spawn_file_actions_t *,
                                  const posix_spawnattr_t *, char *const[], char *const[]) = NULL;
    if (!real_posix_spawn) real_posix_spawn = dlsym(RTLD_NEXT, "posix_spawn");
    init_override();
    if (devkit_override && path && strcmp(path, "/usr/libexec/mutter-devkit") == 0) {
        fprintf(stderr, "[sandbox-preload] Redirecting posix_spawn: %s -> %s\n", path, devkit_override);
        path = devkit_override;
    }
    return real_posix_spawn(pid, path, file_actions, attrp, argv, envp);
}

int posix_spawnp(pid_t *pid, const char *file, const posix_spawn_file_actions_t *file_actions,
                 const posix_spawnattr_t *attrp, char *const argv[], char *const envp[]) {
    static int (*real_posix_spawnp)(pid_t *, const char *, const posix_spawn_file_actions_t *,
                                   const posix_spawnattr_t *, char *const[], char *const[]) = NULL;
    if (!real_posix_spawnp) real_posix_spawnp = dlsym(RTLD_NEXT, "posix_spawnp");
    init_override();
    if (devkit_override && file && strcmp(file, "/usr/libexec/mutter-devkit") == 0) {
        fprintf(stderr, "[sandbox-preload] Redirecting posix_spawnp: %s -> %s\n", file, devkit_override);
        file = devkit_override;
    }
    return real_posix_spawnp(pid, file, file_actions, attrp, argv, envp);
}
