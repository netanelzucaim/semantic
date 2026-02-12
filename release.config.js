// release.config.js
const pluginName = process.env.PLUGIN_NAME;

module.exports = {
  extends: "semantic-release-monorepo",
  // Creates tags like: ansible-v1.0.1
  tagFormat: `${pluginName}-v\${version}`,
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        // Only releases if the commit scope matches the plugin folder name
        releaseRules: [
          { scope: pluginName, release: "patch" },
          { scope: pluginName, type: "feat", release: "minor" },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: "README.md", // Updates the specific plugin's README
      },
    ],
    [
      "@semantic-release/exec",
      {
        // Injects the new version into your Docker build command
        prepareCmd: `docker build -t \${process.env.DOCKER_REG_USERNAME}/${pluginName}:\${nextRelease.version} .`,
        publishCmd: `docker push \${process.env.DOCKER_REG_USERNAME}/${pluginName}:\${nextRelease.version}`,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["README.md", "package.json"],
        message: `chore(${pluginName}): release \${nextRelease.version} [skip ci]`,
      },
    ],
  ],
};
