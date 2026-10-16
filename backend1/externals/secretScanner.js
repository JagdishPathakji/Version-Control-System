/**
 * Secret & Credential Leak Scanner Engine
 * Scans repository files for leaked API keys, tokens, database URIs, passwords, and private keys.
 */

const BINARY_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'webp',
    'pdf', 'zip', 'tar', 'gz', '7z', 'rar',
    'woff', 'woff2', 'ttf', 'eot',
    'mp4', 'mp3', 'mov', 'wav',
    'exe', 'dll', 'so', 'dylib', 'bin', 'o', 'a'
]);

const COMMON_PLACEHOLDERS = new Set([
    'password', 'your_password', 'your-password', '<password>', 'mypassword',
    'secret', 'your_secret', 'your-secret', '<secret>', 'mysecret',
    'apikey', 'your_api_key', 'your-api-key', '<api_key>', 'api_key',
    'null', 'undefined', 'true', 'false', 'none', 'test', 'demo', 'sample',
    'changeme', 'change_me', 'placeholder', 'xxxx', 'xxxxxx', '******'
]);

function isPlaceholder(val) {
    if (!val) return true;
    const clean = val.replace(/["']/g, '').trim().toLowerCase();
    if (clean.length === 0) return true;
    return COMMON_PLACEHOLDERS.has(clean);
}

const SECRET_RULES = [
    {
        id: 'aws_access_key',
        name: 'AWS Access Key ID',
        severity: 'CRITICAL',
        pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
        description: 'Exposed AWS IAM user access key ID.',
        remediation: 'Deactivate and delete this access key in AWS IAM immediately. Use IAM Roles or environment variables instead.'
    },
    {
        id: 'aws_secret_key',
        name: 'AWS Secret Access Key',
        severity: 'CRITICAL',
        pattern: /(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi,
        extractMatch: (m) => m[1],
        description: 'Plaintext AWS Secret Access Key detected in code.',
        remediation: 'Rotate this secret key immediately in AWS IAM and purge it from your git repository history.'
    },
    {
        id: 'private_key',
        name: 'Private Cryptographic Key',
        severity: 'CRITICAL',
        pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
        description: 'Exposed private cryptographic key header block.',
        remediation: 'Revoke and replace this keypair immediately. Add private key extensions (*.pem, *.key, id_rsa) to your .gitignore.'
    },
    {
        id: 'github_token',
        name: 'GitHub Personal Access Token',
        severity: 'CRITICAL',
        pattern: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}|github_pat_[A-Za-z0-9_]{22}_[A-Za-z0-9_]{59})\b/g,
        description: 'Live GitHub Personal Access or OAuth Token found.',
        remediation: 'Revoke this token immediately via GitHub Settings > Developer Settings > Personal Access Tokens.'
    },
    {
        id: 'stripe_key',
        name: 'Stripe Secret / Restricted Key',
        severity: 'CRITICAL',
        pattern: /\b((?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{24,99})\b/g,
        description: 'Stripe payment gateway secret key exposed.',
        remediation: 'Roll this API key in the Stripe Dashboard immediately to prevent unauthorized payment transactions.'
    },
    {
        id: 'kv_db_connection',
        name: 'Database Connection String with Credentials',
        severity: 'CRITICAL',
        // Matches ADO.NET/ODBC/MySQL/SQL Server connection strings with Password=..., or connection_string=Server=...
        pattern: /(?:(?:connection_string|conn_str|database_url|db_url|db_connection)\s*[:=]\s*["']?([^"'\r\n]+)["']?|(?:(?:server|data source|host)=[^;\r\n]+;.*?(?:password|pwd)\s*=\s*([^;\r\n\s"']+))|(?:(?:password|pwd)\s*=\s*([^;\r\n\s"']+);.*?(?:server|data source|host)=[^;\r\n]+))/gi,
        extractMatch: (m) => m[1] || m[2] || m[3] || m[0],
        description: 'Full database connection string or credentials detected in configuration/code.',
        remediation: 'Move database connection strings to environment variables or a secrets manager. Rotate database passwords immediately.'
    },
    {
        id: 'mongodb_uri',
        name: 'MongoDB Credentials in Connection URI',
        severity: 'HIGH',
        pattern: /mongodb(?:\+srv)?:\/\/[^:\s"']+:(?:[^@\s"']+)@[^\/\s"']+/gi,
        extractMatch: (m) => m[0],
        description: 'Plaintext database password embedded in MongoDB connection string.',
        remediation: 'Rotate the database user password in MongoDB Atlas and move the URI to process.env.MONGO_URI.'
    },
    {
        id: 'generic_db_uri',
        name: 'Database URI with Embedded Credentials',
        severity: 'HIGH',
        pattern: /(?:postgres(?:ql)?|mysql|redis|mariadb|oracle|mssql|jdbc:[a-z]+):\/\/[^:\s"']+:[^@\s"']+@[^\/\s"']+/gi,
        extractMatch: (m) => m[0],
        description: 'Database connection string containing plaintext credentials.',
        remediation: 'Store database credentials in environment variables or a secure secrets vault.'
    },
    {
        id: 'jwt_secret',
        name: 'Hardcoded JWT / Session / Secret Key',
        severity: 'HIGH',
        pattern: /(?:jwt_secret|jwt_secret_key|jwt_key|session_secret|secret_key|app_secret|auth_secret|encryption_key)\s*[:=]\s*["']?([^\s"';\r\n]{3,})["']?/gi,
        extractMatch: (m) => m[1],
        validate: (val) => !isPlaceholder(val),
        description: 'Cryptographic JWT or application secret key exposed.',
        remediation: 'Store JWT signing keys in process.env.JWT_SECRET_KEY rather than hardcoding them in repository files.'
    },
    {
        id: 'plaintext_password',
        name: 'Plaintext Password in Configuration',
        severity: 'HIGH',
        pattern: /(?:^|[\s,;])(?:db_password|db_pass|database_password|mysql_password|postgres_password|admin_password|root_password|password|passwd|pwd)\s*[:=]\s*["']?([^\s"';\r\n]{2,})["']?/gi,
        extractMatch: (m) => m[1],
        validate: (val) => !isPlaceholder(val),
        description: 'Plaintext password assignment found in repository code or configuration.',
        remediation: 'Remove hardcoded passwords from source code. Load credentials securely via environment variables.'
    },
    {
        id: 'slack_token',
        name: 'Slack Token / Webhook URL',
        severity: 'HIGH',
        pattern: /(?:https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+|\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}\b)/g,
        description: 'Exposed Slack bot token or incoming webhook URL.',
        remediation: 'Revoke this token in the Slack App dashboard or regenerate the incoming webhook URL.'
    },
    {
        id: 'google_api_key',
        name: 'Google Cloud / Maps API Key',
        severity: 'HIGH',
        pattern: /\b(AIza[0-9A-Za-z-_]{35})\b/g,
        description: 'Google Cloud Platform or Maps API Key exposed.',
        remediation: 'Apply API key restrictions (HTTP referrers, IP, or API scopes) in Google Cloud Console or rotate the key.'
    },
    {
        id: 'generic_api_key',
        name: 'Generic API Key / Token Assignment',
        severity: 'MEDIUM',
        pattern: /(?:api_key|apikey|api_secret|access_token|auth_token|client_secret|bearer_token|private_token)\s*[:=]\s*["']?([^\s"';\r\n]{4,})["']?/gi,
        extractMatch: (m) => m[1],
        validate: (val) => !isPlaceholder(val),
        description: 'Plaintext API token or authentication secret detected.',
        remediation: 'Move third-party API tokens to environment variables.'
    }
];

function isBinaryFile(filePath) {
    const parts = filePath.split('.');
    if (parts.length < 2) return false;
    const ext = parts[parts.length - 1].toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
}

function isSensitiveFilename(filePath) {
    if (!filePath) return false;
    const normalized = filePath.replace(/\\/g, '/');
    const basename = normalized.split('/').pop().toLowerCase();
    
    // .env and its variants (except .env.example, .env.sample, .env.template)
    if (basename === '.env' || (basename.startsWith('.env.') && !basename.endsWith('.example') && !basename.endsWith('.sample') && !basename.endsWith('.template'))) {
        return {
            type: 'env_file',
            name: 'Committed Environment File (.env)',
            severity: 'HIGH',
            description: `Environment configuration file '${basename}' is committed to the repository. This often leaks database URLs, API tokens, and private secrets.`,
            remediation: `Add '${basename}' to your .gitignore immediately and remove it from git history via 'git rm --cached ${filePath}'.`
        };
    }
    
    // Credentials and key files
    if (basename === '.credentials' || basename === 'credentials.json' || basename === 'id_rsa' || basename === 'id_ed25519' || basename.endsWith('.pem') || basename.endsWith('.key') || basename.endsWith('.pfx')) {
        return {
            type: 'credential_file',
            name: 'Committed Private Key / Credential File',
            severity: 'CRITICAL',
            description: `Cryptographic key or credential file '${basename}' detected in repository files.`,
            remediation: `Revoke this credential immediately. Add file pattern to .gitignore and purge from version control history.`
        };
    }

    return null;
}

function maskSecret(secret) {
    if (!secret) return "********";
    const str = String(secret).trim();
    if (str.length <= 4) return "*".repeat(Math.max(4, str.length));
    if (str.length <= 8) {
        return `${str[0]}${"*".repeat(str.length - 2)}${str[str.length - 1]}`;
    }
    const prefix = str.slice(0, 4);
    const suffix = str.slice(-2);
    const maskLen = Math.min(16, Math.max(4, str.length - 6));
    return `${prefix}${"*".repeat(maskLen)}${suffix}`;
}

/**
 * Scans an array of files ({ path, content }) for leaked credentials.
 * @param {Array<{path: string, content: Buffer}>} files 
 * @returns {Object} Detailed security scan report
 */
function scanFilesForSecrets(files) {
    const startTime = Date.now();
    const findings = [];
    let scannedFilesCount = 0;

    for (const file of files) {
        if (!file.path || isBinaryFile(file.path)) {
            continue;
        }

        scannedFilesCount++;

        // 1. Check for sensitive file naming (e.g. .env, id_rsa, credentials.json)
        const sensitiveInfo = isSensitiveFilename(file.path);
        if (sensitiveInfo) {
            findings.push({
                id: `file-${file.path}-1-0`,
                ruleId: sensitiveInfo.type,
                ruleName: sensitiveInfo.name,
                severity: sensitiveInfo.severity,
                filePath: file.path,
                lineNumber: 1,
                maskedSnippet: file.path,
                description: sensitiveInfo.description,
                remediation: sensitiveInfo.remediation
            });
        }

        let textContent = "";
        try {
            textContent = file.content.toString('utf-8');
        } catch {
            continue; // Skip non-utf8 files
        }

        const lines = textContent.split(/\r?\n/);

        for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
            const line = lines[lineIdx];
            if (!line || line.trim().length === 0) continue;

            for (const rule of SECRET_RULES) {
                // Reset regex state for global regexes
                rule.pattern.lastIndex = 0;

                let match;
                while ((match = rule.pattern.exec(line)) !== null) {
                    const matchedRaw = rule.extractMatch ? rule.extractMatch(match) : match[0];

                    // Check custom validation if defined
                    if (rule.validate && !rule.validate(matchedRaw)) {
                        continue;
                    }

                    const maskedPreview = maskSecret(matchedRaw);

                    findings.push({
                        id: `${rule.id}-${file.path}-${lineIdx + 1}-${match.index}`,
                        ruleId: rule.id,
                        ruleName: rule.name,
                        severity: rule.severity,
                        filePath: file.path,
                        lineNumber: lineIdx + 1,
                        maskedSnippet: maskedPreview,
                        description: rule.description,
                        remediation: rule.remediation
                    });
                }
            }
        }
    }

    const durationMs = Date.now() - startTime;

    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;

    let healthStatus = 'CLEAN';
    if (criticalCount > 0) healthStatus = 'CRITICAL';
    else if (highCount > 0) healthStatus = 'HIGH_RISK';
    else if (mediumCount > 0) healthStatus = 'WARNING';

    return {
        healthStatus,
        totalFilesScanned: scannedFilesCount,
        totalFindings: findings.length,
        criticalCount,
        highCount,
        mediumCount,
        durationMs,
        rulesCount: SECRET_RULES.length + 2, // Included file-level rules
        findings
    };
}

module.exports = {
    scanFilesForSecrets,
    SECRET_RULES,
    maskSecret
};
