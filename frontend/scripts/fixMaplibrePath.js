const fs = require("fs");
const path = require("path");
// Path to your settings.gradle.kts
// eslint-disable-next-line no-undef
const gradleKts = path.join(__dirname, "..", "android", "settings.gradle.kts");
// Path to your settings.gradle.kts
// eslint-disable-next-line no-undef
const gradleGroovy = path.join(__dirname, "..", "android", "settings.gradle");

let settingsFile = "";

if (fs.existsSync(gradleKts)) {
  settingsFile = gradleKts;
} else if (fs.existsSync(gradleGroovy)) {
  settingsFile = gradleGroovy;
} else {
  console.error(
    "Cannot find settings.gradle.kts or settings.gradle in android folder!"
  );
  process.exit(1);
}

let content = fs.readFileSync(settingsFile, "utf8");

if (!content.includes("FIX MAPLIBRE RELATIVE PATH")) {
  content +=
    `\n\n// ---- FIX MAPLIBRE RELATIVE PATH ----\n` +
    `val maplibreProject = findProject(":@maplibre_maplibre-react-native")\n` +
    `maplibreProject?.projectDir = file("../node_modules/@maplibre/maplibre-react-native/android")\n`;

  fs.writeFileSync(settingsFile, content, "utf8");
  console.log("Patched @maplibre maplibre-react-native path to relative.");
} else {
  console.log("Patch already applied. Skipping.");
}
