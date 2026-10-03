/**
 * Canonical dictionary of common tech aliases and abbreviations
 */
const ALIAS_MAP = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    react: 'react',
    reactjs: 'react',
    'react.js': 'react',
    node: 'node.js',
    nodejs: 'node.js',
    'node.js': 'node.js',
    next: 'next.js',
    nextjs: 'next.js',
    'next.js': 'next.js',
    vue: 'vue.js',
    vuejs: 'vue.js',
    'vue.js': 'vue.js',
    py: 'python',
    python: 'python',
    golang: 'go',
    go: 'go',
    k8s: 'kubernetes',
    kubernetes: 'kubernetes',
    docker: 'docker',
    mongo: 'mongodb',
    mongodb: 'mongodb',
    postgres: 'postgresql',
    postgresql: 'postgresql',
    sql: 'sql',
    nosql: 'nosql',
    tailwind: 'tailwindcss',
    tailwindcss: 'tailwindcss',
    aws: 'aws',
    gcp: 'gcp',
    azure: 'azure',
    graphql: 'graphql',
    rest: 'rest api',
    'rest api': 'rest api'
};

/**
 * Normalizes a skill string: lowercase, trims, removes punctuation, maps aliases.
 */
export function normalizeSkill(raw = '') {
    if (!raw || typeof raw !== 'string') return '';
    const cleaned = raw
        .toLowerCase()
        .trim()
        .replace(/[+/#_]/g, ' ')
        .replace(/\s+/g, ' ');

    return ALIAS_MAP[cleaned] || cleaned;
}

/**
 * Calculates candidate vs job skill match percentage and lists
 * @param {string[]|string} candidateSkills - candidate's skill array
 * @param {string[]|string} jobSkills - job's required skill array
 * @returns {{ percent: number, matched: string[], missing: string[] }}
 */
export function calculateSkillMatch(candidateSkills = [], jobSkills = []) {
    const rawJobSkills = Array.isArray(jobSkills)
        ? jobSkills
        : typeof jobSkills === 'string'
            ? jobSkills.split(',').map((s) => s.trim())
            : [];

    const rawCandidateSkills = Array.isArray(candidateSkills)
        ? candidateSkills
        : typeof candidateSkills === 'string'
            ? candidateSkills.split(',').map((s) => s.trim())
            : [];

    const validJobSkills = rawJobSkills.filter(Boolean);
    if (validJobSkills.length === 0) {
        return { percent: 0, matched: [], missing: [] };
    }

    const candidateNormSet = new Set(
        rawCandidateSkills.map(normalizeSkill).filter(Boolean)
    );

    const matched = [];
    const missing = [];

    // Deduplicate job skills by normalized form while keeping original label for display
    const seenJobSkills = new Set();

    validJobSkills.forEach((original) => {
        const norm = normalizeSkill(original);
        if (!norm || seenJobSkills.has(norm)) return;
        seenJobSkills.add(norm);

        if (candidateNormSet.has(norm)) {
            matched.push(original);
        } else {
            missing.push(original);
        }
    });

    const totalUnique = seenJobSkills.size;
    const percent = totalUnique > 0 ? Math.round((matched.length / totalUnique) * 100) : 0;

    return {
        percent,
        matched,
        missing
    };
}
