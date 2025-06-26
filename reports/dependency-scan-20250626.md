# Dependency Scan Report – 20250626

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Moderate | 3 |
| Low | 0 |
| Info | 0 |

## Raw npm audit JSON (truncated)

```json
{
  "auditReportVersion": 2,
  "vulnerabilities": {
    "esbuild": {
      "name": "esbuild",
      "severity": "moderate",
      "isDirect": false,
      "via": [
        {
          "source": 1102341,
          "name": "esbuild",
          "dependency": "esbuild",
          "title": "esbuild enables any website to send any requests to the development server and read the response",
          "url": "https://github.com/advisories/GHSA-67mh-4wv8-2f99",
          "severity": "moderate",
          "cwe": [
            "CWE-346"
          ],
          "cvss": {
            "score": 5.3,
            "vectorString": "CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N"
          },
          "range": "<=0.24.2"
        }
      ],
      "effects": [
        "vite"
      ],
      "range": "<=0.24.2",
      "nodes": [
        "node_modules/esbuild"
      ],
      "fixAvailable": false
    },
    "lovable-tagger": {
      "name": "lovable-tagger",
      "severity": "moderate",
      "isDirect": true,
      "via": [
        "vite"
      ],
      "effects": [],
      "range": "*",
      "nodes": [
        "node_modules/lovable-tagger"
      ],
      "fixAvailable": false
    },
    "vite": {
      "name": "vite",
      "severity": "moderate",
      "isDirect": true,
      "via": [
        "esbuild"
      ],
      "effects": [
        "lovable-tagger"
      ],
      "range": "0.11.0 - 6.1.6",
      "nodes": [
        "node_modules/vite"
      ],
      "fixAvailable": false
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 3,
      "high": 0,
      "critical": 0,
      "total": 3
    },
    "dependencies": {
      "prod": 332,
      "dev": 329,
      "optional": 117,
      "peer": 0,
      "peerOptional": 0,
      "total": 678
    }
  }
}
```
