const fs = require("fs");
const path = require("path");

// Path to your settings.gradle.kts
// eslint-disable-next-line no-undef
const settingsGradleKts = path.join(__dirname, "..", "android", "settings.gradle.kts");

// Read the file
let content = fs.readFileSync(settingsGradleKts, "utf8");

// Check if the patch already exists to avoid duplicates
if (!content.includes("FIX MAPLIBRE RELATIVE PATH")) {
  // Add patch at the end of the file
  content += `\n\n// ---- FIX MAPLIBRE RELATIVE PATH ----\n` +
             `val maplibreProject = findProject(":@maplibre_maplibre-react-native")\n` +
             `maplibreProject?.projectDir = file("../node_modules/@maplibre/maplibre-react-native/android")\n`;

  fs.writeFileSync(settingsGradleKts, content, "utf8");
  console.log("Patched @maplibre maplibre-react-native path to relative.");
} else {
  console.log("Patch already applied. Skipping.");
}
