#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <spawn.h>
#include <unistd.h>
#include <fcntl.h>

static const char *devkit_override = NULL;
static const char *host_runtime_dir = NULL;

static void init_override(void) {
    if (!devkit_override) {
        devkit_override = getenv("MUTTER_DEVKIT_PATH");
    }
    if (!host_runtime_dir) {
        host_runtime_dir = getenv("HOST_XDG_RUNTIME_DIR");
    }
}

static char **fix_env(char *const envp[]) {
    if (!host_runtime_dir || !envp) return (char **)envp;
    int count = 0;
    while (envp[count]) count++;
    char **new_env = malloc((count + 4) * sizeof(char *));
    int j = 0;
    for (int i = 0; i < count; i++) {
        if (strncmp(envp[i], "XDG_RUNTIME_DIR=", 16) == 0) {
            char buf[512];
            snprintf(buf, sizeof(buf), "XDG_RUNTIME_DIR=%s", host_runtime_dir);
            new_env[j++] = strdup(buf);
        } else {
            new_env[j++] = strdup(envp[i]);
        }
    }
    new_env[j++] = strdup("G_MESSAGES_DEBUG=all");
    new_env[j++] = strdup("GTK_DEBUG=all");
    new_env[j] = NULL;
    return new_env;
}

int execve(const char *pathname, char *const argv[], char *const envp[]) {
    static int (*real_execve)(const char *, char *const[], char *const[]) = NULL;
    if (!real_execve) real_execve = dlsym(RTLD_NEXT, "execve");
    init_override();
    if (devkit_override && pathname && strcmp(pathname, "/usr/libexec/mutter-devkit") == 0) {
        fprintf(stderr, "[sandbox-preload] Launching mutter-devkit with host XDG_RUNTIME_DIR: %s\n", host_runtime_dir ? host_runtime_dir : "default");
        char **new_env = fix_env(envp);
        return real_execve(devkit_override, argv, new_env);
    }
    return real_execve(pathname, argv, envp);
}

int execv(const char *pathname, char *const argv[]) {
    static int (*real_execv)(const char *, char *const[]) = NULL;
    if (!real_execv) real_execv = dlsym(RTLD_NEXT, "execv");
    init_override();
    if (devkit_override && pathname && strcmp(pathname, "/usr/libexec/mutter-devkit") == 0) {
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
        fprintf(stderr, "[sandbox-preload] Launching mutter-devkit with host XDG_RUNTIME_DIR: %s\n", host_runtime_dir ? host_runtime_dir : "default");
        char **new_env = fix_env(envp);
        return real_posix_spawn(pid, devkit_override, file_actions, attrp, argv, new_env);
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
        fprintf(stderr, "[sandbox-preload] Launching mutter-devkit with host XDG_RUNTIME_DIR: %s\n", host_runtime_dir ? host_runtime_dir : "default");
        char **new_env = fix_env(envp);
        return real_posix_spawnp(pid, devkit_override, file_actions, attrp, argv, new_env);
    }
    return real_posix_spawnp(pid, file, file_actions, attrp, argv, envp);
}
