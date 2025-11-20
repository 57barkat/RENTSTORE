const fs = require("fs");
const path = require("path");

// Path to your settings.gradle.kts
// eslint-disable-next-line no-undef
const gradleKts = path.join(__dirname, "..", "android", "settings.gradle.kts");
// Path to your settings.gradle.kts
// eslint-disable-next-line no-undef
const gradleGroovy = path.join(__dirname, "..", "android", "settings.gradle");

let settingsFile = "";
let isKotlin = false;

// Detect which file exists
if (fs.existsSync(gradleKts)) {
  settingsFile = gradleKts;
  isKotlin = true;
} else if (fs.existsSync(gradleGroovy)) {
  settingsFile = gradleGroovy;
  isKotlin = false;
} else {
  console.error("Cannot find settings.gradle.kts or settings.gradle in android folder!");
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(settingsFile, "utf8");

// Check if patch already exists
if (!content.includes("FIX MAPLIBRE RELATIVE PATH")) {
  const patch = isKotlin
    ? `\n\n// ---- FIX MAPLIBRE RELATIVE PATH ----\n` +
      `val maplibreProject = findProject(":@maplibre_maplibre-react-native")\n` +
      `maplibreProject?.projectDir = file("../node_modules/@maplibre/maplibre-react-native/android")\n`
    : `\n\n// ---- FIX MAPLIBRE RELATIVE PATH ----\n` +
      `def maplibreProject = findProject(":@maplibre_maplibre-react-native")\n` +
      `if (maplibreProject != null) {\n` +
      `    maplibreProject.projectDir = file("../node_modules/@maplibre/maplibre-react-native/android")\n` +
      `}\n`;

  fs.writeFileSync(settingsFile, content + patch, "utf8");
  console.log(`Patched @maplibre maplibre-react-native path to relative (${isKotlin ? "Kotlin DSL" : "Groovy DSL"}).`);
} else {
  console.log("Patch already applied. Skipping.");
}
