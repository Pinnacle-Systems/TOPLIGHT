const fs = require('fs');
const filePath = 'apps/frontend/src/screens/auth/LoginScreen.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings temporarily or match CRLF
if (content.includes('style={styles.loginButtonWrapper}')) {
  content = content.replace(
    'style={styles.loginButtonWrapper}',
    'testID="signInButton"\n                                accessibilityLabel="Sign In"\n                                accessibilityRole="button"\n                                style={styles.loginButtonWrapper}'
  );
}

if (content.includes('style={styles.companyItem}')) {
  content = content.replace(
    'style={styles.companyItem}',
    'testID={`company-${comp.companyCode}`}\n                                        accessibilityLabel={comp.companyCode}\n                                        accessibilityRole="button"\n                                        style={styles.companyItem}'
  );
}

if (content.includes('ref={usernameRef}')) {
  content = content.replace(
    'ref={usernameRef}',
    'testID="usernameInput"\n                                    accessibilityLabel="Username"\n                                    ref={usernameRef}'
  );
}

if (content.includes('ref={passwordRef}')) {
  content = content.replace(
    'ref={passwordRef}',
    'testID="passwordInput"\n                                    accessibilityLabel="Password"\n                                    ref={passwordRef}'
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('LoginScreen.jsx successfully updated with accessibility and testIDs!');

