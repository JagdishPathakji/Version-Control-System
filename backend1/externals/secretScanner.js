/**
 * Secret & Credential Leak Scanner Engine
 * Scans repository files for leaked API keys, tokens, database URIs, and private keys.
 */

const BINARY_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'webp',
    'pdf', 'zip', 'tar', 'gz', '7z', 'rar',
    'woff', 'woff2', 'ttf', 'eot',
    'mp4', 'mp3', 'mov', 'wav',
    'exe', 'dll', 'so', 'dylib', 'bin', 'o', 'a'
]);

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
        pattern: /\b((?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255})\b/g,
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
        id: 'mongodb_uri',
        name: 'MongoDB Credentials in Connection URI',
        severity: 'HIGH',
        pattern: /mongodb(?:\+srv)?:\/\/[^:]+:([^@]+)@[^\/\s]+/gi,
        extractMatch: (m) => m[1],
        description: 'Plaintext database password embedded in MongoDB connection string.',
        remediation: 'Rotate the database user password in MongoDB Atlas and move the URI to process.env.MONGO_URI.'
    },
    {
        id: 'generic_db_uri',
        name: 'Database URI with Embedded Credentials',
        severity: 'HIGH',
        pattern: /(?:postgres|mysql|redis):\/\/[^:]+:([^@]+)@[^\/\s]+/gi,
        extractMatch: (m) => m[1],
        description: 'Database connection string containing plaintext credentials.',
        remediation: 'Store database credentials in environment variables or a secure secrets vault.'
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
        id: 'jwt_secret',
        name: 'Hardcoded JWT / Session Secret',
        severity: 'MEDIUM',
        pattern: /(?:jwt_secret|jwt_secret_key|session_secret)\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi,
        extractMatch: (m) => m[1],
        description: 'Hardcoded cryptographic JWT or session signing secret.',
        remediation: 'Store JWT signing keys in process.env.JWT_SECRET_KEY rather than hardcoding them in repository code.'
    }
];

function isBinaryFile(filePath) {
    const parts = filePath.split('.');
    if (parts.length < 2) return false;
    const ext = parts[parts.length - 1].toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
}

function maskSecret(secret) {
    if (!secret) return "********";
    const str = String(secret).trim();
    if (str.length <= 8) return "********";
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
        rulesCount: SECRET_RULES.length,
        findings
    };
}

module.exports = {
    scanFilesForSecrets,
    SECRET_RULES,
    maskSecret
};
