module.exports = {
    apps: [
        {
            name: "gold-api",
            script: "./api.js",
            env: {
                NODE_ENV: "production",
            },
            instances: 1,
            exec_mode: "fork",
        },
        {
            name: "gold-worker",
            script: "./server.js",
            env: {
                NODE_ENV: "production",
            },
            instances: 1,
            exec_mode: "fork",
        },
    ],
};
