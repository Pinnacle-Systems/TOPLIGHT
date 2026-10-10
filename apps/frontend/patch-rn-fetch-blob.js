const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'rn-fetch-blob', 'android', 'build.gradle');

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix jcenter
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    
    // Fix proguard
    content = content.replace(/proguard-android\.txt/g, 'proguard-android-optimize.txt');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched rn-fetch-blob build.gradle for Gradle 8 compatibility');
} else {
    console.log('rn-fetch-blob build.gradle not found');
}
